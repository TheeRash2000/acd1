/**
 * Focus Cost Efficiency (FCE) Calculator
 * Based on verified Wiki formulas
 *
 * FORMULA:
 * Actual Cost = Base Cost / (2 ^ (Total FCE / 10000))
 *
 * FCE halves the focus cost every 10,000 points:
 * - 0 FCE: 100% cost
 * - 10,000 FCE: 50% cost
 * - 20,000 FCE: 25% cost
 * - 30,000 FCE: 12.5% cost
 * - 40,000 FCE: 6.25% cost
 */

import type { FocusCalculationResult } from '@/types/destiny-board';
import { FOCUS_COSTS, FCE_CONSTANTS } from '@/constants/albion-constants';

export interface FocusCalculationInput {
  activity: 'equipment' | 'consumable' | 'refining_ore' | 'refining_hide' | 'refining_stone' | 'refining_wood' | 'refining_fiber';
  tier: string; // 'T4', 'T5', etc.
  masteryLevel: number; // 0-100
  equippedSpecLevel: number; // 0-120
  equipmentType: 'simple' | 'royal' | 'artifact' | 'avalonian'; // For FCE rates
  allSpecsInMastery: Record<string, { level: number; type: 'simple' | 'royal' | 'artifact' | 'avalonian' }>;
}

/**
 * Get base focus cost for activity and tier
 */
function getBaseFocusCost(activity: string, tier: string): number {
  const key = `${activity}_${tier.toLowerCase()}` as keyof typeof FOCUS_COSTS;
  return FOCUS_COSTS[key] || FOCUS_COSTS.equipment_t4;
}

/**
 * Calculate FCE from mastery level
 */
function getMasteryFCE(masteryLevel: number): number {
  // Mastery provides FCE linearly: 3000 at level 100
  return (masteryLevel / 100) * FCE_CONSTANTS.MASTERY_FCE;
}

/**
 * Calculate unique FCE from equipped specialization
 */
function getUniqueFCE(specLevel: number, equipmentType: string): number {
  // Simple specs: 25,000 unique FCE at level 100
  // Artifact/Royal/Avalonian: 25,000 unique FCE at level 100
  const baseFCE = FCE_CONSTANTS.SIMPLE_UNIQUE_FCE; // All types have same unique FCE
  return (specLevel / 100) * baseFCE;
}

/**
 * Calculate mutual FCE from all specs in mastery
 */
function getMutualFCE(
  allSpecs: Record<string, { level: number; type: string }>,
  equippedSpecId?: string
): number {
  let totalMutual = 0;

  for (const [specId, spec] of Object.entries(allSpecs)) {
    let mutualRate: number;

    if (spec.type === 'simple' || spec.type === '2.simple' || spec.type === '3.simple') {
      mutualRate = FCE_CONSTANTS.SIMPLE_MUTUAL_FCE; // 3000 at level 100
    } else {
      mutualRate = FCE_CONSTANTS.ARTIFACT_MUTUAL_FCE; // 1500 at level 100
    }

    totalMutual += (spec.level / 100) * mutualRate;
  }

  return totalMutual;
}

/**
 * Calculate focus cost with FCE reduction
 *
 * Example:
 * T6 Battleaxe Crafting
 * - Mastery (Axe Crafter) Level 100: 3,000 FCE
 * - Battleaxe Spec Level 100: 25,000 unique + 3,000 mutual = 28,000 FCE
 * - Greataxe Spec Level 100: 3,000 mutual FCE
 * - Halberd Spec Level 100: 3,000 mutual FCE
 * - 4 artifact specs Level 100: 4 × 1,500 = 6,000 mutual FCE
 * Total FCE: 3,000 + 28,000 + 3,000 + 3,000 + 6,000 = 43,000 FCE
 *
 * Reduction: 2 ^ (43,000 / 10,000) = 2 ^ 4.3 = 19.7×
 * Base cost T6: 137 focus
 * Actual cost: 137 / 19.7 ≈ 7 focus
 */
export function calculateFocusCost(input: FocusCalculationInput): FocusCalculationResult {
  const {
    activity,
    tier,
    masteryLevel,
    equippedSpecLevel,
    equipmentType,
    allSpecsInMastery,
  } = input;

  // 1. Get base cost for activity
  const baseFocusCost = getBaseFocusCost(activity, tier);

  // 2. Calculate total FCE
  const masteryFCE = getMasteryFCE(masteryLevel);
  const uniqueFCE = getUniqueFCE(equippedSpecLevel, equipmentType);
  const mutualFCE = getMutualFCE(allSpecsInMastery);

  const totalFCE = masteryFCE + uniqueFCE + mutualFCE;

  // 3. Calculate reduction factor (halves every 10,000 FCE)
  const reductionFactor = Math.pow(2, totalFCE / FCE_CONSTANTS.HALVING_THRESHOLD);

  // 4. Calculate actual cost
  const actualFocusCost = baseFocusCost / reductionFactor;

  // 5. Calculate percentage of base
  const percentOfBase = (actualFocusCost / baseFocusCost) * 100;

  return {
    baseActivity: activity,
    baseFocusCost,
    totalFCE,
    reductionFactor,
    actualFocusCost: Math.round(actualFocusCost * 10) / 10, // Round to 1 decimal
    percentOfBase: Math.round(percentOfBase * 10) / 10,
    breakdown: {
      masteryFCE,
      uniqueFCE,
      mutualFCE,
    },
  };
}

/**
 * Calculate focus savings per day with premium
 */
export function calculateDailyFocusSavings(
  focusCostPerCraft: number,
  craftsPerDay: number,
  premiumFocusPerDay: number = 10000
): {
  totalFocusNeeded: number;
  focusSaved: number;
  silverSaved: number; // Assuming 1 focus = X silver
  canAffordCrafts: boolean;
} {
  const totalFocusNeeded = focusCostPerCraft * craftsPerDay;
  const focusSaved = Math.min(totalFocusNeeded, premiumFocusPerDay);
  const canAffordCrafts = totalFocusNeeded <= premiumFocusPerDay;

  // Rough estimate: 1 focus ≈ 500 silver value
  const silverSaved = focusSaved * 500;

  return {
    totalFocusNeeded,
    focusSaved,
    silverSaved,
    canAffordCrafts,
  };
}

/**
 * Calculate optimal spec levels for maximum FCE efficiency
 * Returns the "sweet spot" where diminishing returns kick in
 */
export function calculateOptimalFCELevels(
  targetReduction: number = 0.1 // Target 10% of base cost
): {
  masteryLevel: number;
  specLevel: number;
  totalFCE: number;
} {
  // Work backwards from desired reduction
  // reduction = 1 / (2 ^ (FCE / 10000))
  // 0.1 = 1 / (2 ^ (FCE / 10000))
  // 2 ^ (FCE / 10000) = 10
  // FCE / 10000 = log2(10) ≈ 3.32
  // FCE ≈ 33,200

  const targetFCE = Math.log2(1 / targetReduction) * FCE_CONSTANTS.HALVING_THRESHOLD;

  // Distribute FCE optimally
  // Prioritize: Mastery (3k) + Equipped Spec (28k) = 31k base
  // Then add mutual from other specs

  const masteryLevel = 100; // Always max mastery first
  const masteryFCE = FCE_CONSTANTS.MASTERY_FCE;

  const remainingFCE = Math.max(0, targetFCE - masteryFCE);
  const specLevel = Math.min(100, Math.ceil((remainingFCE / (FCE_CONSTANTS.SIMPLE_UNIQUE_FCE + FCE_CONSTANTS.SIMPLE_MUTUAL_FCE)) * 100));

  return {
    masteryLevel,
    specLevel,
    totalFCE: targetFCE,
  };
}

/**
 * Compare focus costs between different spec levels
 * Useful for showing "how much focus will I save if I level up?"
 */
export function compareFocusCosts(
  current: FocusCalculationInput,
  target: Partial<FocusCalculationInput>
): {
  currentCost: number;
  targetCost: number;
  savings: number;
  savingsPercent: number;
} {
  const currentResult = calculateFocusCost(current);
  const targetResult = calculateFocusCost({ ...current, ...target });

  const savings = currentResult.actualFocusCost - targetResult.actualFocusCost;
  const savingsPercent = (savings / currentResult.actualFocusCost) * 100;

  return {
    currentCost: currentResult.actualFocusCost,
    targetCost: targetResult.actualFocusCost,
    savings,
    savingsPercent,
  };
}
