/**
 * Food Crafting Data - Extracted from Goldenium Spreadsheet
 * Food bonus city is Bridgewatch
 */

export interface FoodIngredient {
  itemId: string
  name: string
  quantity: number
  tier: number
}

export interface FoodRecipe {
  id: string
  name: string
  itemId: string
  tier: number
  category: 'meal' | 'ingredient' | 'fish' | 'avalon'
  ingredients: FoodIngredient[]
  outputQuantity: number
  baseFocus: number
}

// Ingredient name to item ID mapping
export const FOOD_INGREDIENT_IDS: Record<string, string> = {
  // Crops
  'Carrots': 'T1_CARROT',
  'Beans': 'T2_BEAN',
  'Sheaf of Wheat': 'T3_WHEAT',
  'Turnips': 'T4_TURNIP',
  'Cabbage': 'T5_CABBAGE',
  'Potatoes': 'T6_FARM_POTATOES',
  'Bundle of Corn': 'T7_FARM_CORN',
  'Pumpkin': 'T8_FARM_PUMPKIN',

  // Processed ingredients
  'Flour': 'T3_FLOUR',
  'Bread': 'T4_BREAD',

  // Meat (raw)
  'Raw Chicken': 'T3_MEAT',
  'Raw Goat': 'T4_MEAT',
  'Raw Goose': 'T5_MEAT',
  'Raw Mutton': 'T6_MEAT',
  'Raw Pork': 'T7_MEAT',
  'Raw Beef': 'T8_MEAT',

  // Animals (for butchering)
  'Chicken': 'T3_FARM_CHICKEN_GROWN',
  'Goat': 'T4_FARM_GOAT_GROWN',
  'Goose': 'T5_FARM_GOOSE_GROWN',
  'Sheep': 'T6_FARM_SHEEP_GROWN',
  'Pig': 'T7_FARM_PIG_GROWN',
  'Cow': 'T8_FARM_COW_GROWN',

  // Eggs
  'Hen Eggs': 'T3_FARM_CHICKEN_EGG',
  'Goose Eggs': 'T5_FARM_GOOSE_EGG',

  // Milk
  "Goat's Milk": 'T4_FARM_GOAT_MILK',
  "Sheep's Milk": 'T6_FARM_SHEEP_MILK',
  "Cow's Milk": 'T8_FARM_COW_MILK',

  // Butter
  "Goat's Butter": 'T4_BUTTER',
  "Sheep's Butter": 'T6_BUTTER',
  "Cow's Butter": 'T8_BUTTER',

  // Fish & Fishing
  'Chopped Fish': 'T1_FISH_FRESHWATER_ALL_CHOPPED',
  'Seaweed': 'T1_SEAWEED',

  // Freshwater Fish
  'Greenmoor Clam': 'T3_FISH_FRESHWATER_SWAMP_RARE',
  'Whitefog Snapper': 'T3_FISH_FRESHWATER_FOREST_RARE',
  'Lowriver Crab': 'T3_FISH_FRESHWATER_STEPPE_RARE',
  'Upland Coldeye': 'T3_FISH_FRESHWATER_MOUNTAIN_RARE',
  'Stonestream Lurcher': 'T3_FISH_FRESHWATER_HIGHLANDS_RARE',
  'Greenriver Eel': 'T3_FISH_FRESHWATER_SWAMP_LEGENDARY',
  'Shallowshore Squid': 'T3_FISH_SALTWATER_ALL_RARE',
  'Midwater Octopus': 'T5_FISH_SALTWATER_ALL_RARE',
  'Murkwater Clam': 'T5_FISH_FRESHWATER_SWAMP_RARE',
  'Drybrook Crab': 'T5_FISH_FRESHWATER_STEPPE_RARE',
  'Clearhaze Snapper': 'T5_FISH_FRESHWATER_FOREST_RARE',
  'Mountain Blindeye': 'T5_FISH_FRESHWATER_MOUNTAIN_RARE',
  'Rushwater Lurcher': 'T5_FISH_FRESHWATER_HIGHLANDS_RARE',
  'Blackbog Clam': 'T7_FISH_FRESHWATER_SWAMP_RARE',
  'Deepwater Kraken': 'T7_FISH_SALTWATER_ALL_RARE',
  'Redspring Eel': 'T5_FISH_FRESHWATER_SWAMP_LEGENDARY',
  'Dusthole Crab': 'T7_FISH_FRESHWATER_STEPPE_RARE',
  'Puremist Snapper': 'T7_FISH_FRESHWATER_FOREST_RARE',
  'Frostpeak Deadeye': 'T7_FISH_FRESHWATER_MOUNTAIN_RARE',
  'Thunderfall Lurcher': 'T7_FISH_FRESHWATER_HIGHLANDS_RARE',
  'Deadwater Eel': 'T7_FISH_FRESHWATER_SWAMP_LEGENDARY',

  // Herbs
  'Arcane Agaric': 'T2_HERB',
  'Brightleaf Comfrey': 'T3_HERB',
  'Crenellated Burdock': 'T4_HERB',
  'Dragon Teasel': 'T5_HERB',
  'Elusive Foxglove': 'T6_HERB',
  'Firetouched Mullein': 'T7_HERB',
  'Ghoul Yarrow': 'T8_HERB',

  // Avalon
  'Avalonian Energy': 'QUESTITEM_TOKEN_AVALON',
}

// Get item ID for an ingredient by name and tier
export function getIngredientItemId(name: string, tier: number): string {
  // Check direct mapping first
  if (FOOD_INGREDIENT_IDS[name]) {
    return FOOD_INGREDIENT_IDS[name]
  }

  // Generate ID based on name pattern
  const cleanName = name.toUpperCase().replace(/[^A-Z0-9]/g, '_')
  return `T${tier}_${cleanName}`
}

// All food recipes from Goldenium spreadsheet
export const FOOD_RECIPES: FoodRecipe[] = [
  // ============ AVALONIAN MEALS ============
  {
    id: 'avalonian_beef_sandwich',
    name: 'Avalonian Beef Sandwich',
    itemId: 'T8_MEAL_SANDWICH_AVALON',
    tier: 8,
    category: 'avalon',
    outputQuantity: 10,
    baseFocus: 795,
    ingredients: [
      { itemId: 'T4_BREAD', name: 'Bread', quantity: 36, tier: 4 },
      { itemId: 'T8_MEAT', name: 'Raw Beef', quantity: 72, tier: 8 },
      { itemId: 'T8_BUTTER', name: "Cow's Butter", quantity: 18, tier: 8 },
      { itemId: 'QUESTITEM_TOKEN_AVALON', name: 'Avalonian Energy', quantity: 90, tier: 6 },
    ],
  },
  {
    id: 'avalonian_beef_stew',
    name: 'Avalonian Beef Stew',
    itemId: 'T8_MEAL_STEW_AVALON',
    tier: 8,
    category: 'avalon',
    outputQuantity: 10,
    baseFocus: 850,
    ingredients: [
      { itemId: 'T7_FARM_CORN', name: 'Bundle of Corn', quantity: 36, tier: 7 },
      { itemId: 'T8_FARM_PUMPKIN', name: 'Pumpkin', quantity: 36, tier: 8 },
      { itemId: 'T8_MEAT', name: 'Raw Beef', quantity: 72, tier: 8 },
      { itemId: 'QUESTITEM_TOKEN_AVALON', name: 'Avalonian Energy', quantity: 90, tier: 6 },
    ],
  },
  {
    id: 'avalonian_chicken_omelette',
    name: 'Avalonian Chicken Omelette',
    itemId: 'T3_MEAL_OMELETTE_AVALON',
    tier: 3,
    category: 'avalon',
    outputQuantity: 10,
    baseFocus: 84,
    ingredients: [
      { itemId: 'T4_FARM_GOAT_MILK', name: "Goat's Milk", quantity: 4, tier: 4 },
      { itemId: 'T3_MEAT', name: 'Raw Chicken', quantity: 8, tier: 3 },
      { itemId: 'T3_FARM_CHICKEN_EGG', name: 'Hen Eggs', quantity: 2, tier: 3 },
      { itemId: 'QUESTITEM_TOKEN_AVALON', name: 'Avalonian Energy', quantity: 10, tier: 6 },
    ],
  },
  {
    id: 'avalonian_goat_sandwich',
    name: 'Avalonian Goat Sandwich',
    itemId: 'T4_MEAL_SANDWICH_AVALON',
    tier: 4,
    category: 'avalon',
    outputQuantity: 10,
    baseFocus: 88,
    ingredients: [
      { itemId: 'T4_BREAD', name: 'Bread', quantity: 4, tier: 4 },
      { itemId: 'T4_MEAT', name: 'Raw Goat', quantity: 8, tier: 4 },
      { itemId: 'T4_BUTTER', name: "Goat's Butter", quantity: 2, tier: 4 },
      { itemId: 'QUESTITEM_TOKEN_AVALON', name: 'Avalonian Energy', quantity: 10, tier: 6 },
    ],
  },
  {
    id: 'avalonian_goat_stew',
    name: 'Avalonian Goat Stew',
    itemId: 'T4_MEAL_STEW_AVALON',
    tier: 4,
    category: 'avalon',
    outputQuantity: 10,
    baseFocus: 94,
    ingredients: [
      { itemId: 'T1_CARROT', name: 'Carrots', quantity: 4, tier: 1 },
      { itemId: 'T4_TURNIP', name: 'Turnips', quantity: 4, tier: 4 },
      { itemId: 'T4_MEAT', name: 'Raw Goat', quantity: 8, tier: 4 },
      { itemId: 'QUESTITEM_TOKEN_AVALON', name: 'Avalonian Energy', quantity: 10, tier: 6 },
    ],
  },
  {
    id: 'avalonian_goose_omelette',
    name: 'Avalonian Goose Omelette',
    itemId: 'T5_MEAL_OMELETTE_AVALON',
    tier: 5,
    category: 'avalon',
    outputQuantity: 10,
    baseFocus: 252,
    ingredients: [
      { itemId: 'T6_FARM_SHEEP_MILK', name: "Sheep's Milk", quantity: 12, tier: 6 },
      { itemId: 'T5_MEAT', name: 'Raw Goose', quantity: 24, tier: 5 },
      { itemId: 'T5_FARM_GOOSE_EGG', name: 'Goose Eggs', quantity: 6, tier: 5 },
      { itemId: 'QUESTITEM_TOKEN_AVALON', name: 'Avalonian Energy', quantity: 30, tier: 6 },
    ],
  },
  {
    id: 'avalonian_mutton_sandwich',
    name: 'Avalonian Mutton Sandwich',
    itemId: 'T6_MEAL_SANDWICH_AVALON',
    tier: 6,
    category: 'avalon',
    outputQuantity: 10,
    baseFocus: 265,
    ingredients: [
      { itemId: 'T4_BREAD', name: 'Bread', quantity: 12, tier: 4 },
      { itemId: 'T6_MEAT', name: 'Raw Mutton', quantity: 24, tier: 6 },
      { itemId: 'T6_BUTTER', name: "Sheep's Butter", quantity: 6, tier: 6 },
      { itemId: 'QUESTITEM_TOKEN_AVALON', name: 'Avalonian Energy', quantity: 30, tier: 6 },
    ],
  },
  {
    id: 'avalonian_mutton_stew',
    name: 'Avalonian Mutton Stew',
    itemId: 'T6_MEAL_STEW_AVALON',
    tier: 6,
    category: 'avalon',
    outputQuantity: 10,
    baseFocus: 283,
    ingredients: [
      { itemId: 'T5_CABBAGE', name: 'Cabbage', quantity: 12, tier: 5 },
      { itemId: 'T6_FARM_POTATOES', name: 'Potatoes', quantity: 12, tier: 6 },
      { itemId: 'T6_MEAT', name: 'Raw Mutton', quantity: 24, tier: 6 },
      { itemId: 'QUESTITEM_TOKEN_AVALON', name: 'Avalonian Energy', quantity: 30, tier: 6 },
    ],
  },
  {
    id: 'avalonian_pork_omelette',
    name: 'Avalonian Pork Omelette',
    itemId: 'T7_MEAL_OMELETTE_AVALON',
    tier: 7,
    category: 'avalon',
    outputQuantity: 10,
    baseFocus: 755,
    ingredients: [
      { itemId: 'T8_FARM_COW_MILK', name: "Cow's Milk", quantity: 36, tier: 8 },
      { itemId: 'T7_MEAT', name: 'Raw Pork', quantity: 72, tier: 7 },
      { itemId: 'T5_FARM_GOOSE_EGG', name: 'Goose Eggs', quantity: 18, tier: 5 },
      { itemId: 'QUESTITEM_TOKEN_AVALON', name: 'Avalonian Energy', quantity: 90, tier: 6 },
    ],
  },

  // ============ BASIC MEALS ============
  {
    id: 'bean_salad',
    name: 'Bean Salad',
    itemId: 'T2_MEAL_SALAD',
    tier: 2,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 77,
    ingredients: [
      { itemId: 'T2_BEAN', name: 'Beans', quantity: 8, tier: 2 },
      { itemId: 'T1_CARROT', name: 'Carrots', quantity: 8, tier: 1 },
    ],
  },
  {
    id: 'carrot_soup',
    name: 'Carrot Soup',
    itemId: 'T1_MEAL_SOUP',
    tier: 1,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 77,
    ingredients: [
      { itemId: 'T1_CARROT', name: 'Carrots', quantity: 16, tier: 1 },
    ],
  },
  {
    id: 'wheat_soup',
    name: 'Wheat Soup',
    itemId: 'T3_MEAL_SOUP',
    tier: 3,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 252,
    ingredients: [
      { itemId: 'T3_WHEAT', name: 'Sheaf of Wheat', quantity: 48, tier: 3 },
    ],
  },
  {
    id: 'cabbage_soup',
    name: 'Cabbage Soup',
    itemId: 'T5_MEAL_SOUP',
    tier: 5,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 756,
    ingredients: [
      { itemId: 'T5_CABBAGE', name: 'Cabbage', quantity: 144, tier: 5 },
    ],
  },
  {
    id: 'turnip_salad',
    name: 'Turnip Salad',
    itemId: 'T4_MEAL_SALAD',
    tier: 4,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 252,
    ingredients: [
      { itemId: 'T4_TURNIP', name: 'Turnips', quantity: 24, tier: 4 },
      { itemId: 'T3_WHEAT', name: 'Sheaf of Wheat', quantity: 24, tier: 3 },
    ],
  },
  {
    id: 'potato_salad',
    name: 'Potato Salad',
    itemId: 'T6_MEAL_SALAD',
    tier: 6,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 756,
    ingredients: [
      { itemId: 'T6_FARM_POTATOES', name: 'Potatoes', quantity: 72, tier: 6 },
      { itemId: 'T5_CABBAGE', name: 'Cabbage', quantity: 72, tier: 5 },
    ],
  },

  // ============ OMELETTES ============
  {
    id: 'chicken_omelette',
    name: 'Chicken Omelette',
    itemId: 'T3_MEAL_OMELETTE',
    tier: 3,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 77,
    ingredients: [
      { itemId: 'T3_WHEAT', name: 'Sheaf of Wheat', quantity: 4, tier: 3 },
      { itemId: 'T3_MEAT', name: 'Raw Chicken', quantity: 8, tier: 3 },
      { itemId: 'T3_FARM_CHICKEN_EGG', name: 'Hen Eggs', quantity: 2, tier: 3 },
    ],
  },
  {
    id: 'goose_omelette',
    name: 'Goose Omelette',
    itemId: 'T5_MEAL_OMELETTE',
    tier: 5,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 230,
    ingredients: [
      { itemId: 'T5_CABBAGE', name: 'Cabbage', quantity: 12, tier: 5 },
      { itemId: 'T5_MEAT', name: 'Raw Goose', quantity: 24, tier: 5 },
      { itemId: 'T5_FARM_GOOSE_EGG', name: 'Goose Eggs', quantity: 6, tier: 5 },
    ],
  },
  {
    id: 'pork_omelette',
    name: 'Pork Omelette',
    itemId: 'T7_MEAL_OMELETTE',
    tier: 7,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 690,
    ingredients: [
      { itemId: 'T7_FARM_CORN', name: 'Bundle of Corn', quantity: 36, tier: 7 },
      { itemId: 'T7_MEAT', name: 'Raw Pork', quantity: 72, tier: 7 },
      { itemId: 'T5_FARM_GOOSE_EGG', name: 'Goose Eggs', quantity: 18, tier: 5 },
    ],
  },

  // ============ SANDWICHES ============
  {
    id: 'goat_sandwich',
    name: 'Goat Sandwich',
    itemId: 'T4_MEAL_SANDWICH',
    tier: 4,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 81,
    ingredients: [
      { itemId: 'T4_BREAD', name: 'Bread', quantity: 4, tier: 4 },
      { itemId: 'T4_MEAT', name: 'Raw Goat', quantity: 8, tier: 4 },
      { itemId: 'T4_BUTTER', name: "Goat's Butter", quantity: 2, tier: 4 },
    ],
  },
  {
    id: 'mutton_sandwich',
    name: 'Mutton Sandwich',
    itemId: 'T6_MEAL_SANDWICH',
    tier: 6,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 243,
    ingredients: [
      { itemId: 'T4_BREAD', name: 'Bread', quantity: 12, tier: 4 },
      { itemId: 'T6_MEAT', name: 'Raw Mutton', quantity: 24, tier: 6 },
      { itemId: 'T6_BUTTER', name: "Sheep's Butter", quantity: 6, tier: 6 },
    ],
  },
  {
    id: 'beef_sandwich',
    name: 'Beef Sandwich',
    itemId: 'T8_MEAL_SANDWICH',
    tier: 8,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 730,
    ingredients: [
      { itemId: 'T4_BREAD', name: 'Bread', quantity: 36, tier: 4 },
      { itemId: 'T8_MEAT', name: 'Raw Beef', quantity: 72, tier: 8 },
      { itemId: 'T8_BUTTER', name: "Cow's Butter", quantity: 18, tier: 8 },
    ],
  },

  // ============ STEWS ============
  {
    id: 'goat_stew',
    name: 'Goat Stew',
    itemId: 'T4_MEAL_STEW',
    tier: 4,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 91,
    ingredients: [
      { itemId: 'T4_TURNIP', name: 'Turnips', quantity: 4, tier: 4 },
      { itemId: 'T4_BREAD', name: 'Bread', quantity: 4, tier: 4 },
      { itemId: 'T4_MEAT', name: 'Raw Goat', quantity: 8, tier: 4 },
    ],
  },
  {
    id: 'mutton_stew',
    name: 'Mutton Stew',
    itemId: 'T6_MEAL_STEW',
    tier: 6,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 272,
    ingredients: [
      { itemId: 'T6_FARM_POTATOES', name: 'Potatoes', quantity: 12, tier: 6 },
      { itemId: 'T4_BREAD', name: 'Bread', quantity: 12, tier: 4 },
      { itemId: 'T6_MEAT', name: 'Raw Mutton', quantity: 24, tier: 6 },
    ],
  },
  {
    id: 'beef_stew',
    name: 'Beef Stew',
    itemId: 'T8_MEAL_STEW',
    tier: 8,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 817,
    ingredients: [
      { itemId: 'T8_FARM_PUMPKIN', name: 'Pumpkin', quantity: 36, tier: 8 },
      { itemId: 'T4_BREAD', name: 'Bread', quantity: 36, tier: 4 },
      { itemId: 'T8_MEAT', name: 'Raw Beef', quantity: 72, tier: 8 },
    ],
  },

  // ============ PIES ============
  {
    id: 'chicken_pie',
    name: 'Chicken Pie',
    itemId: 'T3_MEAL_PIE',
    tier: 3,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 78,
    ingredients: [
      { itemId: 'T3_WHEAT', name: 'Sheaf of Wheat', quantity: 2, tier: 3 },
      { itemId: 'T3_FLOUR', name: 'Flour', quantity: 4, tier: 3 },
      { itemId: 'T3_MEAT', name: 'Raw Chicken', quantity: 8, tier: 3 },
    ],
  },
  {
    id: 'goose_pie',
    name: 'Goose Pie',
    itemId: 'T5_MEAL_PIE',
    tier: 5,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 266,
    ingredients: [
      { itemId: 'T5_CABBAGE', name: 'Cabbage', quantity: 6, tier: 5 },
      { itemId: 'T3_FLOUR', name: 'Flour', quantity: 12, tier: 3 },
      { itemId: 'T5_MEAT', name: 'Raw Goose', quantity: 24, tier: 5 },
      { itemId: 'T4_FARM_GOAT_MILK', name: "Goat's Milk", quantity: 6, tier: 4 },
    ],
  },
  {
    id: 'pork_pie',
    name: 'Pork Pie',
    itemId: 'T7_MEAL_PIE',
    tier: 7,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 799,
    ingredients: [
      { itemId: 'T7_FARM_CORN', name: 'Bundle of Corn', quantity: 18, tier: 7 },
      { itemId: 'T3_FLOUR', name: 'Flour', quantity: 36, tier: 3 },
      { itemId: 'T7_MEAT', name: 'Raw Pork', quantity: 72, tier: 7 },
      { itemId: 'T6_FARM_SHEEP_MILK', name: "Sheep's Milk", quantity: 18, tier: 6 },
    ],
  },

  // ============ ROASTS ============
  {
    id: 'roast_chicken',
    name: 'Roast Chicken',
    itemId: 'T3_MEAL_ROAST',
    tier: 3,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 87,
    ingredients: [
      { itemId: 'T3_MEAT', name: 'Raw Chicken', quantity: 8, tier: 3 },
      { itemId: 'T2_BEAN', name: 'Beans', quantity: 4, tier: 2 },
      { itemId: 'T4_FARM_GOAT_MILK', name: "Goat's Milk", quantity: 4, tier: 4 },
    ],
  },
  {
    id: 'roast_goose',
    name: 'Roast Goose',
    itemId: 'T5_MEAL_ROAST',
    tier: 5,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 262,
    ingredients: [
      { itemId: 'T5_MEAT', name: 'Raw Goose', quantity: 24, tier: 5 },
      { itemId: 'T5_CABBAGE', name: 'Cabbage', quantity: 12, tier: 5 },
      { itemId: 'T6_FARM_SHEEP_MILK', name: "Sheep's Milk", quantity: 12, tier: 6 },
    ],
  },
  {
    id: 'roast_pork',
    name: 'Roast Pork',
    itemId: 'T7_MEAL_ROAST',
    tier: 7,
    category: 'meal',
    outputQuantity: 10,
    baseFocus: 785,
    ingredients: [
      { itemId: 'T7_MEAT', name: 'Raw Pork', quantity: 72, tier: 7 },
      { itemId: 'T7_FARM_CORN', name: 'Bundle of Corn', quantity: 36, tier: 7 },
      { itemId: 'T8_FARM_COW_MILK', name: "Cow's Milk", quantity: 36, tier: 8 },
    ],
  },

  // ============ PROCESSED INGREDIENTS ============
  {
    id: 'flour',
    name: 'Flour',
    itemId: 'T3_FLOUR',
    tier: 3,
    category: 'ingredient',
    outputQuantity: 1,
    baseFocus: 52,
    ingredients: [
      { itemId: 'T3_WHEAT', name: 'Sheaf of Wheat', quantity: 1, tier: 3 },
    ],
  },
  {
    id: 'bread',
    name: 'Bread',
    itemId: 'T4_BREAD',
    tier: 4,
    category: 'ingredient',
    outputQuantity: 1,
    baseFocus: 57,
    ingredients: [
      { itemId: 'T3_FLOUR', name: 'Flour', quantity: 1, tier: 3 },
    ],
  },
  {
    id: 'goats_butter',
    name: "Goat's Butter",
    itemId: 'T4_BUTTER',
    tier: 4,
    category: 'ingredient',
    outputQuantity: 1,
    baseFocus: 52,
    ingredients: [
      { itemId: 'T4_FARM_GOAT_MILK', name: "Goat's Milk", quantity: 1, tier: 4 },
    ],
  },
  {
    id: 'sheeps_butter',
    name: "Sheep's Butter",
    itemId: 'T6_BUTTER',
    tier: 6,
    category: 'ingredient',
    outputQuantity: 1,
    baseFocus: 52,
    ingredients: [
      { itemId: 'T6_FARM_SHEEP_MILK', name: "Sheep's Milk", quantity: 1, tier: 6 },
    ],
  },
  {
    id: 'cows_butter',
    name: "Cow's Butter",
    itemId: 'T8_BUTTER',
    tier: 8,
    category: 'ingredient',
    outputQuantity: 1,
    baseFocus: 52,
    ingredients: [
      { itemId: 'T8_FARM_COW_MILK', name: "Cow's Milk", quantity: 1, tier: 8 },
    ],
  },

  // ============ RAW MEAT ============
  {
    id: 'raw_chicken',
    name: 'Raw Chicken',
    itemId: 'T3_MEAT',
    tier: 3,
    category: 'ingredient',
    outputQuantity: 18,
    baseFocus: 52,
    ingredients: [
      { itemId: 'T3_FARM_CHICKEN_GROWN', name: 'Chicken', quantity: 1, tier: 3 },
    ],
  },
  {
    id: 'raw_goat',
    name: 'Raw Goat',
    itemId: 'T4_MEAT',
    tier: 4,
    category: 'ingredient',
    outputQuantity: 18,
    baseFocus: 52,
    ingredients: [
      { itemId: 'T4_FARM_GOAT_GROWN', name: 'Goat', quantity: 1, tier: 4 },
    ],
  },
  {
    id: 'raw_goose',
    name: 'Raw Goose',
    itemId: 'T5_MEAT',
    tier: 5,
    category: 'ingredient',
    outputQuantity: 18,
    baseFocus: 52,
    ingredients: [
      { itemId: 'T5_FARM_GOOSE_GROWN', name: 'Goose', quantity: 1, tier: 5 },
    ],
  },
  {
    id: 'raw_mutton',
    name: 'Raw Mutton',
    itemId: 'T6_MEAT',
    tier: 6,
    category: 'ingredient',
    outputQuantity: 18,
    baseFocus: 52,
    ingredients: [
      { itemId: 'T6_FARM_SHEEP_GROWN', name: 'Sheep', quantity: 1, tier: 6 },
    ],
  },
  {
    id: 'raw_pork',
    name: 'Raw Pork',
    itemId: 'T7_MEAT',
    tier: 7,
    category: 'ingredient',
    outputQuantity: 18,
    baseFocus: 52,
    ingredients: [
      { itemId: 'T7_FARM_PIG_GROWN', name: 'Pig', quantity: 1, tier: 7 },
    ],
  },
  {
    id: 'raw_beef',
    name: 'Raw Beef',
    itemId: 'T8_MEAT',
    tier: 8,
    category: 'ingredient',
    outputQuantity: 18,
    baseFocus: 52,
    ingredients: [
      { itemId: 'T8_FARM_COW_GROWN', name: 'Cow', quantity: 1, tier: 8 },
    ],
  },

  // ============ FISH DISHES ============
  {
    id: 'grilled_fish',
    name: 'Grilled Fish',
    itemId: 'T1_MEAL_GRILLEDFISH',
    tier: 1,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 20,
    ingredients: [
      { itemId: 'T1_FISH_FRESHWATER_ALL_CHOPPED', name: 'Chopped Fish', quantity: 10, tier: 1 },
    ],
  },
  {
    id: 'seaweed_salad',
    name: 'Seaweed Salad',
    itemId: 'T1_MEAL_SEAWEEDSALAD',
    tier: 1,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 5,
    ingredients: [
      { itemId: 'T1_SEAWEED', name: 'Seaweed', quantity: 10, tier: 1 },
    ],
  },
  {
    id: 'basic_fish_sauce',
    name: 'Basic Fish Sauce',
    itemId: 'T1_FISHSAUCE_LEVEL1',
    tier: 1,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 0,
    ingredients: [
      { itemId: 'T1_FISH_FRESHWATER_ALL_CHOPPED', name: 'Chopped Fish', quantity: 15, tier: 1 },
      { itemId: 'T1_SEAWEED', name: 'Seaweed', quantity: 1, tier: 1 },
    ],
  },
  {
    id: 'fancy_fish_sauce',
    name: 'Fancy Fish Sauce',
    itemId: 'T1_FISHSAUCE_LEVEL2',
    tier: 1,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 0,
    ingredients: [
      { itemId: 'T1_FISH_FRESHWATER_ALL_CHOPPED', name: 'Chopped Fish', quantity: 45, tier: 1 },
      { itemId: 'T1_SEAWEED', name: 'Seaweed', quantity: 3, tier: 1 },
    ],
  },
  {
    id: 'special_fish_sauce',
    name: 'Special Fish Sauce',
    itemId: 'T1_FISHSAUCE_LEVEL3',
    tier: 1,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 0,
    ingredients: [
      { itemId: 'T1_FISH_FRESHWATER_ALL_CHOPPED', name: 'Chopped Fish', quantity: 135, tier: 1 },
      { itemId: 'T1_SEAWEED', name: 'Seaweed', quantity: 9, tier: 1 },
    ],
  },

  // ============ RARE FISH DISHES ============
  {
    id: 'greenmoor_clam_soup',
    name: 'Greenmoor Clam Soup',
    itemId: 'T1_MEAL_SOUP_FISH',
    tier: 1,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 106,
    ingredients: [
      { itemId: 'T3_FISH_FRESHWATER_SWAMP_RARE', name: 'Greenmoor Clam', quantity: 1, tier: 3 },
      { itemId: 'T1_CARROT', name: 'Carrots', quantity: 2, tier: 1 },
    ],
  },
  {
    id: 'shallowshore_squid_salad',
    name: 'Shallowshore Squid Salad',
    itemId: 'T2_MEAL_SALAD_FISH',
    tier: 2,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 106,
    ingredients: [
      { itemId: 'T3_FISH_SALTWATER_ALL_RARE', name: 'Shallowshore Squid', quantity: 1, tier: 3 },
      { itemId: 'T2_BEAN', name: 'Beans', quantity: 1, tier: 2 },
      { itemId: 'T2_HERB', name: 'Arcane Agaric', quantity: 1, tier: 2 },
    ],
  },
  {
    id: 'lowriver_crab_omelette',
    name: 'Lowriver Crab Omelette',
    itemId: 'T3_MEAL_OMELETTE_FISH',
    tier: 3,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 116,
    ingredients: [
      { itemId: 'T3_FISH_FRESHWATER_STEPPE_RARE', name: 'Lowriver Crab', quantity: 1, tier: 3 },
      { itemId: 'T3_HERB', name: 'Brightleaf Comfrey', quantity: 1, tier: 3 },
      { itemId: 'T3_FARM_CHICKEN_EGG', name: 'Hen Eggs', quantity: 1, tier: 3 },
    ],
  },
  {
    id: 'upland_coldeye_pie',
    name: 'Upland Coldeye Pie',
    itemId: 'T3_MEAL_PIE_FISH',
    tier: 3,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 120,
    ingredients: [
      { itemId: 'T3_FISH_FRESHWATER_MOUNTAIN_RARE', name: 'Upland Coldeye', quantity: 1, tier: 3 },
      { itemId: 'T3_FLOUR', name: 'Flour', quantity: 1, tier: 3 },
      { itemId: 'T3_FARM_CHICKEN_EGG', name: 'Hen Eggs', quantity: 1, tier: 3 },
    ],
  },
  {
    id: 'roasted_whitefog_snapper',
    name: 'Roasted Whitefog Snapper',
    itemId: 'T3_MEAL_ROAST_FISH',
    tier: 3,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 116,
    ingredients: [
      { itemId: 'T3_FISH_FRESHWATER_FOREST_RARE', name: 'Whitefog Snapper', quantity: 1, tier: 3 },
      { itemId: 'T3_HERB', name: 'Brightleaf Comfrey', quantity: 1, tier: 3 },
      { itemId: 'T4_FARM_GOAT_MILK', name: "Goat's Milk", quantity: 1, tier: 4 },
    ],
  },
  {
    id: 'greenriver_eel_stew',
    name: 'Greenriver Eel Stew',
    itemId: 'T4_MEAL_STEW_FISH',
    tier: 4,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 116,
    ingredients: [
      { itemId: 'T3_FISH_FRESHWATER_SWAMP_LEGENDARY', name: 'Greenriver Eel', quantity: 1, tier: 3 },
      { itemId: 'T4_TURNIP', name: 'Turnips', quantity: 1, tier: 4 },
      { itemId: 'T4_HERB', name: 'Crenellated Burdock', quantity: 1, tier: 4 },
    ],
  },
  {
    id: 'stonestream_lurcher_sandwich',
    name: 'Stonestream Lurcher Sandwich',
    itemId: 'T4_MEAL_SANDWICH_FISH',
    tier: 4,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 120,
    ingredients: [
      { itemId: 'T3_FISH_FRESHWATER_HIGHLANDS_RARE', name: 'Stonestream Lurcher', quantity: 1, tier: 3 },
      { itemId: 'T4_TURNIP', name: 'Turnips', quantity: 1, tier: 4 },
      { itemId: 'T4_BUTTER', name: "Goat's Butter", quantity: 1, tier: 4 },
    ],
  },
  {
    id: 'midwater_octopus_salad',
    name: 'Midwater Octopus Salad',
    itemId: 'T4_MEAL_SALAD_FISH',
    tier: 4,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 345,
    ingredients: [
      { itemId: 'T5_FISH_SALTWATER_ALL_RARE', name: 'Midwater Octopus', quantity: 1, tier: 5 },
      { itemId: 'T4_TURNIP', name: 'Turnips', quantity: 2, tier: 4 },
      { itemId: 'T4_HERB', name: 'Crenellated Burdock', quantity: 2, tier: 4 },
      { itemId: 'T4_MEAT', name: 'Raw Goat', quantity: 2, tier: 4 },
    ],
  },
  {
    id: 'drybrook_crab_omelette',
    name: 'Drybrook Crab Omelette',
    itemId: 'T5_MEAL_OMELETTE_FISH',
    tier: 5,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 337,
    ingredients: [
      { itemId: 'T5_FISH_FRESHWATER_STEPPE_RARE', name: 'Drybrook Crab', quantity: 1, tier: 5 },
      { itemId: 'T5_CABBAGE', name: 'Cabbage', quantity: 2, tier: 5 },
      { itemId: 'T5_HERB', name: 'Dragon Teasel', quantity: 2, tier: 5 },
      { itemId: 'T5_FARM_GOOSE_EGG', name: 'Goose Eggs', quantity: 2, tier: 5 },
    ],
  },
  {
    id: 'mountain_blindeye_pie',
    name: 'Mountain Blindeye Pie',
    itemId: 'T5_MEAL_PIE_FISH',
    tier: 5,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 337,
    ingredients: [
      { itemId: 'T5_FISH_FRESHWATER_MOUNTAIN_RARE', name: 'Mountain Blindeye', quantity: 1, tier: 5 },
      { itemId: 'T5_CABBAGE', name: 'Cabbage', quantity: 2, tier: 5 },
      { itemId: 'T5_HERB', name: 'Dragon Teasel', quantity: 2, tier: 5 },
      { itemId: 'T5_FARM_GOOSE_EGG', name: 'Goose Eggs', quantity: 2, tier: 5 },
    ],
  },
  {
    id: 'roasted_clearhaze_snapper',
    name: 'Roasted Clearhaze Snapper',
    itemId: 'T5_MEAL_ROAST_FISH',
    tier: 5,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 337,
    ingredients: [
      { itemId: 'T5_FISH_FRESHWATER_FOREST_RARE', name: 'Clearhaze Snapper', quantity: 1, tier: 5 },
      { itemId: 'T5_CABBAGE', name: 'Cabbage', quantity: 2, tier: 5 },
      { itemId: 'T5_HERB', name: 'Dragon Teasel', quantity: 2, tier: 5 },
      { itemId: 'T6_FARM_SHEEP_MILK', name: "Sheep's Milk", quantity: 2, tier: 6 },
    ],
  },
  {
    id: 'blackbog_clam_soup',
    name: 'Blackbog Clam Soup',
    itemId: 'T5_MEAL_SOUP_FISH',
    tier: 5,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 750,
    ingredients: [
      { itemId: 'T7_FISH_FRESHWATER_SWAMP_RARE', name: 'Blackbog Clam', quantity: 1, tier: 7 },
      { itemId: 'T5_CABBAGE', name: 'Cabbage', quantity: 6, tier: 5 },
      { itemId: 'T5_HERB', name: 'Dragon Teasel', quantity: 6, tier: 5 },
      { itemId: 'T5_MEAT', name: 'Raw Goose', quantity: 6, tier: 5 },
    ],
  },
  {
    id: 'redspring_eel_stew',
    name: 'Redspring Eel Stew',
    itemId: 'T6_MEAL_STEW_FISH',
    tier: 6,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 337,
    ingredients: [
      { itemId: 'T5_FISH_FRESHWATER_SWAMP_LEGENDARY', name: 'Redspring Eel', quantity: 1, tier: 5 },
      { itemId: 'T6_FARM_POTATOES', name: 'Potatoes', quantity: 2, tier: 6 },
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 2, tier: 6 },
      { itemId: 'T6_FARM_SHEEP_MILK', name: "Sheep's Milk", quantity: 2, tier: 6 },
    ],
  },
  {
    id: 'rushwater_lurcher_sandwich',
    name: 'Rushwater Lurcher Sandwich',
    itemId: 'T6_MEAL_SANDWICH_FISH',
    tier: 6,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 345,
    ingredients: [
      { itemId: 'T5_FISH_FRESHWATER_HIGHLANDS_RARE', name: 'Rushwater Lurcher', quantity: 1, tier: 5 },
      { itemId: 'T6_FARM_POTATOES', name: 'Potatoes', quantity: 2, tier: 6 },
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 2, tier: 6 },
      { itemId: 'T6_BUTTER', name: "Sheep's Butter", quantity: 2, tier: 6 },
    ],
  },
  {
    id: 'deepwater_kraken_salad',
    name: 'Deepwater Kraken Salad',
    itemId: 'T6_MEAL_SALAD_FISH',
    tier: 6,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 1002,
    ingredients: [
      { itemId: 'T7_FISH_SALTWATER_ALL_RARE', name: 'Deepwater Kraken', quantity: 1, tier: 7 },
      { itemId: 'T6_FARM_POTATOES', name: 'Potatoes', quantity: 6, tier: 6 },
      { itemId: 'T6_HERB', name: 'Elusive Foxglove', quantity: 6, tier: 6 },
      { itemId: 'T6_MEAT', name: 'Raw Mutton', quantity: 6, tier: 6 },
    ],
  },
  {
    id: 'dusthole_crab_omelette',
    name: 'Dusthole Crab Omelette',
    itemId: 'T7_MEAL_OMELETTE_FISH',
    tier: 7,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 1002,
    ingredients: [
      { itemId: 'T7_FISH_FRESHWATER_STEPPE_RARE', name: 'Dusthole Crab', quantity: 1, tier: 7 },
      { itemId: 'T7_FARM_CORN', name: 'Bundle of Corn', quantity: 6, tier: 7 },
      { itemId: 'T7_HERB', name: 'Firetouched Mullein', quantity: 6, tier: 7 },
      { itemId: 'T7_MEAT', name: 'Raw Pork', quantity: 6, tier: 7 },
    ],
  },
  {
    id: 'frostpeak_deadeye_pie',
    name: 'Frostpeak Deadeye Pie',
    itemId: 'T7_MEAL_PIE_FISH',
    tier: 7,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 1002,
    ingredients: [
      { itemId: 'T7_FISH_FRESHWATER_MOUNTAIN_RARE', name: 'Frostpeak Deadeye', quantity: 1, tier: 7 },
      { itemId: 'T7_FARM_CORN', name: 'Bundle of Corn', quantity: 6, tier: 7 },
      { itemId: 'T7_HERB', name: 'Firetouched Mullein', quantity: 6, tier: 7 },
      { itemId: 'T7_MEAT', name: 'Raw Pork', quantity: 6, tier: 7 },
    ],
  },
  {
    id: 'roasted_puremist_snapper',
    name: 'Roasted Puremist Snapper',
    itemId: 'T7_MEAL_ROAST_FISH',
    tier: 7,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 978,
    ingredients: [
      { itemId: 'T7_FISH_FRESHWATER_FOREST_RARE', name: 'Puremist Snapper', quantity: 1, tier: 7 },
      { itemId: 'T7_FARM_CORN', name: 'Bundle of Corn', quantity: 6, tier: 7 },
      { itemId: 'T7_HERB', name: 'Firetouched Mullein', quantity: 6, tier: 7 },
      { itemId: 'T8_FARM_COW_MILK', name: "Cow's Milk", quantity: 6, tier: 8 },
    ],
  },
  {
    id: 'deadwater_eel_stew',
    name: 'Deadwater Eel Stew',
    itemId: 'T8_MEAL_STEW_FISH',
    tier: 8,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 978,
    ingredients: [
      { itemId: 'T7_FISH_FRESHWATER_SWAMP_LEGENDARY', name: 'Deadwater Eel', quantity: 1, tier: 7 },
      { itemId: 'T8_FARM_PUMPKIN', name: 'Pumpkin', quantity: 6, tier: 8 },
      { itemId: 'T8_HERB', name: 'Ghoul Yarrow', quantity: 6, tier: 8 },
      { itemId: 'T8_FARM_COW_MILK', name: "Cow's Milk", quantity: 6, tier: 8 },
    ],
  },
  {
    id: 'thunderfall_lurcher_sandwich',
    name: 'Thunderfall Lurcher Sandwich',
    itemId: 'T8_MEAL_SANDWICH_FISH',
    tier: 8,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 1002,
    ingredients: [
      { itemId: 'T7_FISH_FRESHWATER_HIGHLANDS_RARE', name: 'Thunderfall Lurcher', quantity: 1, tier: 7 },
      { itemId: 'T8_FARM_PUMPKIN', name: 'Pumpkin', quantity: 6, tier: 8 },
      { itemId: 'T8_HERB', name: 'Ghoul Yarrow', quantity: 6, tier: 8 },
      { itemId: 'T8_BUTTER', name: "Cow's Butter", quantity: 6, tier: 8 },
    ],
  },
  {
    id: 'murkwater_clam_soup',
    name: 'Murkwater Clam Soup',
    itemId: 'T3_MEAL_SOUP_FISH',
    tier: 3,
    category: 'fish',
    outputQuantity: 1,
    baseFocus: 345,
    ingredients: [
      { itemId: 'T5_FISH_FRESHWATER_SWAMP_RARE', name: 'Murkwater Clam', quantity: 1, tier: 5 },
      { itemId: 'T3_WHEAT', name: 'Sheaf of Wheat', quantity: 2, tier: 3 },
      { itemId: 'T3_HERB', name: 'Brightleaf Comfrey', quantity: 2, tier: 3 },
      { itemId: 'T3_MEAT', name: 'Raw Chicken', quantity: 2, tier: 3 },
    ],
  },
]

// Get all unique ingredient item IDs for API fetching
export function getAllFoodIngredientIds(): string[] {
  const ids = new Set<string>()
  for (const recipe of FOOD_RECIPES) {
    for (const ingredient of recipe.ingredients) {
      ids.add(ingredient.itemId)
    }
  }
  return Array.from(ids)
}

// Get all food item IDs for API fetching
export function getAllFoodIds(): string[] {
  return FOOD_RECIPES.map(r => r.itemId)
}

// Get recipes by category
export function getFoodRecipesByCategory(category: FoodRecipe['category']): FoodRecipe[] {
  return FOOD_RECIPES.filter(r => r.category === category)
}

// Get recipe by ID
export function getFoodRecipeById(id: string): FoodRecipe | undefined {
  return FOOD_RECIPES.find(r => r.id === id)
}
