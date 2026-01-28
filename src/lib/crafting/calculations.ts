import type {
  ArtifactRequirement,
  CraftingRequirement,
  GoldeniumCraftingConfig,
  HideoutConfig,
  Item,
  Journal,
} from './types'
import {
  calculateRRR,
  calculateTotalBonus,
  ZONE_QUALITY_BONUS,
  HIDEOUT_POWER_BONUS,
  CRAFTING_BONUSES,
} from '@/constants/crafting-bonuses'

export const ARTIFACT_PATTERNS = {
  avalonian: /_AVALON$/i,
  elder: /_SET1$|_UNDEAD$|_ELDER$/i,
  keeper: /_SET2$|_KEEPER$/i,
  morgana: /_SET3$|_MORGANA$/i,
  heretic: /_SET4$|_HELL$|_HERETIC$/i,
} as const

export const ENCHANTMENT_MULTIPLIERS = [1.0, 1.5, 2.5, 5.0, 10.0]

export const calculateProfit = (
  sellPrice: number,
  materialCost: number,
  quantity: number,
  stationFee: number
): number => {
  const grossRevenue = sellPrice * quantity
  const totalMaterialCost = materialCost * quantity
  const stationFeeCost = grossRevenue * stationFee
  return grossRevenue - totalMaterialCost - stationFeeCost
}

export const calculateStationFeePer100 = (feePer100: number, itemTier: number): number => {
  const nutritionByTier: Record<number, number> = {
    1: 6,
    2: 12,
    3: 24,
    4: 48,
    5: 96,
    6: 192,
    7: 384,
    8: 768,
  }
  const nutritionUsed = nutritionByTier[itemTier] ?? 48
  return (feePer100 / 100) * nutritionUsed
}

export const calculateProfitWithPer100Fee = (
  sellPrice: number,
  materialCost: number,
  quantity: number,
  feePer100: number,
  itemTier: number
): number => {
  const grossRevenue = sellPrice * quantity
  const totalMaterialCost = materialCost * quantity
  const stationFee = calculateStationFeePer100(feePer100, itemTier)
  const totalStationFee = stationFee * quantity
  return grossRevenue - totalMaterialCost - totalStationFee
}

export const calculateProfitMargin = (sellPrice: number, totalCost: number): number => {
  if (totalCost === 0) return 0
  return ((sellPrice - totalCost) / totalCost) * 100
}

export const calculateROI = (profit: number, investment: number): number => {
  if (investment === 0) return 0
  return (profit / investment) * 100
}

export const parseItemId = (
  itemId: string
): { baseId: string; tier: number; enchantment: number } => {
  const tierMatch = itemId.match(/T(\d+)/)
  const tier = tierMatch ? parseInt(tierMatch[1], 10) : 1
  let enchantment = 0
  let baseId = itemId

  const levelMatch = itemId.match(/_LEVEL(\d+)/i)
  if (levelMatch) {
    enchantment = parseInt(levelMatch[1], 10)
    baseId = itemId.replace(/_LEVEL\d+(@\d+)?/i, '')
  } else if (itemId.includes('@')) {
    const parts = itemId.split('@')
    baseId = parts[0]
    enchantment = parseInt(parts[1], 10) || 0
  } else if (/\.\d+$/.test(itemId)) {
    const parts = itemId.split('.')
    baseId = parts[0]
    enchantment = parseInt(parts[1], 10) || 0
  }

  return { baseId, tier, enchantment }
}

export const getArtifactType = (itemId: string): Item['artifact_type'] | null => {
  for (const [type, pattern] of Object.entries(ARTIFACT_PATTERNS)) {
    if (pattern.test(itemId)) return type as Item['artifact_type']
  }
  return null
}

export const getEnchantmentMultiplier = (enchantment: number): number => {
  return ENCHANTMENT_MULTIPLIERS[enchantment] ?? 1.0
}

export const calculateMaterialCost = (
  requirements: CraftingRequirement[],
  marketPrices: Map<string, number>,
  rrr: number
): number => {
  let totalCost = 0
  for (const req of requirements) {
    const price = marketPrices.get(req.material_id) || 0
    const effectiveAmount = req.amount * (1 - rrr)
    totalCost += price * effectiveAmount
  }
  return totalCost
}

export const calculateTotalMaterialCost = (
  item: Item,
  requirements: CraftingRequirement[],
  artifacts: ArtifactRequirement[],
  quantity: number,
  marketPrices: Map<string, number>,
  rrr: number,
  enchantmentMultiplierOverride?: number
): number => {
  const enchantmentMultiplier =
    enchantmentMultiplierOverride ?? getEnchantmentMultiplier(item.enchantment)
  const materialCost = requirements.reduce((total, mat) => {
    const price = marketPrices.get(mat.material_id) || 0
    const effectiveAmount = mat.amount * (1 - rrr)
    return total + price * effectiveAmount
  }, 0)
  const artifactCost = artifacts.reduce((total, art) => {
    const price = marketPrices.get(art.artifact_id) || 0
    return total + price * art.amount
  }, 0)
  const totalCost = materialCost * enchantmentMultiplier + artifactCost
  return totalCost * quantity
}

export const getRRR = (city: string, category: string, useFocus: boolean): number => {
  const baseRRR: Record<string, Record<string, number>> = {
    Bridgewatch: { plate: 0.15, leather: 0.15, cloth: 0.36 },
    Lymhurst: { tool: 0.15, planks: 0.36, bow: 0.15 },
    Martlock: { plate: 0.15, gathering: 0.15, crop: 0.36 },
    Thetford: { cloth: 0.36, magic: 0.15, potions: 0.15 },
    'Fort Sterling': { tool: 0.15, mount: 0.15, stone: 0.36 },
    Caerleon: { all: 0.08 },
    Brecilien: { all: 0.08 },
  }

  const rrrBase = baseRRR[city]?.[category] ?? baseRRR[city]?.all ?? 0
  let rrr = rrrBase
  if (useFocus) {
    rrr = Math.min(rrr * 2, 0.5)
  }
  return rrr
}

export const getHideoutRRR = (
  buildingType: HideoutConfig['buildingType'],
  buildingTier: number,
  foodBonus: number,
  useFocus: boolean,
  mapQualityBonus = 0,
  energyLevel = 100
): number => {
  const baseRRRByTier: Record<string, number[]> = {
    forge: [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35],
    workbench: [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35],
    tailor: [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35],
    toolmaker: [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35],
    alchemy: [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35],
    cook: [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35],
  }

  const baseRRR = baseRRRByTier[buildingType]?.[buildingTier - 1] ?? 0
  const foodMultiplier = 1 + foodBonus / 100
  const mapQualityMultiplier = 1 + mapQualityBonus / 100
  const energyMultiplier = Math.min(Math.max(energyLevel / 100, 0), 1)
  let rrr = baseRRR * foodMultiplier * mapQualityMultiplier * energyMultiplier
  if (useFocus) {
    rrr = Math.min(rrr * 2, 0.5)
  }
  return Math.min(rrr, 0.5)
}

export const getTotalRRR = (
  locationType: 'city' | 'hideout',
  city: string,
  hideoutConfig: HideoutConfig,
  item: Item,
  useFocus: boolean
): number => {
  if (locationType === 'city') {
    return getRRR(city, item.subcategory, useFocus)
  }
  return getHideoutRRR(
    hideoutConfig.buildingType,
    hideoutConfig.buildingTier,
    hideoutConfig.foodBonus,
    useFocus,
    hideoutConfig.mapQualityBonus,
    hideoutConfig.energyLevel
  )
}

export const calculateJournalProfit = (
  journal: Journal,
  famePerActivity: number,
  journalCost: number
) => {
  const fillsNeeded = famePerActivity > 0 ? Math.ceil(journal.fame_required / famePerActivity) : 0
  const totalSilver = journal.silver_value * fillsNeeded
  const totalCost = journalCost * fillsNeeded
  return {
    profit: totalSilver - totalCost,
    fills_needed: fillsNeeded,
  }
}

/**
 * Calculate RRR (Resource Return Rate)
 *
 * Formula: RRR = totalBonus / (1 + totalBonus)
 *
 * Total Bonus Components:
 * - Zone Quality Bonus (Level 1-6)
 * - Hideout Power Bonus (Level 1-9)
 * - City Bonus (+15% if crafting in bonus city)
 * - Focus Bonus (+59% if using focus)
 * - Island Penalty (-18% if on island)
 */
export const getGoldeniumRRR = (config: GoldeniumCraftingConfig): number => {
  const totalBonus = calculateTotalBonus({
    zoneQuality: config.zoneQuality,
    hideoutPower: config.hideoutPower,
    useCityBonus: config.useCityBonus,
    useFocus: config.useFocus,
    isOnIsland: config.isOnIsland,
  })

  return calculateRRR(totalBonus)
}

/**
 * Get the total bonus breakdown for display purposes
 */
export const getGoldeniumBonusBreakdown = (config: GoldeniumCraftingConfig): {
  zoneQualityBonus: number
  hideoutPowerBonus: number
  cityBonus: number
  focusBonus: number
  islandPenalty: number
  totalBonus: number
  rrr: number
} => {
  const zoneQualityBonus = ZONE_QUALITY_BONUS[config.zoneQuality] ?? 0
  const hideoutPowerBonus = HIDEOUT_POWER_BONUS[config.hideoutPower] ?? 0
  const cityBonus = config.useCityBonus ? CRAFTING_BONUSES.CITY_BONUS : 0
  const focusBonus = config.useFocus ? CRAFTING_BONUSES.FOCUS_BONUS : 0
  const islandPenalty = config.isOnIsland ? CRAFTING_BONUSES.ISLAND_PENALTY : 0

  const totalBonus = zoneQualityBonus + hideoutPowerBonus + cityBonus + focusBonus + islandPenalty
  const rrr = calculateRRR(totalBonus)

  return {
    zoneQualityBonus,
    hideoutPowerBonus,
    cityBonus,
    focusBonus,
    islandPenalty,
    totalBonus,
    rrr,
  }
}

/**
 * Get total RRR using the bonus-based calculation
 * This replaces the legacy getRRR and getHideoutRRR functions
 */
export const getTotalRRRGoldenium = (
  config: GoldeniumCraftingConfig
): number => {
  return getGoldeniumRRR(config)
}
