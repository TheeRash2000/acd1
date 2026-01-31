'use client'

import { useEffect, useMemo, useState } from 'react'
import itemsIndex from '@/lib/data/generated/itemsIndex.json'
import { BuildSlot } from '@/components/BuildSlot'
import { DamageRotation } from '@/components/DamageRotation'
import { BuildCompare } from '@/components/BuildCompare'
import { BuildPanel } from '@/components/BuildPanel'
import { BuildLoadoutStrip } from '@/components/BuildLoadoutStrip'
import { BuildViewModal } from '@/components/BuildViewModal'
import { ShareBuildModal } from '@/components/ShareBuildModal'
import { useBuilds, type BuildItemRef, type ItemQuality, type Build } from '@/stores/builds'
import { useCharacterSync } from '@/stores/characterSync'
import { COMMUNITY_BUILDS } from '@/data/communityBuilds'

type ItemEntry = {
  id: string
  slotType: string
  baseItemPower?: number
  hands?: string
}

const QUALITY_BONUS: Record<ItemQuality, number> = {
  normal: 0,
  good: 20,
  outstanding: 40,
  excellent: 60,
  masterpiece: 100,
}

const TIER_OPTIONS = [4, 5, 6, 7, 8]

function getItemsBySlot(slot: string): ItemEntry[] {
  return Object.values(itemsIndex as Record<string, ItemEntry>).filter(
    (item) => item.slotType === slot
  )
}

function getBaseItemPower(itemId?: string) {
  if (!itemId) return 0
  const entry = (itemsIndex as Record<string, ItemEntry>)[itemId]
  return entry?.baseItemPower ?? 0
}

function getWeaponHands(itemId?: string) {
  if (!itemId) return null
  const entry = (itemsIndex as Record<string, ItemEntry>)[itemId]
  return entry?.hands ?? null
}

function parseTier(id: string) {
  const match = id.match(/T(\d+)/)
  return match ? parseInt(match[1], 10) : 1
}

function parseEnchant(id: string) {
  const match = id.match(/@(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

export default function BuildPage() {
  const {
    current,
    builds,
    setSlot,
    setName,
    saveBuild,
    loadBuild,
    setIp,
    setManualIp,
    resetCurrent,
  } = useBuilds()
  const { characters } = useCharacterSync()
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelCharacter, setPanelCharacter] = useState('')
  const [viewBuildId, setViewBuildId] = useState<string | null>(null)
  const [shareBuild, setShareBuild] = useState<Build | null>(null)
  const [openCommunityId, setOpenCommunityId] = useState<string | null>(null)
  const [openSavedId, setOpenSavedId] = useState<string | null>(null)
  const [pickerSlotKey, setPickerSlotKey] = useState<string | null>(null)
  const [pickerQuery, setPickerQuery] = useState('')
  const [pickerTier, setPickerTier] = useState<'all' | number>('all')
  const [pickerQuality, setPickerQuality] = useState<ItemQuality>('normal')

  const slots = useMemo(
    () => [
      { key: 'weapon', label: 'Weapon', items: getItemsBySlot('weapon') },
      { key: 'offhand', label: 'Offhand', items: getItemsBySlot('offhand') },
      { key: 'head', label: 'Head', items: getItemsBySlot('head') },
      { key: 'chest', label: 'Chest', items: getItemsBySlot('chest') },
      { key: 'shoes', label: 'Shoes', items: getItemsBySlot('shoes') },
      { key: 'cape', label: 'Cape', items: getItemsBySlot('cape') },
      { key: 'mount', label: 'Mount', items: getItemsBySlot('mount') },
      { key: 'food', label: 'Food', items: getItemsBySlot('food') },
      { key: 'potion', label: 'Potion', items: getItemsBySlot('potion') },
    ],
    []
  )

  const weaponId = current.weapon?.uniquename
  const weaponHands = useMemo(() => getWeaponHands(current.weapon?.uniquename), [current.weapon])
  const isTwoHanded = weaponHands === '2h'
  const computedWeaponIP = useMemo(() => {
    if (!current.weapon) return 0
    const base = getBaseItemPower(current.weapon.uniquename)
    const qualityBonus = QUALITY_BONUS[current.weapon.quality ?? 'normal']
    return base + qualityBonus
  }, [current.weapon])

  const weaponIP = current.manualIp ?? computedWeaponIP
  const filledSlots = useMemo(
    () =>
      slots.filter((slot) => current[slot.key as keyof typeof current]?.uniquename).length,
    [current, slots]
  )
  const canSave = Boolean(current.weapon?.uniquename)

  useEffect(() => {
    if (weaponIP && weaponIP !== current.ip) {
      setIp(weaponIP)
    }
  }, [weaponIP, current.ip, setIp])

  useEffect(() => {
    if (isTwoHanded && current.offhand?.uniquename) {
      setSlot('offhand', undefined)
    }
  }, [isTwoHanded, current.offhand, setSlot])

  const handleSlotSelect = (slotKey: string, item: BuildItemRef) => {
    if (slotKey === 'offhand' && isTwoHanded) return
    setSlot(slotKey as keyof typeof current, item)
  }

  const handleQualityChange = (slotKey: string, quality: ItemQuality) => {
    const slot = current[slotKey as keyof typeof current] as BuildItemRef | undefined
    if (!slot) return
    setSlot(slotKey as keyof typeof current, { ...slot, quality })
  }

  const handleTierChange = (slotKey: string, tier: number) => {
    const slot = current[slotKey as keyof typeof current] as BuildItemRef | undefined
    if (!slot) return
    setSlot(slotKey as keyof typeof current, { ...slot, tier })
  }

  const pickerSlot = useMemo(
    () => slots.find((slot) => slot.key === pickerSlotKey) ?? null,
    [pickerSlotKey, slots]
  )

  const pickerItems = useMemo(() => {
    if (!pickerSlot) return []
    const needle = pickerQuery.trim().toLowerCase()
    return pickerSlot.items.filter((item) => {
      if (pickerTier !== 'all' && parseTier(item.id) !== pickerTier) return false
      if (!needle) return true
      return item.id.toLowerCase().includes(needle)
    })
  }, [pickerSlot, pickerQuery, pickerTier])

  const openPicker = (slotKey: string) => {
    if (slotKey === 'offhand' && isTwoHanded) return
    setPickerSlotKey(slotKey)
    setPickerQuery('')
    setPickerTier('all')
    const slot = current[slotKey as keyof typeof current] as BuildItemRef | undefined
    setPickerQuality(slot?.quality ?? 'normal')
  }

  const closePicker = () => {
    setPickerSlotKey(null)
  }

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">
            Build + Damage
          </h1>
          <p className="text-muted-light dark:text-muted">
            Forge a loadout, then test damage rotation vs armor profiles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={panelCharacter}
            onChange={(event) => setPanelCharacter(event.target.value)}
            className="rounded border border-border-light bg-bg-light px-3 py-2 text-sm dark:border-border dark:bg-bg"
          >
            <option value="">Select character...</option>
            {characters
              .filter((character) => character?.name)
              .map((character) => (
                <option key={`${character.name}-${character.server}`} value={character.name}>
                  {character.name}
                </option>
              ))}
          </select>
          <button
            type="button"
            className="btn-secondary px-4 py-2 text-xs"
            onClick={() => setPanelOpen(true)}
          >
            Open Build Panel
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-4">
          <div className="grid gap-4 rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
              <label className="grid gap-1 text-xs">
                <span className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
                  Build Name
                </span>
                <input
                  className="rounded border border-border-light bg-bg-light px-3 py-2 text-sm dark:border-border dark:bg-bg"
                  value={current.name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <div className="grid gap-2 rounded-xl border border-border-light bg-bg-light/70 p-3 text-xs shadow-sm dark:border-border dark:bg-bg/70">
                <div className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
                  Snapshot
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Weapon IP</span>
                  <span className="text-base font-semibold text-text1-light dark:text-text1">
                    {weaponIP || '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Slots Filled</span>
                  <span className="text-base font-semibold text-text1-light dark:text-text1">
                    {filledSlots}/{slots.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Manual IP</span>
                  <span className="text-base font-semibold text-text1-light dark:text-text1">
                    {current.manualIp ?? 'Auto'}
                  </span>
                </div>
              </div>
            </div>

            <BuildLoadoutStrip
              build={current as Record<string, BuildItemRef | undefined>}
              onSelectSlot={(slotKey) => openPicker(slotKey)}
              onClearSlot={(slotKey) =>
                setSlot(slotKey as keyof typeof current, undefined)
              }
            />

            <div className="grid gap-2 text-xs text-muted-light dark:text-muted sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="grid gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <span>Estimated Weapon IP: {computedWeaponIP}</span>
                <input
                  className="rounded border border-border-light bg-bg-light px-2 py-1 text-xs dark:border-border dark:bg-bg"
                  type="number"
                  min={0}
                  placeholder="Override IP"
                  value={current.manualIp ?? ''}
                  onChange={(event) => {
                    const value = event.target.value
                    if (!value) {
                      setManualIp(null)
                      return
                    }
                    const parsed = parseInt(value, 10)
                    setManualIp(Number.isNaN(parsed) ? null : parsed)
                  }}
                />
                <button
                  className="text-xs text-accent"
                  type="button"
                  onClick={() => setManualIp(null)}
                >
                  Reset
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn-secondary px-3 py-2 text-xs"
                  type="button"
                  onClick={() => resetCurrent()}
                >
                  Clear Build
                </button>
                <button
                  className="btn-forge px-4 py-2 text-xs"
                  disabled={!canSave}
                  onClick={() => saveBuild()}
                >
                  Save Build
                </button>
                {!canSave && (
                  <span className="text-[11px] text-muted-light dark:text-muted">
                    Add a weapon to save.
                  </span>
                )}
              </div>
            </div>

            {weaponId ? (
              <div className="mt-2 rounded-xl border border-border-light bg-bg-light/50 p-4 dark:border-border dark:bg-bg/50">
                <DamageRotation weaponId={weaponId} weaponIP={weaponIP} size="lg" variant="full" />
              </div>
            ) : (
              <div className="mt-2 rounded-xl border border-border-light bg-bg-light/50 p-4 text-sm dark:border-border dark:bg-bg/50">
                Equip a weapon to unlock spell selection and damage rotation.
              </div>
            )}
          </div>

          <details className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
            <summary className="cursor-pointer text-xs uppercase tracking-wide text-muted-light dark:text-muted">
              Advanced Slot Settings
            </summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => (
                <BuildSlot
                  key={slot.key}
                  label={slot.label}
                  slotKey={slot.key}
                  items={slot.items}
                  value={current[slot.key as keyof typeof current] as BuildItemRef | undefined}
                  onSelect={(item) => handleSlotSelect(slot.key, item)}
                  onQualityChange={(quality) => handleQualityChange(slot.key, quality)}
                  onTierChange={(tier) => handleTierChange(slot.key, tier)}
                  disabled={slot.key === 'offhand' && isTwoHanded}
                />
              ))}
            </div>
          </details>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-3 rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
            <div className="text-xs uppercase tracking-wide text-muted-light dark:text-muted">
              Saved Builds
            </div>
            {builds.length === 0 ? (
                <div className="text-sm text-muted-light dark:text-muted">
                  No saved builds yet.
                </div>
              ) : (
                <div className="grid gap-2 text-sm">
                  {builds.map((build) => (
                    <div
                      key={build.id}
                      className="grid gap-1 rounded-lg border border-border-light bg-bg-light/60 dark:border-border dark:bg-bg/60"
                    >
                      <div className="flex items-start justify-between px-3 py-2">
                        <div>
                          <div className="text-text1-light dark:text-text1">{build.name}</div>
                          <div className="text-[11px] text-muted-light dark:text-muted">
                            You - Custom - {new Date(build.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          className="text-xs text-accent"
                          type="button"
                          onClick={() =>
                            setOpenSavedId((current) =>
                              current === build.id ? null : build.id
                            )
                          }
                        >
                          {openSavedId === build.id ? 'Less' : 'More'}
                        </button>
                      </div>
                      {openSavedId === build.id && (
                        <div className="grid gap-2 px-3 pb-3">
                          <BuildLoadoutStrip
                            build={build as Record<string, BuildItemRef | undefined>}
                            size="sm"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              className="btn-secondary px-3 py-1 text-xs"
                              type="button"
                              onClick={() => loadBuild(build.id)}
                            >
                              Load
                            </button>
                            <button
                              className="btn-secondary px-3 py-1 text-xs"
                              type="button"
                              onClick={() => setViewBuildId(build.id)}
                            >
                              View
                            </button>
                            <button
                              className="btn-forge px-3 py-1 text-xs"
                              type="button"
                              onClick={() => setShareBuild(build)}
                            >
                              Share
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>

          <div className="grid gap-3 rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
            <div className="text-xs uppercase tracking-wide text-muted-light dark:text-muted">
              Community Builds
            </div>
            <div className="grid gap-2 text-xs">
              {COMMUNITY_BUILDS.map((preset) => (
                <div
                  key={preset.id}
                  className="rounded-lg border border-border-light bg-bg-light/60 dark:border-border dark:bg-bg/60"
                >
                  <div className="flex items-start justify-between px-3 py-2 text-sm font-semibold text-text1-light dark:text-text1">
                    <div>
                      <div>{preset.name}</div>
                      <div className="text-[11px] text-muted-light dark:text-muted">
                        {preset.author} - {preset.category}
                      </div>
                    </div>
                    <button
                      className="text-xs text-accent"
                      type="button"
                      onClick={() =>
                        setOpenCommunityId((current) =>
                          current === preset.id ? null : preset.id
                        )
                      }
                    >
                      {openCommunityId === preset.id ? 'Less' : 'More'}
                    </button>
                  </div>
                  {openCommunityId === preset.id && (
                    <div className="px-3 pb-3">
                      <BuildLoadoutStrip build={preset.slots} size="sm" />
                      <div className="mt-3 grid gap-2 text-[11px] text-muted-light dark:text-muted">
                        <div>{preset.description}</div>
                        <button
                          className="btn-secondary mt-1 px-3 py-1 text-xs"
                          type="button"
                          onClick={() => {
                            setName(preset.name)
                            setManualIp(null)
                            setIp(0)
                            slots.forEach(({ key }) =>
                              setSlot(key as keyof typeof current, undefined)
                            )
                            Object.entries(preset.slots).forEach(([key, item]) => {
                              if (item) {
                                setSlot(key as keyof typeof current, item)
                              }
                            })
                          }}
                        >
                          Load Preset
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {builds.length >= 2 && <BuildCompare builds={builds} />}

      {pickerSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-3xl rounded-2xl border border-border-light bg-surface-light p-6 shadow-2xl dark:border-border dark:bg-surface">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-text1-light dark:text-text1">
                Select {pickerSlot.label}
              </div>
              <button className="text-xs text-accent" type="button" onClick={closePicker}>
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <input
                className="rounded border border-border-light bg-bg-light px-3 py-2 text-sm dark:border-border dark:bg-bg"
                placeholder="Search by name..."
                value={pickerQuery}
                onChange={(event) => setPickerQuery(event.target.value)}
              />
              <select
                className="rounded border border-border-light bg-bg-light px-3 py-2 text-sm dark:border-border dark:bg-bg"
                value={pickerTier}
                onChange={(event) => {
                  const value = event.target.value
                  setPickerTier(value === 'all' ? 'all' : parseInt(value, 10))
                }}
              >
                <option value="all">All tiers</option>
                {TIER_OPTIONS.map((tier) => (
                  <option key={`picker-tier-${tier}`} value={tier}>
                    T{tier}
                  </option>
                ))}
              </select>
              <select
                className="rounded border border-border-light bg-bg-light px-3 py-2 text-sm capitalize dark:border-border dark:bg-bg"
                value={pickerQuality}
                onChange={(event) => setPickerQuality(event.target.value as ItemQuality)}
              >
                {Object.keys(QUALITY_BONUS).map((quality) => (
                  <option key={`picker-quality-${quality}`} value={quality}>
                    {quality}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 max-h-[420px] overflow-auto rounded-lg border border-border-light dark:border-border">
              {pickerItems.slice(0, 200).map((item) => (
                <button
                  key={item.id}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-amber-100/10"
                  onClick={() => {
                    const tier = parseTier(item.id)
                    const enchant = parseEnchant(item.id)
                    setSlot(pickerSlot.key as keyof typeof current, {
                      uniquename: item.id,
                      tier,
                      enchant,
                      quality: pickerQuality,
                    })
                    closePicker()
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://render.albiononline.com/v1/item/${item.id}`}
                      alt={item.id}
                      className="h-8 w-8 rounded"
                      loading="lazy"
                    />
                    <div className="flex flex-col">
                      <span className="text-text1-light dark:text-text1">{item.id}</span>
                      <span className="text-[11px] text-muted-light dark:text-muted">
                        T{parseTier(item.id)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] uppercase text-muted-light dark:text-muted">
                    {pickerSlot.label}
                  </span>
                </button>
              ))}
              {pickerItems.length === 0 && (
                <div className="px-3 py-4 text-sm text-muted-light dark:text-muted">
                  No matches found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BuildPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        characterName={panelCharacter}
      />

      {viewBuildId && (
        <BuildViewModal
          build={builds.find((build) => build.id === viewBuildId)!}
          onClose={() => setViewBuildId(null)}
        />
      )}

      {shareBuild && (
        <ShareBuildModal
          build={shareBuild}
          onClose={() => setShareBuild(null)}
        />
      )}
    </section>
  )
}
