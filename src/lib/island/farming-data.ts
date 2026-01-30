// Albion Online Farming Data
// Based on wiki and community data

// ============ CROPS ============
export interface CropData {
  id: string
  name: string
  seedName: string
  tier: number
  baseYieldMin: number
  baseYieldMax: number
  premiumYieldMin: number
  premiumYieldMax: number
  baseSeedReturn: number // Percentage (e.g., 100 = 100%)
  wateredSeedReturn: number // Percentage when watered with focus
  bonusCity: string
  seedItemId: string
  cropItemId: string
}

export const CROPS: CropData[] = [
  {
    id: 'carrot',
    name: 'Carrot',
    seedName: 'Carrot Seeds',
    tier: 1,
    baseYieldMin: 3,
    baseYieldMax: 6,
    premiumYieldMin: 6,
    premiumYieldMax: 12,
    baseSeedReturn: 100,
    wateredSeedReturn: 200,
    bonusCity: 'Bridgewatch',
    seedItemId: 'T1_CARROT_SEED',
    cropItemId: 'T1_CARROT',
  },
  {
    id: 'bean',
    name: 'Bean',
    seedName: 'Bean Seeds',
    tier: 2,
    baseYieldMin: 3,
    baseYieldMax: 6,
    premiumYieldMin: 6,
    premiumYieldMax: 12,
    baseSeedReturn: 66.67,
    wateredSeedReturn: 166.67,
    bonusCity: 'Bridgewatch',
    seedItemId: 'T2_BEAN_SEED',
    cropItemId: 'T2_BEAN',
  },
  {
    id: 'wheat',
    name: 'Wheat',
    seedName: 'Wheat Seeds',
    tier: 3,
    baseYieldMin: 3,
    baseYieldMax: 6,
    premiumYieldMin: 6,
    premiumYieldMax: 12,
    baseSeedReturn: 50,
    wateredSeedReturn: 150,
    bonusCity: 'Martlock',
    seedItemId: 'T3_WHEAT_SEED',
    cropItemId: 'T3_WHEAT',
  },
  {
    id: 'turnip',
    name: 'Turnip',
    seedName: 'Turnip Seeds',
    tier: 4,
    baseYieldMin: 3,
    baseYieldMax: 6,
    premiumYieldMin: 6,
    premiumYieldMax: 12,
    baseSeedReturn: 40,
    wateredSeedReturn: 140,
    bonusCity: 'Fort Sterling',
    seedItemId: 'T4_TURNIP_SEED',
    cropItemId: 'T4_TURNIP',
  },
  {
    id: 'cabbage',
    name: 'Cabbage',
    seedName: 'Cabbage Seeds',
    tier: 5,
    baseYieldMin: 3,
    baseYieldMax: 6,
    premiumYieldMin: 6,
    premiumYieldMax: 12,
    baseSeedReturn: 33.33,
    wateredSeedReturn: 133.33,
    bonusCity: 'Thetford',
    seedItemId: 'T5_CABBAGE_SEED',
    cropItemId: 'T5_CABBAGE',
  },
  {
    id: 'potato',
    name: 'Potato',
    seedName: 'Potato Seeds',
    tier: 6,
    baseYieldMin: 3,
    baseYieldMax: 6,
    premiumYieldMin: 6,
    premiumYieldMax: 12,
    baseSeedReturn: 28.57,
    wateredSeedReturn: 128.57,
    bonusCity: 'Martlock',
    seedItemId: 'T6_POTATO_SEED',
    cropItemId: 'T6_POTATO',
  },
  {
    id: 'corn',
    name: 'Corn',
    seedName: 'Corn Seeds',
    tier: 7,
    baseYieldMin: 3,
    baseYieldMax: 6,
    premiumYieldMin: 6,
    premiumYieldMax: 12,
    baseSeedReturn: 25,
    wateredSeedReturn: 113.33,
    bonusCity: 'Bridgewatch',
    seedItemId: 'T7_CORN_SEED',
    cropItemId: 'T7_CORN',
  },
  {
    id: 'pumpkin',
    name: 'Pumpkin',
    seedName: 'Pumpkin Seeds',
    tier: 8,
    baseYieldMin: 3,
    baseYieldMax: 6,
    premiumYieldMin: 6,
    premiumYieldMax: 12,
    baseSeedReturn: 22.22,
    wateredSeedReturn: 106.33,
    bonusCity: 'Caerleon',
    seedItemId: 'T8_PUMPKIN_SEED',
    cropItemId: 'T8_PUMPKIN',
  },
]

// ============ ANIMALS (LIVESTOCK) ============
export interface AnimalData {
  id: string
  name: string
  babyName: string
  tier: number
  type: 'livestock' | 'mount'
  building: 'pasture' | 'kennel'
  feedRequired: number // crops per growth cycle
  favoriteFoodTier: number // tier of crop that halves feed
  produceType: 'eggs' | 'milk' | 'none'
  produceName: string | null
  produceMin: number
  produceMax: number
  premiumProduceMin: number
  premiumProduceMax: number
  meatName: string
  meatYieldBase: number
  bonusCity: string
  babyItemId: string
  adultItemId: string
  produceItemId: string | null
  meatItemId: string
}

export const ANIMALS: AnimalData[] = [
  // Livestock (pasture)
  {
    id: 'chicken',
    name: 'Chicken',
    babyName: 'Baby Chicken',
    tier: 3,
    type: 'livestock',
    building: 'pasture',
    feedRequired: 10,
    favoriteFoodTier: 1, // Carrots
    produceType: 'eggs',
    produceName: 'Hen Eggs',
    produceMin: 8,
    produceMax: 11,
    premiumProduceMin: 16,
    premiumProduceMax: 22,
    meatName: 'Raw Chicken',
    meatYieldBase: 18,
    bonusCity: 'Thetford',
    babyItemId: 'T3_FARM_CHICKEN_BABY',
    adultItemId: 'T3_FARM_CHICKEN_GROWN',
    produceItemId: 'T3_EGG',
    meatItemId: 'T3_MEAT',
  },
  {
    id: 'goose',
    name: 'Goose',
    babyName: 'Gosling',
    tier: 4,
    type: 'livestock',
    building: 'pasture',
    feedRequired: 10,
    favoriteFoodTier: 2, // Beans
    produceType: 'eggs',
    produceName: 'Goose Eggs',
    produceMin: 8,
    produceMax: 11,
    premiumProduceMin: 16,
    premiumProduceMax: 22,
    meatName: 'Raw Goose',
    meatYieldBase: 36,
    bonusCity: 'Fort Sterling',
    babyItemId: 'T4_FARM_GOOSE_BABY',
    adultItemId: 'T4_FARM_GOOSE_GROWN',
    produceItemId: 'T4_EGG',
    meatItemId: 'T4_MEAT',
  },
  {
    id: 'goat',
    name: 'Goat',
    babyName: 'Kid (Goat)',
    tier: 5,
    type: 'livestock',
    building: 'pasture',
    feedRequired: 10,
    favoriteFoodTier: 3, // Wheat
    produceType: 'milk',
    produceName: "Goat's Milk",
    produceMin: 8,
    produceMax: 11,
    premiumProduceMin: 16,
    premiumProduceMax: 22,
    meatName: 'Raw Goat',
    meatYieldBase: 54,
    bonusCity: 'Lymhurst',
    babyItemId: 'T5_FARM_GOAT_BABY',
    adultItemId: 'T5_FARM_GOAT_GROWN',
    produceItemId: 'T5_MILK',
    meatItemId: 'T5_MEAT',
  },
  {
    id: 'sheep',
    name: 'Sheep',
    babyName: 'Lamb',
    tier: 6,
    type: 'livestock',
    building: 'pasture',
    feedRequired: 10,
    favoriteFoodTier: 4, // Turnips
    produceType: 'milk',
    produceName: "Sheep's Milk",
    produceMin: 8,
    produceMax: 11,
    premiumProduceMin: 16,
    premiumProduceMax: 22,
    meatName: 'Raw Mutton',
    meatYieldBase: 72,
    bonusCity: 'Martlock',
    babyItemId: 'T6_FARM_SHEEP_BABY',
    adultItemId: 'T6_FARM_SHEEP_GROWN',
    produceItemId: 'T6_MILK',
    meatItemId: 'T6_MEAT',
  },
  {
    id: 'pig',
    name: 'Pig',
    babyName: 'Piglet',
    tier: 7,
    type: 'livestock',
    building: 'pasture',
    feedRequired: 10,
    favoriteFoodTier: 5, // Cabbage
    produceType: 'none',
    produceName: null,
    produceMin: 0,
    produceMax: 0,
    premiumProduceMin: 0,
    premiumProduceMax: 0,
    meatName: 'Raw Pork',
    meatYieldBase: 144,
    bonusCity: 'Bridgewatch',
    babyItemId: 'T7_FARM_PIG_BABY',
    adultItemId: 'T7_FARM_PIG_GROWN',
    produceItemId: null,
    meatItemId: 'T7_MEAT',
  },
  {
    id: 'cow',
    name: 'Cow',
    babyName: 'Calf',
    tier: 8,
    type: 'livestock',
    building: 'pasture',
    feedRequired: 10,
    favoriteFoodTier: 6, // Potatoes
    produceType: 'milk',
    produceName: "Cow's Milk",
    produceMin: 8,
    produceMax: 11,
    premiumProduceMin: 16,
    premiumProduceMax: 22,
    meatName: 'Raw Beef',
    meatYieldBase: 288,
    bonusCity: 'Caerleon',
    babyItemId: 'T8_FARM_COW_BABY',
    adultItemId: 'T8_FARM_COW_GROWN',
    produceItemId: 'T8_MILK',
    meatItemId: 'T8_MEAT',
  },
  // Mounts (kennel/pasture)
  {
    id: 'horse',
    name: 'Horse',
    babyName: 'Foal',
    tier: 3,
    type: 'mount',
    building: 'pasture',
    feedRequired: 10,
    favoriteFoodTier: 1,
    produceType: 'none',
    produceName: null,
    produceMin: 0,
    produceMax: 0,
    premiumProduceMin: 0,
    premiumProduceMax: 0,
    meatName: 'N/A',
    meatYieldBase: 0,
    bonusCity: 'Martlock',
    babyItemId: 'T3_MOUNT_HORSE_BABY',
    adultItemId: 'T3_MOUNT_HORSE',
    produceItemId: null,
    meatItemId: '',
  },
  {
    id: 'ox',
    name: 'Ox',
    babyName: 'Ox Calf',
    tier: 4,
    type: 'mount',
    building: 'pasture',
    feedRequired: 10,
    favoriteFoodTier: 2,
    produceType: 'none',
    produceName: null,
    produceMin: 0,
    produceMax: 0,
    premiumProduceMin: 0,
    premiumProduceMax: 0,
    meatName: 'N/A',
    meatYieldBase: 0,
    bonusCity: 'Bridgewatch',
    babyItemId: 'T4_MOUNT_OX_BABY',
    adultItemId: 'T4_MOUNT_OX',
    produceItemId: null,
    meatItemId: '',
  },
]

// ============ HERBS ============
export interface HerbData {
  id: string
  name: string
  seedName: string
  tier: number
  baseSeedReturn: number
  wateredSeedReturn: number
  bonusCity: string
  seedItemId: string
  herbItemId: string
}

export const HERBS: HerbData[] = [
  { id: 'agaric', name: 'Agaric', seedName: 'Agaric Seeds', tier: 1, baseSeedReturn: 100, wateredSeedReturn: 200, bonusCity: 'Thetford', seedItemId: 'T1_HERB_AGARIC_SEED', herbItemId: 'T1_HERB_AGARIC' },
  { id: 'comfrey', name: 'Comfrey', seedName: 'Comfrey Seeds', tier: 2, baseSeedReturn: 66.67, wateredSeedReturn: 166.67, bonusCity: 'Lymhurst', seedItemId: 'T2_HERB_COMFREY_SEED', herbItemId: 'T2_HERB_COMFREY' },
  { id: 'burdock', name: 'Burdock', seedName: 'Burdock Seeds', tier: 3, baseSeedReturn: 50, wateredSeedReturn: 150, bonusCity: 'Fort Sterling', seedItemId: 'T3_HERB_BURDOCK_SEED', herbItemId: 'T3_HERB_BURDOCK' },
  { id: 'teasel', name: 'Teasel', seedName: 'Teasel Seeds', tier: 4, baseSeedReturn: 40, wateredSeedReturn: 140, bonusCity: 'Bridgewatch', seedItemId: 'T4_HERB_TEASEL_SEED', herbItemId: 'T4_HERB_TEASEL' },
  { id: 'foxglove', name: 'Foxglove', seedName: 'Foxglove Seeds', tier: 5, baseSeedReturn: 33.33, wateredSeedReturn: 133.33, bonusCity: 'Martlock', seedItemId: 'T5_HERB_FOXGLOVE_SEED', herbItemId: 'T5_HERB_FOXGLOVE' },
  { id: 'mullein', name: 'Mullein', seedName: 'Mullein Seeds', tier: 6, baseSeedReturn: 28.57, wateredSeedReturn: 128.57, bonusCity: 'Fort Sterling', seedItemId: 'T6_HERB_MULLEIN_SEED', herbItemId: 'T6_HERB_MULLEIN' },
  { id: 'yarrow', name: 'Yarrow', seedName: 'Yarrow Seeds', tier: 7, baseSeedReturn: 25, wateredSeedReturn: 113.33, bonusCity: 'Thetford', seedItemId: 'T7_HERB_YARROW_SEED', herbItemId: 'T7_HERB_YARROW' },
]

// ============ ISLAND CONFIGURATION ============
export const SEEDS_PER_PLOT = 9
export const ANIMALS_PER_PLOT = 9
export const GROWTH_TIME_HOURS = 22
export const GROWTH_TIME_HOURS_PREMIUM = 11
export const FEED_PER_ANIMAL = 10
export const FEED_PER_ANIMAL_FAVORITE = 5

// Premium crop yield multiplier
export const PREMIUM_CROP_MULTIPLIER = 2
export const PREMIUM_PRODUCE_MULTIPLIER = 2

// Average yield calculations (used for estimates)
export const AVERAGE_CROP_YIELD_NON_PREMIUM = 4.5 // (3+6)/2
export const AVERAGE_CROP_YIELD_PREMIUM = 9 // (6+12)/2
export const AVERAGE_PRODUCE_NON_PREMIUM = 9.5 // (8+11)/2
export const AVERAGE_PRODUCE_PREMIUM = 19 // (16+22)/2

// Island tier plot counts
export const ISLAND_PLOT_COUNTS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
}

// Cities with farming bonuses
export const FARMING_CITIES = [
  'Bridgewatch',
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford',
  'Caerleon',
] as const

export type FarmingCity = typeof FARMING_CITIES[number]

// City bonus percentage (+10% yield when farming in bonus city)
export const CITY_BONUS_PERCENT = 10

// Check if crop/animal gets city bonus
export function hasCityBonus(bonusCity: string, islandCity: string): boolean {
  return bonusCity.toLowerCase() === islandCity.toLowerCase()
}

// Get the yield multiplier including city bonus
export function getCityBonusMultiplier(bonusCity: string, islandCity: string): number {
  return hasCityBonus(bonusCity, islandCity) ? 1 + (CITY_BONUS_PERCENT / 100) : 1
}

// ============ CALCULATION HELPERS ============

export interface CropCalculation {
  seedsNeeded: number
  seedsNeededWithBuffer: number // +10% for RNG safety
  expectedCropYield: number
  expectedSeedReturn: number
  netCrops: number
}

export function calculateCropOutput(
  crop: CropData,
  plotCount: number,
  hasPremium: boolean,
  useFocus: boolean,
  daysCount: number = 1,
  rngBuffer: number = 0.10, // 10% buffer by default
  islandCity: string = '' // City where island is located
): CropCalculation {
  const seedsPerDay = plotCount * SEEDS_PER_PLOT
  const totalSeeds = seedsPerDay * daysCount

  // Add RNG buffer to seeds needed (input)
  const seedsNeededWithBuffer = Math.ceil(totalSeeds * (1 + rngBuffer))

  // Calculate expected yield with city bonus
  const avgYield = hasPremium ? AVERAGE_CROP_YIELD_PREMIUM : AVERAGE_CROP_YIELD_NON_PREMIUM
  const cityMultiplier = islandCity ? getCityBonusMultiplier(crop.bonusCity, islandCity) : 1
  const expectedCropYield = Math.floor(totalSeeds * avgYield * cityMultiplier)

  // Calculate seed return (city bonus also applies to seed return)
  const seedReturnRate = useFocus ? crop.wateredSeedReturn : crop.baseSeedReturn
  const expectedSeedReturn = Math.floor(totalSeeds * (seedReturnRate / 100) * cityMultiplier)

  return {
    seedsNeeded: totalSeeds,
    seedsNeededWithBuffer,
    expectedCropYield,
    expectedSeedReturn,
    netCrops: expectedCropYield,
  }
}

export interface AnimalCalculation {
  animalsNeeded: number
  feedNeeded: number
  feedNeededWithBuffer: number
  expectedProduce: number
  expectedMeat: number
  expectedOffspring: number
}

export function calculateAnimalOutput(
  animal: AnimalData,
  plotCount: number,
  hasPremium: boolean,
  useFocus: boolean,
  useFavoriteFeed: boolean,
  daysCount: number = 1,
  rngBuffer: number = 0.10,
  islandCity: string = '' // City where island is located
): AnimalCalculation {
  const animalsPerDay = plotCount * ANIMALS_PER_PLOT
  const totalAnimals = animalsPerDay * daysCount

  // Feed calculation
  const feedPerAnimal = useFavoriteFeed ? FEED_PER_ANIMAL_FAVORITE : FEED_PER_ANIMAL
  const feedNeeded = totalAnimals * feedPerAnimal
  const feedNeededWithBuffer = Math.ceil(feedNeeded * (1 + rngBuffer))

  // City bonus multiplier for produce/meat
  const cityMultiplier = islandCity ? getCityBonusMultiplier(animal.bonusCity, islandCity) : 1

  // Produce calculation (for livestock that produce) - city bonus applies
  let expectedProduce = 0
  if (animal.produceType !== 'none') {
    const avgProduce = hasPremium ? AVERAGE_PRODUCE_PREMIUM : AVERAGE_PRODUCE_NON_PREMIUM
    expectedProduce = Math.floor(totalAnimals * avgProduce * cityMultiplier)
  }

  // Meat calculation (if butchering) - city bonus applies
  const expectedMeat = Math.floor(totalAnimals * animal.meatYieldBase * cityMultiplier)

  // Offspring (with focus, ~100% return rate) - city bonus does NOT apply to offspring
  const expectedOffspring = useFocus ? totalAnimals : Math.floor(totalAnimals * 0.2)

  return {
    animalsNeeded: totalAnimals,
    feedNeeded,
    feedNeededWithBuffer,
    expectedProduce,
    expectedMeat,
    expectedOffspring,
  }
}

// Get crop by ID
export function getCropById(id: string): CropData | undefined {
  return CROPS.find(c => c.id === id)
}

// Get animal by ID
export function getAnimalById(id: string): AnimalData | undefined {
  return ANIMALS.find(a => a.id === id)
}

// Building types
export type BuildingType = 'farm' | 'herb_garden' | 'pasture' | 'kennel'

export const BUILDING_NAMES: Record<BuildingType, string> = {
  farm: 'Farm',
  herb_garden: 'Herb Garden',
  pasture: 'Pasture',
  kennel: 'Kennel',
}
