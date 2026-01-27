'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import itemsIndex from '@/lib/data/generated/itemsIndex.json'
import { BuildLoadoutStrip } from '@/components/BuildLoadoutStrip'
import { DamageRotation } from '@/components/DamageRotation'
import { useBuilds, type BuildItemRef, type ItemQuality } from '@/stores/builds'
import { useMarketData } from '@/hooks/useMarketData'

type ItemEntry = {
  id: string
  slotType: string
  baseItemPower?: number
}

const QUALITY_BONUS: Record<ItemQuality, number> = {
  normal: 0,
  good: 20,
  outstanding: 40,
  excellent: 60,
  masterpiece: 100,
}

const SLOT_LABELS: Array<{ key: keyof BuildItemRef | 'weapon'; label: string }> = [
  { key: 'weapon', label: 'Weapon' },
  { key: 'offhand', label: 'Offhand' },
  { key: 'head', label: 'Head' },
  { key: 'chest', label: 'Chest' },
  { key: 'shoes', label: 'Shoes' },
  { key: 'cape', label: 'Cape' },
  { key: 'mount', label: 'Mount' },
  { key: 'food', label: 'Food' },
  { key: 'potion', label: 'Potion' },
]

function getBaseItemPower(itemId?: string) {
  if (!itemId) return 0
  const entry = (itemsIndex as Record<string, ItemEntry>)[itemId]
  return entry?.baseItemPower ?? 0
}

function formatPrice(price: number) {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`
  if (price >= 1000) return `${(price / 1000).toFixed(1)}k`
  return price.toLocaleString()
}

export default function BuildDetailPage() {
  const params = useParams()
  const router = useRouter()
  const buildId = typeof params?.id === 'string' ? params.id : ''
  const { builds, loadBuild } = useBuilds()

  const build = useMemo(() => builds.find((item) => item.id === buildId), [builds, buildId])

  const buildItems = useMemo(() => {
    if (!build) return []
    const entries: Array<{ slot: string; item: BuildItemRef }> = []
    SLOT_LABELS.forEach(({ key }) => {
      const slotItem = build[key as keyof typeof build] as BuildItemRef | undefined
      if (slotItem?.uniquename) {
        entries.push({ slot: key, item: slotItem })
      }
    })
    return entries
  }, [build])

  const itemIds = useMemo(() => buildItems.map((entry) => entry.item.uniquename), [buildItems])
  const { data: marketData } = useMarketData(itemIds)

  const marketBestSell = useMemo(() => {
    const map = new Map<string, number>()
    for (const entry of marketData) {
      const currentBest = map.get(entry.itemId) ?? 0
      if (entry.sellPriceMin && (currentBest === 0 || entry.sellPriceMin < currentBest)) {
        map.set(entry.itemId, entry.sellPriceMin)
      }
    }
    return map
  }, [marketData])

  const totalCost = useMemo(() => {
    return buildItems.reduce(
      (sum, entry) => sum + (marketBestSell.get(entry.item.uniquename) ?? 0),
      0
    )
  }, [buildItems, marketBestSell])

  const weaponIP = useMemo(() => {
    if (!build?.weapon) return 0
    const base = getBaseItemPower(build.weapon.uniquename)
    const qualityBonus = QUALITY_BONUS[build.weapon.quality ?? 'normal'] ?? 0
    return build.manualIp ?? base + qualityBonus
  }, [build])

  if (!build) {
    return (
      <section className="grid gap-6">
        <div className="rounded-2xl border border-border-light bg-surface-light p-6 text-sm text-muted-light dark:border-border dark:bg-surface dark:text-muted">
          Build not found. Save a build first.
        </div>
        <Link href="/build" className="text-accent">
          Back to Builder
        </Link>
      </section>
    )
  }

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">{build.name}</h1>
          <p className="text-muted-light dark:text-muted">
            Saved {new Date(build.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="btn-secondary px-3 py-2 text-xs"
            type="button"
            onClick={() => {
              loadBuild(build.id)
              router.push('/build')
            }}
          >
            Open in Builder
          </button>
          <Link href="/market" className="text-xs text-accent">
            Open Market
          </Link>
        </div>
      </header>

      <div className="grid gap-4 rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="text-xs uppercase tracking-wide text-muted-light dark:text-muted">Loadout</div>
        <BuildLoadoutStrip build={build as Record<string, BuildItemRef | undefined>} />
        <div className="grid gap-3 text-xs text-muted-light dark:text-muted sm:grid-cols-3">
          <div className="rounded-lg border border-border-light bg-bg-light/60 p-3 dark:border-border dark:bg-bg/60">
            <div className="text-[11px] uppercase tracking-wide">Weapon IP</div>
            <div className="text-sm text-text1-light dark:text-text1">{weaponIP || '--'}</div>
          </div>
          <div className="rounded-lg border border-border-light bg-bg-light/60 p-3 dark:border-border dark:bg-bg/60">
            <div className="text-[11px] uppercase tracking-wide">Total Cost</div>
            <div className="text-sm text-text1-light dark:text-text1">
              {totalCost ? formatPrice(totalCost) : '--'}
            </div>
          </div>
          <div className="rounded-lg border border-border-light bg-bg-light/60 p-3 dark:border-border dark:bg-bg/60">
            <div className="text-[11px] uppercase tracking-wide">Slots Filled</div>
            <div className="text-sm text-text1-light dark:text-text1">
              {buildItems.length}/{SLOT_LABELS.length}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="text-xs uppercase tracking-wide text-muted-light dark:text-muted">Equipment</div>
        <div className="mt-3 grid gap-2">
          {SLOT_LABELS.map((slot) => {
            const item = build[slot.key as keyof typeof build] as BuildItemRef | undefined
            const cost = item ? marketBestSell.get(item.uniquename) ?? 0 : 0
            return (
              <div
                key={slot.key}
                className="flex items-center justify-between rounded-lg border border-border-light bg-bg-light/50 px-3 py-2 text-xs dark:border-border dark:bg-bg/50"
              >
                <span className="text-muted-light dark:text-muted">{slot.label}</span>
                {item ? (
                  <span className="text-right text-text1-light dark:text-text1">
                    {item.uniquename}
                    <span className="ml-2 text-[11px] text-muted-light dark:text-muted">
                      {cost ? formatPrice(cost) : '--'}
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-light dark:text-muted">Empty</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {build.weapon?.uniquename ? (
        <DamageRotation
          weaponId={build.weapon?.uniquename}
          weaponIP={weaponIP}
          variant="full"
        />
      ) : (
        <div className="rounded-lg border border-border-light bg-surface-light p-4 text-sm dark:border-border dark:bg-surface">
          Equip a weapon to unlock spell selection and damage rotation.
        </div>
      )}
    </section>
  )
}
