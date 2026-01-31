'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useBuilds } from '@/stores/builds'
import { useDestinyBoardStore } from '@/stores/destinyBoardStore'

interface BuildSlots {
  weapon?: { uniquename: string; tier: number; enchant: number; quality: string }
  offhand?: { uniquename: string; tier: number; enchant: number; quality: string }
  head?: { uniquename: string; tier: number; enchant: number; quality: string }
  chest?: { uniquename: string; tier: number; enchant: number; quality: string }
  shoes?: { uniquename: string; tier: number; enchant: number; quality: string }
  cape?: { uniquename: string; tier: number; enchant: number; quality: string }
  mount?: { uniquename: string; tier: number; enchant: number; quality: string }
  food?: { uniquename: string; tier: number; enchant: number; quality: string }
  potion?: { uniquename: string; tier: number; enchant: number; quality: string }
}

interface Build {
  id: string
  name: string
  slots: BuildSlots
  ip: number
  is_public: boolean
  created_at: string
  profiles?: {
    discord_username: string | null
  }
}

const SLOT_LABELS = [
  { key: 'weapon', label: 'Weapon', icon: '⚔️' },
  { key: 'offhand', label: 'Offhand', icon: '🛡️' },
  { key: 'head', label: 'Head', icon: '🪖' },
  { key: 'chest', label: 'Chest', icon: '👕' },
  { key: 'shoes', label: 'Shoes', icon: '👟' },
  { key: 'cape', label: 'Cape', icon: '🧣' },
  { key: 'mount', label: 'Mount', icon: '🐴' },
  { key: 'food', label: 'Food', icon: '🍖' },
  { key: 'potion', label: 'Potion', icon: '🧪' },
]

export default function SharedBuildPage() {
  const params = useParams()
  const router = useRouter()
  const [build, setBuild] = useState<Build | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(false)
  const [copied, setCopied] = useState(false)

  const { setSlot, setName, saveBuild } = useBuilds()
  const { characters, activeCharacter, setActiveCharacter } = useDestinyBoardStore()

  // Calculate IP bonus based on character specs
  const ipCalculation = useMemo(() => {
    if (!build || !activeCharacter) return null

    const weaponId = build.slots?.weapon?.uniquename
    if (!weaponId) return null

    // Extract weapon type from ID (e.g., T8_MAIN_SPEAR -> SPEAR)
    const parts = weaponId.split('_')
    const weaponType = parts.slice(2).join('_') // Get everything after T8_MAIN_

    // Look for matching mastery/specialization in character data
    // This is a simplified calculation - real IP calc is more complex
    const masteries = activeCharacter.masteries || {}
    const specs = activeCharacter.specializations || {}

    // Find relevant spec levels (simplified - would need proper mapping in production)
    let specLevel = 0
    let masteryLevel = 0

    // Check if any spec keys contain the weapon type
    for (const [key, level] of Object.entries(specs)) {
      if (key.toLowerCase().includes(weaponType.toLowerCase())) {
        specLevel = Math.max(specLevel, level as number)
      }
    }

    for (const [key, level] of Object.entries(masteries)) {
      if (key.toLowerCase().includes(weaponType.toLowerCase()) ||
          key.toLowerCase().includes('fighter') ||
          key.toLowerCase().includes('warrior')) {
        masteryLevel = Math.max(masteryLevel, level as number)
      }
    }

    // IP calculation:
    // - Mastery: 0.2 IP per level
    // - Spec: 2.0 IP per level (unique) + 0.2 IP per level (mutual)
    const masteryBonus = masteryLevel * 0.2
    const specBonus = specLevel * 2.2 // unique + mutual for simple weapons

    return {
      weaponType,
      masteryLevel,
      specLevel,
      masteryBonus: Math.round(masteryBonus * 10) / 10,
      specBonus: Math.round(specBonus * 10) / 10,
      totalBonus: Math.round((masteryBonus + specBonus) * 10) / 10,
    }
  }, [build, activeCharacter])

  useEffect(() => {
    async function fetchBuild() {
      try {
        const res = await fetch(`/api/builds/${params.id}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Build not found')
          return
        }

        setBuild(data.build)
      } catch (err) {
        setError('Failed to load build')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBuild()
    }
  }, [params.id])

  const handleImport = async () => {
    if (!build) return
    setImporting(true)

    try {
      // Set the build name
      setName(build.name + ' (Imported)')

      // Import each slot
      const slots = build.slots as BuildSlots
      for (const { key } of SLOT_LABELS) {
        const slotData = slots[key as keyof BuildSlots]
        if (slotData) {
          setSlot(key as any, {
            uniquename: slotData.uniquename,
            tier: slotData.tier || 4,
            enchant: slotData.enchant || 0,
            quality: (slotData.quality as any) || 'normal',
          })
        }
      }

      // Save the build
      saveBuild()
      setImported(true)

      // Redirect to build page after short delay
      setTimeout(() => {
        router.push('/build')
      }, 1500)
    } catch (err) {
      setError('Failed to import build')
    } finally {
      setImporting(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-64 rounded bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>
    )
  }

  if (error || !build) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
          <h1 className="mb-2 text-xl font-medium text-red-400">Build Not Found</h1>
          <p className="mb-4 text-sm text-muted-light dark:text-muted">
            {error || 'This build may be private or deleted.'}
          </p>
          <Link
            href="/builds/community"
            className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Browse Community Builds
          </Link>
        </div>
      </div>
    )
  }

  const slots = build.slots as BuildSlots
  const filledSlots = SLOT_LABELS.filter(s => slots[s.key as keyof BuildSlots])

  return (
    <div className="mx-auto max-w-2xl py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-accent">{build.name}</h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Shared by {build.profiles?.discord_username || 'Anonymous'}
            {' · '}
            {new Date(build.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1 rounded-lg border border-border-light bg-surface-light px-3 py-1.5 text-xs text-text1-light transition-colors hover:bg-bg-light dark:border-border dark:bg-surface dark:text-text1 dark:hover:bg-bg"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      {/* Success Message */}
      {imported && (
        <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center text-green-500">
          Build imported successfully! Redirecting...
        </div>
      )}

      {/* Build Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <p className="text-sm text-muted-light dark:text-muted">Item Power</p>
          <p className="text-2xl font-bold text-accent">{build.ip || '--'}</p>
        </div>
        <div className="rounded-lg border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <p className="text-sm text-muted-light dark:text-muted">Slots Filled</p>
          <p className="text-2xl font-bold text-text1-light dark:text-text1">
            {filledSlots.length}/{SLOT_LABELS.length}
          </p>
        </div>
      </div>

      {/* Your IP Calculation */}
      <div className="mb-6 rounded-lg border border-accent/30 bg-accent/5 p-4 dark:border-accent/30 dark:bg-accent/10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-text1-light dark:text-text1">Your IP with this Build</h2>
          {characters.length > 0 && (
            <select
              value={activeCharacter?.id || ''}
              onChange={(e) => setActiveCharacter(e.target.value)}
              className="rounded border border-border-light bg-bg-light px-2 py-1 text-sm dark:border-border dark:bg-bg"
            >
              <option value="">Select character...</option>
              {characters.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {characters.length === 0 ? (
          <p className="text-sm text-muted-light dark:text-muted">
            <Link href="/destiny-board" className="text-accent hover:underline">
              Create a character
            </Link>{' '}
            in the Destiny Board to see your personalized IP calculation.
          </p>
        ) : !activeCharacter ? (
          <p className="text-sm text-muted-light dark:text-muted">
            Select a character to see your IP with this build.
          </p>
        ) : ipCalculation ? (
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-light dark:text-muted">Base IP</span>
              <span className="text-text1-light dark:text-text1">{build.ip || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-light dark:text-muted">
                Mastery Bonus (Lv. {ipCalculation.masteryLevel})
              </span>
              <span className="text-green-500">+{ipCalculation.masteryBonus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-light dark:text-muted">
                Spec Bonus (Lv. {ipCalculation.specLevel})
              </span>
              <span className="text-green-500">+{ipCalculation.specBonus}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-border-light pt-2 dark:border-border">
              <span className="font-medium text-text1-light dark:text-text1">Your Total IP</span>
              <span className="text-lg font-bold text-accent">
                {Math.round((build.ip || 0) + ipCalculation.totalBonus)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-light dark:text-muted">
            IP calculation not available for this weapon type.
          </p>
        )}
      </div>

      {/* Equipment Grid */}
      <div className="mb-6 rounded-lg border border-border-light bg-surface-light p-6 dark:border-border dark:bg-surface">
        <h2 className="mb-4 text-lg font-medium text-text1-light dark:text-text1">Equipment</h2>
        <div className="grid gap-3">
          {SLOT_LABELS.map(({ key, label, icon }) => {
            const item = slots[key as keyof BuildSlots]
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border border-border-light bg-bg-light p-3 dark:border-border dark:bg-bg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm text-muted-light dark:text-muted">{label}</span>
                </div>
                {item ? (
                  <div className="text-right">
                    <p className="text-sm font-medium text-text1-light dark:text-text1">
                      {item.uniquename}
                    </p>
                    <p className="text-xs text-muted-light dark:text-muted">
                      T{item.tier || 4}.{item.enchant || 0} · {item.quality || 'Normal'}
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-muted-light dark:text-muted">Empty</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Import Button */}
      <div className="flex gap-4">
        <button
          onClick={handleImport}
          disabled={importing || imported}
          className="flex-1 rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          {importing ? 'Importing...' : imported ? 'Imported!' : 'Import Build'}
        </button>
        <Link
          href="/builds/community"
          className="rounded-lg border border-border-light bg-surface-light px-6 py-3 font-medium text-text1-light transition-colors hover:bg-bg-light dark:border-border dark:bg-surface dark:text-text1 dark:hover:bg-bg"
        >
          Browse More
        </Link>
      </div>
    </div>
  )
}
