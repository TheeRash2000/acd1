'use client'

import { useMemo, useState } from 'react'
import type { BuildItemRef, ItemQuality } from '@/stores/builds'

type ItemEntry = {
  id: string
  slotType: string
}

type BuildSlotProps = {
  label: string
  slotKey: string
  items: ItemEntry[]
  value?: BuildItemRef
  onSelect: (item: BuildItemRef) => void
  onQualityChange: (quality: ItemQuality) => void
  onTierChange: (tier: number) => void
  disabled?: boolean
}

const QUALITY_OPTIONS: ItemQuality[] = [
  'normal',
  'good',
  'outstanding',
  'excellent',
  'masterpiece',
]

function parseTier(id: string) {
  const match = id.match(/T(\d+)/)
  return match ? parseInt(match[1], 10) : 1
}

function parseEnchant(id: string) {
  const match = id.match(/@(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

export function BuildSlot({
  label,
  slotKey,
  items,
  value,
  onSelect,
  onQualityChange,
  onTierChange,
  disabled,
}: BuildSlotProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.toLowerCase()
    return items.filter((item) => item.id.toLowerCase().includes(needle))
  }, [items, query])

  return (
    <div className="rune-border rounded-lg bg-surface-light p-2 text-xs text-text1-light dark:bg-surface dark:text-text1">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{label}</div>
        <button
          className="btn-secondary px-2 py-1 text-[11px] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => setOpen(true)}
          disabled={disabled}
        >
          {disabled ? 'Blocked' : value ? 'Edit' : 'Select'}
        </button>
      </div>
      <div className="mt-1 text-[11px] text-muted-light dark:text-muted">
        {disabled ? 'Requires 1H weapon' : value ? value.uniquename : 'No item selected'}
      </div>
      <div className="mt-2 grid gap-2">
        <label className="grid gap-1">
          <span className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
            Tier
          </span>
          <select
            className="rounded border border-border-light bg-bg-light px-2 py-1 text-[11px] dark:border-border dark:bg-bg"
            value={value?.tier ?? 4}
            onChange={(event) => onTierChange(parseInt(event.target.value, 10))}
            disabled={disabled}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((tier) => (
              <option key={`${slotKey}-tier-${tier}`} value={tier}>
                T{tier}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
            Quality
          </span>
          <select
            className="rounded border border-border-light bg-bg-light px-2 py-1 text-[11px] capitalize dark:border-border dark:bg-bg"
            value={value?.quality ?? 'normal'}
            onChange={(event) => onQualityChange(event.target.value as ItemQuality)}
            disabled={disabled}
          >
            {QUALITY_OPTIONS.map((quality) => (
              <option key={`${slotKey}-${quality}`} value={quality}>
                {quality}
              </option>
            ))}
          </select>
        </label>
      </div>

      {open && !disabled && (
        <div className="mt-3 grid gap-2 rounded border border-border-light bg-bg-light p-3 dark:border-border dark:bg-bg">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-text1-light dark:text-text1">Select {label}</div>
            <button className="text-xs text-accent" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <input
            className="rounded border border-border-light bg-surface-light px-2 py-1 text-xs dark:border-border dark:bg-surface"
            placeholder="Search..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="max-h-48 overflow-auto rounded border border-border-light dark:border-border">
            {filtered.slice(0, 80).map((item) => (
              <button
                key={item.id}
                className="flex w-full items-center justify-between px-2 py-1 text-left text-xs hover:bg-amber-100/10"
                onClick={() => {
                  const tier = parseTier(item.id)
                  const enchant = parseEnchant(item.id)
                  onSelect({
                    uniquename: item.id,
                    tier,
                    enchant,
                    quality: value?.quality ?? 'normal',
                  })
                  setOpen(false)
                }}
              >
                <span>{item.id}</span>
                <span className="text-[10px] text-muted-light dark:text-muted">T{parseTier(item.id)}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-2 py-2 text-xs text-muted-light dark:text-muted">No matches.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
