'use client'

import { useEffect, useMemo, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import itemsIndex from '@/lib/data/generated/itemsIndex.json'
import { useBuilds, type BuildItemRef, type ItemQuality } from '@/stores/builds'
import { useCharacterSpecs } from '@/hooks/useCharacterSpecs'
import { useMarketData } from '@/hooks/useMarketData'
import { DamageRotation } from '@/components/DamageRotation'
import { BuildLoadoutStrip } from '@/components/BuildLoadoutStrip'
import { parseLoadoutCode, type LoadoutMetadata } from '@/lib/loadoutCode'

type ItemEntry = {
  id: string
  slotType: string
  baseItemPower?: number
}

type Props = {
  isOpen: boolean
  onClose?: () => void
  characterName: string
  variant?: 'drawer' | 'embedded'
  mountContext?: {
    requiredWeight: number
    mountCapacity?: number
    canCarry: boolean
  }
}

const QUALITY_MAP: Record<ItemQuality, string> = {
  normal: 'Normal',
  good: 'Good',
  outstanding: 'Outstanding',
  excellent: 'Excellent',
  masterpiece: 'Masterpiece',
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

export function BuildPanel({
  isOpen,
  onClose,
  characterName,
  variant = 'drawer',
  mountContext,
}: Props) {
  const { current, resetCurrent } = useBuilds()
  const { specs, hasCharacter } = useCharacterSpecs(characterName)
  const [ipResults, setIpResults] = useState<Record<string, any>>({})
  const [ipLoading, setIpLoading] = useState(false)
  const [loadoutInput, setLoadoutInput] = useState('')
  const [loadoutMeta, setLoadoutMeta] = useState<LoadoutMetadata | null>(null)
  const [loadoutError, setLoadoutError] = useState<string | null>(null)
  const [showEquipment, setShowEquipment] = useState(false)

  const buildItems = useMemo(() => {
    const entries: Array<{ slot: string; item: BuildItemRef }> = []
    SLOT_LABELS.forEach(({ key }) => {
      const slotItem = current[key as keyof typeof current] as BuildItemRef | undefined
      if (slotItem?.uniquename) {
        entries.push({ slot: key, item: slotItem })
      }
    })
    return entries
  }, [current])

  const itemIdsForMarket = useMemo(
    () => buildItems.map((entry) => entry.item.uniquename),
    [buildItems]
  )
  const { data: marketData } = useMarketData(itemIdsForMarket)

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

  const weaponId = current.weapon?.uniquename
  const weaponIP = useMemo(() => {
    if (!current.weapon) return 0
    const base = getBaseItemPower(current.weapon.uniquename)
    const quality = QUALITY_MAP[current.weapon.quality ?? 'normal'] ?? 'Normal'
    const qualityBonusMap: Record<string, number> = {
      Normal: 0,
      Good: 20,
      Outstanding: 40,
      Excellent: 60,
      Masterpiece: 100,
    }
    return base + (qualityBonusMap[quality] ?? 0)
  }, [current.weapon])

  useEffect(() => {
    let active = true
    if (!isOpen || !hasCharacter || buildItems.length === 0) {
      setIpResults({})
      return
    }
    setIpLoading(true)

    const run = async () => {
      const results: Record<string, any> = {}
      for (const entry of buildItems) {
        const quality = QUALITY_MAP[entry.item.quality ?? 'normal'] ?? 'Normal'
        const response = await fetch('/api/ip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: entry.item.uniquename,
            quality,
            characterSpecs: specs,
            contentType: 'openWorld',
          }),
        })
        const data = await response.json()
        if (response.ok) {
          results[entry.slot] = data
        }
      }
      if (!active) return
      setIpResults(results)
      setIpLoading(false)
    }

    run().catch(() => {
      if (!active) return
      setIpResults({})
      setIpLoading(false)
    })

    return () => {
      active = false
    }
  }, [buildItems, hasCharacter, isOpen, specs])

  if (!isOpen) return null

  const containerClass =
    variant === 'embedded'
      ? 'w-full rounded-2xl border border-border bg-surface shadow-xl'
      : 'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl'

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-text1-light dark:text-text1">Build Panel</div>
          <div className="text-xs text-muted-light dark:text-muted">
            {characterName ? `Character: ${characterName}` : 'Select a character'}
          </div>
        </div>
        {variant === 'drawer' && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-muted-light hover:bg-surface dark:text-muted"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="grid gap-3 rounded-2xl border border-border bg-surface/70 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-text1-light dark:text-text1">
            <span>Loadout Strip</span>
            <button
              className="text-[11px] text-accent"
              type="button"
              onClick={() => resetCurrent()}
            >
              Clear
            </button>
          </div>
          <BuildLoadoutStrip build={current as Record<string, BuildItemRef | undefined>} />
          <div className="grid gap-2 text-xs text-muted-light dark:text-muted sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-bg-light/40 p-2 dark:bg-bg/40">
              <div className="text-[11px] uppercase tracking-wide">Total Cost</div>
              <div className="text-base font-semibold text-text1-light dark:text-text1">
                {totalCost ? formatPrice(totalCost) : '--'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-bg-light/40 p-2 dark:bg-bg/40">
              <div className="text-[11px] uppercase tracking-wide">Weapon IP</div>
              <div className="text-base font-semibold text-text1-light dark:text-text1">
                {weaponIP || '--'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-bg-light/40 p-2 dark:bg-bg/40">
              <div className="text-[11px] uppercase tracking-wide">Slots</div>
              <div className="text-base font-semibold text-text1-light dark:text-text1">
                {buildItems.length}/{SLOT_LABELS.length}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface/70 p-3">
          <div className="text-xs font-semibold text-text1-light dark:text-text1">Loadout Code</div>
          <div className="mt-2 flex gap-2">
            <input
              className="w-full rounded border border-border-light bg-bg-light px-2 py-1 text-xs dark:border-border dark:bg-bg"
              placeholder="[loa=...]"
              value={loadoutInput}
              onChange={(event) => setLoadoutInput(event.target.value)}
            />
            <button
              type="button"
              className="btn-secondary px-3 py-1 text-xs"
              onClick={() => {
                const meta = parseLoadoutCode(loadoutInput)
                if (!meta) {
                  setLoadoutError('Invalid loadout code')
                  setLoadoutMeta(null)
                  return
                }
                setLoadoutError(null)
                setLoadoutMeta(meta)
              }}
            >
              Parse
            </button>
          </div>
          {loadoutError && <div className="mt-2 text-[11px] text-red-400">{loadoutError}</div>}
          {loadoutMeta && (
            <div className="mt-3 grid gap-1 text-[11px] text-muted-light dark:text-muted">
              <div>Loadout: {loadoutMeta.name ?? '--'}</div>
              <div>GUID: {loadoutMeta.guid ?? '--'}</div>
              <div>Storage: {loadoutMeta.storage}</div>
              <div>
                Timestamp: {loadoutMeta.timestamp ? loadoutMeta.timestamp.toLocaleString() : '--'}
              </div>
              <div>Version: {loadoutMeta.version ?? '--'}</div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface/70">
          <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs font-semibold text-text1-light dark:text-text1">
            <span>Equipment</span>
            <button
              className="text-[11px] text-accent"
              type="button"
              onClick={() => setShowEquipment((value) => !value)}
            >
              {showEquipment ? 'Hide' : 'Show'}
            </button>
          </div>
          {showEquipment && (
            <div className="divide-y divide-border">
              {SLOT_LABELS.map((slot) => {
                const item = current[slot.key as keyof typeof current] as BuildItemRef | undefined
                const ip = ipResults[slot.key]?.totalIP
                const cost = item ? marketBestSell.get(item.uniquename) ?? 0 : 0
                const isMountSlot = slot.key === 'mount'
                const mountBorder =
                  isMountSlot && mountContext
                    ? mountContext.mountCapacity
                      ? mountContext.canCarry
                        ? 'border-emerald-400/60'
                        : 'border-red-400/60'
                      : 'border-amber-400/60'
                    : 'border-border/60'
                return (
                  <div
                    key={slot.key}
                    className={`flex items-center justify-between border-l-2 px-3 py-2 text-xs ${mountBorder}`}
                  >
                    <span className="text-muted-light dark:text-muted">{slot.label}</span>
                    {item ? (
                      <span className="text-right text-text1-light dark:text-text1">
                        {item.uniquename}
                        <span className="ml-2 text-[11px] text-muted-light dark:text-muted">
                          IP {ip ?? (ipLoading ? '...' : '--')} · {cost ? formatPrice(cost) : '--'}
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-light dark:text-muted">Empty</span>
                    )}
                  </div>
                )
              })}
              {mountContext && (
                <div className="px-3 py-2 text-[11px] text-muted-light dark:text-muted">
                  Mount check: need {Math.round(mountContext.requiredWeight)} kg ·{' '}
                  {mountContext.mountCapacity
                    ? `${Math.round(mountContext.mountCapacity)} kg ${
                        mountContext.canCarry ? '✓' : '✕'
                      }`
                    : 'no mount'}
                </div>
              )}
            </div>
          )}
        </div>

        {weaponId ? (
          <DamageRotation
            weaponId={weaponId}
            weaponIP={weaponIP}
            showIcons={true}
            variant="compact"
          />
        ) : (
          <div className="rounded-lg border border-border bg-surface/70 p-3 text-xs text-muted-light dark:text-muted">
            Equip a weapon to unlock spell selection and damage rotation.
          </div>
        )}
      </div>
    </div>
  )
}
