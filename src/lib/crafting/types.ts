export interface Item {
  item_id: string
  name: string
  tier: number
  enchantment: number
  base_item_id: string
  category: 'gear' | 'food' | 'potion' | 'refining'
  subcategory: string
  is_artifact: boolean
  artifact_type?: 'avalonian' | 'elder' | 'keeper' | 'morgana' | 'heretic'
  city_bonus?: string
}

export interface CraftingRequirement {
  item_id: string
  material_id: string
  amount: number
  is_primary: boolean
}

export interface ArtifactRequirement {
  item_id: string
  artifact_id: string
  artifact_name: string
  amount: number
}

export interface MarketPrice {
  item_id: string
  location: string
  buy_price: number
  sell_price: number
  last_updated: Date
  volume?: number
}

export interface Material {
  material_id: string
  name: string
  tier: string
  category: 'resources' | 'refined' | 'artifacts'
}

export interface Journal {
  journal_id: string
  name: string
  tier: number
  type: 'combat' | 'gathering' | 'crafting'
  fame_required: number
  fame_per_kill: number
  silver_value: number
}

export interface HideoutConfig {
  name: string
  guild?: string
  buildingType: 'forge' | 'workbench' | 'tailor' | 'toolmaker' | 'alchemy' | 'cook'
  buildingTier: number
  foodBonus: number
  mapQualityBonus: number
  energyLevel: number
  isActive: boolean
}

export interface SavedHideout extends HideoutConfig {
  id: string
  isFavorite: boolean
  lastUsed: number
}

/**
 * Crafting Bonus Configuration
 * Used for calculating RRR (Resource Return Rate)
 */
export interface GoldeniumCraftingConfig {
  zoneQuality: number      // 1-6
  hideoutPower: number     // 1-9
  useCityBonus: boolean    // +15% if crafting in bonus city
  useFocus: boolean        // +59% if using focus
  isOnIsland: boolean      // -18% if on island
}

/**
 * Refining Material Configuration
 */
export interface RefiningItem {
  material_type: 'ore' | 'wood' | 'hide' | 'fiber' | 'stone'
  tier: number
  enchantment: number
  input_id: string
  output_id: string
  input_amount: number
  output_amount: number
}
