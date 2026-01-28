/**
 * FCE (Focus Cost Efficiency) Data Types
 * Source: Albion Online crafting spreadsheet
 */

export interface ItemFCEData {
  itemId: string
  name: string
  category: CraftingCategory
  subcategory: string
  tier: number
  baseFocus: number
  specUniqueFCE: number
  specMutualFCE: number
  bonusCity?: string
}

export type CraftingCategory = 'gear' | 'food' | 'potion' | 'refining'

export interface RefiningFCEData {
  materialType: RefiningMaterialType
  tier: number
  enchantment: number
  baseFocus: number
  specUniqueFCE: number
  specMutualFCE: number
}

export type RefiningMaterialType = 'ore' | 'wood' | 'hide' | 'fiber' | 'stone'

export interface GearSubcategory {
  id: string
  name: string
  craftingCategory: 1 | 2 | 3 | 4  // Category: 1=Mage, 2=Hunter, 3=Warrior, 4=Tools
  baseFocus: number
  specUniqueFCE: number
  specMutualFCE: number
  bonusCity?: string
}

// Gear subcategory FCE data
export const GEAR_SUBCATEGORY_FCE: Record<string, GearSubcategory> = {
  // Category 1 - Mage (Cloth armor, staves)
  'cloth': {
    id: 'cloth',
    name: 'Cloth Armor',
    craftingCategory: 1,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Thetford',
  },
  'arcane': {
    id: 'arcane',
    name: 'Arcane Staff',
    craftingCategory: 1,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Lymhurst',
  },
  'fire': {
    id: 'fire',
    name: 'Fire Staff',
    craftingCategory: 1,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Bridgewatch',
  },
  'frost': {
    id: 'frost',
    name: 'Frost Staff',
    craftingCategory: 1,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Fort Sterling',
  },
  'holy': {
    id: 'holy',
    name: 'Holy Staff',
    craftingCategory: 1,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Lymhurst',
  },
  'cursed': {
    id: 'cursed',
    name: 'Cursed Staff',
    craftingCategory: 1,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Thetford',
  },

  // Category 2 - Hunter (Leather armor, bows, daggers, nature, quarterstaffs)
  'leather': {
    id: 'leather',
    name: 'Leather Armor',
    craftingCategory: 2,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Martlock',
  },
  'bow': {
    id: 'bow',
    name: 'Bow',
    craftingCategory: 2,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Lymhurst',
  },
  'dagger': {
    id: 'dagger',
    name: 'Dagger',
    craftingCategory: 2,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Thetford',
  },
  'nature': {
    id: 'nature',
    name: 'Nature Staff',
    craftingCategory: 2,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Martlock',
  },
  'quarterstaff': {
    id: 'quarterstaff',
    name: 'Quarterstaff',
    craftingCategory: 2,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Fort Sterling',
  },
  'spear': {
    id: 'spear',
    name: 'Spear',
    craftingCategory: 2,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Bridgewatch',
  },
  'wargloves': {
    id: 'wargloves',
    name: 'War Gloves',
    craftingCategory: 2,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Bridgewatch',
  },

  // Category 3 - Warrior (Plate armor, swords, axes, maces, hammers, crossbows)
  'plate': {
    id: 'plate',
    name: 'Plate Armor',
    craftingCategory: 3,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Fort Sterling',
  },
  'sword': {
    id: 'sword',
    name: 'Sword',
    craftingCategory: 3,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Bridgewatch',
  },
  'axe': {
    id: 'axe',
    name: 'Axe',
    craftingCategory: 3,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Fort Sterling',
  },
  'mace': {
    id: 'mace',
    name: 'Mace',
    craftingCategory: 3,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Martlock',
  },
  'hammer': {
    id: 'hammer',
    name: 'Hammer',
    craftingCategory: 3,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Fort Sterling',
  },
  'crossbow': {
    id: 'crossbow',
    name: 'Crossbow',
    craftingCategory: 3,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Lymhurst',
  },
  'shield': {
    id: 'shield',
    name: 'Shield',
    craftingCategory: 3,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Fort Sterling',
  },

  // Category 4 - Tools (Bags, capes, off-hands, gathering tools)
  'bag': {
    id: 'bag',
    name: 'Bag',
    craftingCategory: 4,
    baseFocus: 310,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Bridgewatch',
  },
  'cape': {
    id: 'cape',
    name: 'Cape',
    craftingCategory: 4,
    baseFocus: 370,
    specUniqueFCE: 0,   // Capes have no unique FCE
    specMutualFCE: 30,
    bonusCity: 'Martlock',
  },
  'tome': {
    id: 'tome',
    name: 'Tome',
    craftingCategory: 4,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Lymhurst',
  },
  'torch': {
    id: 'torch',
    name: 'Torch',
    craftingCategory: 4,
    baseFocus: 250,
    specUniqueFCE: 30,
    specMutualFCE: 30,
    bonusCity: 'Thetford',
  },
  'gathering': {
    id: 'gathering',
    name: 'Gathering Tool',
    craftingCategory: 4,
    baseFocus: 250,
    specUniqueFCE: 60,
    specMutualFCE: 310,  // High mutual FCE for gathering tools
    bonusCity: undefined,
  },
}

// Artifact item FCE modifiers (lower unique FCE)
export const ARTIFACT_FCE_MODIFIER = {
  specUniqueFCE: 15,  // Artifacts have 15 instead of 30
  specMutualFCE: 30,  // Same mutual as simple items
}

// Crystal item FCE modifiers (very low unique FCE)
export const CRYSTAL_FCE_MODIFIER = {
  specUniqueFCE: 2.15,  // Crystal items have very low unique FCE
  specMutualFCE: 30,    // Same mutual as simple items
}

// Food crafting FCE data
export const FOOD_FCE: Record<string, { baseFocus: number; specUniqueFCE: number; specMutualFCE: number }> = {
  'soup': { baseFocus: 56, specUniqueFCE: 30, specMutualFCE: 30 },
  'salad': { baseFocus: 56, specUniqueFCE: 30, specMutualFCE: 30 },
  'pie': { baseFocus: 56, specUniqueFCE: 30, specMutualFCE: 30 },
  'omelette': { baseFocus: 56, specUniqueFCE: 30, specMutualFCE: 30 },
  'sandwich': { baseFocus: 56, specUniqueFCE: 30, specMutualFCE: 30 },
  'stew': { baseFocus: 56, specUniqueFCE: 30, specMutualFCE: 30 },
  'roast': { baseFocus: 56, specUniqueFCE: 30, specMutualFCE: 30 },
}

// Potion crafting FCE data
export const POTION_FCE: Record<string, { baseFocus: number; specUniqueFCE: number; specMutualFCE: number }> = {
  'healing': { baseFocus: 56, specUniqueFCE: 30, specMutualFCE: 30 },
  'energy': { baseFocus: 56, specUniqueFCE: 30, specMutualFCE: 30 },
  'gigantify': { baseFocus: 56, specUniqueFCE: 30, specMutualFCE: 30 },
  'resistance': { baseFocus: 56, specUniqueFCE: 30, specMutualFCE: 30 },
  'sticky': { baseFocus: 56, specUniqueFCE: 30, specMutualFCE: 30 },
  'poison': { baseFocus: 56, specUniqueFCE: 30, specMutualFCE: 30 },
}

// Refining bonus cities - verified from spreadsheet
export const REFINING_BONUS_CITIES: Record<RefiningMaterialType, string> = {
  'ore': 'Thetford',      // Ore → Metal Bars
  'fiber': 'Lymhurst',    // Fiber → Cloth
  'hide': 'Martlock',     // Hide → Leather
  'wood': 'Fort Sterling', // Wood → Planks
  'stone': 'Bridgewatch',  // Stone → Stone Blocks
}

// Refining output names
export const REFINING_OUTPUT_NAMES: Record<RefiningMaterialType, string> = {
  'ore': 'Metal Bars',
  'fiber': 'Cloth',
  'hide': 'Leather',
  'wood': 'Planks',
  'stone': 'Stone Blocks',
}

/**
 * Base Focus Costs for Refining - EXACT values from spreadsheet
 * Indexed by "tier.enchantment" (e.g., "4.0", "4.1", etc.)
 * These are the same for ALL material types
 */
export const REFINING_BASE_FOCUS: Record<string, number> = {
  // Tier 3
  '3.0': 31,
  // Tier 4
  '4.0': 54,
  '4.1': 94,
  '4.2': 164,
  '4.3': 287,
  '4.4': 503,
  // Tier 5
  '5.0': 94,
  '5.1': 164,
  '5.2': 287,
  '5.3': 503,
  '5.4': 880,
  // Tier 6
  '6.0': 164,
  '6.1': 287,
  '6.2': 503,
  '6.3': 880,
  '6.4': 1539,
  // Tier 7
  '7.0': 287,
  '7.1': 503,
  '7.2': 880,
  '7.3': 1539,
  '7.4': 2694,
  // Tier 8
  '8.0': 503,
  '8.1': 880,
  '8.2': 1539,
  '8.3': 2694,
  '8.4': 4714,
}

// Refining FCE values (same for all material types)
export const REFINING_FCE_VALUES = {
  specUniqueFCE: 250,  // FCE per spec level (unique to this material)
  specMutualFCE: 30,   // FCE per spec level (shared across materials)
}

/**
 * Get FCE data for a gear item based on its subcategory and type
 */
export function getGearFCEData(
  subcategory: string,
  isArtifact: boolean = false,
  isCrystal: boolean = false
): { baseFocus: number; specUniqueFCE: number; specMutualFCE: number } | undefined {
  const normalizedSubcategory = subcategory.toLowerCase()
  const baseData = GEAR_SUBCATEGORY_FCE[normalizedSubcategory]

  if (!baseData) return undefined

  // Apply modifiers for artifact or crystal items
  if (isCrystal) {
    return {
      baseFocus: baseData.baseFocus,
      specUniqueFCE: CRYSTAL_FCE_MODIFIER.specUniqueFCE,
      specMutualFCE: CRYSTAL_FCE_MODIFIER.specMutualFCE,
    }
  }

  if (isArtifact) {
    return {
      baseFocus: baseData.baseFocus,
      specUniqueFCE: ARTIFACT_FCE_MODIFIER.specUniqueFCE,
      specMutualFCE: ARTIFACT_FCE_MODIFIER.specMutualFCE,
    }
  }

  return {
    baseFocus: baseData.baseFocus,
    specUniqueFCE: baseData.specUniqueFCE,
    specMutualFCE: baseData.specMutualFCE,
  }
}

/**
 * Get FCE data for refining using exact values from spreadsheet
 */
export function getRefiningFCEData(
  materialType: RefiningMaterialType,
  tier: number,
  enchantment: number = 0
): { baseFocus: number; specUniqueFCE: number; specMutualFCE: number; bonusCity: string } | undefined {
  // Look up exact base focus from spreadsheet data
  const key = `${tier}.${enchantment}`
  const baseFocus = REFINING_BASE_FOCUS[key]

  if (baseFocus === undefined) return undefined

  const bonusCity = REFINING_BONUS_CITIES[materialType]

  return {
    baseFocus,
    specUniqueFCE: REFINING_FCE_VALUES.specUniqueFCE,
    specMutualFCE: REFINING_FCE_VALUES.specMutualFCE,
    bonusCity,
  }
}

/**
 * Get bonus city for a material type
 */
export function getRefiningBonusCity(materialType: RefiningMaterialType): string {
  return REFINING_BONUS_CITIES[materialType]
}

/**
 * Get output name for a material type
 */
export function getRefiningOutputName(materialType: RefiningMaterialType): string {
  return REFINING_OUTPUT_NAMES[materialType]
}
