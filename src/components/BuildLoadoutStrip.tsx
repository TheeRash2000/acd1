'use client'

import { useMemo } from 'react'
import type { BuildItemRef } from '@/stores/builds'

const SLOT_ORDER: Array<{ key: keyof BuildItemRef | 'weapon'; label: string }> = [
  { key: 'potion', label: 'Potion' },
  { key: 'head', label: 'Head' },
  { key: 'cape', label: 'Cape' },
  { key: 'weapon', label: 'Weapon' },
  { key: 'chest', label: 'Chest' },
  { key: 'offhand', label: 'Offhand' },
  { key: 'food', label: 'Food' },
  { key: 'shoes', label: 'Shoes' },
  { key: 'mount', label: 'Mount' },
]

type Props = {
  build: Record<string, BuildItemRef | undefined>
  onSelectSlot?: (slotKey: string) => void
  onClearSlot?: (slotKey: string) => void
  size?: 'sm' | 'lg'
}

export function BuildLoadoutStrip({
  build,
  onSelectSlot,
  onClearSlot,
  size = 'lg',
}: Props) {
  const items = useMemo(
    () =>
      SLOT_ORDER.map((slot) => ({
        ...slot,
        item: build[slot.key as keyof typeof build] as BuildItemRef | undefined,
      })),
    [build]
  )

  const isSmall = size === 'sm'
  const containerClass = isSmall
    ? 'grid grid-cols-3 gap-2 rounded-xl border border-border bg-surface/60 p-3'
    : 'grid grid-cols-3 gap-3 rounded-2xl border border-border bg-surface/60 p-4'
  const iconClass = isSmall ? 'h-12 w-12' : 'h-16 w-16'
  const buttonClass = isSmall ? 'h-14 w-14' : 'h-20 w-20'

  return (
    <div className={containerClass}>
      {items.map((slot) => {
        const item = slot.item
        const id = item?.uniquename
        const isEmpty = !id
        const isClickable = Boolean(onSelectSlot)
        return (
          <div key={slot.key} className="grid justify-items-center gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => onSelectSlot?.(String(slot.key))}
              className={`relative flex ${buttonClass} items-center justify-center rounded-xl border ${
                isEmpty ? 'border-border/60 bg-surface/30' : 'border-amber-400/70 bg-black/40'
              } ${isClickable ? 'cursor-pointer hover:border-amber-400/80' : 'cursor-default'}`}
            >
              {id && onClearSlot && (
                <span
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-bg text-[10px] text-text1-light dark:text-text1"
                  onClick={(event) => {
                    event.stopPropagation()
                    onClearSlot(String(slot.key))
                  }}
                >
                  x
                </span>
              )}
              {isEmpty ? (
                <span className="text-[10px] text-muted-light dark:text-muted">
                  {slot.label[0]}
                </span>
              ) : (
                <img
                  src={`https://render.albiononline.com/v1/item/${id}`}
                  alt={id}
                  className={`${iconClass} rounded-md`}
                  loading="lazy"
                />
              )}
            </button>
            <span className="text-center uppercase tracking-wide text-muted-light dark:text-muted">
              {slot.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
