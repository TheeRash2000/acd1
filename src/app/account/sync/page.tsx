'use client'

import { useAuth } from '@/components/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { getLocalData } from '@/lib/sync/syncService'

interface DataStats {
  characters: number
  builds: number
  favorites: number
}

interface SyncResult {
  success: boolean
  message: string
}

export default function SyncPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [localStats, setLocalStats] = useState<DataStats | null>(null)
  const [cloudStats, setCloudStats] = useState<DataStats | null>(null)
  const [syncing, setSyncing] = useState<'upload' | 'download' | null>(null)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [loadingCloud, setLoadingCloud] = useState(false)

  const refreshStats = useCallback(async () => {
    // Get local stats
    const local = getLocalData()
    setLocalStats({
      characters: local.characters.length,
      builds: local.builds.length,
      favorites: local.favorites.length,
    })

    // Get cloud stats via API
    if (user) {
      setLoadingCloud(true)
      try {
        const res = await fetch('/api/sync')
        if (res.ok) {
          const data = await res.json()
          setCloudStats({
            characters: data.characters?.length || 0,
            builds: data.builds?.length || 0,
            favorites: data.preferences ? 1 : 0,
          })
        } else {
          setCloudStats(null)
        }
      } catch (e) {
        console.error('Error fetching cloud stats:', e)
        setCloudStats(null)
      }
      setLoadingCloud(false)
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirectTo=/account/sync')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      refreshStats()
    }
  }, [user, refreshStats])

  const handleUpload = async () => {
    if (!user) return
    setSyncing('upload')
    setResult(null)

    try {
      const localData = getLocalData()
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localData),
      })
      const data = await res.json()

      if (res.ok) {
        setResult({ success: true, message: data.message || 'Upload successful' })
        await refreshStats()
      } else {
        setResult({ success: false, message: data.error || 'Upload failed' })
      }
    } catch (e) {
      setResult({ success: false, message: 'Upload failed: ' + String(e) })
    }
    setSyncing(null)
  }

  const handleDownload = async () => {
    if (!user) return
    setSyncing('download')
    setResult(null)

    try {
      const res = await fetch('/api/sync')
      if (!res.ok) {
        setResult({ success: false, message: 'Download failed' })
        setSyncing(null)
        return
      }

      const data = await res.json()

      // Update localStorage - Characters (destiny board store)
      if (data.characters && data.characters.length > 0) {
        const destinyBoardData = {
          state: {
            activeCharacter: {
              id: data.characters[0].id,
              name: data.characters[0].name,
              masteries: data.characters[0].masteries || {},
              specializations: data.characters[0].specializations || {},
              createdAt: data.characters[0].created_at,
              updatedAt: data.characters[0].updated_at,
            },
            characters: data.characters.map((c: any) => ({
              id: c.id,
              name: c.name,
              masteries: c.masteries || {},
              specializations: c.specializations || {},
              createdAt: c.created_at,
              updatedAt: c.updated_at,
            })),
          },
          version: 1,
        }
        localStorage.setItem('destiny-board-storage', JSON.stringify(destinyBoardData))
      }

      // Update localStorage - Builds
      if (data.builds && data.builds.length > 0) {
        const buildsData = {
          state: {
            current: { name: 'New Build', ip: 0, manualIp: null },
            builds: data.builds.map((b: any) => ({
              id: b.id,
              name: b.name,
              ...(b.slots || {}),
              ip: b.ip,
              manualIp: b.manual_ip,
              timestamp: new Date(b.updated_at).getTime(),
            })),
          },
        }
        localStorage.setItem('builds', JSON.stringify(buildsData))
      }

      // Update localStorage - Preferences
      if (data.preferences) {
        if (data.preferences.favorites) {
          localStorage.setItem('albion-market-favorites', JSON.stringify(data.preferences.favorites))
        }
        if (data.preferences.theme) {
          localStorage.setItem('theme', JSON.stringify({
            state: { dark: data.preferences.theme === 'dark' },
          }))
        }
        if (data.preferences.market_server) {
          localStorage.setItem('albion-market-server', JSON.stringify({
            state: { server: data.preferences.market_server },
          }))
        }
      }

      setResult({
        success: true,
        message: `Downloaded ${data.characters?.length || 0} characters and ${data.builds?.length || 0} builds`,
      })
      setSyncing(null)

      // Reload page to reflect new data
      window.location.reload()
    } catch (e) {
      setResult({ success: false, message: 'Download failed: ' + String(e) })
      setSyncing(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-32 rounded bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-2 font-display text-2xl text-accent">Data Sync</h1>
      <p className="mb-6 text-sm text-muted-light dark:text-muted">
        Sync your local data to the cloud to access it from any device.
      </p>

      {/* Result Message */}
      {result && (
        <div
          className={`mb-6 rounded-lg border p-4 ${
            result.success
              ? 'border-green-500/30 bg-green-500/10 text-green-500'
              : 'border-red-500/30 bg-red-500/10 text-red-400'
          }`}
        >
          <p className="font-medium">{result.success ? 'Success!' : 'Error'}</p>
          <p className="text-sm">{result.message}</p>
        </div>
      )}

      {/* Data Comparison */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {/* Local Data */}
        <div className="rounded-lg border border-border-light bg-surface-light p-6 dark:border-border dark:bg-surface">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-text1-light dark:text-text1">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            This Device
          </h2>

          {localStats ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-light dark:text-muted">Characters</span>
                <span className="font-medium text-text1-light dark:text-text1">{localStats.characters}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-light dark:text-muted">Builds</span>
                <span className="font-medium text-text1-light dark:text-text1">{localStats.builds}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-light dark:text-muted">Favorites</span>
                <span className="font-medium text-text1-light dark:text-text1">{localStats.favorites}</span>
              </div>
            </div>
          ) : (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 rounded bg-gray-300 dark:bg-gray-700"></div>
              ))}
            </div>
          )}
        </div>

        {/* Cloud Data */}
        <div className="rounded-lg border border-border-light bg-surface-light p-6 dark:border-border dark:bg-surface">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-text1-light dark:text-text1">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            Cloud
          </h2>

          {loadingCloud ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 rounded bg-gray-300 dark:bg-gray-700"></div>
              ))}
            </div>
          ) : cloudStats ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-light dark:text-muted">Characters</span>
                <span className="font-medium text-text1-light dark:text-text1">{cloudStats.characters}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-light dark:text-muted">Builds</span>
                <span className="font-medium text-text1-light dark:text-text1">{cloudStats.builds}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-light dark:text-muted">Preferences</span>
                <span className="font-medium text-text1-light dark:text-text1">
                  {cloudStats.favorites > 0 ? 'Saved' : 'None'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-light dark:text-muted">No cloud data yet</p>
          )}
        </div>
      </div>

      {/* Sync Actions */}
      <div className="mb-6 rounded-lg border border-border-light bg-surface-light p-6 dark:border-border dark:bg-surface">
        <h2 className="mb-4 text-lg font-medium text-text1-light dark:text-text1">
          Sync Actions
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border-light bg-bg-light p-4 dark:border-border dark:bg-bg">
            <div>
              <p className="font-medium text-text1-light dark:text-text1">
                Upload to Cloud
              </p>
              <p className="text-sm text-muted-light dark:text-muted">
                Push local data to cloud (overwrites cloud data)
              </p>
            </div>
            <button
              onClick={handleUpload}
              disabled={syncing !== null}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {syncing === 'upload' ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border-light bg-bg-light p-4 dark:border-border dark:bg-bg">
            <div>
              <p className="font-medium text-text1-light dark:text-text1">
                Download from Cloud
              </p>
              <p className="text-sm text-muted-light dark:text-muted">
                Pull cloud data to this device (overwrites local data)
              </p>
            </div>
            <button
              onClick={handleDownload}
              disabled={syncing !== null || !cloudStats || (cloudStats.characters === 0 && cloudStats.builds === 0)}
              className="flex items-center gap-2 rounded-lg border border-accent bg-transparent px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
            >
              {syncing === 'download' ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
        <h3 className="mb-2 font-medium text-blue-400">How Sync Works</h3>
        <ul className="space-y-1 text-sm text-muted-light dark:text-muted">
          <li>• <strong>Upload</strong> saves your local characters, builds, and favorites to the cloud</li>
          <li>• <strong>Download</strong> replaces local data with cloud data and reloads the page</li>
          <li>• Your data is stored securely and only accessible to you</li>
          <li>• Sync is manual - your data won&apos;t change unless you click a button</li>
        </ul>
      </div>
    </div>
  )
}
