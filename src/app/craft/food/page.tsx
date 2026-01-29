'use client'

import Link from 'next/link'
import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  FOOD_RECIPES,
  getAllFoodIngredientIds,
  getAllFoodIds,
  type FoodRecipe,
} from '@/lib/crafting/food-data'
import {
  calculateFocusCost,
  calculateTotalFCE,
  calculateRRR,
  FCE_CONSTANTS,
  PRODUCTION_BONUSES,
  ZONE_QUALITY_BONUS,
  HIDEOUT_POWER_BONUS,
} from '@/constants/crafting-bonuses'
import { useDestinyBoardStore } from '@/stores/destinyBoardStore'

// Food bonus city is Bridgewatch
const FOOD_BONUS_CITY = 'Bridgewatch'

// Server to API endpoint mapping
const SERVER_API_ENDPOINTS: Record<string, string> = {
  'West': 'https://west.albion-online-data.com',
  'East': 'https://east.albion-online-data.com',
  'Europe': 'https://europe.albion-online-data.com',
  'Asia': 'https://asia.albion-online-data.com',
}

const CITIES = [
  'Bridgewatch',
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford',
  'Caerleon',
  'Brecilien',
]

const SERVERS = ['West', 'East', 'Europe', 'Asia']
const ROYAL_CITIES = ['Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford']

// Daily bonus multipliers (applies to RRR)
const DAILY_BONUS_MULTIPLIER: Record<string, number> = {
  'None': 0,
  'Bronze': 0.05,
  'Silver': 0.10,
  'Gold': 0.20,
}

// Food FCE values (from spreadsheet)
const FOOD_FCE = {
  specUniqueFCE: 30,
  specMutualFCE: 30,
}

interface FoodRowData {
  recipe: FoodRecipe
  foodPrice: number
  ingredientCost: number
  totalCost: number
  revenue: number
  profit: number
  profitPerFocus: number
  profitMargin: number
  actualFocus: number
  hasPrices: boolean
}

type SortField = 'name' | 'tier' | 'profit' | 'profitPerFocus' | 'profitMargin' | 'cost'
type SortDirection = 'asc' | 'desc'

// Get color based on value relative to min/max
function getValueColor(value: number, min: number, max: number, invert = false): string {
  if (max === min) return ''
  const ratio = (value - min) / (max - min)
  const adjusted = invert ? 1 - ratio : ratio

  if (adjusted >= 0.8) return 'text-green-400 font-bold'
  if (adjusted >= 0.6) return 'text-green-400'
  if (adjusted >= 0.4) return 'text-yellow-400'
  if (adjusted >= 0.2) return 'text-orange-400'
  return 'text-red-400'
}

export default function FoodCraftingPage() {
  // Destiny Board integration
  const { activeCharacter } = useDestinyBoardStore()
  const [useDestinyBoard, setUseDestinyBoard] = useState(true)

  // Settings state
  const [craftCity, setCraftCity] = useState('Bridgewatch')
  const [sellCity, setSellCity] = useState('Bridgewatch')
  const [server, setServer] = useState('West')
  const [useFocus, setUseFocus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Location settings (from Excel)
  const [locationType, setLocationType] = useState<'city' | 'hideout' | 'island'>('city')
  const [zoneQuality, setZoneQuality] = useState(6) // 1-6
  const [hideoutPower, setHideoutPower] = useState(7) // 1-9
  const [dailyBonus, setDailyBonus] = useState<'None' | 'Bronze' | 'Silver' | 'Gold'>('None')
  const [isPremium, setIsPremium] = useState(true)

  // Station fee
  const [stationFee, setStationFee] = useState(400)

  // Manual mastery levels
  const [manualMastery, setManualMastery] = useState(0)
  const [manualSpec, setManualSpec] = useState(0)

  // Prices
  const [foodPrices, setFoodPrices] = useState<Record<string, number>>({})
  const [ingredientPrices, setIngredientPrices] = useState<Record<string, number>>({})

  // Sorting
  const [sortField, setSortField] = useState<SortField>('profit')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Filtering
  const [filterTierMin, setFilterTierMin] = useState(1)
  const [filterTierMax, setFilterTierMax] = useState(8)
  const [filterCategory, setFilterCategory] = useState<'all' | 'meal' | 'ingredient' | 'fish' | 'avalon'>('all')
  const [filterProfitableOnly, setFilterProfitableOnly] = useState(false)
  const [filterHasPrices, setFilterHasPrices] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Get mastery from destiny board
  const getMasteryFromDB = useCallback((): { mastery: number; spec: number } => {
    if (!useDestinyBoard || !activeCharacter) {
      return { mastery: manualMastery, spec: manualSpec }
    }
    // Cook mastery for food
    const mastery = activeCharacter.masteries['mastery_cook'] || 0
    // Use highest spec level
    const specIds = ['spec_food_stew', 'spec_food_pie', 'spec_food_omelette', 'spec_food_sandwich', 'spec_food_roast', 'spec_food_salad', 'spec_food_soup']
    const specLevels = specIds.map(id => activeCharacter.specializations[id] || 0)
    const spec = specLevels.length > 0 ? Math.max(...specLevels) : 0
    return { mastery, spec }
  }, [useDestinyBoard, activeCharacter, manualMastery, manualSpec])

  const { mastery, spec } = getMasteryFromDB()

  // Calculate RRR based on location settings (following Excel logic)
  const { calculatedRRR, bonusBreakdown } = useMemo(() => {
    let totalBonus = 0
    const breakdown = { base: 0, zone: 0, hideout: 0, specialty: 0, focus: 0, daily: 0, island: 0, total: 0 }

    if (locationType === 'city') {
      const isRoyalCity = ROYAL_CITIES.includes(craftCity)
      const isInBonusCity = craftCity === FOOD_BONUS_CITY

      if (isRoyalCity) {
        breakdown.base = PRODUCTION_BONUSES.ROYAL_CITY_BASE
        totalBonus += breakdown.base

        if (isInBonusCity) {
          breakdown.specialty = PRODUCTION_BONUSES.CRAFTING_SPECIALTY || 0.15
          totalBonus += breakdown.specialty
        }
      } else if (craftCity === 'Caerleon' || craftCity === 'Brecilien') {
        breakdown.base = PRODUCTION_BONUSES.ROYAL_CITY_BASE
        totalBonus += breakdown.base
      }
    } else if (locationType === 'hideout') {
      // Zone quality bonus
      breakdown.zone = ZONE_QUALITY_BONUS[zoneQuality as keyof typeof ZONE_QUALITY_BONUS] || 0
      totalBonus += breakdown.zone

      // Hideout power bonus
      breakdown.hideout = HIDEOUT_POWER_BONUS[hideoutPower as keyof typeof HIDEOUT_POWER_BONUS] || 0
      totalBonus += breakdown.hideout
    } else if (locationType === 'island') {
      // Island has penalty
      breakdown.island = -0.18
      totalBonus += breakdown.island
    }

    // Focus bonus
    if (useFocus) {
      breakdown.focus = PRODUCTION_BONUSES.FOCUS_BONUS
      totalBonus += breakdown.focus
    }

    // Daily bonus
    if (dailyBonus !== 'None') {
      breakdown.daily = DAILY_BONUS_MULTIPLIER[dailyBonus]
      totalBonus += breakdown.daily
    }

    breakdown.total = totalBonus

    return { calculatedRRR: calculateRRR(Math.max(0, totalBonus)), bonusBreakdown: breakdown }
  }, [craftCity, locationType, zoneQuality, hideoutPower, useFocus, dailyBonus])

  const returnRatePercent = calculatedRRR * 100

  // Calculate actual focus cost for a recipe
  const calculateActualFocus = useCallback((baseFocus: number): number => {
    if (baseFocus === 0) return 0

    const totalFCE = calculateTotalFCE({
      masteryLevel: mastery,
      masteryFCEPerLevel: FCE_CONSTANTS.MASTERY_FCE_PER_LEVEL,
      specLevel: spec,
      specUniqueFCE: FOOD_FCE.specUniqueFCE,
      specMutualFCE: FOOD_FCE.specMutualFCE,
      mutualSpecLevels: 0,
    })

    return calculateFocusCost(baseFocus, totalFCE)
  }, [mastery, spec])

  // Fetch prices from API
  const fetchPrices = useCallback(async () => {
    setIsLoading(true)
    try {
      const apiBase = SERVER_API_ENDPOINTS[server]
      const allFoodIds = getAllFoodIds()
      const allIngredientIds = getAllFoodIngredientIds()

      // Fetch food prices from sell city
      const foodResponse = await fetch(
        `${apiBase}/api/v2/stats/prices/${allFoodIds.join(',')}?locations=${sellCity}&qualities=1`
      )
      const foodData = await foodResponse.json()

      const newFoodPrices: Record<string, number> = {}
      for (const item of foodData) {
        if (item.sell_price_min > 0) {
          newFoodPrices[item.item_id] = item.sell_price_min
        }
      }
      setFoodPrices(newFoodPrices)

      // Fetch ingredient prices from craft city
      const ingredientResponse = await fetch(
        `${apiBase}/api/v2/stats/prices/${allIngredientIds.join(',')}?locations=${craftCity}&qualities=1`
      )
      const ingredientData = await ingredientResponse.json()

      const newIngredientPrices: Record<string, number> = {}
      for (const item of ingredientData) {
        if (item.sell_price_min > 0) {
          newIngredientPrices[item.item_id] = item.sell_price_min
        }
      }
      setIngredientPrices(newIngredientPrices)

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    } finally {
      setIsLoading(false)
    }
  }, [server, craftCity, sellCity])

  // Auto-fetch on mount
  useEffect(() => {
    fetchPrices()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate row data
  const rowData: FoodRowData[] = useMemo(() => {
    return FOOD_RECIPES.map((recipe) => {
      const foodPrice = foodPrices[recipe.itemId] || 0

      // Calculate ingredient cost
      let ingredientCost = 0
      let allIngredientsHavePrices = true
      for (const ingredient of recipe.ingredients) {
        const price = ingredientPrices[ingredient.itemId] || 0
        if (price === 0) {
          allIngredientsHavePrices = false
        }
        ingredientCost += price * ingredient.quantity
      }

      // Apply RRR to reduce effective cost
      const effectiveIngredientCost = ingredientCost * (1 - calculatedRRR)

      // Calculate focus
      const actualFocus = calculateActualFocus(recipe.baseFocus)

      // Revenue (selling food)
      const revenue = foodPrice * recipe.outputQuantity

      // Total cost (ingredients + station fee)
      const totalCost = effectiveIngredientCost + stationFee

      // Profit
      const profit = revenue - totalCost

      // Profit per focus
      const profitPerFocus = actualFocus > 0 ? profit / actualFocus : 0

      // Profit margin
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0

      const hasPrices = foodPrice > 0 && allIngredientsHavePrices

      return {
        recipe,
        foodPrice,
        ingredientCost: effectiveIngredientCost,
        totalCost,
        revenue,
        profit,
        profitPerFocus,
        profitMargin,
        actualFocus,
        hasPrices,
      }
    })
  }, [foodPrices, ingredientPrices, calculatedRRR, calculateActualFocus, stationFee])

  // Filter and sort
  const filteredAndSortedData = useMemo(() => {
    let filtered = rowData.filter((row) => {
      if (row.recipe.tier < filterTierMin || row.recipe.tier > filterTierMax) return false
      if (filterCategory !== 'all' && row.recipe.category !== filterCategory) return false
      if (filterProfitableOnly && row.profit <= 0) return false
      if (filterHasPrices && !row.hasPrices) return false
      if (searchTerm && !row.recipe.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })

    filtered.sort((a, b) => {
      let aVal: number | string = 0
      let bVal: number | string = 0

      switch (sortField) {
        case 'name':
          aVal = a.recipe.name
          bVal = b.recipe.name
          break
        case 'tier':
          aVal = a.recipe.tier
          bVal = b.recipe.tier
          break
        case 'profit':
          aVal = a.profit
          bVal = b.profit
          break
        case 'profitPerFocus':
          aVal = a.profitPerFocus
          bVal = b.profitPerFocus
          break
        case 'profitMargin':
          aVal = a.profitMargin
          bVal = b.profitMargin
          break
        case 'cost':
          aVal = a.totalCost
          bVal = b.totalCost
          break
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }

      return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })

    return filtered
  }, [rowData, filterTierMin, filterTierMax, filterCategory, filterProfitableOnly, filterHasPrices, searchTerm, sortField, sortDirection])

  // Get min/max for coloring
  const profitRange = useMemo(() => {
    const profits = filteredAndSortedData.map((r) => r.profit)
    return { min: Math.min(...profits), max: Math.max(...profits) }
  }, [filteredAndSortedData])

  const spfRange = useMemo(() => {
    const spfs = filteredAndSortedData.map((r) => r.profitPerFocus).filter((v) => v > 0)
    return { min: Math.min(...spfs, 0), max: Math.max(...spfs, 0) }
  }, [filteredAndSortedData])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection(field === 'name' ? 'asc' : 'desc')
    }
  }

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="cursor-pointer px-2 py-2 text-left text-xs font-medium text-muted-light hover:text-text1-light dark:text-muted dark:hover:text-text1"
      onClick={() => handleSort(field)}
    >
      {label}
      {sortField === field && (
        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
      )}
    </th>
  )

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">
            Food Crafting Calculator
          </h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Calculate profit for food crafting with live market prices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchPrices}
            disabled={isLoading}
            className="rounded-lg border border-amber-400 bg-amber-400/10 px-4 py-2 text-sm text-amber-300 hover:bg-amber-400/20 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh Prices'}
          </button>
          {lastUpdated && (
            <span className="text-xs text-muted-light dark:text-muted">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex flex-wrap items-center gap-2 text-xs">
        <Link
          href="/craft/gear"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          GEAR
        </Link>
        <Link
          href="/craft/food"
          className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-amber-300"
        >
          FOOD
        </Link>
        <Link
          href="/craft/potions"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          POTIONS
        </Link>
        <Link
          href="/craft/refining"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          REFINING
        </Link>
        <Link
          href="/craft"
          className="ml-auto rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          Classic View
        </Link>
      </nav>

      {/* Settings Grid */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Location Settings */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">
            Location
          </h2>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Server</label>
              <select
                value={server}
                onChange={(e) => setServer(e.target.value)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                {SERVERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Craft Location</label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as typeof locationType)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                <option value="city">City</option>
                <option value="hideout">Hideout</option>
                <option value="island">Island</option>
              </select>
            </div>
            {locationType === 'city' && (
              <div className="grid gap-1">
                <label className="text-xs text-muted-light dark:text-muted">Craft City</label>
                <select
                  value={craftCity}
                  onChange={(e) => setCraftCity(e.target.value)}
                  className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Sell City</label>
              <select
                value={sellCity}
                onChange={(e) => setSellCity(e.target.value)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Hideout/Zone Settings */}
        {locationType === 'hideout' && (
          <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
            <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">
              Hideout Settings
            </h2>
            <div className="grid gap-3">
              <div className="grid gap-1">
                <label className="text-xs text-muted-light dark:text-muted">Zone Quality (1-6)</label>
                <select
                  value={zoneQuality}
                  onChange={(e) => setZoneQuality(parseInt(e.target.value))}
                  className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
                >
                  {[1, 2, 3, 4, 5, 6].map((q) => (
                    <option key={q} value={q}>Level {q} (+{((ZONE_QUALITY_BONUS[q as keyof typeof ZONE_QUALITY_BONUS] || 0) * 100).toFixed(0)}%)</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1">
                <label className="text-xs text-muted-light dark:text-muted">Hideout Power (1-9)</label>
                <select
                  value={hideoutPower}
                  onChange={(e) => setHideoutPower(parseInt(e.target.value))}
                  className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((p) => (
                    <option key={p} value={p}>Level {p} (+{((HIDEOUT_POWER_BONUS[p as keyof typeof HIDEOUT_POWER_BONUS] || 0) * 100).toFixed(1)}%)</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* RRR Display */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">
            Return Rate (RRR)
          </h2>
          <div className="mb-3 text-center">
            <div className="text-3xl font-bold text-green-400">{returnRatePercent.toFixed(2)}%</div>
            <div className="text-xs text-muted-light dark:text-muted">Material Return</div>
          </div>
          <div className="space-y-1 text-xs">
            {bonusBreakdown.base > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-light dark:text-muted">City Base:</span>
                <span className="text-text1-light dark:text-text1">+{(bonusBreakdown.base * 100).toFixed(0)}%</span>
              </div>
            )}
            {bonusBreakdown.zone > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-light dark:text-muted">Zone Quality:</span>
                <span className="text-text1-light dark:text-text1">+{(bonusBreakdown.zone * 100).toFixed(0)}%</span>
              </div>
            )}
            {bonusBreakdown.hideout > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-light dark:text-muted">Hideout Power:</span>
                <span className="text-text1-light dark:text-text1">+{(bonusBreakdown.hideout * 100).toFixed(1)}%</span>
              </div>
            )}
            {bonusBreakdown.specialty > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-light dark:text-muted">Bonus City:</span>
                <span className="text-amber-400">+{(bonusBreakdown.specialty * 100).toFixed(0)}%</span>
              </div>
            )}
            {bonusBreakdown.focus > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-light dark:text-muted">Focus:</span>
                <span className="text-blue-400">+{(bonusBreakdown.focus * 100).toFixed(0)}%</span>
              </div>
            )}
            {bonusBreakdown.daily > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-light dark:text-muted">Daily Bonus:</span>
                <span className="text-purple-400">+{(bonusBreakdown.daily * 100).toFixed(0)}%</span>
              </div>
            )}
            {bonusBreakdown.island < 0 && (
              <div className="flex justify-between">
                <span className="text-muted-light dark:text-muted">Island Penalty:</span>
                <span className="text-red-400">{(bonusBreakdown.island * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Crafting Settings */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">
            Crafting Settings
          </h2>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Station Fee</label>
              <input
                type="number"
                min="0"
                value={stationFee}
                onChange={(e) => setStationFee(parseInt(e.target.value) || 0)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Daily Bonus</label>
              <select
                value={dailyBonus}
                onChange={(e) => setDailyBonus(e.target.value as typeof dailyBonus)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                <option value="None">None</option>
                <option value="Bronze">Bronze (+5%)</option>
                <option value="Silver">Silver (+10%)</option>
                <option value="Gold">Gold (+20%)</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useFocus}
                  onChange={(e) => setUseFocus(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className={useFocus ? 'text-blue-400' : 'text-muted-light dark:text-muted'}>
                  Use Focus
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className={isPremium ? 'text-amber-400' : 'text-muted-light dark:text-muted'}>
                  Premium
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Mastery/Spec Settings */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">
            Mastery & Spec
          </h2>
          <div className="mb-3 flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useDestinyBoard}
                onChange={(e) => setUseDestinyBoard(e.target.checked)}
                className="h-4 w-4"
              />
              <span className={useDestinyBoard ? 'text-blue-400' : 'text-muted-light dark:text-muted'}>
                Use Destiny Board
              </span>
            </label>
            {useDestinyBoard && activeCharacter && (
              <span className="text-xs text-blue-400">({activeCharacter.name})</span>
            )}
          </div>
          {useDestinyBoard && !activeCharacter && (
            <p className="mb-3 text-xs text-amber-400">
              No character - <Link href="/destiny-board" className="underline">create one</Link>
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Mastery</label>
              <input
                type="number"
                min="0"
                max="100"
                value={mastery}
                onChange={(e) => setManualMastery(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                disabled={useDestinyBoard && !!activeCharacter}
                className={`rounded border px-3 py-2 text-sm ${
                  useDestinyBoard && activeCharacter
                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                    : 'border-border-light bg-surface-light dark:border-border dark:bg-surface'
                }`}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Spec</label>
              <input
                type="number"
                min="0"
                max="120"
                value={spec}
                onChange={(e) => setManualSpec(Math.min(120, Math.max(0, parseInt(e.target.value) || 0)))}
                disabled={useDestinyBoard && !!activeCharacter}
                className={`rounded border px-3 py-2 text-sm ${
                  useDestinyBoard && activeCharacter
                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                    : 'border-border-light bg-surface-light dark:border-border dark:bg-surface'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-light dark:text-muted">Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search foods..."
              className="w-40 rounded border border-border-light bg-surface-light px-3 py-1 text-sm dark:border-border dark:bg-surface"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-light dark:text-muted">Tier:</label>
            <select
              value={filterTierMin}
              onChange={(e) => setFilterTierMin(parseInt(e.target.value))}
              className="rounded border border-border-light bg-surface-light px-2 py-1 text-sm dark:border-border dark:bg-surface"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((t) => (
                <option key={t} value={t}>T{t}</option>
              ))}
            </select>
            <span className="text-muted-light dark:text-muted">-</span>
            <select
              value={filterTierMax}
              onChange={(e) => setFilterTierMax(parseInt(e.target.value))}
              className="rounded border border-border-light bg-surface-light px-2 py-1 text-sm dark:border-border dark:bg-surface"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((t) => (
                <option key={t} value={t}>T{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-light dark:text-muted">Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as typeof filterCategory)}
              className="rounded border border-border-light bg-surface-light px-2 py-1 text-sm dark:border-border dark:bg-surface"
            >
              <option value="all">All</option>
              <option value="meal">Meals</option>
              <option value="ingredient">Ingredients</option>
              <option value="fish">Fish Dishes</option>
              <option value="avalon">Avalonian</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={filterProfitableOnly}
              onChange={(e) => setFilterProfitableOnly(e.target.checked)}
              className="h-3 w-3"
            />
            <span className="text-muted-light dark:text-muted">Profitable only</span>
          </label>
          <label className="flex cursor-pointer items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={filterHasPrices}
              onChange={(e) => setFilterHasPrices(e.target.checked)}
              className="h-3 w-3"
            />
            <span className="text-muted-light dark:text-muted">Has prices</span>
          </label>
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-text1-light dark:text-text1">
            Foods ({filteredAndSortedData.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light dark:border-border">
                <SortHeader field="name" label="Food" />
                <SortHeader field="tier" label="Tier" />
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">
                  Ingredients
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">
                  Output
                </th>
                <SortHeader field="cost" label="Cost" />
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">
                  Revenue
                </th>
                <SortHeader field="profit" label="Profit" />
                <SortHeader field="profitPerFocus" label="S/Focus" />
                <SortHeader field="profitMargin" label="Margin" />
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((row) => (
                <tr
                  key={row.recipe.id}
                  className="border-b border-border-light/50 hover:bg-bg-light/50 dark:border-border/50 dark:hover:bg-bg/50"
                >
                  <td className="px-2 py-2">
                    <div className="font-medium text-text1-light dark:text-text1">{row.recipe.name}</div>
                    <div className="text-[10px] text-muted-light dark:text-muted">{row.recipe.category}</div>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-xs text-amber-300">
                      T{row.recipe.tier}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="max-w-[180px] space-y-0.5">
                      {row.recipe.ingredients.slice(0, 3).map((ing, idx) => {
                        const price = ingredientPrices[ing.itemId] || 0
                        return (
                          <div key={idx} className="flex items-center justify-between text-[10px]">
                            <span className="truncate text-muted-light dark:text-muted">{ing.quantity}x {ing.name}</span>
                            <span className={price > 0 ? 'text-text1-light dark:text-text1' : 'text-red-400'}>
                              {price > 0 ? (price * ing.quantity).toLocaleString() : '?'}
                            </span>
                          </div>
                        )
                      })}
                      {row.recipe.ingredients.length > 3 && (
                        <div className="text-[10px] text-muted-light dark:text-muted">
                          +{row.recipe.ingredients.length - 3} more
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-right text-text1-light dark:text-text1">
                    {row.recipe.outputQuantity}x
                  </td>
                  <td className="px-2 py-2 text-right text-text1-light dark:text-text1">
                    {row.totalCost > 0 ? row.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {row.foodPrice > 0 ? (
                      <span className="text-text1-light dark:text-text1">
                        {row.revenue.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-red-400">No price</span>
                    )}
                  </td>
                  <td className={`px-2 py-2 text-right ${getValueColor(row.profit, profitRange.min, profitRange.max)}`}>
                    {row.hasPrices ? row.profit.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}
                  </td>
                  <td className={`px-2 py-2 text-right ${row.profitPerFocus > 0 ? getValueColor(row.profitPerFocus, spfRange.min, spfRange.max) : ''}`}>
                    {row.hasPrices && row.actualFocus > 0 ? row.profitPerFocus.toFixed(2) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {row.hasPrices ? (
                      <span className={row.profitMargin > 0 ? 'text-green-400' : 'text-red-400'}>
                        {row.profitMargin.toFixed(1)}%
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedData.length === 0 && (
          <div className="py-8 text-center text-muted-light dark:text-muted">
            No foods match your filters. Try adjusting the settings.
          </div>
        )}
      </div>
    </section>
  )
}
