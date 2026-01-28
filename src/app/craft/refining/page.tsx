'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useCraftingStore } from '@/stores/crafting'
import { RRRSelector } from '@/components/crafting/RRRSelector'
import {
  REFINING_BASE_FOCUS,
  REFINING_BONUS_CITIES,
  REFINING_OUTPUT_NAMES,
  REFINING_FCE_VALUES,
  type RefiningMaterialType,
} from '@/lib/crafting/fce-types'
import {
  calculateFocusCost,
  calculateTotalFCE,
  calculateTotalBonus,
  calculateGoldeniumRRR,
  FCE_CONSTANTS,
  CRAFTING_BONUSES,
} from '@/constants/goldenium'

// Material types with verified bonus cities from spreadsheet
const MATERIAL_TYPES: { id: RefiningMaterialType; name: string; outputName: string; bonusCity: string }[] = [
  { id: 'ore', name: 'Ore', outputName: 'Metal Bars', bonusCity: 'Thetford' },
  { id: 'fiber', name: 'Fiber', outputName: 'Cloth', bonusCity: 'Lymhurst' },
  { id: 'hide', name: 'Hide', outputName: 'Leather', bonusCity: 'Martlock' },
  { id: 'wood', name: 'Wood', outputName: 'Planks', bonusCity: 'Fort Sterling' },
  { id: 'stone', name: 'Stone', outputName: 'Stone Blocks', bonusCity: 'Bridgewatch' },
]

const TIERS = [3, 4, 5, 6, 7, 8]
const ENCHANTMENTS = [0, 1, 2, 3, 4]

export default function RefiningPage() {
  const { inputs, updateInputs } = useCraftingStore()
  const [selectedMaterial, setSelectedMaterial] = useState<RefiningMaterialType>('ore')
  const [selectedTier, setSelectedTier] = useState(4)
  const [selectedEnchant, setSelectedEnchant] = useState(0)

  // Spec levels for focus calculation
  const [masteryLevel, setMasteryLevel] = useState(100)
  const [specLevel, setSpecLevel] = useState(100)
  const [mutualSpecLevels, setMutualSpecLevels] = useState(0)

  const materialData = MATERIAL_TYPES.find((m) => m.id === selectedMaterial)

  // Get exact base focus from spreadsheet data
  const focusKey = `${selectedTier}.${selectedEnchant}`
  const baseFocus = REFINING_BASE_FOCUS[focusKey] ?? 0

  // Calculate FCE and actual focus cost
  const { totalFCE, actualFocusCost, reductionPercent } = useMemo(() => {
    const totalFCE = calculateTotalFCE({
      masteryLevel,
      masteryFCEPerLevel: FCE_CONSTANTS.MASTERY_FCE_PER_LEVEL,
      specLevel,
      specUniqueFCE: REFINING_FCE_VALUES.specUniqueFCE,
      mutualSpecLevels,
      specMutualFCE: REFINING_FCE_VALUES.specMutualFCE,
    })

    const actualFocusCost = calculateFocusCost(baseFocus, totalFCE)
    const reductionPercent = baseFocus > 0 ? ((baseFocus - actualFocusCost) / baseFocus) * 100 : 0

    return { totalFCE, actualFocusCost, reductionPercent }
  }, [baseFocus, masteryLevel, specLevel, mutualSpecLevels])

  // Calculate RRR
  // For refining, we use a simplified calculation based on city bonus and focus
  const rrr = useMemo(() => {
    let totalBonus = 0

    // City bonus (+15% if in bonus city)
    if (inputs.city === materialData?.bonusCity) {
      totalBonus += CRAFTING_BONUSES.CITY_BONUS
    }

    // Focus bonus (+59% if using focus)
    if (inputs.useFocus) {
      totalBonus += CRAFTING_BONUSES.FOCUS_BONUS
    }

    return calculateGoldeniumRRR(totalBonus)
  }, [inputs.city, inputs.useFocus, materialData?.bonusCity])

  // Check if T3 is selected (only .0 enchant available)
  const availableEnchants = selectedTier === 3 ? [0] : ENCHANTMENTS

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">
            Refining Calculator
          </h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Material refining with return rate and focus calculations.
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex flex-wrap items-center gap-2 text-xs">
        <Link
          href="/craft/gear"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          GEAR
        </Link>
        <Link
          href="/craft/food"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          FOOD
        </Link>
        <Link
          href="/craft/potions"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          POTIONS
        </Link>
        <Link
          href="/craft/refining"
          className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-amber-300"
        >
          REFINING
        </Link>
        <Link
          href="/craft"
          className="ml-auto rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          Classic View
        </Link>
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Material Selection */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-4 text-sm font-medium text-text1-light dark:text-text1">
            Material Type
          </h2>

          <div className="grid gap-1">
            {MATERIAL_TYPES.map((material) => (
              <button
                key={material.id}
                type="button"
                onClick={() => setSelectedMaterial(material.id)}
                className={`rounded px-3 py-2 text-left text-xs transition-colors ${
                  selectedMaterial === material.id
                    ? 'bg-amber-400/10 text-amber-300'
                    : 'text-text1-light hover:bg-bg-light/60 dark:text-text1 dark:hover:bg-bg/60'
                }`}
              >
                <div className="font-medium">{material.name} → {material.outputName}</div>
                <div className="text-[10px] text-muted-light dark:text-muted">
                  Bonus City: {material.bonusCity}
                </div>
              </button>
            ))}
          </div>

          {/* Tier Selection */}
          <div className="mt-4 grid gap-2">
            <label className="text-[11px] uppercase text-muted-light dark:text-muted">Tier</label>
            <div className="flex gap-1">
              {TIERS.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => {
                    setSelectedTier(tier)
                    // Reset enchant to 0 if switching to T3
                    if (tier === 3) setSelectedEnchant(0)
                  }}
                  className={`flex-1 rounded px-2 py-1.5 text-xs transition-colors ${
                    selectedTier === tier
                      ? 'bg-amber-400/10 text-amber-300'
                      : 'bg-bg-light text-text1-light hover:bg-bg-light/80 dark:bg-bg dark:text-text1 dark:hover:bg-bg/80'
                  }`}
                >
                  T{tier}
                </button>
              ))}
            </div>
          </div>

          {/* Enchantment Selection */}
          <div className="mt-4 grid gap-2">
            <label className="text-[11px] uppercase text-muted-light dark:text-muted">Enchantment</label>
            <div className="flex gap-1">
              {availableEnchants.map((enchant) => (
                <button
                  key={enchant}
                  type="button"
                  onClick={() => setSelectedEnchant(enchant)}
                  className={`flex-1 rounded px-2 py-1.5 text-xs transition-colors ${
                    selectedEnchant === enchant
                      ? 'bg-amber-400/10 text-amber-300'
                      : 'bg-bg-light text-text1-light hover:bg-bg-light/80 dark:bg-bg dark:text-text1 dark:hover:bg-bg/80'
                  }`}
                >
                  .{enchant}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RRR Calculator */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-4 text-sm font-medium text-text1-light dark:text-text1">
            Return Rate
          </h2>

          <RRRSelector
            locationType={inputs.locationType}
            selectedCity={inputs.city}
            hideoutConfig={inputs.hideoutConfig}
            onLocationTypeChange={(value) => updateInputs({ locationType: value })}
            onCityChange={(value) => updateInputs({ city: value })}
            onHideoutChange={(value) => updateInputs({ hideoutConfig: value })}
            computedRrr={rrr}
          />

          <div className="mt-4 rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-light dark:text-muted">Material Return Rate:</span>
              <span className="text-lg font-bold text-green-400">
                {(rrr * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Bonus city info */}
          {materialData && (
            <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-2 text-[11px] text-amber-300">
              <strong>{materialData.name}</strong> has city bonus in <strong>{materialData.bonusCity}</strong>
            </div>
          )}
        </div>

        {/* Focus Calculator */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-4 text-sm font-medium text-text1-light dark:text-text1">
            Focus Cost
          </h2>

          {/* Spec Level Inputs */}
          <div className="grid gap-3">
            <div className="grid gap-1">
              <div className="flex items-center justify-between text-[11px] text-muted-light dark:text-muted">
                <span>Mastery Level</span>
                <span>{masteryLevel}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={masteryLevel}
                onChange={(e) => setMasteryLevel(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>

            <div className="grid gap-1">
              <div className="flex items-center justify-between text-[11px] text-muted-light dark:text-muted">
                <span>Specialization Level</span>
                <span>{specLevel}</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                value={specLevel}
                onChange={(e) => setSpecLevel(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>

            <div className="grid gap-1">
              <div className="flex items-center justify-between text-[11px] text-muted-light dark:text-muted">
                <span>Mutual Spec Levels</span>
                <span>{mutualSpecLevels}</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={mutualSpecLevels}
                onChange={(e) => setMutualSpecLevels(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>
          </div>

          {/* Results */}
          <div className="mt-4 grid gap-2 rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-light dark:text-muted">Total FCE:</span>
              <span className="font-medium">{totalFCE.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-light dark:text-muted">Base Focus Cost:</span>
              <span className="font-medium">{baseFocus}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-border-light pt-2 dark:border-border">
              <span className="text-muted-light dark:text-muted">Actual Focus Cost:</span>
              <span className="text-lg font-bold text-green-400">{actualFocusCost.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-green-400">
              <span>Reduction:</span>
              <span>-{reductionPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Refining Info */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <h2 className="mb-4 text-sm font-medium text-text1-light dark:text-text1">
          T{selectedTier}.{selectedEnchant} {materialData?.outputName} - Data Summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-5">
          <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
            <div className="text-[10px] uppercase text-muted-light dark:text-muted">Base Focus</div>
            <div className="text-lg font-bold text-text1-light dark:text-text1">{baseFocus}</div>
          </div>
          <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
            <div className="text-[10px] uppercase text-muted-light dark:text-muted">Actual Focus</div>
            <div className="text-lg font-bold text-green-400">{actualFocusCost.toFixed(1)}</div>
          </div>
          <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
            <div className="text-[10px] uppercase text-muted-light dark:text-muted">Return Rate</div>
            <div className="text-lg font-bold text-green-400">{(rrr * 100).toFixed(2)}%</div>
          </div>
          <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
            <div className="text-[10px] uppercase text-muted-light dark:text-muted">Unique FCE/lvl</div>
            <div className="text-lg font-bold text-text1-light dark:text-text1">{REFINING_FCE_VALUES.specUniqueFCE}</div>
          </div>
          <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 dark:border-border dark:bg-bg/40">
            <div className="text-[10px] uppercase text-muted-light dark:text-muted">Bonus City</div>
            <div className="text-lg font-bold text-amber-300">{materialData?.bonusCity}</div>
          </div>
        </div>

        {/* Focus Cost Table */}
        <div className="mt-4">
          <h3 className="mb-2 text-xs font-medium text-text1-light dark:text-text1">
            Base Focus Cost Reference (from spreadsheet)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border-light dark:border-border">
                  <th className="px-2 py-1 text-left text-muted-light dark:text-muted">Tier</th>
                  {ENCHANTMENTS.map((e) => (
                    <th key={e} className="px-2 py-1 text-right text-muted-light dark:text-muted">.{e}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIERS.map((tier) => (
                  <tr key={tier} className="border-b border-border-light/50 dark:border-border/50">
                    <td className="px-2 py-1 font-medium">T{tier}</td>
                    {ENCHANTMENTS.map((e) => {
                      const key = `${tier}.${e}`
                      const focus = REFINING_BASE_FOCUS[key]
                      const isSelected = tier === selectedTier && e === selectedEnchant
                      return (
                        <td
                          key={e}
                          className={`px-2 py-1 text-right ${
                            isSelected ? 'bg-amber-400/20 font-bold text-amber-300' : ''
                          } ${focus === undefined ? 'text-muted-light/50 dark:text-muted/50' : ''}`}
                        >
                          {focus ?? '-'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
