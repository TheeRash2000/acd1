'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth'

interface BuildSlots {
  weapon?: { uniquename: string }
  offhand?: { uniquename: string }
  head?: { uniquename: string }
  chest?: { uniquename: string }
  shoes?: { uniquename: string }
}

interface CommunityBuild {
  id: string
  name: string
  slots: BuildSlots
  ip: number
  created_at: string
  profiles?: {
    discord_username: string | null
  }
}

export default function CommunityBuildsPage() {
  const { user } = useAuth()
  const [builds, setBuilds] = useState<CommunityBuild[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const limit = 12

  useEffect(() => {
    async function fetchBuilds() {
      setLoading(true)
      try {
        const res = await fetch(`/api/builds?limit=${limit}&offset=${page * limit}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Failed to load builds')
          return
        }

        setBuilds(data.builds || [])
        setTotal(data.total || 0)
      } catch (err) {
        setError('Failed to load builds')
      } finally {
        setLoading(false)
      }
    }

    fetchBuilds()
  }, [page])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="mx-auto max-w-4xl py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-accent">Community Builds</h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Browse and import builds shared by the community
          </p>
        </div>
        {user && (
          <Link
            href="/builds/my"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            My Shared Builds
          </Link>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface"
            >
              <div className="mb-3 h-6 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>
              <div className="mb-2 h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-700"></div>
              <div className="h-20 rounded bg-gray-300 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      ) : builds.length === 0 ? (
        /* Empty State */
        <div className="rounded-lg border border-border-light bg-surface-light p-8 text-center dark:border-border dark:bg-surface">
          <h2 className="mb-2 text-lg font-medium text-text1-light dark:text-text1">
            No Builds Yet
          </h2>
          <p className="mb-4 text-sm text-muted-light dark:text-muted">
            Be the first to share a build with the community!
          </p>
          <Link
            href="/build"
            className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Create a Build
          </Link>
        </div>
      ) : (
        /* Build Grid */
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {builds.map((build) => (
              <Link
                key={build.id}
                href={`/builds/shared/${build.id}`}
                className="group rounded-lg border border-border-light bg-surface-light p-4 transition-colors hover:border-accent dark:border-border dark:bg-surface"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-medium text-text1-light group-hover:text-accent dark:text-text1">
                    {build.name}
                  </h3>
                  <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                    IP {build.ip || '?'}
                  </span>
                </div>

                <p className="mb-3 text-xs text-muted-light dark:text-muted">
                  by {build.profiles?.discord_username || 'Anonymous'}
                  {' · '}
                  {new Date(build.created_at).toLocaleDateString()}
                </p>

                {/* Equipment Preview */}
                <div className="flex flex-wrap gap-1">
                  {build.slots?.weapon && (
                    <span className="rounded bg-bg-light px-2 py-1 text-xs text-text1-light dark:bg-bg dark:text-text1">
                      ⚔️ {build.slots.weapon.uniquename?.split('_').slice(-1)[0] || 'Weapon'}
                    </span>
                  )}
                  {build.slots?.head && (
                    <span className="rounded bg-bg-light px-2 py-1 text-xs text-text1-light dark:bg-bg dark:text-text1">
                      🪖
                    </span>
                  )}
                  {build.slots?.chest && (
                    <span className="rounded bg-bg-light px-2 py-1 text-xs text-text1-light dark:bg-bg dark:text-text1">
                      👕
                    </span>
                  )}
                  {build.slots?.shoes && (
                    <span className="rounded bg-bg-light px-2 py-1 text-xs text-text1-light dark:bg-bg dark:text-text1">
                      👟
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg border border-border-light bg-surface-light px-4 py-2 text-sm disabled:opacity-50 dark:border-border dark:bg-surface"
              >
                Previous
              </button>
              <span className="text-sm text-muted-light dark:text-muted">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-lg border border-border-light bg-surface-light px-4 py-2 text-sm disabled:opacity-50 dark:border-border dark:bg-surface"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Info Box */}
      <div className="mt-8 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
        <h3 className="mb-2 font-medium text-blue-400">Share Your Build</h3>
        <p className="text-sm text-muted-light dark:text-muted">
          To share your build with the community:
        </p>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-muted-light dark:text-muted">
          <li>Go to Account → Sync Data and upload your builds</li>
          <li>Go to My Shared Builds and make a build public</li>
          <li>Share the link with others!</li>
        </ol>
      </div>
    </div>
  )
}
