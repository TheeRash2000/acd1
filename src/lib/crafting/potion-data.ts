/**
 * Potion Crafting Data - Extracted from Goldenium Spreadsheet
 * All potions have bonus crafting in Thetford
 */

export interface PotionIngredient {
  itemId: string
  name: string
  quantity: number
  tier: number
}

export interface PotionRecipe {
  id: string
  name: string
  itemId: string
  tier: number
  category: 'combat' | 'utility' | 'alcohol'
  ingredients: PotionIngredient[]
  outputQuantity: number
  baseFocus: number
}

// Ingredient item IDs mapping
export const INGREDIENT_IDS: Record<string, string> = {
  // Herbs (gathered)
  'Arcane Agaric': 'T2_HERB',
  'Brightleaf Comfrey': 'T3_HERB',
  'Crenellated Burdock': 'T4_HERB',
  'Dragon Teasel': 'T5_HERB',
  'Elusive Foxglove': 'T6_HERB',
  'Firetouched Mullein': 'T7_HERB',
  'Ghoul Yarrow': 'T8_HERB',

  // Farm products - Eggs
  'Hen Eggs': 'T3_FARM_CHICKEN_EGG',
  'Goose Eggs': 'T5_FARM_GOOSE_EGG',

  // Farm products - Milk
  'Goats Milk': 'T4_FARM_GOAT_MILK',
  'Sheeps Milk': 'T6_FARM_SHEEP_MILK',
  'Cows Milk': 'T8_FARM_COW_MILK',

  // Farm products - Butter
  'Goats Butter': 'T4_FARM_GOAT_BUTTER',
  'Sheeps Butter': 'T6_FARM_SHEEP_BUTTER',
  'Cows Butter': 'T8_FARM_COW_BUTTER',

  // Crops (for alcohol)
  'Potatoes': 'T6_FARM_POTATOES',
  'Bundle of Corn': 'T7_FARM_CORN',
  'Pumpkin': 'T8_FARM_PUMPKIN',

  // Alcohol (intermediate crafted items)
  'Potato Schnapps': 'T6_ALCOHOL',
  'Corn Hooch': 'T7_ALCOHOL',
  'Pumpkin Moonshine': 'T8_ALCOHOL',

  // Artifacts/Trophies (for special potions)
  'Rugged Spirit Paws': 'T3_ARTEFACT_POTION_ACID',
  'Fine Spirit Paws': 'T5_ARTEFACT_POTION_ACID',
  'Excellent Spirit Paws': 'T7_ARTEFACT_POTION_ACID',
  'Rugged Werewolf Fangs': 'T3_ARTEFACT_POTION_BERSERK',
  'Fine Werewolf Fangs': 'T5_ARTEFACT_POTION_BERSERK',
  'Excellent Werewolf Fangs': 'T7_ARTEFACT_POTION_BERSERK',
  'Rugged Shadow Claws': 'T3_ARTEFACT_POTION_MOB_RESET',
  'Fine Shadow Claws': 'T5_ARTEFACT_POTION_MOB_RESET',
  'Excellent Shadow Claws': 'T7_ARTEFACT_POTION_MOB_RESET',
  'Rugged Sylvian Root': 'T3_ARTEFACT_POTION_CLEANSE',
  'Fine Sylvian Root': 'T5_ARTEFACT_POTION_CLEANSE',
  'Excellent Sylvian Root': 'T7_ARTEFACT_POTION_CLEANSE',
  'Rugged Runestone Tooth': 'T3_ARTEFACT_POTION_GATHER',
  'Fine Runestone Tooth': 'T5_ARTEFACT_POTION_GATHER',
  'Excellent Runestone Tooth': 'T7_ARTEFACT_POTION_GATHER',
  'Rugged Imps Horn': 'T3_ARTEFACT_POTION_LAVA',
  'Fine Imps Horn': 'T5_ARTEFACT_POTION_LAVA',
  'Excellent Imps Horn': 'T7_ARTEFACT_POTION_LAVA',
  'Rugged Dawnfeather': 'T3_ARTEFACT_POTION_TORNADO',
  'Fine Dawnfeather': 'T5_ARTEFACT_POTION_TORNADO',
  'Excellent Dawnfeather': 'T7_ARTEFACT_POTION_TORNADO',
}

// Base focus costs per potion tier (from spreadsheet)
export const POTION_BASE_FOCUS: Record<number, number> = {
  2: 9,
  3: 18,
  4: 36,
  5: 56,
  6: 110,
  7: 220,
  8: 440,
}

// All potion recipes from Goldenium spreadsheet
export const POTION_RECIPES: PotionRecipe[] = [
  // ============ ALCOHOL (crafted intermediate items) ============
  {
    id: 'potato_schnapps',
    name: 'Potato Schnapps',
    itemId: 'T6_ALCOHOL',
    tier: 6,
    category: 'alcohol',
    outputQuantity: 1,
    baseFocus: 110,
    ingredients: [
      { itemId: 'T6_FARM_POTATOES', name: 'Potatoes', quantity: 1, tier: 6 },
    ],
  },
  {
    id: 'corn_hooch',
    name: 'Corn Hooch',
    itemId: 'T7_ALCOHOL',
    tier: 7,
    category: 'alcohol',
    outputQuantity: 1,
    baseFocus: 220,
    ingredients: [
      { itemId: 'T7_FARM_CORN', name: 'Bundle of Corn', quantity: 1, tier: 7 },
    ],
  },
  {
    id: 'pumpkin_moonshine',
    name: 'Pumpkin Moonshine',
    itemId: 'T8_ALCOHOL',
    tier: 8,
    category: 'alcohol',
    outputQuantity: 1,
    baseFocus: 440,
    ingredients: [
      { itemId: 'T8_FARM_PUMPKIN', name: 'Pumpkin', quantity: 1, tier: 8 },
    ],
  },

  // ============ HEALING POTIONS ============
  {
    id: 'minor_healing',
    name: 'Minor Healing Potion',
    itemId: 'T2_POTION_HEAL',
    tier: 2,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 9,
    ingredients: [
      { itemId: 'T2_HERB', name: 'Arcane Agaric', quantity: 8, tier: 2 },
    ],
  },
  {
    id: 'healing',
    name: 'Healing Potion',
    itemId: 'T4_POTION_HEAL',
    tier: 4,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 36,
    ingredients: [
      { itemId: 'T4_HERB', name: 'Crenellated Burdock', quantity: 24, tier: 4 },
      { itemId: 'T3_FARM_CHICKEN_EGG', name: 'Hen Eggs', quantity: 6, tier: 3 },
    ],
  },
  {
    id: 'major_healing',
    name: 'Major Healing Potion',
    itemId: 'T6_POTION_HEAL',
    tier: 6,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 110,
    ingredients: [
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 72, tier: 6 },
      { itemId: 'T5_FARM_GOOSE_EGG', name: 'Goose Eggs', quantity: 18, tier: 5 },
      { itemId: 'T6_ALCOHOL', name: 'Potato Schnapps', quantity: 1, tier: 6 },
    ],
  },

  // ============ ENERGY POTIONS ============
  {
    id: 'minor_energy',
    name: 'Minor Energy Potion',
    itemId: 'T2_POTION_ENERGY',
    tier: 2,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 9,
    ingredients: [
      { itemId: 'T2_HERB', name: 'Arcane Agaric', quantity: 8, tier: 2 },
    ],
  },
  {
    id: 'energy',
    name: 'Energy Potion',
    itemId: 'T4_POTION_ENERGY',
    tier: 4,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 36,
    ingredients: [
      { itemId: 'T4_HERB', name: 'Crenellated Burdock', quantity: 24, tier: 4 },
      { itemId: 'T4_FARM_GOAT_MILK', name: 'Goats Milk', quantity: 6, tier: 4 },
    ],
  },
  {
    id: 'major_energy',
    name: 'Major Energy Potion',
    itemId: 'T6_POTION_ENERGY',
    tier: 6,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 110,
    ingredients: [
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 72, tier: 6 },
      { itemId: 'T6_FARM_SHEEP_MILK', name: 'Sheeps Milk', quantity: 18, tier: 6 },
      { itemId: 'T6_ALCOHOL', name: 'Potato Schnapps', quantity: 1, tier: 6 },
    ],
  },

  // ============ GIGANTIFY POTIONS ============
  {
    id: 'minor_gigantify',
    name: 'Minor Gigantify Potion',
    itemId: 'T3_POTION_REVIVE',
    tier: 3,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 18,
    ingredients: [
      { itemId: 'T3_HERB', name: 'Brightleaf Comfrey', quantity: 8, tier: 3 },
    ],
  },
  {
    id: 'gigantify',
    name: 'Gigantify Potion',
    itemId: 'T5_POTION_REVIVE',
    tier: 5,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 56,
    ingredients: [
      { itemId: 'T5_HERB', name: 'Dragon Teasel', quantity: 24, tier: 5 },
      { itemId: 'T4_HERB', name: 'Crenellated Burdock', quantity: 12, tier: 4 },
      { itemId: 'T5_FARM_GOOSE_EGG', name: 'Goose Eggs', quantity: 6, tier: 5 },
    ],
  },
  {
    id: 'major_gigantify',
    name: 'Major Gigantify Potion',
    itemId: 'T7_POTION_REVIVE',
    tier: 7,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 220,
    ingredients: [
      { itemId: 'T7_HERB', name: 'Firetouched Mullein', quantity: 72, tier: 7 },
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 36, tier: 6 },
      { itemId: 'T5_FARM_GOOSE_EGG', name: 'Goose Eggs', quantity: 18, tier: 5 },
      { itemId: 'T7_ALCOHOL', name: 'Corn Hooch', quantity: 1, tier: 7 },
    ],
  },

  // ============ RESISTANCE POTIONS ============
  {
    id: 'minor_resistance',
    name: 'Minor Resistance Potion',
    itemId: 'T3_POTION_STONESKIN',
    tier: 3,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 18,
    ingredients: [
      { itemId: 'T3_HERB', name: 'Brightleaf Comfrey', quantity: 8, tier: 3 },
    ],
  },
  {
    id: 'resistance',
    name: 'Resistance Potion',
    itemId: 'T5_POTION_STONESKIN',
    tier: 5,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 56,
    ingredients: [
      { itemId: 'T5_HERB', name: 'Dragon Teasel', quantity: 24, tier: 5 },
      { itemId: 'T4_HERB', name: 'Crenellated Burdock', quantity: 12, tier: 4 },
      { itemId: 'T4_FARM_GOAT_MILK', name: 'Goats Milk', quantity: 6, tier: 4 },
    ],
  },
  {
    id: 'major_resistance',
    name: 'Major Resistance Potion',
    itemId: 'T7_POTION_STONESKIN',
    tier: 7,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 220,
    ingredients: [
      { itemId: 'T7_HERB', name: 'Firetouched Mullein', quantity: 72, tier: 7 },
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 36, tier: 6 },
      { itemId: 'T4_HERB', name: 'Crenellated Burdock', quantity: 36, tier: 4 },
      { itemId: 'T6_FARM_SHEEP_MILK', name: 'Sheeps Milk', quantity: 18, tier: 6 },
      { itemId: 'T7_ALCOHOL', name: 'Corn Hooch', quantity: 1, tier: 7 },
    ],
  },

  // ============ STICKY POTIONS ============
  {
    id: 'minor_sticky',
    name: 'Minor Sticky Potion',
    itemId: 'T3_POTION_SLOWFIELD',
    tier: 3,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 18,
    ingredients: [
      { itemId: 'T3_HERB', name: 'Brightleaf Comfrey', quantity: 8, tier: 3 },
    ],
  },
  {
    id: 'sticky',
    name: 'Sticky Potion',
    itemId: 'T5_POTION_SLOWFIELD',
    tier: 5,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 56,
    ingredients: [
      { itemId: 'T5_HERB', name: 'Dragon Teasel', quantity: 24, tier: 5 },
      { itemId: 'T4_HERB', name: 'Crenellated Burdock', quantity: 12, tier: 4 },
      { itemId: 'T5_FARM_GOOSE_EGG', name: 'Goose Eggs', quantity: 6, tier: 5 },
    ],
  },
  {
    id: 'major_sticky',
    name: 'Major Sticky Potion',
    itemId: 'T7_POTION_SLOWFIELD',
    tier: 7,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 220,
    ingredients: [
      { itemId: 'T7_HERB', name: 'Firetouched Mullein', quantity: 72, tier: 7 },
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 36, tier: 6 },
      { itemId: 'T4_HERB', name: 'Crenellated Burdock', quantity: 36, tier: 4 },
      { itemId: 'T5_FARM_GOOSE_EGG', name: 'Goose Eggs', quantity: 18, tier: 5 },
      { itemId: 'T7_ALCOHOL', name: 'Corn Hooch', quantity: 1, tier: 7 },
    ],
  },

  // ============ POISON POTIONS ============
  {
    id: 'minor_poison',
    name: 'Minor Poison Potion',
    itemId: 'T4_POTION_COOLDOWN',
    tier: 4,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 36,
    ingredients: [
      { itemId: 'T4_HERB', name: 'Crenellated Burdock', quantity: 8, tier: 4 },
      { itemId: 'T3_HERB', name: 'Brightleaf Comfrey', quantity: 4, tier: 3 },
    ],
  },
  {
    id: 'poison',
    name: 'Poison Potion',
    itemId: 'T6_POTION_COOLDOWN',
    tier: 6,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 110,
    ingredients: [
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 24, tier: 6 },
      { itemId: 'T5_HERB', name: 'Dragon Teasel', quantity: 12, tier: 5 },
      { itemId: 'T3_HERB', name: 'Brightleaf Comfrey', quantity: 12, tier: 3 },
      { itemId: 'T6_FARM_SHEEP_MILK', name: 'Sheeps Milk', quantity: 6, tier: 6 },
    ],
  },
  {
    id: 'major_poison',
    name: 'Major Poison Potion',
    itemId: 'T8_POTION_COOLDOWN',
    tier: 8,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 440,
    ingredients: [
      { itemId: 'T8_HERB', name: 'Ghoul Yarrow', quantity: 72, tier: 8 },
      { itemId: 'T7_HERB', name: 'Firetouched Mullein', quantity: 36, tier: 7 },
      { itemId: 'T5_HERB', name: 'Dragon Teasel', quantity: 36, tier: 5 },
      { itemId: 'T8_FARM_COW_MILK', name: 'Cows Milk', quantity: 18, tier: 8 },
      { itemId: 'T8_ALCOHOL', name: 'Pumpkin Moonshine', quantity: 1, tier: 8 },
    ],
  },

  // ============ INVISIBILITY POTION ============
  {
    id: 'invisibility',
    name: 'Invisibility Potion',
    itemId: 'T8_POTION_CLEANSE',
    tier: 8,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 440,
    ingredients: [
      { itemId: 'T8_HERB', name: 'Ghoul Yarrow', quantity: 72, tier: 8 },
      { itemId: 'T7_HERB', name: 'Firetouched Mullein', quantity: 36, tier: 7 },
      { itemId: 'T5_HERB', name: 'Dragon Teasel', quantity: 36, tier: 5 },
      { itemId: 'T8_FARM_COW_MILK', name: 'Cows Milk', quantity: 18, tier: 8 },
      { itemId: 'T8_ALCOHOL', name: 'Pumpkin Moonshine', quantity: 1, tier: 8 },
    ],
  },

  // ============ GATHERING POTIONS ============
  {
    id: 'minor_gathering',
    name: 'Minor Gathering Potion',
    itemId: 'T4_POTION_GATHER',
    tier: 4,
    category: 'utility',
    outputQuantity: 5,
    baseFocus: 36,
    ingredients: [
      { itemId: 'T4_FARM_GOAT_BUTTER', name: 'Goats Butter', quantity: 16, tier: 4 },
      { itemId: 'T3_ARTEFACT_POTION_GATHER', name: 'Rugged Runestone Tooth', quantity: 1, tier: 3 },
    ],
  },
  {
    id: 'gathering',
    name: 'Gathering Potion',
    itemId: 'T6_POTION_GATHER',
    tier: 6,
    category: 'utility',
    outputQuantity: 5,
    baseFocus: 110,
    ingredients: [
      { itemId: 'T6_FARM_SHEEP_BUTTER', name: 'Sheeps Butter', quantity: 48, tier: 6 },
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 24, tier: 6 },
      { itemId: 'T5_HERB', name: 'Dragon Teasel', quantity: 12, tier: 5 },
      { itemId: 'T5_ARTEFACT_POTION_GATHER', name: 'Fine Runestone Tooth', quantity: 1, tier: 5 },
    ],
  },
  {
    id: 'major_gathering',
    name: 'Major Gathering Potion',
    itemId: 'T8_POTION_GATHER',
    tier: 8,
    category: 'utility',
    outputQuantity: 5,
    baseFocus: 440,
    ingredients: [
      { itemId: 'T8_FARM_COW_BUTTER', name: 'Cows Butter', quantity: 144, tier: 8 },
      { itemId: 'T8_HERB', name: 'Ghoul Yarrow', quantity: 72, tier: 8 },
      { itemId: 'T7_HERB', name: 'Firetouched Mullein', quantity: 72, tier: 7 },
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 36, tier: 6 },
      { itemId: 'T7_ARTEFACT_POTION_GATHER', name: 'Excellent Runestone Tooth', quantity: 1, tier: 7 },
      { itemId: 'T8_ALCOHOL', name: 'Pumpkin Moonshine', quantity: 1, tier: 8 },
    ],
  },

  // ============ CLEANSING POTIONS ============
  {
    id: 'minor_cleansing',
    name: 'Minor Cleansing Potion',
    itemId: 'T3_POTION_CLEANSE2',
    tier: 3,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 18,
    ingredients: [
      { itemId: 'T3_HERB', name: 'Brightleaf Comfrey', quantity: 16, tier: 3 },
      { itemId: 'T3_ARTEFACT_POTION_CLEANSE', name: 'Rugged Sylvian Root', quantity: 1, tier: 3 },
    ],
  },
  {
    id: 'cleansing',
    name: 'Cleansing Potion',
    itemId: 'T5_POTION_CLEANSE2',
    tier: 5,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 56,
    ingredients: [
      { itemId: 'T5_HERB', name: 'Dragon Teasel', quantity: 48, tier: 5 },
      { itemId: 'T3_HERB', name: 'Brightleaf Comfrey', quantity: 24, tier: 3 },
      { itemId: 'T4_FARM_GOAT_BUTTER', name: 'Goats Butter', quantity: 12, tier: 4 },
      { itemId: 'T5_ARTEFACT_POTION_CLEANSE', name: 'Fine Sylvian Root', quantity: 1, tier: 5 },
    ],
  },
  {
    id: 'major_cleansing',
    name: 'Major Cleansing Potion',
    itemId: 'T7_POTION_CLEANSE2',
    tier: 7,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 220,
    ingredients: [
      { itemId: 'T7_HERB', name: 'Firetouched Mullein', quantity: 144, tier: 7 },
      { itemId: 'T4_HERB', name: 'Crenellated Burdock', quantity: 72, tier: 4 },
      { itemId: 'T3_HERB', name: 'Brightleaf Comfrey', quantity: 72, tier: 3 },
      { itemId: 'T6_FARM_SHEEP_BUTTER', name: 'Sheeps Butter', quantity: 36, tier: 6 },
      { itemId: 'T7_ARTEFACT_POTION_CLEANSE', name: 'Excellent Sylvian Root', quantity: 1, tier: 7 },
      { itemId: 'T7_ALCOHOL', name: 'Corn Hooch', quantity: 1, tier: 7 },
    ],
  },

  // ============ ACID POTIONS ============
  {
    id: 'minor_acid',
    name: 'Minor Acid Potion',
    itemId: 'T3_POTION_ACID',
    tier: 3,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 18,
    ingredients: [
      { itemId: 'T3_HERB', name: 'Brightleaf Comfrey', quantity: 16, tier: 3 },
      { itemId: 'T3_ARTEFACT_POTION_ACID', name: 'Rugged Spirit Paws', quantity: 1, tier: 3 },
    ],
  },
  {
    id: 'acid',
    name: 'Acid Potion',
    itemId: 'T5_POTION_ACID',
    tier: 5,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 56,
    ingredients: [
      { itemId: 'T5_HERB', name: 'Dragon Teasel', quantity: 48, tier: 5 },
      { itemId: 'T4_HERB', name: 'Crenellated Burdock', quantity: 24, tier: 4 },
      { itemId: 'T4_FARM_GOAT_MILK', name: 'Goats Milk', quantity: 12, tier: 4 },
      { itemId: 'T5_ARTEFACT_POTION_ACID', name: 'Fine Spirit Paws', quantity: 1, tier: 5 },
    ],
  },
  {
    id: 'major_acid',
    name: 'Major Acid Potion',
    itemId: 'T7_POTION_ACID',
    tier: 7,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 220,
    ingredients: [
      { itemId: 'T7_HERB', name: 'Firetouched Mullein', quantity: 144, tier: 7 },
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 72, tier: 6 },
      { itemId: 'T6_ALCOHOL', name: 'Potato Schnapps', quantity: 72, tier: 6 },
      { itemId: 'T6_FARM_SHEEP_MILK', name: 'Sheeps Milk', quantity: 36, tier: 6 },
      { itemId: 'T7_ARTEFACT_POTION_ACID', name: 'Excellent Spirit Paws', quantity: 1, tier: 7 },
      { itemId: 'T7_ALCOHOL', name: 'Corn Hooch', quantity: 1, tier: 7 },
    ],
  },

  // ============ BERSERK POTIONS ============
  {
    id: 'minor_berserk',
    name: 'Minor Berserk Potion',
    itemId: 'T4_POTION_BERSERK',
    tier: 4,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 36,
    ingredients: [
      { itemId: 'T4_HERB', name: 'Crenellated Burdock', quantity: 16, tier: 4 },
      { itemId: 'T3_ARTEFACT_POTION_BERSERK', name: 'Rugged Werewolf Fangs', quantity: 1, tier: 3 },
    ],
  },
  {
    id: 'berserk',
    name: 'Berserk Potion',
    itemId: 'T6_POTION_BERSERK',
    tier: 6,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 110,
    ingredients: [
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 48, tier: 6 },
      { itemId: 'T2_HERB', name: 'Arcane Agaric', quantity: 24, tier: 2 },
      { itemId: 'T5_ARTEFACT_POTION_BERSERK', name: 'Fine Werewolf Fangs', quantity: 1, tier: 5 },
      { itemId: 'T6_ALCOHOL', name: 'Potato Schnapps', quantity: 1, tier: 6 },
    ],
  },
  {
    id: 'major_berserk',
    name: 'Major Berserk Potion',
    itemId: 'T8_POTION_BERSERK',
    tier: 8,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 440,
    ingredients: [
      { itemId: 'T8_HERB', name: 'Ghoul Yarrow', quantity: 144, tier: 8 },
      { itemId: 'T3_HERB', name: 'Brightleaf Comfrey', quantity: 72, tier: 3 },
      { itemId: 'T6_ALCOHOL', name: 'Potato Schnapps', quantity: 72, tier: 6 },
      { itemId: 'T7_ALCOHOL', name: 'Corn Hooch', quantity: 36, tier: 7 },
      { itemId: 'T7_ARTEFACT_POTION_BERSERK', name: 'Excellent Werewolf Fangs', quantity: 1, tier: 7 },
      { itemId: 'T8_ALCOHOL', name: 'Pumpkin Moonshine', quantity: 1, tier: 8 },
    ],
  },

  // ============ CALMING POTIONS ============
  {
    id: 'minor_calming',
    name: 'Minor Calming Potion',
    itemId: 'T3_POTION_MOB_RESET',
    tier: 3,
    category: 'utility',
    outputQuantity: 5,
    baseFocus: 18,
    ingredients: [
      { itemId: 'T3_HERB', name: 'Brightleaf Comfrey', quantity: 16, tier: 3 },
      { itemId: 'T3_ARTEFACT_POTION_MOB_RESET', name: 'Rugged Shadow Claws', quantity: 1, tier: 3 },
    ],
  },
  {
    id: 'calming',
    name: 'Calming Potion',
    itemId: 'T5_POTION_MOB_RESET',
    tier: 5,
    category: 'utility',
    outputQuantity: 5,
    baseFocus: 56,
    ingredients: [
      { itemId: 'T5_HERB', name: 'Dragon Teasel', quantity: 48, tier: 5 },
      { itemId: 'T4_HERB', name: 'Crenellated Burdock', quantity: 24, tier: 4 },
      { itemId: 'T2_HERB', name: 'Arcane Agaric', quantity: 12, tier: 2 },
      { itemId: 'T5_ARTEFACT_POTION_MOB_RESET', name: 'Fine Shadow Claws', quantity: 1, tier: 5 },
    ],
  },
  {
    id: 'major_calming',
    name: 'Major Calming Potion',
    itemId: 'T7_POTION_MOB_RESET',
    tier: 7,
    category: 'utility',
    outputQuantity: 5,
    baseFocus: 220,
    ingredients: [
      { itemId: 'T7_HERB', name: 'Firetouched Mullein', quantity: 144, tier: 7 },
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 72, tier: 6 },
      { itemId: 'T3_HERB', name: 'Brightleaf Comfrey', quantity: 72, tier: 3 },
      { itemId: 'T2_HERB', name: 'Arcane Agaric', quantity: 36, tier: 2 },
      { itemId: 'T7_ARTEFACT_POTION_MOB_RESET', name: 'Excellent Shadow Claws', quantity: 1, tier: 7 },
      { itemId: 'T7_ALCOHOL', name: 'Corn Hooch', quantity: 1, tier: 7 },
    ],
  },

  // ============ HELLFIRE POTIONS ============
  {
    id: 'minor_hellfire',
    name: 'Minor Hellfire Potion',
    itemId: 'T4_POTION_LAVA',
    tier: 4,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 36,
    ingredients: [
      { itemId: 'T4_FARM_GOAT_MILK', name: 'Goats Milk', quantity: 16, tier: 4 },
      { itemId: 'T3_ARTEFACT_POTION_LAVA', name: 'Rugged Imps Horn', quantity: 1, tier: 3 },
    ],
  },
  {
    id: 'hellfire',
    name: 'Hellfire Potion',
    itemId: 'T6_POTION_LAVA',
    tier: 6,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 110,
    ingredients: [
      { itemId: 'T6_FARM_SHEEP_MILK', name: 'Sheeps Milk', quantity: 48, tier: 6 },
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 24, tier: 6 },
      { itemId: 'T3_FARM_CHICKEN_EGG', name: 'Hen Eggs', quantity: 12, tier: 3 },
      { itemId: 'T5_ARTEFACT_POTION_LAVA', name: 'Fine Imps Horn', quantity: 1, tier: 5 },
    ],
  },
  {
    id: 'major_hellfire',
    name: 'Major Hellfire Potion',
    itemId: 'T8_POTION_LAVA',
    tier: 8,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 440,
    ingredients: [
      { itemId: 'T8_FARM_COW_MILK', name: 'Cows Milk', quantity: 144, tier: 8 },
      { itemId: 'T8_HERB', name: 'Ghoul Yarrow', quantity: 72, tier: 8 },
      { itemId: 'T7_HERB', name: 'Firetouched Mullein', quantity: 72, tier: 7 },
      { itemId: 'T5_FARM_GOOSE_EGG', name: 'Goose Eggs', quantity: 36, tier: 5 },
      { itemId: 'T7_ARTEFACT_POTION_LAVA', name: 'Excellent Imps Horn', quantity: 1, tier: 7 },
      { itemId: 'T8_ALCOHOL', name: 'Pumpkin Moonshine', quantity: 1, tier: 8 },
    ],
  },

  // ============ TORNADO IN A BOTTLE ============
  {
    id: 'minor_tornado',
    name: 'Minor Tornado in a Bottle',
    itemId: 'T4_POTION_TORNADO',
    tier: 4,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 36,
    ingredients: [
      { itemId: 'T4_HERB', name: 'Crenellated Burdock', quantity: 16, tier: 4 },
      { itemId: 'T3_ARTEFACT_POTION_TORNADO', name: 'Rugged Dawnfeather', quantity: 1, tier: 3 },
    ],
  },
  {
    id: 'tornado',
    name: 'Tornado in a Bottle',
    itemId: 'T6_POTION_TORNADO',
    tier: 6,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 110,
    ingredients: [
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 48, tier: 6 },
      { itemId: 'T5_HERB', name: 'Dragon Teasel', quantity: 24, tier: 5 },
      { itemId: 'T3_FARM_CHICKEN_EGG', name: 'Hen Eggs', quantity: 12, tier: 3 },
      { itemId: 'T5_ARTEFACT_POTION_TORNADO', name: 'Fine Dawnfeather', quantity: 1, tier: 5 },
    ],
  },
  {
    id: 'major_tornado',
    name: 'Major Tornado in a Bottle',
    itemId: 'T8_POTION_TORNADO',
    tier: 8,
    category: 'combat',
    outputQuantity: 5,
    baseFocus: 440,
    ingredients: [
      { itemId: 'T8_HERB', name: 'Ghoul Yarrow', quantity: 144, tier: 8 },
      { itemId: 'T7_HERB', name: 'Firetouched Mullein', quantity: 72, tier: 7 },
      { itemId: 'T7_ALCOHOL', name: 'Corn Hooch', quantity: 72, tier: 7 },
      { itemId: 'T5_FARM_GOOSE_EGG', name: 'Goose Eggs', quantity: 36, tier: 5 },
      { itemId: 'T7_ARTEFACT_POTION_TORNADO', name: 'Excellent Dawnfeather', quantity: 1, tier: 7 },
      { itemId: 'T8_ALCOHOL', name: 'Pumpkin Moonshine', quantity: 1, tier: 8 },
    ],
  },
]

// Get all unique ingredient item IDs for API fetching
export function getAllIngredientIds(): string[] {
  const ids = new Set<string>()
  for (const recipe of POTION_RECIPES) {
    for (const ingredient of recipe.ingredients) {
      ids.add(ingredient.itemId)
    }
  }
  return Array.from(ids)
}

// Get all potion item IDs for API fetching
export function getAllPotionIds(): string[] {
  return POTION_RECIPES.map(r => r.itemId)
}

// Get recipes by category
export function getRecipesByCategory(category: 'combat' | 'utility' | 'alcohol'): PotionRecipe[] {
  return POTION_RECIPES.filter(r => r.category === category)
}

// Get recipe by ID
export function getRecipeById(id: string): PotionRecipe | undefined {
  return POTION_RECIPES.find(r => r.id === id)
}
