'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth'
import { useBuilds } from '@/stores/builds'

interface BuildSlots {
  weapon?: { uniquename: string; tier?: number; enchant?: number; quality?: string }
  offhand?: { uniquename: string }
  head?: { uniquename: string }
  chest?: { uniquename: string }
  shoes?: { uniquename: string }
  cape?: { uniquename: string }
  mount?: { uniquename: string }
  food?: { uniquename: string }
  potion?: { uniquename: string }
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

type SortOption = 'newest' | 'oldest' | 'ip_high' | 'ip_low' | 'name'

// Extract weapon category from uniquename
function getWeaponCategory(uniquename: string): string {
  if (!uniquename) return 'unknown'
  const parts = uniquename.split('_')
  if (parts.length < 3) return 'other'

  const type = parts.slice(2).join('_').toLowerCase()

  if (type.includes('sword') || type.includes('claymore') || type.includes('broadsword') || type.includes('carving')) return 'sword'
  if (type.includes('axe') || type.includes('halberd') || type.includes('greataxe')) return 'axe'
  if (type.includes('mace') || type.includes('hammer') || type.includes('morning')) return 'mace'
  if (type.includes('spear') || type.includes('pike') || type.includes('glaive')) return 'spear'
  if (type.includes('dagger') || type.includes('claws') || type.includes('bloodletter')) return 'dagger'
  if (type.includes('quarterstaff') || (type.includes('staff') && !type.includes('fire') && !type.includes('frost') && !type.includes('holy') && !type.includes('arcane') && !type.includes('cursed') && !type.includes('nature'))) return 'quarterstaff'
  if (type.includes('bow') || type.includes('crossbow') || type.includes('longbow')) return 'bow'
  if (type.includes('fire')) return 'fire'
  if (type.includes('frost') || type.includes('ice')) return 'frost'
  if (type.includes('arcane')) return 'arcane'
  if (type.includes('holy')) return 'holy'
  if (type.includes('cursed')) return 'cursed'
  if (type.includes('nature')) return 'nature'

  return 'other'
}

const WEAPON_CATEGORIES = [
  { value: 'all', label: 'All Weapons' },
  { value: 'sword', label: 'Swords' },
  { value: 'axe', label: 'Axes' },
  { value: 'mace', label: 'Maces' },
  { value: 'spear', label: 'Spears' },
  { value: 'dagger', label: 'Daggers' },
  { value: 'quarterstaff', label: 'Quarterstaffs' },
  { value: 'bow', label: 'Bows' },
  { value: 'fire', label: 'Fire Staffs' },
  { value: 'frost', label: 'Frost Staffs' },
  { value: 'arcane', label: 'Arcane Staffs' },
  { value: 'holy', label: 'Holy Staffs' },
  { value: 'cursed', label: 'Cursed Staffs' },
  { value: 'nature', label: 'Nature Staffs' },
  { value: 'other', label: 'Other' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'ip_high', label: 'Highest IP' },
  { value: 'ip_low', label: 'Lowest IP' },
  { value: 'name', label: 'Name (A-Z)' },
]

export default function CommunityBuildsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { setSlot, setName: setBuildName, saveBuild, resetCurrent } = useBuilds()

  const [builds, setBuilds] = useState<CommunityBuild[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const limit = 24

  // Filters
  const [search, setSearch] = useState('')
  const [weaponCategory, setWeaponCategory] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [importing, setImporting] = useState<string | null>(null)

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

  // Filter and sort builds client-side
  const filteredBuilds = useMemo(() => {
    let result = [...builds]

    // Search filter
    if (search.trim()) {
      const needle = search.toLowerCase()
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(needle) ||
          b.slots?.weapon?.uniquename?.toLowerCase().includes(needle) ||
          b.profiles?.discord_username?.toLowerCase().includes(needle)
      )
    }

    // Weapon category filter
    if (weaponCategory !== 'all') {
      result = result.filter((b) => {
        const weaponId = b.slots?.weapon?.uniquename
        return weaponId && getWeaponCategory(weaponId) === weaponCategory
      })
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'ip_high':
          return (b.ip || 0) - (a.ip || 0)
        case 'ip_low':
          return (a.ip || 0) - (b.ip || 0)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return result
  }, [builds, search, weaponCategory, sortBy])

  const totalPages = Math.ceil(total / limit)

  const handleQuickImport = async (build: CommunityBuild) => {
    setImporting(build.id)
    try {
      resetCurrent()
      setBuildName(build.name + ' (Imported)')

      const slots = build.slots
      if (slots.weapon) {
        setSlot('weapon', {
          uniquename: slots.weapon.uniquename,
          tier: slots.weapon.tier || 4,
          enchant: slots.weapon.enchant || 0,
          quality: (slots.weapon.quality as any) || 'normal',
        })
      }

      const slotKeys = ['offhand', 'head', 'chest', 'shoes', 'cape', 'mount', 'food', 'potion'] as const
      for (const key of slotKeys) {
        const slotData = (slots as any)[key]
        if (slotData?.uniquename) {
          setSlot(key, {
            uniquename: slotData.uniquename,
            tier: slotData.tier || 4,
            enchant: slotData.enchant || 0,
            quality: slotData.quality || 'normal',
          })
        }
      }

      saveBuild()

      // Brief delay then redirect
      setTimeout(() => {
        router.push('/build')
      }, 500)
    } catch (err) {
      console.error('Import failed:', err)
    } finally {
      setImporting(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
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

      {/* Filters */}
      <div className="mb-6 grid gap-4 rounded-lg border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-muted-light dark:text-muted">Search</label>
          <input
            type="text"
            placeholder="Search builds..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-border-light bg-bg-light px-3 py-2 text-sm dark:border-border dark:bg-bg"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-light dark:text-muted">Weapon Type</label>
          <select
            value={weaponCategory}
            onChange={(e) => setWeaponCategory(e.target.value)}
            className="w-full rounded border border-border-light bg-bg-light px-3 py-2 text-sm dark:border-border dark:bg-bg"
          >
            {WEAPON_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-light dark:text-muted">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full rounded border border-border-light bg-bg-light px-3 py-2 text-sm dark:border-border dark:bg-bg"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div className="mb-4 text-sm text-muted-light dark:text-muted">
          Showing {filteredBuilds.length} of {total} builds
          {(search || weaponCategory !== 'all') && ' (filtered)'}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface"
            >
              <div className="mb-3 h-6 w-3/4 rounded bg-gray-300 dark:bg-gray-700"></div>
              <div className="mb-2 h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-700"></div>
              <div className="h-16 rounded bg-gray-300 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      ) : filteredBuilds.length === 0 ? (
        /* Empty State */
        <div className="rounded-lg border border-border-light bg-surface-light p-8 text-center dark:border-border dark:bg-surface">
          <h2 className="mb-2 text-lg font-medium text-text1-light dark:text-text1">
            {search || weaponCategory !== 'all' ? 'No Matching Builds' : 'No Builds Yet'}
          </h2>
          <p className="mb-4 text-sm text-muted-light dark:text-muted">
            {search || weaponCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Be the first to share a build with the community!'}
          </p>
          {!search && weaponCategory === 'all' && (
            <Link
              href="/build"
              className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
            >
              Create a Build
            </Link>
          )}
        </div>
      ) : (
        /* Build Grid */
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBuilds.map((build) => (
              <div
                key={build.id}
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
                <div className="mb-3 flex flex-wrap gap-1">
                  {build.slots?.weapon && (
                    <img
                      src={`https://render.albiononline.com/v1/item/${build.slots.weapon.uniquename}`}
                      alt={build.slots.weapon.uniquename}
                      className="h-8 w-8 rounded border border-border-light dark:border-border"
                      loading="lazy"
                    />
                  )}
                  {build.slots?.head && (
                    <img
                      src={`https://render.albiononline.com/v1/item/${(build.slots.head as any).uniquename}`}
                      alt="head"
                      className="h-8 w-8 rounded border border-border-light dark:border-border"
                      loading="lazy"
                    />
                  )}
                  {build.slots?.chest && (
                    <img
                      src={`https://render.albiononline.com/v1/item/${(build.slots.chest as any).uniquename}`}
                      alt="chest"
                      className="h-8 w-8 rounded border border-border-light dark:border-border"
                      loading="lazy"
                    />
                  )}
                  {build.slots?.shoes && (
                    <img
                      src={`https://render.albiononline.com/v1/item/${(build.slots.shoes as any).uniquename}`}
                      alt="shoes"
                      className="h-8 w-8 rounded border border-border-light dark:border-border"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/builds/shared/${build.id}`}
                    className="flex-1 rounded bg-bg-light px-3 py-1.5 text-center text-xs font-medium text-text1-light transition-colors hover:bg-accent/10 hover:text-accent dark:bg-bg dark:text-text1"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleQuickImport(build)}
                    disabled={importing === build.id}
                    className="flex-1 rounded bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
                  >
                    {importing === build.id ? 'Importing...' : 'Import'}
                  </button>
                </div>
              </div>
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
          <li>Create and save a build in the Build page</li>
          <li>Click the Share button on your saved build</li>
          <li>Or go to Account → Sync Data to upload all builds</li>
        </ol>
      </div>
    </div>
  )
}
