'use client'

import Link from 'next/link'
import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  GEAR_RECIPES,
  CATEGORY_NAMES,
  MATERIAL_ITEM_IDS,
  getGearItemId,
  getMaterialItemId,
  type GearRecipe,
  type GearCategory,
  type GearItemType,
  type MaterialType,
} from '@/lib/crafting/gear-data'
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

// Quality multipliers for crafting
const QUALITY_MULTIPLIERS: Record<string, number> = {
  'Normal': 1,
  'Good': 1.075,
  'Outstanding': 1.17,
  'Excellent': 1.285,
  'Masterpiece': 1.42,
}

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

// Category to mastery mapping
const CATEGORY_MASTERY_MAP: Record<GearCategory, string> = {
  1: 'mastery_mage',       // Mage Tower
  2: 'mastery_hunter',     // Hunter Lodge
  3: 'mastery_warrior',    // Warrior Forge
  4: 'mastery_toolmaker',  // Toolmaker
}

interface GearRowData {
  recipe: GearRecipe
  gearPrice: number
  materialCost: number
  artifactCost: number
  totalCost: number
  revenue: number
  profit: number
  profitPerFocus: number
  profitMargin: number
  actualFocus: number
  hasPrices: boolean
}

type SortField = 'name' | 'category' | 'profit' | 'profitPerFocus' | 'profitMargin' | 'cost'
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

export default function GearCraftingPage() {
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

  // Gear-specific settings
  const [tier, setTier] = useState(6)
  const [enchant, setEnchant] = useState(0)
  const [quality, setQuality] = useState<keyof typeof QUALITY_MULTIPLIERS>('Normal')
  const [stationFee, setStationFee] = useState(400)
  const [globalDiscount, setGlobalDiscount] = useState(0) // Percentage discount on materials

  // Manual mastery levels
  const [manualMastery, setManualMastery] = useState(0)
  const [manualSpec, setManualSpec] = useState(0)

  // Prices
  const [gearPrices, setGearPrices] = useState<Record<string, number>>({})
  const [materialPrices, setMaterialPrices] = useState<Record<string, number>>({})
  const [artifactPrices, setArtifactPrices] = useState<Record<string, number>>({})

  // Sorting
  const [sortField, setSortField] = useState<SortField>('profit')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Filtering
  const [filterCategory, setFilterCategory] = useState<'all' | GearCategory>('all')
  const [filterItemType, setFilterItemType] = useState<'all' | GearItemType>('all')
  const [filterProfitableOnly, setFilterProfitableOnly] = useState(false)
  const [filterHasPrices, setFilterHasPrices] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Get mastery from destiny board based on current category filter
  const getMasteryFromDB = useCallback((category: GearCategory): { mastery: number; spec: number } => {
    if (!useDestinyBoard || !activeCharacter) {
      return { mastery: manualMastery, spec: manualSpec }
    }

    const masteryKey = CATEGORY_MASTERY_MAP[category]
    const mastery = activeCharacter.masteries[masteryKey] || 0

    // For gear, spec is more complex - use highest relevant spec
    // This is a simplification - real implementation would map items to specific specs
    const spec = manualSpec

    return { mastery, spec }
  }, [useDestinyBoard, activeCharacter, manualMastery, manualSpec])

  // Calculate RRR based on location settings (following Excel logic)
  const { calculatedRRR, bonusBreakdown, isBonusCity } = useMemo(() => {
    let totalBonus = 0
    const breakdown = { base: 0, zone: 0, hideout: 0, specialty: 0, focus: 0, daily: 0, island: 0, total: 0 }

    // Determine if we're in a bonus city (depends on selected item's bonus city)
    // For the overview, we just track if the craft city is a royal city
    const isRoyalCity = ROYAL_CITIES.includes(craftCity)

    if (locationType === 'city') {
      if (isRoyalCity) {
        breakdown.base = PRODUCTION_BONUSES.ROYAL_CITY_BASE
        totalBonus += breakdown.base
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

    return {
      calculatedRRR: calculateRRR(Math.max(0, totalBonus)),
      bonusBreakdown: breakdown,
      isBonusCity: isRoyalCity
    }
  }, [craftCity, locationType, zoneQuality, hideoutPower, useFocus, dailyBonus])

  // Calculate RRR with bonus city for a specific item
  const calculateItemRRR = useCallback((itemBonusCity: string): number => {
    let totalBonus = bonusBreakdown.total

    // Add bonus city specialty if applicable
    if (locationType === 'city' && craftCity === itemBonusCity && ROYAL_CITIES.includes(craftCity)) {
      totalBonus += PRODUCTION_BONUSES.CRAFTING_SPECIALTY || 0.15
    }

    return calculateRRR(Math.max(0, totalBonus))
  }, [bonusBreakdown.total, locationType, craftCity])

  const returnRatePercent = calculatedRRR * 100

  // Calculate actual focus cost for a recipe
  const calculateActualFocus = useCallback((recipe: GearRecipe): number => {
    if (recipe.baseFocus === 0) return 0

    const { mastery } = getMasteryFromDB(recipe.category)

    const totalFCE = calculateTotalFCE({
      masteryLevel: mastery,
      masteryFCEPerLevel: FCE_CONSTANTS.MASTERY_FCE_PER_LEVEL,
      specLevel: manualSpec,
      specUniqueFCE: recipe.uniqueFCE,
      specMutualFCE: recipe.mutualFCE,
      mutualSpecLevels: 0,
    })

    return calculateFocusCost(recipe.baseFocus, totalFCE)
  }, [getMasteryFromDB, manualSpec])

  // Fetch prices from API
  const fetchPrices = useCallback(async () => {
    setIsLoading(true)
    try {
      const apiBase = SERVER_API_ENDPOINTS[server]

      // Get all item IDs for current tier/enchant
      const gearIds: string[] = []
      const materialIds = new Set<string>()
      const artifactIds = new Set<string>()

      for (const recipe of GEAR_RECIPES) {
        // Gear item ID
        gearIds.push(getGearItemId(recipe.id, tier, enchant))

        // Material IDs
        if (recipe.primaryMat) {
          materialIds.add(getMaterialItemId(recipe.primaryMat, tier, enchant))
        }
        if (recipe.secondaryMat) {
          materialIds.add(getMaterialItemId(recipe.secondaryMat, tier, enchant))
        }

        // Artifact IDs (no tier/enchant suffix)
        if (recipe.artifactId) {
          artifactIds.add(recipe.artifactId)
          // Also add Avalon hearts if applicable
          if (recipe.artifactHearts > 0) {
            artifactIds.add('QUESTITEM_TOKEN_AVALON')
          }
        }
      }

      // Fetch gear prices from sell city with quality
      const qualityMap: Record<string, number> = {
        'Normal': 1,
        'Good': 2,
        'Outstanding': 3,
        'Excellent': 4,
        'Masterpiece': 5,
      }
      const qualityNum = qualityMap[quality]

      const gearResponse = await fetch(
        `${apiBase}/api/v2/stats/prices/${gearIds.join(',')}?locations=${sellCity}&qualities=${qualityNum}`
      )
      const gearData = await gearResponse.json()

      const newGearPrices: Record<string, number> = {}
      for (const item of gearData) {
        if (item.sell_price_min > 0) {
          newGearPrices[item.item_id] = item.sell_price_min
        }
      }
      setGearPrices(newGearPrices)

      // Fetch material prices from craft city
      const materialResponse = await fetch(
        `${apiBase}/api/v2/stats/prices/${Array.from(materialIds).join(',')}?locations=${craftCity}&qualities=1`
      )
      const materialData = await materialResponse.json()

      const newMaterialPrices: Record<string, number> = {}
      for (const item of materialData) {
        if (item.sell_price_min > 0) {
          newMaterialPrices[item.item_id] = item.sell_price_min
        }
      }
      setMaterialPrices(newMaterialPrices)

      // Fetch artifact prices from craft city
      if (artifactIds.size > 0) {
        const artifactResponse = await fetch(
          `${apiBase}/api/v2/stats/prices/${Array.from(artifactIds).join(',')}?locations=${craftCity}&qualities=1`
        )
        const artifactData = await artifactResponse.json()

        const newArtifactPrices: Record<string, number> = {}
        for (const item of artifactData) {
          if (item.sell_price_min > 0) {
            newArtifactPrices[item.item_id] = item.sell_price_min
          }
        }
        setArtifactPrices(newArtifactPrices)
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    } finally {
      setIsLoading(false)
    }
  }, [server, craftCity, sellCity, tier, enchant, quality])

  // Auto-fetch on mount
  useEffect(() => {
    fetchPrices()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate row data
  const rowData: GearRowData[] = useMemo(() => {
    const discountMultiplier = 1 - (globalDiscount / 100)

    return GEAR_RECIPES.map((recipe) => {
      const gearItemId = getGearItemId(recipe.id, tier, enchant)
      const gearPrice = gearPrices[gearItemId] || 0

      // Calculate material cost
      let materialCost = 0
      let allMaterialsHavePrices = true

      if (recipe.primaryMat) {
        const matId = getMaterialItemId(recipe.primaryMat, tier, enchant)
        const price = materialPrices[matId] || 0
        if (price === 0) allMaterialsHavePrices = false
        materialCost += price * recipe.primaryQty * discountMultiplier
      }

      if (recipe.secondaryMat) {
        const matId = getMaterialItemId(recipe.secondaryMat, tier, enchant)
        const price = materialPrices[matId] || 0
        if (price === 0) allMaterialsHavePrices = false
        materialCost += price * recipe.secondaryQty * discountMultiplier
      }

      // Calculate artifact cost
      let artifactCost = 0
      if (recipe.artifactId) {
        const artifactPrice = artifactPrices[recipe.artifactId] || 0
        if (artifactPrice === 0) allMaterialsHavePrices = false
        artifactCost += artifactPrice * recipe.artifactQty

        // Avalon hearts
        if (recipe.artifactHearts > 0) {
          const heartsPrice = artifactPrices['QUESTITEM_TOKEN_AVALON'] || 0
          if (heartsPrice === 0) allMaterialsHavePrices = false
          artifactCost += heartsPrice * recipe.artifactHearts
        }
      }

      // Apply RRR to reduce effective material cost (not artifact cost)
      const itemRRR = calculateItemRRR(recipe.bonusCity)
      const effectiveMaterialCost = materialCost * (1 - itemRRR)

      // Calculate focus
      const actualFocus = calculateActualFocus(recipe)

      // Revenue (selling gear)
      const revenue = gearPrice

      // Total cost (materials + artifacts + station fee)
      const totalCost = effectiveMaterialCost + artifactCost + stationFee

      // Profit
      const profit = revenue - totalCost

      // Profit per focus
      const profitPerFocus = actualFocus > 0 ? profit / actualFocus : 0

      // Profit margin
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0

      const hasPrices = gearPrice > 0 && allMaterialsHavePrices

      return {
        recipe,
        gearPrice,
        materialCost: effectiveMaterialCost,
        artifactCost,
        totalCost,
        revenue,
        profit,
        profitPerFocus,
        profitMargin,
        actualFocus,
        hasPrices,
      }
    })
  }, [gearPrices, materialPrices, artifactPrices, tier, enchant, globalDiscount, calculateItemRRR, calculateActualFocus, stationFee])

  // Filter and sort
  const filteredAndSortedData = useMemo(() => {
    let filtered = rowData.filter((row) => {
      if (filterCategory !== 'all' && row.recipe.category !== filterCategory) return false
      if (filterItemType !== 'all' && row.recipe.itemType !== filterItemType) return false
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
        case 'category':
          aVal = a.recipe.category
          bVal = b.recipe.category
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
  }, [rowData, filterCategory, filterItemType, filterProfitableOnly, filterHasPrices, searchTerm, sortField, sortDirection])

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
            Gear Crafting Calculator
          </h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Calculate profit for gear crafting with live market prices. {GEAR_RECIPES.length} items.
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
          className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-amber-300"
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
      <div className="grid gap-4 lg:grid-cols-6">
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

        {/* Gear Settings */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">
            Gear Settings
          </h2>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(parseInt(e.target.value))}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                {[4, 5, 6, 7, 8].map((t) => (
                  <option key={t} value={t}>T{t}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Enchant</label>
              <select
                value={enchant}
                onChange={(e) => setEnchant(parseInt(e.target.value))}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                {[0, 1, 2, 3, 4].map((e) => (
                  <option key={e} value={e}>{e === 0 ? '.0 (None)' : `.${e}`}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Quality</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as typeof quality)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                {Object.keys(QUALITY_MULTIPLIERS).map((q) => (
                  <option key={q} value={q}>{q}</option>
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
            <div className="mt-2 border-t border-border-light pt-2 text-[10px] text-muted-light dark:border-border dark:text-muted">
              +15% bonus city added per item
            </div>
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
              <label className="text-xs text-muted-light dark:text-muted">Global Discount %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={globalDiscount}
                onChange={(e) => setGlobalDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
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
                  Focus
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
                value={manualMastery}
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
                value={manualSpec}
                onChange={(e) => setManualSpec(Math.min(120, Math.max(0, parseInt(e.target.value) || 0)))}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
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
              placeholder="Search gear..."
              className="w-40 rounded border border-border-light bg-surface-light px-3 py-1 text-sm dark:border-border dark:bg-surface"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-light dark:text-muted">Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as GearCategory)}
              className="rounded border border-border-light bg-surface-light px-2 py-1 text-sm dark:border-border dark:bg-surface"
            >
              <option value="all">All</option>
              <option value="1">Mage Tower</option>
              <option value="2">Hunter Lodge</option>
              <option value="3">Warrior Forge</option>
              <option value="4">Toolmaker</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-light dark:text-muted">Type:</label>
            <select
              value={filterItemType}
              onChange={(e) => setFilterItemType(e.target.value as typeof filterItemType)}
              className="rounded border border-border-light bg-surface-light px-2 py-1 text-sm dark:border-border dark:bg-surface"
            >
              <option value="all">All</option>
              <option value="NORMAL">Normal</option>
              <option value="CRYSTAL">Crystal</option>
              <option value="AVALON">Avalonian</option>
              <option value="RELIC">Relic</option>
              <option value="RUNE">Rune</option>
              <option value="SOUL">Soul</option>
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
            Gear ({filteredAndSortedData.length})
          </h2>
          <span className="text-xs text-muted-light dark:text-muted">
            T{tier}{enchant > 0 ? `.${enchant}` : ''} {quality}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light dark:border-border">
                <SortHeader field="name" label="Gear" />
                <SortHeader field="category" label="Category" />
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">
                  Type
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">
                  Materials
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">
                  Bonus City
                </th>
                <SortHeader field="cost" label="Cost" />
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">
                  Sell Price
                </th>
                <SortHeader field="profit" label="Profit" />
                <SortHeader field="profitPerFocus" label="S/Focus" />
                <SortHeader field="profitMargin" label="Margin" />
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((row) => {
                const isInBonusCity = locationType === 'city' && craftCity === row.recipe.bonusCity && ROYAL_CITIES.includes(craftCity)
                return (
                  <tr
                    key={row.recipe.id}
                    className="border-b border-border-light/50 hover:bg-bg-light/50 dark:border-border/50 dark:hover:bg-bg/50"
                  >
                    <td className="px-2 py-2">
                      <div className="font-medium text-text1-light dark:text-text1">{row.recipe.name}</div>
                      {row.recipe.artifactName && (
                        <div className="text-[10px] text-purple-400">{row.recipe.artifactQty}x {row.recipe.artifactName}</div>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <span className="rounded bg-surface-light px-1.5 py-0.5 text-xs text-muted-light dark:bg-surface dark:text-muted">
                        {CATEGORY_NAMES[row.recipe.category]}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <span className={`rounded px-1.5 py-0.5 text-xs ${
                        row.recipe.itemType === 'CRYSTAL' ? 'bg-cyan-400/20 text-cyan-300' :
                        row.recipe.itemType === 'AVALON' ? 'bg-purple-400/20 text-purple-300' :
                        row.recipe.itemType === 'RELIC' ? 'bg-red-400/20 text-red-300' :
                        row.recipe.itemType === 'RUNE' ? 'bg-blue-400/20 text-blue-300' :
                        row.recipe.itemType === 'SOUL' ? 'bg-green-400/20 text-green-300' :
                        'bg-gray-400/20 text-gray-300'
                      }`}>
                        {row.recipe.itemType}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="max-w-[150px] space-y-0.5 text-[10px]">
                        {row.recipe.primaryMat && (
                          <div className="flex justify-between">
                            <span className="text-muted-light dark:text-muted">{row.recipe.primaryQty}x {row.recipe.primaryMat}</span>
                          </div>
                        )}
                        {row.recipe.secondaryMat && (
                          <div className="flex justify-between">
                            <span className="text-muted-light dark:text-muted">{row.recipe.secondaryQty}x {row.recipe.secondaryMat}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right">
                      <span className={isInBonusCity ? 'font-bold text-amber-400' : 'text-muted-light dark:text-muted'}>
                        {row.recipe.bonusCity}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right text-text1-light dark:text-text1">
                      {row.totalCost > 0 ? row.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {row.gearPrice > 0 ? (
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
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredAndSortedData.length === 0 && (
          <div className="py-8 text-center text-muted-light dark:text-muted">
            No gear matches your filters. Try adjusting the settings.
          </div>
        )}
      </div>
    </section>
  )
}
