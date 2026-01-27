/**
 * Goldenium Spreadsheet Constants
 * Source: Copy of Goldenium All-In-One V2.6.0.xlsx
 *
 * These values are extracted directly from the Goldenium spreadsheet
 * and should match exactly.
 */

// Zone Quality Bonus - Level 1-6
export const ZONE_QUALITY_BONUS: Record<number, number> = {
  1: 0.01,   // 1%
  2: 0.06,   // 6%
  3: 0.11,   // 11%
  4: 0.16,   // 16%
  5: 0.21,   // 21%
  6: 0.26,   // 26%
} as const

// Hideout Power Bonus - Level 1-9
export const HIDEOUT_POWER_BONUS: Record<number, number> = {
  1: 0,        // 0%
  2: 0.0975,   // 9.75%
  3: 0.185,    // 18.5%
  4: 0.2625,   // 26.25%
  5: 0.33,     // 33%
  6: 0.3875,   // 38.75%
  7: 0.445,    // 44.5%
  8: 0.5025,   // 50.25%
  9: 0.56,     // 56%
} as const

// Fixed Crafting Bonuses
export const CRAFTING_BONUSES = {
  CITY_BONUS: 0.15,       // +15% when crafting in bonus city
  FOCUS_BONUS: 0.59,      // +59% when using focus
  ISLAND_PENALTY: -0.18,  // -18% when crafting on island
} as const

// Zone Quality Labels for UI
export const ZONE_QUALITY_LABELS: Record<number, string> = {
  1: 'Level 1 (1%)',
  2: 'Level 2 (6%)',
  3: 'Level 3 (11%)',
  4: 'Level 4 (16%)',
  5: 'Level 5 (21%)',
  6: 'Level 6 (26%)',
} as const

// Hideout Power Labels for UI
export const HIDEOUT_POWER_LABELS: Record<number, string> = {
  1: 'Level 1 (0%)',
  2: 'Level 2 (9.75%)',
  3: 'Level 3 (18.5%)',
  4: 'Level 4 (26.25%)',
  5: 'Level 5 (33%)',
  6: 'Level 6 (38.75%)',
  7: 'Level 7 (44.5%)',
  8: 'Level 8 (50.25%)',
  9: 'Level 9 (56%)',
} as const

/**
 * Calculate RRR using the Goldenium formula
 *
 * Formula: RRR = totalBonus / (1 + totalBonus)
 * Which is equivalent to: RRR = 1 - 100 / (100 + totalBonus * 100)
 *
 * @param totalBonus - The sum of all applicable bonuses (as decimal, e.g., 0.15 for 15%)
 * @returns The Return Rate Reduction as a decimal (e.g., 0.13 for 13%)
 */
export function calculateGoldeniumRRR(totalBonus: number): number {
  if (totalBonus <= 0) return 0
  return totalBonus / (1 + totalBonus)
}

/**
 * Calculate total bonus from all sources
 *
 * totalBonus = zoneQualityBonus
 *            + hideoutPowerBonus
 *            + cityBonus (if enabled)
 *            + focusBonus (if enabled)
 *            + islandPenalty (if on island)
 */
export interface RRRBonusInputs {
  zoneQuality: number        // 1-6
  hideoutPower: number       // 1-9
  useCityBonus: boolean
  useFocus: boolean
  isOnIsland: boolean
}

export function calculateTotalBonus(inputs: RRRBonusInputs): number {
  let total = 0

  // Zone Quality
  total += ZONE_QUALITY_BONUS[inputs.zoneQuality] ?? 0

  // Hideout Power
  total += HIDEOUT_POWER_BONUS[inputs.hideoutPower] ?? 0

  // City Bonus
  if (inputs.useCityBonus) {
    total += CRAFTING_BONUSES.CITY_BONUS
  }

  // Focus Bonus
  if (inputs.useFocus) {
    total += CRAFTING_BONUSES.FOCUS_BONUS
  }

  // Island Penalty (negative)
  if (inputs.isOnIsland) {
    total += CRAFTING_BONUSES.ISLAND_PENALTY
  }

  return total
}

/**
 * FCE (Focus Cost Efficiency) Constants
 */
export const FCE_CONSTANTS = {
  HALVING_THRESHOLD: 10000,  // Every 10,000 FCE halves the focus cost
  MASTERY_FCE_PER_LEVEL: 30, // FCE per mastery level (most activities)
} as const

/**
 * Calculate actual focus cost using FCE
 *
 * Formula: actualFocusCost = baseFocusCost / (2 ^ (totalFCE / 10000))
 *
 * @param baseFocusCost - The base focus cost for the activity
 * @param totalFCE - Total Focus Cost Efficiency
 * @returns The actual focus cost after FCE reduction
 */
export function calculateFocusCost(baseFocusCost: number, totalFCE: number): number {
  if (totalFCE <= 0) return baseFocusCost
  const reductionFactor = Math.pow(2, totalFCE / FCE_CONSTANTS.HALVING_THRESHOLD)
  return baseFocusCost / reductionFactor
}

/**
 * Calculate total FCE from mastery and spec levels
 *
 * totalFCE = (masteryLevel * masteryFCEPerLevel)
 *          + (specLevel * specUniqueFCE)
 *          + (mutualSpecLevels * specMutualFCE)
 */
export interface FCEInputs {
  masteryLevel: number
  masteryFCEPerLevel: number
  specLevel: number
  specUniqueFCE: number
  mutualSpecLevels: number
  specMutualFCE: number
}

export function calculateTotalFCE(inputs: FCEInputs): number {
  return (
    inputs.masteryLevel * inputs.masteryFCEPerLevel +
    inputs.specLevel * inputs.specUniqueFCE +
    inputs.mutualSpecLevels * inputs.specMutualFCE
  )
}

/**
 * Crafting Category Types
 * From Goldenium: 1=Mage, 2=Hunter, 3=Warrior, 4=Tools
 */
export type CraftingCategoryId = 1 | 2 | 3 | 4

export const CRAFTING_CATEGORY_NAMES: Record<CraftingCategoryId, string> = {
  1: 'Mage',
  2: 'Hunter',
  3: 'Warrior',
  4: 'Tools',
} as const
