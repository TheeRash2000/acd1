'use client'

import { useMemo, useState } from 'react'
import { calculateFocusCost, calculateTotalFCE, FCE_CONSTANTS } from '@/constants/goldenium'
import { getGearFCEData, getRefiningFCEData, FOOD_FCE, POTION_FCE } from '@/lib/crafting/fce-types'
import type { Item } from '@/lib/crafting/types'

interface Props {
  item?: Item | null
  category?: 'gear' | 'food' | 'potion' | 'refining'
  subcategory?: string
  tier?: number
  enchantment?: number
  isArtifact?: boolean
  isCrystal?: boolean
  materialType?: 'ore' | 'wood' | 'hide' | 'fiber' | 'stone'
}

export function FocusCalculator({
  item,
  category,
  subcategory,
  tier = 4,
  enchantment = 0,
  isArtifact = false,
  isCrystal = false,
  materialType,
}: Props) {
  const [masteryLevel, setMasteryLevel] = useState(100)
  const [specLevel, setSpecLevel] = useState(100)
  const [mutualSpecLevels, setMutualSpecLevels] = useState(0)

  // Determine FCE data based on category and item
  const fceData = useMemo(() => {
    const effectiveCategory = category ?? item?.category
    const effectiveSubcategory = subcategory ?? item?.subcategory ?? ''
    const effectiveTier = tier ?? item?.tier ?? 4
    const effectiveEnchant = enchantment ?? item?.enchantment ?? 0
    const effectiveIsArtifact = isArtifact ?? item?.is_artifact ?? false

    if (effectiveCategory === 'gear') {
      return getGearFCEData(effectiveSubcategory, effectiveIsArtifact, isCrystal)
    }

    if (effectiveCategory === 'food') {
      const foodType = effectiveSubcategory.toLowerCase()
      return FOOD_FCE[foodType] ?? { baseFocus: 56, specUniqueFCE: 30, specMutualFCE: 30 }
    }

    if (effectiveCategory === 'potion') {
      const potionType = effectiveSubcategory.toLowerCase()
      return POTION_FCE[potionType] ?? { baseFocus: 56, specUniqueFCE: 30, specMutualFCE: 30 }
    }

    if (effectiveCategory === 'refining' && materialType) {
      return getRefiningFCEData(materialType, effectiveTier, effectiveEnchant)
    }

    // Default FCE values
    return { baseFocus: 250, specUniqueFCE: 30, specMutualFCE: 30 }
  }, [item, category, subcategory, tier, enchantment, isArtifact, isCrystal, materialType])

  // Calculate total FCE and actual focus cost
  const { totalFCE, actualFocusCost, reductionPercent, halvings } = useMemo(() => {
    if (!fceData) {
      return { totalFCE: 0, actualFocusCost: 0, reductionPercent: 0, halvings: 0 }
    }

    const totalFCE = calculateTotalFCE({
      masteryLevel,
      masteryFCEPerLevel: FCE_CONSTANTS.MASTERY_FCE_PER_LEVEL,
      specLevel,
      specUniqueFCE: fceData.specUniqueFCE,
      mutualSpecLevels,
      specMutualFCE: fceData.specMutualFCE,
    })

    const actualFocusCost = calculateFocusCost(fceData.baseFocus, totalFCE)
    const reductionPercent = ((fceData.baseFocus - actualFocusCost) / fceData.baseFocus) * 100
    const halvings = totalFCE / FCE_CONSTANTS.HALVING_THRESHOLD

    return { totalFCE, actualFocusCost, reductionPercent, halvings }
  }, [fceData, masteryLevel, specLevel, mutualSpecLevels])

  if (!fceData) {
    return (
      <div className="rounded-xl border border-border-light bg-bg-light/60 p-3 text-xs text-muted-light dark:border-border dark:bg-bg/60 dark:text-muted">
        No FCE data available for this item
      </div>
    )
  }

  return (
    <div className="grid gap-3 rounded-xl border border-border-light bg-bg-light/60 p-3 text-xs dark:border-border dark:bg-bg/60">
      <div className="flex items-center justify-between text-[11px] uppercase text-muted-light dark:text-muted">
        <span>Focus Calculator</span>
        <span className="text-text1-light dark:text-text1">
          {actualFocusCost.toFixed(1)} Focus
        </span>
      </div>

      {/* FCE Data Display */}
      <div className="grid gap-1 rounded-lg border border-border/40 bg-bg-light/30 p-2 text-[11px] dark:bg-bg/30">
        <div className="text-[10px] uppercase tracking-wide text-muted-light dark:text-muted">
          Item FCE Values
        </div>
        <div className="grid gap-0.5">
          <div className="flex justify-between">
            <span>Base Focus Cost:</span>
            <span>{fceData.baseFocus}</span>
          </div>
          <div className="flex justify-between">
            <span>Spec Unique FCE/lvl:</span>
            <span>{fceData.specUniqueFCE}</span>
          </div>
          <div className="flex justify-between">
            <span>Spec Mutual FCE/lvl:</span>
            <span>{fceData.specMutualFCE}</span>
          </div>
        </div>
      </div>

      {/* Input Sliders */}
      <div className="grid gap-2">
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
            <span>Mutual Spec Levels (total)</span>
            <span>{mutualSpecLevels}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            value={mutualSpecLevels}
            onChange={(e) => setMutualSpecLevels(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-1 rounded-lg border border-border/40 bg-bg-light/30 p-2 text-[11px] dark:bg-bg/30">
        <div className="text-[10px] uppercase tracking-wide text-muted-light dark:text-muted">
          Focus Calculation
        </div>
        <div className="grid gap-0.5">
          <div className="flex justify-between">
            <span>Total FCE:</span>
            <span className="font-medium">{totalFCE.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Halvings (FCE / 10,000):</span>
            <span>{halvings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Reduction Factor:</span>
            <span>2^{halvings.toFixed(2)} = {Math.pow(2, halvings).toFixed(2)}x</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-border/40 pt-1">
            <span>Base Focus Cost:</span>
            <span>{fceData.baseFocus}</span>
          </div>
          <div className="flex justify-between font-bold text-text1-light dark:text-text1">
            <span>Actual Focus Cost:</span>
            <span className="text-green-400">{actualFocusCost.toFixed(1)}</span>
          </div>
          <div className="flex justify-between text-green-400">
            <span>Reduction:</span>
            <span>-{reductionPercent.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* FCE Breakdown */}
      <div className="grid gap-1 rounded-lg border border-border/40 bg-bg-light/30 p-2 text-[11px] dark:bg-bg/30">
        <div className="text-[10px] uppercase tracking-wide text-muted-light dark:text-muted">
          FCE Sources
        </div>
        <div className="grid gap-0.5">
          <div className="flex justify-between">
            <span>Mastery ({masteryLevel} x {FCE_CONSTANTS.MASTERY_FCE_PER_LEVEL}):</span>
            <span>{masteryLevel * FCE_CONSTANTS.MASTERY_FCE_PER_LEVEL}</span>
          </div>
          <div className="flex justify-between">
            <span>Spec Unique ({specLevel} x {fceData.specUniqueFCE}):</span>
            <span>{(specLevel * fceData.specUniqueFCE).toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span>Spec Mutual ({mutualSpecLevels} x {fceData.specMutualFCE}):</span>
            <span>{mutualSpecLevels * fceData.specMutualFCE}</span>
          </div>
        </div>
      </div>

      {/* Formula */}
      <div className="text-[10px] text-muted-light dark:text-muted">
        Formula: actualCost = baseCost / (2 ^ (totalFCE / 10000))
        <br />
        Source: Goldenium All-In-One V2.6.0
      </div>
    </div>
  )
}
