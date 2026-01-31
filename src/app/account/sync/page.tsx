'use client'

import { useAuth } from '@/components/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface LocalDataStats {
  characters: number
  builds: number
  favorites: number
  hideouts: number
}

export default function SyncPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [localStats, setLocalStats] = useState<LocalDataStats | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirectTo=/account/sync')
    }
  }, [loading, user, router])

  useEffect(() => {
    // Analyze local storage data
    if (typeof window !== 'undefined') {
      const destinyBoard = localStorage.getItem('destiny-board-storage')
      const builds = localStorage.getItem('builds')
      const favorites = localStorage.getItem('albion-market-favorites')
      const crafting = localStorage.getItem('crafting-dashboard')

      let characterCount = 0
      let buildCount = 0
      let favoriteCount = 0
      let hideoutCount = 0

      if (destinyBoard) {
        try {
          const data = JSON.parse(destinyBoard)
          characterCount = Object.keys(data.state?.characters || {}).length
        } catch (e) {
          console.error('Error parsing destiny board data:', e)
        }
      }

      if (builds) {
        try {
          const data = JSON.parse(builds)
          buildCount = (data.state?.builds || []).length
        } catch (e) {
          console.error('Error parsing builds data:', e)
        }
      }

      if (favorites) {
        try {
          const data = JSON.parse(favorites)
          favoriteCount = (data || []).length
        } catch (e) {
          console.error('Error parsing favorites data:', e)
        }
      }

      if (crafting) {
        try {
          const data = JSON.parse(crafting)
          hideoutCount = (data.state?.savedHideouts || []).length
        } catch (e) {
          console.error('Error parsing crafting data:', e)
        }
      }

      setLocalStats({
        characters: characterCount,
        builds: buildCount,
        favorites: favoriteCount,
        hideouts: hideoutCount,
      })
    }
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    setSyncStatus('idle')

    try {
      // TODO: Implement actual sync to Supabase
      // For now, simulate a sync operation
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setSyncStatus('success')
    } catch (error) {
      console.error('Sync error:', error)
      setSyncStatus('error')
    } finally {
      setSyncing(false)
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

      {/* Local Data Overview */}
      <div className="mb-6 rounded-lg border border-border-light bg-surface-light p-6 dark:border-border dark:bg-surface">
        <h2 className="mb-4 text-lg font-medium text-text1-light dark:text-text1">
          Local Data
        </h2>
        <p className="mb-4 text-sm text-muted-light dark:text-muted">
          Data currently stored in your browser:
        </p>

        {localStats ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border-light bg-bg-light p-4 dark:border-border dark:bg-bg">
              <p className="text-2xl font-bold text-accent">{localStats.characters}</p>
              <p className="text-sm text-muted-light dark:text-muted">Characters</p>
            </div>
            <div className="rounded-lg border border-border-light bg-bg-light p-4 dark:border-border dark:bg-bg">
              <p className="text-2xl font-bold text-accent">{localStats.builds}</p>
              <p className="text-sm text-muted-light dark:text-muted">Builds</p>
            </div>
            <div className="rounded-lg border border-border-light bg-bg-light p-4 dark:border-border dark:bg-bg">
              <p className="text-2xl font-bold text-accent">{localStats.favorites}</p>
              <p className="text-sm text-muted-light dark:text-muted">Favorites</p>
            </div>
            <div className="rounded-lg border border-border-light bg-bg-light p-4 dark:border-border dark:bg-bg">
              <p className="text-2xl font-bold text-accent">{localStats.hideouts}</p>
              <p className="text-sm text-muted-light dark:text-muted">Hideout Presets</p>
            </div>
          </div>
        ) : (
          <div className="animate-pulse space-y-2">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 rounded bg-gray-300 dark:bg-gray-700"></div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sync Actions */}
      <div className="mb-6 rounded-lg border border-border-light bg-surface-light p-6 dark:border-border dark:bg-surface">
        <h2 className="mb-4 text-lg font-medium text-text1-light dark:text-text1">
          Sync Actions
        </h2>

        {syncStatus === 'success' && (
          <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500">
            Data synced successfully!
          </div>
        )}

        {syncStatus === 'error' && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            Sync failed. Please try again.
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border-light bg-bg-light p-4 dark:border-border dark:bg-bg">
            <div>
              <p className="font-medium text-text1-light dark:text-text1">
                Upload Local Data
              </p>
              <p className="text-sm text-muted-light dark:text-muted">
                Push your local data to the cloud
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Syncing...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Upload
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border-light bg-bg-light p-4 dark:border-border dark:bg-bg">
            <div>
              <p className="font-medium text-text1-light dark:text-text1">
                Download Cloud Data
              </p>
              <p className="text-sm text-muted-light dark:text-muted">
                Pull your cloud data to this device
              </p>
            </div>
            <button
              disabled={syncing}
              className="flex items-center gap-2 rounded-lg border border-accent bg-transparent px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <h3 className="mb-2 font-medium text-amber-500">Coming Soon</h3>
        <p className="text-sm text-muted-light dark:text-muted">
          Full cloud sync functionality is being developed. Currently, your data is
          stored locally in your browser. Once sync is fully implemented, your builds,
          characters, and settings will automatically sync across devices.
        </p>
      </div>
    </div>
  )
}
