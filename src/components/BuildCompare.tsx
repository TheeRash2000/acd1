"use client"

import { useMemo, useState } from 'react'
import weaponSpellPools from '@/lib/data/generated/weaponSpellPoolsResolved.json'
import { calculateSpellDamage, RESISTANCE_PROFILES } from '@/lib/combat/damage/damageCalculator'
import type { Build } from '@/stores/builds'

type SpellEntry = {
  uniquename: string
  slots: number[]
}

type BuildCompareProps = {
  builds: Build[]
}

function getDefaultRotation(weaponId?: string) {
  if (!weaponId) return []
  const pool = (weaponSpellPools as Record<string, SpellEntry[]>)[weaponId] ?? []
  const pick = (slot: number) => pool.find((spell) => spell.slots.length === 0 || spell.slots.includes(slot))
  return [pick(1)?.uniquename, pick(2)?.uniquename, pick(3)?.uniquename].filter(
    Boolean
  ) as string[]
}

function calculateBurst(weaponId: string, weaponIP: number) {
  const rotation = getDefaultRotation(weaponId)
  if (rotation.length === 0) return null

  return Object.entries({
    Cloth: RESISTANCE_PROFILES.cloth_preset,
    Leather: RESISTANCE_PROFILES.leather_preset,
    Plate: RESISTANCE_PROFILES.plate_preset,
  }).map(([label, profile]) => {
    const total = rotation.reduce((sum, spellId) => {
      const result = calculateSpellDamage({
        weaponId,
        weaponIP,
        spellId,
        armor: profile.armor,
        mr: profile.mr,
      })
      return sum + result.total
    }, 0)
    return { label, total }
  })
}

export function BuildCompare({ builds }: BuildCompareProps) {
  const [leftId, setLeftId] = useState(builds[0]?.id ?? '')
  const [rightId, setRightId] = useState(builds[1]?.id ?? '')

  const leftBuild = builds.find((build) => build.id === leftId)
  const rightBuild = builds.find((build) => build.id === rightId)

  const leftBurst = useMemo(() => {
    if (!leftBuild?.weapon?.uniquename) return null
    return calculateBurst(leftBuild.weapon.uniquename, leftBuild.ip)
  }, [leftBuild])

  const rightBurst = useMemo(() => {
    if (!rightBuild?.weapon?.uniquename) return null
    return calculateBurst(rightBuild.weapon.uniquename, rightBuild.ip)
  }, [rightBuild])

  return (
    <div className="grid gap-4 rounded-lg border border-border-light bg-surface-light p-4 text-xs dark:border-border dark:bg-surface">
      <div className="font-semibold text-text1-light dark:text-text1">Build Compare</div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
            Build A
          </span>
          <select
            className="rounded border border-border-light bg-bg-light px-2 py-1 text-xs dark:border-border dark:bg-bg"
            value={leftId}
            onChange={(event) => setLeftId(event.target.value)}
          >
            {builds.map((build) => (
              <option key={build.id} value={build.id}>
                {build.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
            Build B
          </span>
          <select
            className="rounded border border-border-light bg-bg-light px-2 py-1 text-xs dark:border-border dark:bg-bg"
            value={rightId}
            onChange={(event) => setRightId(event.target.value)}
          >
            {builds.map((build) => (
              <option key={build.id} value={build.id}>
                {build.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-2 text-muted-light dark:text-muted">
        <div className="flex items-center justify-between">
          <span>IP</span>
          <span>
            {leftBuild?.ip ?? 0} vs {rightBuild?.ip ?? 0}
          </span>
        </div>
      </div>

      {leftBurst && rightBurst && (
        <div className="grid gap-2">
          <div className="font-semibold text-text1-light dark:text-text1">Burst (3s)</div>
          {leftBurst.map((entry, index) => {
            const rightEntry = rightBurst[index]
            const highlight =
              entry.total === rightEntry.total
                ? ''
                : entry.total > rightEntry.total
                ? 'text-accent'
                : ''
            return (
              <div key={`compare-${entry.label}`} className="flex items-center justify-between">
                <span>{entry.label}</span>
                <span className={highlight}>
                  {entry.total} vs {rightEntry.total}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
