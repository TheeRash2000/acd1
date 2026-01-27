/**
 * Albion Online Constants - Based on Wiki
 * CRITICAL: These values are verified from in-game mechanics
 */

// ============================================================================
// ITEM POWER (IP) CONSTANTS
// ============================================================================

/**
 * Mastery Modifier by Tier
 * Applies ONLY to Destiny Board IP, NOT to base IP
 * T4 and below have 0% modifier
 */
export const MASTERY_MODIFIER_BY_TIER = {
  T1: 0,
  T2: 0,
  T3: 0,
  T4: 0,
  T5: 0.05, // 5%
  T6: 0.1, // 10%
  T7: 0.15, // 15%
  T8: 0.20, // 20%
} as const;

/**
 * Base Item Power by Tier
 * T4 = 700, increases by 100 per tier
 */
export const BASE_IP_BY_TIER = {
  T1: 400,
  T2: 500,
  T3: 600,
  T4: 700,
  T5: 800,
  T6: 900,
  T7: 1000,
  T8: 1100,
} as const;

/**
 * Mutual IP Rates by Equipment Type
 * CRITICAL: Off-hand has 3× multiplier (0.6 instead of 0.2)
 */
export const MUTUAL_IP_RATES = {
  // Armor (Head/Chest/Feet)
  armor_simple: 0.2,
  armor_royal: 0.1,
  armor_artifact: 0.1,
  armor_misty: 0.1, // Note: Wiki shows 0.1 despite being "simple-like"
  armor_avalonian: 0.1,

  // Weapons (Main-hand/Two-hand)
  weapon_simple: 0.2,
  weapon_artifact: 0.1,
  weapon_avalonian: 0.1,

  // Off-hand (3× multiplier!)
  offhand_simple: 0.6, // Shield, Torch, Tome
  offhand_artifact: 0.1,
  offhand_avalonian: 0.1,

  // Gathering tools
  gathering_simple: 0.2,

  // Defaults
  default: 0.2,
} as const;

/**
 * IP contribution constants
 * NEVER change these - they are fundamental game mechanics
 */
export const IP_CONSTANTS = {
  MASTERY_IP_PER_LEVEL: 0.2, // ALWAYS 0.2
  SPECIALIZATION_UNIQUE_IP_PER_LEVEL: 2.0, // ALWAYS 2.0
} as const;

// ============================================================================
// FOCUS COST EFFICIENCY (FCE) CONSTANTS
// ============================================================================

/**
 * Base Focus Costs by Activity
 * These are the costs at 0 FCE
 */
export const FOCUS_COSTS = {
  // Equipment crafting (varies by tier)
  equipment_t4: 112,
  equipment_t5: 125.8, // 112 * sqrt(5/4)
  equipment_t6: 137.1, // 112 * sqrt(6/4)
  equipment_t7: 147.6, // 112 * sqrt(7/4)
  equipment_t8: 157.5, // 112 * sqrt(8/4)

  // Consumable crafting
  consumable_t4: 56,
  consumable_t5: 62.9,
  consumable_t6: 68.6,
  consumable_t7: 73.8,
  consumable_t8: 78.8,

  // Refining (per resource type)
  refining_stone_t4: 54,
  refining_hide_t4: 54,
  refining_ore_t4: 54,
  refining_wood_t4: 54,
  refining_fiber_t4: 54,
} as const;

/**
 * FCE (Focus Cost Efficiency) Rates
 * Focus halves every 10,000 FCE (exponential reduction)
 */
export const FCE_CONSTANTS = {
  // Focus reduction formula: Cost = BaseCost / (2 ^ (FCE / 10000))
  HALVING_THRESHOLD: 10000,

  // Mastery FCE (at level 100)
  MASTERY_FCE: 3000,

  // Specialization FCE (at level 100)
  SIMPLE_UNIQUE_FCE: 25000,
  SIMPLE_MUTUAL_FCE: 3000,

  ARTIFACT_UNIQUE_FCE: 25000,
  ARTIFACT_MUTUAL_FCE: 1500,

  ROYAL_UNIQUE_FCE: 25000,
  ROYAL_MUTUAL_FCE: 1500,

  AVALONIAN_UNIQUE_FCE: 25000,
  AVALONIAN_MUTUAL_FCE: 1500,

  // Max FCE by activity
  MAX_FCE_REFINING: 40000, // 5 nodes × 8,000 each
  MAX_FCE_EQUIPMENT_CRAFTING: 47500, // Varies by equipment type
  MAX_FCE_TOOL_CRAFTING: 40000,
  MAX_FCE_FARMING: 55000, // Varies by activity
} as const;

// ============================================================================
// QUALITY CONTRIBUTION CONSTANTS
// ============================================================================

export const QUALITY_CONSTANTS = {
  // Base quality chance
  BASE_QUALITY_CHANCE: 0.15, // 15%

  // Quality bonus from specializations
  SIMPLE_UNIQUE_QUALITY_PER_LEVEL: 0.002, // 0.2% per level
  SIMPLE_MUTUAL_QUALITY_PER_LEVEL: 0.0002, // 0.02% per level

  ARTIFACT_UNIQUE_QUALITY_PER_LEVEL: 0.002,
  ARTIFACT_MUTUAL_QUALITY_PER_LEVEL: 0.0001, // 0.01% per level
} as const;

// ============================================================================
// PROGRESSION CONSTANTS
// ============================================================================

/**
 * Fame required for levels
 * Level 1-100: Fame-based progression
 * Level 100-120: Silver-based progression (elite levels)
 */
export const PROGRESSION_CONSTANTS = {
  MASTERY_MAX_LEVEL: 100,
  SPECIALIZATION_MAX_LEVEL: 120,
  ELITE_LEVEL_START: 100,

  // Elite levels (100-120) cost silver instead of fame
  SILVER_PER_ELITE_LEVEL: 20000000, // 20 million silver per level
} as const;

// ============================================================================
// PREMIUM CONSTANTS
// ============================================================================

export const PREMIUM_CONSTANTS = {
  FOCUS_PER_DAY: 10000,
  MAX_FOCUS_STORAGE: 30000,
  LEARNING_POINTS_PER_DAY: 20,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get mutual IP rate for equipment type
 */
export function getMutualIPRate(
  equipmentType: string,
  slot?: 'mainhand' | 'offhand' | 'armor' | 'gathering'
): number {
  // Off-hand has special 3× multiplier
  if (slot === 'offhand') {
    if (equipmentType.includes('artifact') || equipmentType.includes('avalonian')) {
      return MUTUAL_IP_RATES.offhand_artifact;
    }
    return MUTUAL_IP_RATES.offhand_simple;
  }

  // Armor
  if (slot === 'armor') {
    if (equipmentType === 'simple' || equipmentType === '2.simple' || equipmentType === '3.simple') {
      return MUTUAL_IP_RATES.armor_simple;
    }
    if (equipmentType === 'royal') return MUTUAL_IP_RATES.armor_royal;
    if (equipmentType.includes('artifact')) return MUTUAL_IP_RATES.armor_artifact;
    if (equipmentType === 'avalonian') return MUTUAL_IP_RATES.armor_avalonian;
    if (equipmentType === 'misty') return MUTUAL_IP_RATES.armor_misty;
  }

  // Weapons
  if (slot === 'mainhand' || !slot) {
    if (equipmentType === 'simple' || equipmentType === '2.simple' || equipmentType === '3.simple') {
      return MUTUAL_IP_RATES.weapon_simple;
    }
    if (equipmentType.includes('artifact')) return MUTUAL_IP_RATES.weapon_artifact;
    if (equipmentType === 'avalonian') return MUTUAL_IP_RATES.weapon_avalonian;
  }

  // Gathering
  if (slot === 'gathering') {
    return MUTUAL_IP_RATES.gathering_simple;
  }

  return MUTUAL_IP_RATES.default;
}

/**
 * Get mastery modifier for tier
 */
export function getMasteryModifier(tier: string): number {
  return MASTERY_MODIFIER_BY_TIER[tier as keyof typeof MASTERY_MODIFIER_BY_TIER] || 0;
}

/**
 * Get base IP for tier
 */
export function getBaseIP(tier: string): number {
  return BASE_IP_BY_TIER[tier as keyof typeof BASE_IP_BY_TIER] || 700;
}
