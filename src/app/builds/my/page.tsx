'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth'
import { createClient } from '@/lib/supabase/client'

interface Build {
  id: string
  name: string
  slots: Record<string, any>
  ip: number
  is_public: boolean
  created_at: string
  updated_at: string
}

export default function MyBuildsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirectTo=/builds/my')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    async function fetchMyBuilds() {
      if (!user) return

      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('builds')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (fetchError) {
          setError(fetchError.message)
          return
        }

        setBuilds(data || [])
      } catch (err) {
        setError('Failed to load builds')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchMyBuilds()
    }
  }, [user])

  const togglePublic = async (buildId: string, currentlyPublic: boolean) => {
    setUpdating(buildId)
    try {
      const res = await fetch(`/api/builds/${buildId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !currentlyPublic }),
      })

      if (res.ok) {
        setBuilds((prev) =>
          prev.map((b) =>
            b.id === buildId ? { ...b, is_public: !currentlyPublic } : b
          )
        )
      }
    } catch (err) {
      console.error('Failed to update build:', err)
    } finally {
      setUpdating(null)
    }
  }

  const copyShareLink = (buildId: string) => {
    const url = `${window.location.origin}/builds/shared/${buildId}`
    navigator.clipboard.writeText(url)
    setCopied(buildId)
    setTimeout(() => setCopied(null), 2000)
  }

  const deleteBuild = async (buildId: string) => {
    if (!confirm('Are you sure you want to delete this build from the cloud?')) return

    setUpdating(buildId)
    try {
      const res = await fetch(`/api/builds/${buildId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setBuilds((prev) => prev.filter((b) => b.id !== buildId))
      }
    } catch (err) {
      console.error('Failed to delete build:', err)
    } finally {
      setUpdating(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl py-8">
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
    <div className="mx-auto max-w-4xl py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-accent">My Shared Builds</h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Manage your cloud-synced builds and sharing settings
          </p>
        </div>
        <Link
          href="/builds/community"
          className="rounded-lg border border-border-light bg-surface-light px-4 py-2 text-sm font-medium text-text1-light transition-colors hover:bg-bg-light dark:border-border dark:bg-surface dark:text-text1 dark:hover:bg-bg"
        >
          Browse Community
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-red-400">
          {error}
        </div>
      )}

      {/* Empty State */}
      {builds.length === 0 ? (
        <div className="rounded-lg border border-border-light bg-surface-light p-8 text-center dark:border-border dark:bg-surface">
          <h2 className="mb-2 text-lg font-medium text-text1-light dark:text-text1">
            No Builds in Cloud
          </h2>
          <p className="mb-4 text-sm text-muted-light dark:text-muted">
            Sync your local builds to the cloud to manage and share them.
          </p>
          <Link
            href="/account/sync"
            className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Sync Data
          </Link>
        </div>
      ) : (
        /* Builds List */
        <div className="space-y-4">
          {builds.map((build) => (
            <div
              key={build.id}
              className="rounded-lg border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-text1-light dark:text-text1">
                      {build.name}
                    </h3>
                    {build.is_public ? (
                      <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                        Public
                      </span>
                    ) : (
                      <span className="rounded bg-gray-500/10 px-2 py-0.5 text-xs font-medium text-gray-400">
                        Private
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-light dark:text-muted">
                    IP: {build.ip || '--'}
                    {' · '}
                    Updated {new Date(build.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle Public */}
                  <button
                    onClick={() => togglePublic(build.id, build.is_public)}
                    disabled={updating === build.id}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                      build.is_public
                        ? 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
                        : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                    }`}
                  >
                    {build.is_public ? 'Make Private' : 'Make Public'}
                  </button>

                  {/* Copy Link */}
                  {build.is_public && (
                    <button
                      onClick={() => copyShareLink(build.id)}
                      className="rounded-lg border border-border-light bg-bg-light px-3 py-1.5 text-xs font-medium text-text1-light transition-colors hover:border-accent dark:border-border dark:bg-bg dark:text-text1"
                    >
                      {copied === build.id ? 'Copied!' : 'Copy Link'}
                    </button>
                  )}

                  {/* View */}
                  {build.is_public && (
                    <Link
                      href={`/builds/shared/${build.id}`}
                      className="rounded-lg border border-accent bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
                    >
                      View
                    </Link>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => deleteBuild(build.id)}
                    disabled={updating === build.id}
                    className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
        <h3 className="mb-2 font-medium text-blue-400">How Sharing Works</h3>
        <ul className="space-y-1 text-sm text-muted-light dark:text-muted">
          <li>• <strong>Private</strong> builds are only visible to you</li>
          <li>• <strong>Public</strong> builds can be viewed and imported by anyone with the link</li>
          <li>• Public builds also appear in the Community Builds browser</li>
          <li>• Deleting a build removes it from the cloud but not your local storage</li>
        </ul>
      </div>
    </div>
  )
}
