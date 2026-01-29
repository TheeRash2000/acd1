'use client'

import Link from 'next/link'
import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  POTION_RECIPES,
  getAllIngredientIds,
  getAllPotionIds,
  type PotionRecipe,
} from '@/lib/crafting/potion-data'
import {
  calculateFocusCost,
  calculateTotalFCE,
  calculateRRR,
  FCE_CONSTANTS,
  PRODUCTION_BONUSES,
} from '@/constants/crafting-bonuses'
import { useDestinyBoardStore } from '@/stores/destinyBoardStore'

// Potions bonus city is Thetford
const POTION_BONUS_CITY = 'Thetford'

// Server to API endpoint mapping
const SERVER_API_ENDPOINTS: Record<string, string> = {
  'Americas': 'https://west.albion-online-data.com',
  'Europe': 'https://europe.albion-online-data.com',
  'Asia': 'https://east.albion-online-data.com',
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

const SERVERS = ['Americas', 'Europe', 'Asia']

const ROYAL_CITIES = ['Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford']

// Potion FCE values (from spreadsheet)
const POTION_FCE = {
  specUniqueFCE: 30,
  specMutualFCE: 30,
}

interface PotionRowData {
  recipe: PotionRecipe
  potionPrice: number
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

export default function PotionCraftingPage() {
  // Destiny Board integration
  const { activeCharacter } = useDestinyBoardStore()
  const [useDestinyBoard, setUseDestinyBoard] = useState(true)

  // Settings state
  const [craftCity, setCraftCity] = useState('Thetford')
  const [sellCity, setSellCity] = useState('Thetford')
  const [server, setServer] = useState('Americas')
  const [useFocus, setUseFocus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Manual mastery levels
  const [manualMastery, setManualMastery] = useState(0)
  const [manualSpec, setManualSpec] = useState(0)

  // Prices
  const [potionPrices, setPotionPrices] = useState<Record<string, number>>({})
  const [ingredientPrices, setIngredientPrices] = useState<Record<string, number>>({})

  // Sorting
  const [sortField, setSortField] = useState<SortField>('profit')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Filtering
  const [filterTierMin, setFilterTierMin] = useState(2)
  const [filterTierMax, setFilterTierMax] = useState(8)
  const [filterCategory, setFilterCategory] = useState<'all' | 'combat' | 'utility' | 'alcohol'>('all')
  const [filterProfitableOnly, setFilterProfitableOnly] = useState(false)
  const [filterHasPrices, setFilterHasPrices] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Get mastery from destiny board
  const getMasteryFromDB = useCallback((): { mastery: number; spec: number } => {
    if (!useDestinyBoard || !activeCharacter) {
      return { mastery: manualMastery, spec: manualSpec }
    }
    // Alchemist mastery for potions
    const mastery = activeCharacter.masteries['mastery_alchemist'] || 0
    // For simplicity, use average of all potion specs (could be refined)
    const specIds = ['spec_potion_heal', 'spec_potion_energy', 'spec_potion_revive']
    const specLevels = specIds.map(id => activeCharacter.specializations[id] || 0)
    const spec = specLevels.length > 0 ? Math.max(...specLevels) : 0
    return { mastery, spec }
  }, [useDestinyBoard, activeCharacter, manualMastery, manualSpec])

  const { mastery, spec } = getMasteryFromDB()

  // Calculate RRR based on city and focus
  const { calculatedRRR, bonusBreakdown } = useMemo(() => {
    let totalBonus = 0
    const breakdown = { base: 0, specialty: 0, focus: 0, total: 0 }

    const isRoyalCity = ROYAL_CITIES.includes(craftCity)
    const isInBonusCity = craftCity === POTION_BONUS_CITY

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

    if (useFocus) {
      breakdown.focus = PRODUCTION_BONUSES.FOCUS_BONUS
      totalBonus += breakdown.focus
    }

    breakdown.total = totalBonus

    return { calculatedRRR: calculateRRR(totalBonus), bonusBreakdown: breakdown }
  }, [craftCity, useFocus])

  const returnRatePercent = calculatedRRR * 100

  // Calculate actual focus cost for a recipe
  const calculateActualFocus = useCallback((baseFocus: number): number => {
    if (baseFocus === 0) return 0

    const totalFCE = calculateTotalFCE({
      masteryLevel: mastery,
      masteryFCEPerLevel: FCE_CONSTANTS.MASTERY_FCE_PER_LEVEL,
      specLevel: spec,
      specUniqueFCE: POTION_FCE.specUniqueFCE,
      specMutualFCE: POTION_FCE.specMutualFCE,
      mutualSpecLevels: 0,
    })

    return calculateFocusCost(baseFocus, totalFCE)
  }, [mastery, spec])

  // Fetch prices from API
  const fetchPrices = useCallback(async () => {
    setIsLoading(true)
    try {
      const apiBase = SERVER_API_ENDPOINTS[server]
      const allPotionIds = getAllPotionIds()
      const allIngredientIds = getAllIngredientIds()

      // Fetch potion prices from sell city
      const potionResponse = await fetch(
        `${apiBase}/api/v2/stats/prices/${allPotionIds.join(',')}?locations=${sellCity}&qualities=1`
      )
      const potionData = await potionResponse.json()

      const newPotionPrices: Record<string, number> = {}
      for (const item of potionData) {
        if (item.sell_price_min > 0) {
          newPotionPrices[item.item_id] = item.sell_price_min
        }
      }
      setPotionPrices(newPotionPrices)

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

  // Auto-fetch on mount and when settings change
  useEffect(() => {
    fetchPrices()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate row data
  const rowData: PotionRowData[] = useMemo(() => {
    return POTION_RECIPES.map((recipe) => {
      const potionPrice = potionPrices[recipe.itemId] || 0

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

      // Revenue (selling potions)
      const revenue = potionPrice * recipe.outputQuantity

      // Total cost
      const totalCost = effectiveIngredientCost

      // Profit
      const profit = revenue - totalCost

      // Profit per focus (if using focus)
      const profitPerFocus = actualFocus > 0 ? profit / actualFocus : 0

      // Profit margin
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0

      const hasPrices = potionPrice > 0 && allIngredientsHavePrices

      return {
        recipe,
        potionPrice,
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
  }, [potionPrices, ingredientPrices, calculatedRRR, calculateActualFocus])

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
            Potion Crafting Calculator
          </h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Calculate profit for potion crafting with live market prices.
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
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          FOOD
        </Link>
        <Link
          href="/craft/potions"
          className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-amber-300"
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
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Location Settings */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">
            Location Settings
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
            {bonusBreakdown.specialty > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-light dark:text-muted">Bonus City ({POTION_BONUS_CITY}):</span>
                <span className="text-amber-400">+{(bonusBreakdown.specialty * 100).toFixed(0)}%</span>
              </div>
            )}
            {bonusBreakdown.focus > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-light dark:text-muted">Focus:</span>
                <span className="text-blue-400">+{(bonusBreakdown.focus * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
          <div className="mt-3">
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
          </div>
        </div>

        {/* Mastery/Spec Settings */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">
            Mastery & Spec (FCE)
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
              No character selected - <Link href="/destiny-board" className="underline">create one</Link>
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
              <label className="text-xs text-muted-light dark:text-muted">Specialization</label>
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

        {/* Filters */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">
            Filters
          </h2>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search potions..."
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1">
                <label className="text-xs text-muted-light dark:text-muted">Min Tier</label>
                <select
                  value={filterTierMin}
                  onChange={(e) => setFilterTierMin(parseInt(e.target.value))}
                  className="rounded border border-border-light bg-surface-light px-2 py-1 text-sm dark:border-border dark:bg-surface"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((t) => (
                    <option key={t} value={t}>T{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1">
                <label className="text-xs text-muted-light dark:text-muted">Max Tier</label>
                <select
                  value={filterTierMax}
                  onChange={(e) => setFilterTierMax(parseInt(e.target.value))}
                  className="rounded border border-border-light bg-surface-light px-2 py-1 text-sm dark:border-border dark:bg-surface"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((t) => (
                    <option key={t} value={t}>T{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as typeof filterCategory)}
                className="rounded border border-border-light bg-surface-light px-2 py-1 text-sm dark:border-border dark:bg-surface"
              >
                <option value="all">All</option>
                <option value="combat">Combat</option>
                <option value="utility">Utility</option>
                <option value="alcohol">Alcohol</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
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
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-text1-light dark:text-text1">
            Potions ({filteredAndSortedData.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light dark:border-border">
                <SortHeader field="name" label="Potion" />
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
                <SortHeader field="profitPerFocus" label="Silver/Focus" />
                <SortHeader field="profitMargin" label="Margin" />
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">
                  Focus
                </th>
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
                    <div className="max-w-[200px] space-y-0.5">
                      {row.recipe.ingredients.map((ing, idx) => {
                        const price = ingredientPrices[ing.itemId] || 0
                        return (
                          <div key={idx} className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-light dark:text-muted">{ing.quantity}x {ing.name}</span>
                            <span className={price > 0 ? 'text-text1-light dark:text-text1' : 'text-red-400'}>
                              {price > 0 ? (price * ing.quantity).toLocaleString() : '?'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-right text-text1-light dark:text-text1">
                    {row.recipe.outputQuantity}x
                  </td>
                  <td className="px-2 py-2 text-right text-text1-light dark:text-text1">
                    {row.totalCost > 0 ? row.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {row.potionPrice > 0 ? (
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
                  <td className="px-2 py-2 text-right text-muted-light dark:text-muted">
                    {row.actualFocus.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedData.length === 0 && (
          <div className="py-8 text-center text-muted-light dark:text-muted">
            No potions match your filters. Try adjusting the settings.
          </div>
        )}
      </div>
    </section>
  )
}
