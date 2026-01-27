export interface Item {
  item_id: string
  name: string
  tier: number
  enchantment: number
  base_item_id: string
  category: 'gear' | 'food' | 'potion'
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
