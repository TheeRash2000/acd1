'use client'

import { BuildLoadoutStrip } from '@/components/BuildLoadoutStrip'
import type { Build, BuildItemRef } from '@/stores/builds'

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

type Props = {
  build: Build
  onClose: () => void
}

export function BuildViewModal({ build, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold text-text1-light dark:text-text1">{build.name}</div>
            <div className="text-[11px] text-muted-light dark:text-muted">
              You · Custom · {new Date(build.timestamp).toLocaleString()}
            </div>
          </div>
          <button
            className="btn-secondary px-3 py-1 text-xs"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          <BuildLoadoutStrip build={build as Record<string, BuildItemRef | undefined>} />
          <div className="grid gap-2 rounded-lg border border-border bg-bg/40 p-3 text-xs text-muted-light dark:text-muted sm:grid-cols-3">
            <div>
              <div className="text-[10px] uppercase tracking-wide">Weapon IP</div>
              <div className="text-sm font-semibold text-text1-light dark:text-text1">
                {build.ip || '--'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide">Manual IP</div>
              <div className="text-sm font-semibold text-text1-light dark:text-text1">
                {build.manualIp ?? 'Auto'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide">Slots Filled</div>
              <div className="text-sm font-semibold text-text1-light dark:text-text1">
                {
                  SLOT_LABELS.filter(
                    (slot) => (build[slot.key as keyof Build] as BuildItemRef | undefined)?.uniquename
                  ).length
                }/{SLOT_LABELS.length}
              </div>
            </div>
          </div>

          <div className="grid gap-2 rounded-lg border border-border bg-bg/40 p-3 text-xs">
            {SLOT_LABELS.map((slot) => {
              const item = build[slot.key as keyof Build] as BuildItemRef | undefined
              return (
                <div key={slot.key} className="flex items-center justify-between">
                  <span className="text-muted-light dark:text-muted">{slot.label}</span>
                  <span className="text-text1-light dark:text-text1">
                    {item?.uniquename ?? 'Empty'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
