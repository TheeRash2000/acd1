'use client'

import { useEffect, useMemo, useState } from 'react'
import weaponSpellPools from '@/lib/data/generated/weaponSpellPoolsResolved.json'
import spellDisplayNames from '@/lib/data/generated/spellDisplayNames.json'
import {
  calculateAutoAttack,
  calculateSpellDamage,
  RESISTANCE_PROFILES,
} from '@/lib/combat/damage/damageCalculator'

type SpellEntry = {
  uniquename: string
  slots: number[]
  tag?: string
}

type DamageRotationProps = {
  weaponId?: string
  weaponIP: number
  showIcons?: boolean
  size?: 'sm' | 'lg'
  variant?: 'full' | 'compact'
}

function getSpellLabel(spellId: string) {
  return (spellDisplayNames as Record<string, string>)[spellId] ?? spellId
}

function getSlotOptions(spells: SpellEntry[], slot: number) {
  return spells.filter((spell) => {
    if (spell.uniquename.startsWith('PASSIVE_')) return false
    if (spell.tag?.toUpperCase().includes('PASSIVE')) return false
    return spell.slots.length === 0 || spell.slots.includes(slot)
  })
}

export function DamageRotation({
  weaponId,
  weaponIP,
  showIcons = true,
  size = 'sm',
  variant = 'full',
}: DamageRotationProps) {
  const spellPool = useMemo(() => {
    if (!weaponId) return []
    return (weaponSpellPools as Record<string, SpellEntry[]>)[weaponId] ?? []
  }, [weaponId])

  const qOptions = useMemo(() => getSlotOptions(spellPool, 1), [spellPool])
  const wOptions = useMemo(() => getSlotOptions(spellPool, 2), [spellPool])
  const eOptions = useMemo(() => getSlotOptions(spellPool, 3), [spellPool])

  const [qSpell, setQSpell] = useState<string | null>(null)
  const [wSpell, setWSpell] = useState<string | null>(null)
  const [eSpell, setESpell] = useState<string | null>(null)
  const [includeAutos, setIncludeAutos] = useState(true)
  const [showSelector, setShowSelector] = useState(false)

  useEffect(() => {
    if (!qSpell && qOptions.length > 0) {
      setQSpell(qOptions[0]?.uniquename ?? null)
    }
  }, [qOptions, qSpell])

  useEffect(() => {
    if (!wSpell && wOptions.length > 0) {
      setWSpell(wOptions[0]?.uniquename ?? null)
    }
  }, [wOptions, wSpell])

  useEffect(() => {
    if (eOptions.length === 0) {
      if (eSpell !== null) setESpell(null)
      return
    }
    if (eOptions.length === 1) {
      const only = eOptions[0]?.uniquename
      if (only && eSpell !== only) setESpell(only)
      return
    }
    if (eSpell && !eOptions.some((option) => option.uniquename === eSpell)) {
      setESpell(null)
    }
  }, [eOptions, eSpell])

  const rotation = [qSpell, wSpell, eSpell].filter(Boolean) as string[]

  const burstResults = useMemo(() => {
    if (!weaponId || rotation.length === 0) return null
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
      const autoTotal = includeAutos
        ? calculateAutoAttack({
            weaponId,
            weaponIP,
            armor: profile.armor,
            mr: profile.mr,
          }).total * 2
        : 0
      return { label, total: total + autoTotal }
    })
  }, [rotation, weaponId, weaponIP, includeAutos])

  const perSpellBreakdown = useMemo(() => {
    if (!weaponId || rotation.length === 0) return null
    return Object.entries({
      Cloth: RESISTANCE_PROFILES.cloth_preset,
      Leather: RESISTANCE_PROFILES.leather_preset,
      Plate: RESISTANCE_PROFILES.plate_preset,
    }).map(([label, profile]) => {
      const spells = rotation.map((spellId) => {
        const result = calculateSpellDamage({
          weaponId,
          weaponIP,
          spellId,
          armor: profile.armor,
          mr: profile.mr,
        })
        return { spellId, result }
      })
      const autos = includeAutos
        ? calculateAutoAttack({
            weaponId,
            weaponIP,
            armor: profile.armor,
            mr: profile.mr,
          })
        : null
      return { label, spells, autos }
    })
  }, [rotation, weaponId, weaponIP, includeAutos])

  const sustainResults = useMemo(() => {
    if (!burstResults) return null
    const scale = 10 / 3
    return burstResults.map((entry) => ({
      label: entry.label,
      total: Math.round(entry.total * scale),
    }))
  }, [burstResults])

  if (!weaponId) {
    return (
      <div className="rounded-lg border border-border-light bg-surface-light p-4 text-sm dark:border-border dark:bg-surface">
        Select a weapon to see damage rotation.
      </div>
    )
  }

  return (
    <div className="grid gap-4 rounded-lg border border-border-light bg-surface-light p-4 text-xs dark:border-border dark:bg-surface">
      <div className="font-semibold text-text1-light dark:text-text1">Damage Rotation</div>
      <div className="text-[11px] text-muted-light dark:text-muted">Weapon IP: {weaponIP}</div>
      <div className="grid gap-3">
        <div className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
          Spell Selection
        </div>

        <div className="grid gap-3 rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40 sm:grid-cols-3">
          {[{ key: 'Q', value: qSpell }, { key: 'W', value: wSpell }, { key: 'E', value: eSpell }].map(
            (slot) => (
              <div key={slot.key} className="grid justify-items-center gap-2">
                <span className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
                  {slot.key}
                </span>
                <div
                  className={`flex items-center justify-center rounded border ${
                    slot.value ? 'border-amber-400/80 bg-amber-400/10' : 'border-border/60 bg-bg/40'
                  } ${size === 'lg' ? 'h-14 w-14' : 'h-11 w-11'}`}
                  title={slot.value ? getSpellLabel(slot.value) : 'No spell selected'}
                >
                  {slot.value ? (
                    <img
                      src={`https://render.albiononline.com/v1/spell/${slot.value}`}
                      alt={slot.value}
                      className={size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'}
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-[10px] text-muted-light dark:text-muted">None</span>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {showIcons && (
          <div className="flex items-center justify-end text-[11px] text-muted-light dark:text-muted">
            <button
              className="text-accent"
              type="button"
              onClick={() => setShowSelector((value) => !value)}
            >
              {showSelector ? 'Close' : 'Change Skills'}
            </button>
          </div>
        )}

        {showIcons && showSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-3xl rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="text-sm font-semibold text-text1-light dark:text-text1">
                  Select Skills
                </div>
                <button
                  className="text-xs text-accent"
                  type="button"
                  onClick={() => setShowSelector(false)}
                >
                  Close
                </button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <div className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
                    Q Abilities
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {qOptions.map((spell) => (
                      <button
                        key={`q-${spell.uniquename}`}
                        type="button"
                        onClick={() => setQSpell(spell.uniquename)}
                        className={`flex items-center justify-center rounded border ${
                          qSpell === spell.uniquename
                            ? 'border-amber-400/80 bg-amber-400/10'
                            : 'border-border/60 bg-bg-light/40 dark:bg-bg/40'
                        } ${size === 'lg' ? 'h-12 w-12' : 'h-9 w-9'}`}
                        title={getSpellLabel(spell.uniquename)}
                      >
                        <img
                          src={`https://render.albiononline.com/v1/spell/${spell.uniquename}`}
                          alt={spell.uniquename}
                          className={size === 'lg' ? 'h-9 w-9' : 'h-7 w-7'}
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
                    W Abilities
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {wOptions.map((spell) => (
                      <button
                        key={`w-${spell.uniquename}`}
                        type="button"
                        onClick={() => setWSpell(spell.uniquename)}
                        className={`flex items-center justify-center rounded border ${
                          wSpell === spell.uniquename
                            ? 'border-amber-400/80 bg-amber-400/10'
                            : 'border-border/60 bg-bg-light/40 dark:bg-bg/40'
                        } ${size === 'lg' ? 'h-12 w-12' : 'h-9 w-9'}`}
                        title={getSpellLabel(spell.uniquename)}
                      >
                        <img
                          src={`https://render.albiononline.com/v1/spell/${spell.uniquename}`}
                          alt={spell.uniquename}
                          className={size === 'lg' ? 'h-9 w-9' : 'h-7 w-7'}
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
                    E Ability
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {eOptions.map((spell) => (
                      <button
                        key={`e-${spell.uniquename}`}
                        type="button"
                        onClick={() => setESpell(spell.uniquename)}
                        className={`flex items-center justify-center rounded border ${
                          eSpell === spell.uniquename
                            ? 'border-amber-400/80 bg-amber-400/10'
                            : 'border-border/60 bg-bg-light/40 dark:bg-bg/40'
                        } ${size === 'lg' ? 'h-12 w-12' : 'h-9 w-9'}`}
                        title={getSpellLabel(spell.uniquename)}
                        disabled={eOptions.length === 1}
                      >
                        <img
                          src={`https://render.albiononline.com/v1/spell/${spell.uniquename}`}
                          alt={spell.uniquename}
                          className={size === 'lg' ? 'h-9 w-9' : 'h-7 w-7'}
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-muted-light dark:text-muted">
                Tip: E is fixed per weapon unless it has multiple variants.
              </div>
            </div>
          </div>
        )}

        <label className="flex items-center gap-2 text-[11px] text-muted-light dark:text-muted">
          <input
            type="checkbox"
            checked={includeAutos}
            onChange={(event) => setIncludeAutos(event.target.checked)}
          />
          Include 2 auto-attacks in burst (scaled for sustain)
        </label>
      </div>

      {burstResults && (
        <div className="grid gap-3">
          <div className="font-semibold text-text1-light dark:text-text1">Burst (3s)</div>
          <div className="grid gap-1 text-muted-light dark:text-muted">
            {burstResults.map((entry) => (
              <div key={`burst-${entry.label}`} className="flex items-center justify-between">
                <span>{entry.label}</span>
                <span>{entry.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {perSpellBreakdown && (
        <div className="grid gap-3">
          <div className="font-semibold text-text1-light dark:text-text1">Spell Breakdown</div>
          {perSpellBreakdown.map((profile) => (
            <details
              key={`profile-${profile.label}`}
              className="rounded border border-border-light p-3 dark:border-border"
            >
              <summary className="cursor-pointer text-xs font-semibold text-text1-light dark:text-text1">
                {profile.label} (Armor{' '}
                {RESISTANCE_PROFILES[`${profile.label.toLowerCase()}_preset` as keyof typeof RESISTANCE_PROFILES]?.armor ?? 0}
                , MR{' '}
                {RESISTANCE_PROFILES[`${profile.label.toLowerCase()}_preset` as keyof typeof RESISTANCE_PROFILES]?.mr ?? 0}
                )
              </summary>
              <div className="mt-3 grid gap-2 text-xs text-muted-light dark:text-muted">
                {profile.spells.map((spell) => (
                  <details
                    key={`${profile.label}-${spell.spellId}`}
                    className="rounded border border-border-light p-2 dark:border-border"
                  >
                    <summary className="cursor-pointer flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <img
                          src={`https://render.albiononline.com/v1/spell/${spell.spellId}`}
                          alt={spell.spellId}
                          className="h-6 w-6 rounded"
                          loading="lazy"
                        />
                        {getSpellLabel(spell.spellId)}
                      </span>
                      <span className="text-text1-light dark:text-text1">{spell.result.total}</span>
                    </summary>
                    <div className="mt-2 grid gap-1">
                      {spell.result.packets.length === 0 && (
                        <div className="text-[11px]">No damage packets found.</div>
                      )}
                      {spell.result.packets.map((packet, index) => (
                        <div
                          key={`${spell.spellId}-${index}`}
                          className="flex items-center justify-between text-[11px]"
                        >
                          <span>
                            {packet.label} ({packet.damageType}) x{packet.count}
                          </span>
                          <span>{packet.total}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
                {profile.autos && (
                  <details className="rounded border border-border-light p-2 dark:border-border">
                    <summary className="cursor-pointer flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded border border-border/60 bg-bg/40">
                          A
                        </div>
                        Auto Attack
                      </span>
                      <span className="text-text1-light dark:text-text1">{profile.autos.total}</span>
                    </summary>
                    <div className="mt-2 grid gap-1">
                      {profile.autos.packets.map((packet, index) => (
                        <div
                          key={`auto-${index}`}
                          className="flex items-center justify-between text-[11px]"
                        >
                          <span>
                            {packet.label} ({packet.damageType}) x{packet.count}
                          </span>
                          <span>{packet.total}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </details>
          ))}
        </div>
      )}

      {sustainResults && (
        <div className="grid gap-3">
          <div className="font-semibold text-text1-light dark:text-text1">Sustain (10s)</div>
          <div className="grid gap-1 text-muted-light dark:text-muted">
            {sustainResults.map((entry) => (
              <div key={`sustain-${entry.label}`} className="flex items-center justify-between">
                <span>{entry.label}</span>
                <span>{entry.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
