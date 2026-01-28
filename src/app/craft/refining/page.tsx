'use client'

import Link from 'next/link'
import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  REFINING_BASE_FOCUS,
  REFINING_BONUS_CITIES,
  REFINING_FCE_VALUES,
  type RefiningMaterialType,
} from '@/lib/crafting/fce-types'
import {
  calculateFocusCost,
  calculateTotalFCE,
  calculateRRR,
  FCE_CONSTANTS,
  PRODUCTION_BONUSES,
} from '@/constants/crafting-bonuses'
import { useDestinyBoardStore } from '@/stores/destinyBoardStore'

// Material types with verified data from spreadsheet
// Includes destiny board mastery/spec IDs for integration
const MATERIAL_TYPES: {
  id: RefiningMaterialType
  name: string
  rawName: string
  outputName: string
  bonusCity: string
  rawItemPrefix: string
  refinedItemPrefix: string
  masteryId: string
  specPrefix: string
}[] = [
  { id: 'hide', name: 'Leather', rawName: 'Hide', outputName: 'Leather', bonusCity: 'Martlock', rawItemPrefix: 'HIDE', refinedItemPrefix: 'LEATHER', masteryId: 'mastery_tanner', specPrefix: 'spec_leather_t' },
  { id: 'fiber', name: 'Cloth', rawName: 'Fiber', outputName: 'Cloth', bonusCity: 'Lymhurst', rawItemPrefix: 'FIBER', refinedItemPrefix: 'CLOTH', masteryId: 'mastery_weaver', specPrefix: 'spec_cloth_t' },
  { id: 'ore', name: 'Metal', rawName: 'Ore', outputName: 'Metal Bar', bonusCity: 'Thetford', rawItemPrefix: 'ORE', refinedItemPrefix: 'METALBAR', masteryId: 'mastery_smelter', specPrefix: 'spec_metalbar_t' },
  { id: 'wood', name: 'Planks', rawName: 'Wood', outputName: 'Planks', bonusCity: 'Fort Sterling', rawItemPrefix: 'WOOD', refinedItemPrefix: 'PLANKS', masteryId: 'mastery_woodworker', specPrefix: 'spec_planks_t' },
  { id: 'stone', name: 'Stone Block', rawName: 'Stone', outputName: 'Stone Block', bonusCity: 'Bridgewatch', rawItemPrefix: 'ROCK', refinedItemPrefix: 'STONEBLOCK', masteryId: 'mastery_stonemason', specPrefix: 'spec_stoneblock_t' },
]

// Server to API endpoint mapping
const SERVER_API_ENDPOINTS: Record<string, string> = {
  'West': 'https://west.albion-online-data.com',
  'East': 'https://east.albion-online-data.com',
  'Europe': 'https://europe.albion-online-data.com',
  'Asia': 'https://asia.albion-online-data.com',
}

// City to API location mapping
const CITY_API_LOCATIONS: Record<string, string> = {
  'Bridgewatch': 'Bridgewatch',
  'Fort Sterling': 'Fort Sterling',
  'Lymhurst': 'Lymhurst',
  'Martlock': 'Martlock',
  'Thetford': 'Thetford',
  'Caerleon': 'Caerleon',
  'Brecilien': 'Brecilien',
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

const MARKET_TAX_OPTIONS = [
  { label: 'No Tax', value: 0 },
  { label: '4% (Setup)', value: 0.04 },
  { label: '8% (Normal)', value: 0.08 },
]

// All refining tiers/enchants in order
const REFINING_ROWS = [
  { tier: 2, enchant: 0, label: 'T2' },
  { tier: 3, enchant: 0, label: 'T3' },
  { tier: 4, enchant: 0, label: 'T4' },
  { tier: 4, enchant: 1, label: 'T4.1' },
  { tier: 4, enchant: 2, label: 'T4.2' },
  { tier: 4, enchant: 3, label: 'T4.3' },
  { tier: 4, enchant: 4, label: 'T4.4' },
  { tier: 5, enchant: 0, label: 'T5' },
  { tier: 5, enchant: 1, label: 'T5.1' },
  { tier: 5, enchant: 2, label: 'T5.2' },
  { tier: 5, enchant: 3, label: 'T5.3' },
  { tier: 5, enchant: 4, label: 'T5.4' },
  { tier: 6, enchant: 0, label: 'T6' },
  { tier: 6, enchant: 1, label: 'T6.1' },
  { tier: 6, enchant: 2, label: 'T6.2' },
  { tier: 6, enchant: 3, label: 'T6.3' },
  { tier: 6, enchant: 4, label: 'T6.4' },
  { tier: 7, enchant: 0, label: 'T7' },
  { tier: 7, enchant: 1, label: 'T7.1' },
  { tier: 7, enchant: 2, label: 'T7.2' },
  { tier: 7, enchant: 3, label: 'T7.3' },
  { tier: 7, enchant: 4, label: 'T7.4' },
  { tier: 8, enchant: 0, label: 'T8' },
  { tier: 8, enchant: 1, label: 'T8.1' },
  { tier: 8, enchant: 2, label: 'T8.2' },
  { tier: 8, enchant: 3, label: 'T8.3' },
  { tier: 8, enchant: 4, label: 'T8.4' },
]

// Base focus for T2 (not in spreadsheet, adding it)
const EXTENDED_BASE_FOCUS: Record<string, number> = {
  '2.0': 18,
  ...REFINING_BASE_FOCUS,
}

// Resources needed per tier
const RESOURCES_PER_TIER: Record<number, { rawQty: number; lowerTierQty: number }> = {
  2: { rawQty: 1, lowerTierQty: 0 },
  3: { rawQty: 2, lowerTierQty: 1 },
  4: { rawQty: 2, lowerTierQty: 1 },
  5: { rawQty: 3, lowerTierQty: 1 },
  6: { rawQty: 4, lowerTierQty: 1 },
  7: { rawQty: 5, lowerTierQty: 1 },
  8: { rawQty: 5, lowerTierQty: 1 },
}

interface RefiningRowData {
  tier: number
  enchant: number
  label: string
  rawPrice: number
  refinedPrice: number
  baseFocus: number
  actualFocus: number
  resources: { rawQty: number; lowerTierQty: number }
  cost: number
  profit: number
  profitPerFocus: number
  profitMargin: number
  rawItemId: string
  refinedItemId: string
}

type SortField = 'tier' | 'rawPrice' | 'refinedPrice' | 'profit' | 'profitPerFocus' | 'profitMargin' | 'cost'
type SortDirection = 'asc' | 'desc'

// Generate item ID for Albion Online Data API
function getItemId(prefix: string, tier: number, enchant: number): string {
  if (enchant === 0) {
    return `T${tier}_${prefix}`
  }
  return `T${tier}_${prefix}_LEVEL${enchant}@${enchant}`
}

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

export default function RefiningPage() {
  // Destiny Board integration
  const { activeCharacter } = useDestinyBoardStore()
  const [useDestinyBoard, setUseDestinyBoard] = useState(true)

  // Settings state
  const [materialType, setMaterialType] = useState<RefiningMaterialType>('hide')
  const [amount, setAmount] = useState(1)
  const [shopFee, setShopFee] = useState(100)
  const [marketTax, setMarketTax] = useState(0)
  const [useFocus, setUseFocus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Manual mastery levels (used when not using destiny board)
  const [manualMasteryT4, setManualMasteryT4] = useState(0)
  const [manualMasteryT5, setManualMasteryT5] = useState(0)
  const [manualMasteryT6, setManualMasteryT6] = useState(0)
  const [manualMasteryT7, setManualMasteryT7] = useState(0)
  const [manualMasteryT8, setManualMasteryT8] = useState(0)

  // Get mastery level from destiny board or manual input
  const materialData = MATERIAL_TYPES.find((m) => m.id === materialType)

  const getMasteryForTierFromDB = useCallback((tier: number): number => {
    if (!useDestinyBoard || !activeCharacter || !materialData) {
      return 0
    }
    // Get the specialization level for this tier (spec levels act as mastery for FCE)
    const specId = `${materialData.specPrefix}${tier}`
    return activeCharacter.specializations[specId] || 0
  }, [useDestinyBoard, activeCharacter, materialData])

  // Effective mastery levels (from DB or manual)
  const masteryT4 = useDestinyBoard && activeCharacter ? getMasteryForTierFromDB(4) : manualMasteryT4
  const masteryT5 = useDestinyBoard && activeCharacter ? getMasteryForTierFromDB(5) : manualMasteryT5
  const masteryT6 = useDestinyBoard && activeCharacter ? getMasteryForTierFromDB(6) : manualMasteryT6
  const masteryT7 = useDestinyBoard && activeCharacter ? getMasteryForTierFromDB(7) : manualMasteryT7
  const masteryT8 = useDestinyBoard && activeCharacter ? getMasteryForTierFromDB(8) : manualMasteryT8

  // Cities
  const [craftCity, setCraftCity] = useState('Martlock')
  const [sellCity, setSellCity] = useState('Martlock')
  const [server, setServer] = useState('West')

  // Prices - keyed by "tier.enchant"
  const [rawPrices, setRawPrices] = useState<Record<string, number>>({})
  const [refinedPrices, setRefinedPrices] = useState<Record<string, number>>({})

  // Sorting
  const [sortField, setSortField] = useState<SortField>('tier')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Filtering
  const [filterTierMin, setFilterTierMin] = useState(2)
  const [filterTierMax, setFilterTierMax] = useState(8)
  const [filterEnchantMin, setFilterEnchantMin] = useState(0)
  const [filterEnchantMax, setFilterEnchantMax] = useState(4)
  const [filterProfitableOnly, setFilterProfitableOnly] = useState(false)
  const [filterHasPrices, setFilterHasPrices] = useState(false)

  // Royal cities (have base 18% bonus)
  const ROYAL_CITIES = ['Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford']

  // Auto-calculate RRR based on city and material
  // Using wiki formula: RRR = 1 - 1/(1 + ProductionBonus/100) = bonus / (1 + bonus)
  const { calculatedRRR, bonusBreakdown } = useMemo(() => {
    if (!materialData) return { calculatedRRR: 0, bonusBreakdown: { base: 0, specialty: 0, focus: 0, total: 0 } }

    let totalBonus = 0
    const breakdown = { base: 0, specialty: 0, focus: 0, total: 0 }

    // Check if in a royal city
    const isRoyalCity = ROYAL_CITIES.includes(craftCity)
    const isInBonusCity = craftCity === materialData.bonusCity

    if (isRoyalCity) {
      // Royal City Base: 18%
      breakdown.base = PRODUCTION_BONUSES.ROYAL_CITY_BASE // 0.18
      totalBonus += breakdown.base

      // Refining Specialty Bonus: +40% in specialty city (total 58%)
      if (isInBonusCity) {
        breakdown.specialty = PRODUCTION_BONUSES.REFINING_SPECIALTY // 0.40
        totalBonus += breakdown.specialty
      }
    }
    // Caerleon and Brecilien have no refining specialty bonuses
    // but still have base 18% according to wiki "Baseline royal cities"
    else if (craftCity === 'Caerleon' || craftCity === 'Brecilien') {
      breakdown.base = PRODUCTION_BONUSES.ROYAL_CITY_BASE // 0.18
      totalBonus += breakdown.base
    }

    // Focus bonus: +59% if using focus
    if (useFocus) {
      breakdown.focus = PRODUCTION_BONUSES.FOCUS_BONUS // 0.59
      totalBonus += breakdown.focus
    }

    breakdown.total = totalBonus

    // Calculate RRR using formula: RRR = totalBonus / (1 + totalBonus)
    return { calculatedRRR: calculateRRR(totalBonus), bonusBreakdown: breakdown }
  }, [craftCity, materialData, useFocus])

  // Display RRR as percentage
  const returnRatePercent = calculatedRRR * 100

  // Get mastery for a specific tier
  const getMasteryForTier = useCallback((tier: number): number => {
    switch (tier) {
      case 4: return masteryT4
      case 5: return masteryT5
      case 6: return masteryT6
      case 7: return masteryT7
      case 8: return masteryT8
      default: return 0
    }
  }, [masteryT4, masteryT5, masteryT6, masteryT7, masteryT8])

  // Calculate focus cost for a tier/enchant
  const calculateActualFocus = useCallback((tier: number, enchant: number): number => {
    const key = `${tier}.${enchant}`
    const baseFocus = EXTENDED_BASE_FOCUS[key] ?? 0
    if (baseFocus === 0) return 0

    const mastery = getMasteryForTier(tier)
    const totalFCE = calculateTotalFCE({
      masteryLevel: mastery,
      masteryFCEPerLevel: FCE_CONSTANTS.MASTERY_FCE_PER_LEVEL,
      specLevel: 0,
      specUniqueFCE: REFINING_FCE_VALUES.specUniqueFCE,
      mutualSpecLevels: 0,
      specMutualFCE: REFINING_FCE_VALUES.specMutualFCE,
    })

    return calculateFocusCost(baseFocus, totalFCE)
  }, [getMasteryForTier])

  // Calculate row data
  const rowData = useMemo((): RefiningRowData[] => {
    if (!materialData) return []

    return REFINING_ROWS.map((row) => {
      const key = `${row.tier}.${row.enchant}`
      const baseFocus = EXTENDED_BASE_FOCUS[key] ?? 0
      const actualFocus = calculateActualFocus(row.tier, row.enchant)
      const resources = RESOURCES_PER_TIER[row.tier] ?? { rawQty: 2, lowerTierQty: 1 }

      const rawPrice = rawPrices[key] ?? 0
      const refinedPrice = refinedPrices[key] ?? 0

      // Get lower tier refined price for cost calculation
      // For enchanted items: use previous enchant at SAME tier (T5.2 needs T5.1)
      // For base items: use previous tier at base enchant (T5 needs T4)
      const lowerTierKey = row.enchant > 0
        ? `${row.tier}.${row.enchant - 1}`  // Same tier, previous enchant
        : row.tier > 2
          ? `${row.tier - 1}.0`              // Previous tier, base enchant
          : null                              // T2 has no lower tier requirement
      const lowerTierPrice = lowerTierKey ? (refinedPrices[lowerTierKey] ?? 0) : 0

      // Calculate cost with return rate
      const rawCost = rawPrice * resources.rawQty * (1 - calculatedRRR)
      const lowerTierCost = lowerTierPrice * resources.lowerTierQty * (1 - calculatedRRR)
      const stationCost = (shopFee / 100) * baseFocus
      const totalCost = (rawCost + lowerTierCost + stationCost) * amount

      // Calculate profit
      const sellValue = refinedPrice * amount * (1 - marketTax)
      const profit = sellValue - totalCost

      // Profit per focus (always calculate for comparison, even when not using focus)
      const totalFocusUsed = actualFocus * amount
      const profitPerFocus = totalFocusUsed > 0 ? profit / totalFocusUsed : 0

      // Profit margin (ROI)
      const profitMargin = totalCost > 0 ? (profit / totalCost) * 100 : 0

      // Item IDs for API
      const rawItemId = getItemId(materialData.rawItemPrefix, row.tier, row.enchant)
      const refinedItemId = getItemId(materialData.refinedItemPrefix, row.tier, row.enchant)

      return {
        tier: row.tier,
        enchant: row.enchant,
        label: row.label,
        rawPrice,
        refinedPrice,
        baseFocus,
        actualFocus,
        resources,
        cost: totalCost,
        profit,
        profitPerFocus,
        profitMargin,
        rawItemId,
        refinedItemId,
      }
    })
  }, [materialData, rawPrices, refinedPrices, amount, shopFee, calculatedRRR, marketTax, useFocus, calculateActualFocus])

  // Filter and sort row data
  const filteredAndSortedData = useMemo(() => {
    let filtered = rowData.filter((row) => {
      // Tier filter
      if (row.tier < filterTierMin || row.tier > filterTierMax) return false
      // Enchant filter
      if (row.enchant < filterEnchantMin || row.enchant > filterEnchantMax) return false
      // Profitable only filter
      if (filterProfitableOnly && row.profit <= 0) return false
      // Has prices filter
      if (filterHasPrices && (row.rawPrice === 0 || row.refinedPrice === 0)) return false
      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let aVal: number, bVal: number
      switch (sortField) {
        case 'tier':
          aVal = a.tier * 10 + a.enchant
          bVal = b.tier * 10 + b.enchant
          break
        case 'rawPrice':
          aVal = a.rawPrice
          bVal = b.rawPrice
          break
        case 'refinedPrice':
          aVal = a.refinedPrice
          bVal = b.refinedPrice
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
          aVal = a.cost
          bVal = b.cost
          break
        default:
          return 0
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })

    return filtered
  }, [rowData, filterTierMin, filterTierMax, filterEnchantMin, filterEnchantMax, filterProfitableOnly, filterHasPrices, sortField, sortDirection])

  // Calculate min/max for color scaling
  const { minProfit, maxProfit, minProfitPerFocus, maxProfitPerFocus, minMargin, maxMargin } = useMemo(() => {
    const profits = filteredAndSortedData.map(r => r.profit).filter(p => p !== 0)
    const ppf = filteredAndSortedData.filter(r => r.profitPerFocus !== 0).map(r => r.profitPerFocus)
    const margins = filteredAndSortedData.map(r => r.profitMargin).filter(m => m !== 0)

    return {
      minProfit: Math.min(...profits, 0),
      maxProfit: Math.max(...profits, 0),
      minProfitPerFocus: Math.min(...ppf, 0),
      maxProfitPerFocus: Math.max(...ppf, 0),
      minMargin: Math.min(...margins, 0),
      maxMargin: Math.max(...margins, 0),
    }
  }, [filteredAndSortedData])

  // Best values for highlighting
  const bestValues = useMemo(() => {
    const withPrices = filteredAndSortedData.filter(r => r.rawPrice > 0 && r.refinedPrice > 0)
    if (withPrices.length === 0) return { bestProfit: null, bestProfitPerFocus: null, bestMargin: null }

    const bestProfit = withPrices.reduce((best, r) => r.profit > (best?.profit ?? -Infinity) ? r : best, null as RefiningRowData | null)
    const bestProfitPerFocus = withPrices.reduce((best, r) => r.profitPerFocus > (best?.profitPerFocus ?? -Infinity) ? r : best, null as RefiningRowData | null)
    const bestMargin = withPrices.reduce((best, r) => r.profitMargin > (best?.profitMargin ?? -Infinity) ? r : best, null as RefiningRowData | null)

    return { bestProfit, bestProfitPerFocus, bestMargin }
  }, [filteredAndSortedData])

  const updateRawPrice = (key: string, value: number) => {
    setRawPrices((prev) => ({ ...prev, [key]: value }))
  }

  const updateRefinedPrice = (key: string, value: number) => {
    setRefinedPrices((prev) => ({ ...prev, [key]: value }))
  }

  // Handle column header click for sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc') // Default to descending for most fields
    }
  }

  // Sort indicator
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="ml-1 text-muted/50">↕</span>
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
  }

  // Fetch prices from Albion Online Data Project API
  const handleGetPrices = async () => {
    if (!materialData) return

    setIsLoading(true)

    try {
      // Build list of all item IDs needed
      const rawItems: string[] = []
      const refinedItems: string[] = []

      for (const row of REFINING_ROWS) {
        rawItems.push(getItemId(materialData.rawItemPrefix, row.tier, row.enchant))
        refinedItems.push(getItemId(materialData.refinedItemPrefix, row.tier, row.enchant))
      }

      const allItems = [...rawItems, ...refinedItems]
      const itemList = allItems.join(',')

      // Get API endpoint based on server selection
      const apiEndpoint = SERVER_API_ENDPOINTS[server] || SERVER_API_ENDPOINTS['West']

      // Fetch from API - use craftCity for raw materials, sellCity for refined
      const buyLocation = CITY_API_LOCATIONS[craftCity] || craftCity
      const sellLocation = CITY_API_LOCATIONS[sellCity] || sellCity
      const locations = buyLocation === sellLocation ? buyLocation : `${buyLocation},${sellLocation}`

      const apiUrl = `${apiEndpoint}/api/v2/stats/prices/${itemList}?locations=${locations}`

      console.log('Fetching prices from:', apiUrl)

      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Parse the response and update prices
      const newRawPrices: Record<string, number> = {}
      const newRefinedPrices: Record<string, number> = {}

      for (const item of data) {
        const itemId = item.item_id
        const city = item.city

        // Find which row this corresponds to
        for (const row of REFINING_ROWS) {
          const key = `${row.tier}.${row.enchant}`
          const rawItemId = getItemId(materialData.rawItemPrefix, row.tier, row.enchant)
          const refinedItemId = getItemId(materialData.refinedItemPrefix, row.tier, row.enchant)

          // Raw items - use buy price from craft city
          if (itemId === rawItemId && city === buyLocation) {
            const price = item.sell_price_min || 0
            if (price > 0) {
              newRawPrices[key] = price
            }
          }

          // Refined items - use sell price from sell city
          if (itemId === refinedItemId && city === sellLocation) {
            const price = item.sell_price_min || 0
            if (price > 0) {
              newRefinedPrices[key] = price
            }
          }
        }
      }

      setRawPrices((prev) => ({ ...prev, ...newRawPrices }))
      setRefinedPrices((prev) => ({ ...prev, ...newRefinedPrices }))
      setLastUpdated(new Date())

      console.log('Prices updated:', { raw: newRawPrices, refined: newRefinedPrices })
    } catch (error) {
      console.error('Failed to fetch prices:', error)
      alert('Failed to fetch prices. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-set craft city to bonus city when material changes
  useEffect(() => {
    if (materialData) {
      setCraftCity(materialData.bonusCity)
      setSellCity(materialData.bonusCity)
    }
  }, [materialData])

  return (
    <section className="grid gap-6">
      {/* Header */}
      <header>
        <h1 className="font-display text-2xl font-bold text-amber-400">
          REFINING CALCULATOR
        </h1>
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
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          POTIONS
        </Link>
        <Link
          href="/craft/refining"
          className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-amber-300"
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

      {/* Controls Row 1 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {/* Type */}
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">Type</label>
          <select
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value as RefiningMaterialType)}
            className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
          >
            {MATERIAL_TYPES.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
            className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
          />
        </div>

        {/* Shop Fee */}
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">
            Shop Fee <span className="text-[10px] text-muted-light/60 dark:text-muted/60">(per 100)</span>
          </label>
          <input
            type="number"
            value={shopFee}
            onChange={(e) => setShopFee(Math.max(0, parseInt(e.target.value) || 0))}
            className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
          />
        </div>

        {/* Return Rate (Auto-calculated) */}
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">
            Return Rate %
            <span className="ml-1 text-[10px] text-green-400">(auto)</span>
          </label>
          <div className="flex items-center rounded border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm font-bold text-green-400">
            {returnRatePercent.toFixed(2)}%
          </div>
        </div>

        {/* Market Tax */}
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">Market Tax</label>
          <select
            value={marketTax}
            onChange={(e) => setMarketTax(parseFloat(e.target.value))}
            className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
          >
            {MARKET_TAX_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Use Focus Toggle */}
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">Focus</label>
          <label className="flex h-[38px] cursor-pointer items-center gap-2 rounded border border-border-light bg-surface-light px-3 dark:border-border dark:bg-surface">
            <input
              type="checkbox"
              checked={useFocus}
              onChange={(e) => setUseFocus(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">Use Focus</span>
          </label>
        </div>
      </div>

      {/* Controls Row 2 - Masteries */}
      <div className="rounded-lg border border-border-light bg-surface-light/50 p-3 dark:border-border dark:bg-surface/50">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              <span className="text-xs text-blue-400">
                ({activeCharacter.name})
              </span>
            )}
            {useDestinyBoard && !activeCharacter && (
              <span className="text-xs text-amber-400">
                No character selected - <Link href="/destiny-board" className="underline">create one</Link>
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          <div className="grid gap-1">
            <label className="text-xs text-muted-light dark:text-muted">Spec T4</label>
            <input
              type="number"
              min="0"
              max="120"
              value={masteryT4}
              onChange={(e) => setManualMasteryT4(Math.min(120, Math.max(0, parseInt(e.target.value) || 0)))}
              disabled={useDestinyBoard && !!activeCharacter}
              className={`rounded border px-3 py-2 text-sm ${
                useDestinyBoard && activeCharacter
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                  : 'border-border-light bg-surface-light dark:border-border dark:bg-surface'
              }`}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-muted-light dark:text-muted">Spec T5</label>
            <input
              type="number"
              min="0"
              max="120"
              value={masteryT5}
              onChange={(e) => setManualMasteryT5(Math.min(120, Math.max(0, parseInt(e.target.value) || 0)))}
              disabled={useDestinyBoard && !!activeCharacter}
              className={`rounded border px-3 py-2 text-sm ${
                useDestinyBoard && activeCharacter
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                  : 'border-border-light bg-surface-light dark:border-border dark:bg-surface'
              }`}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-muted-light dark:text-muted">Spec T6</label>
            <input
              type="number"
              min="0"
              max="120"
              value={masteryT6}
              onChange={(e) => setManualMasteryT6(Math.min(120, Math.max(0, parseInt(e.target.value) || 0)))}
              disabled={useDestinyBoard && !!activeCharacter}
              className={`rounded border px-3 py-2 text-sm ${
                useDestinyBoard && activeCharacter
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                  : 'border-border-light bg-surface-light dark:border-border dark:bg-surface'
              }`}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-muted-light dark:text-muted">Spec T7</label>
            <input
              type="number"
              min="0"
              max="120"
              value={masteryT7}
              onChange={(e) => setManualMasteryT7(Math.min(120, Math.max(0, parseInt(e.target.value) || 0)))}
              disabled={useDestinyBoard && !!activeCharacter}
              className={`rounded border px-3 py-2 text-sm ${
                useDestinyBoard && activeCharacter
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                  : 'border-border-light bg-surface-light dark:border-border dark:bg-surface'
              }`}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-muted-light dark:text-muted">Spec T8</label>
            <input
              type="number"
              min="0"
              max="120"
              value={masteryT8}
              onChange={(e) => setManualMasteryT8(Math.min(120, Math.max(0, parseInt(e.target.value) || 0)))}
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

      {/* Controls Row 3 - Cities and Actions */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">
            Craft City
            {materialData && craftCity === materialData.bonusCity && (
              <span className="ml-1 text-green-400">+40% Specialty</span>
            )}
          </label>
          <select
            value={craftCity}
            onChange={(e) => setCraftCity(e.target.value)}
            className={`rounded border px-3 py-2 text-sm ${
              materialData && craftCity === materialData.bonusCity
                ? 'border-green-500/50 bg-green-500/10'
                : 'border-border-light bg-surface-light dark:border-border dark:bg-surface'
            }`}
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city} {materialData && city === materialData.bonusCity ? '(+40%)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">
            Sell City
          </label>
          <select
            value={sellCity}
            onChange={(e) => setSellCity(e.target.value)}
            className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
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
          <label className="text-xs text-transparent">Action</label>
          <button
            type="button"
            onClick={handleGetPrices}
            disabled={isLoading}
            className="rounded bg-green-500 px-4 py-2 text-sm font-bold text-black hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'LOADING...' : 'GET PRICES'}
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="rounded-lg border border-border-light bg-surface-light/50 p-3 dark:border-border dark:bg-surface/50">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-xs font-medium text-muted-light dark:text-muted">FILTERS:</span>

          {/* Tier Range */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-light dark:text-muted">Tier:</span>
            <select
              value={filterTierMin}
              onChange={(e) => setFilterTierMin(parseInt(e.target.value))}
              className="rounded border border-border-light bg-bg-light px-2 py-1 text-xs dark:border-border dark:bg-bg"
            >
              {[2, 3, 4, 5, 6, 7, 8].map(t => <option key={t} value={t}>T{t}</option>)}
            </select>
            <span className="text-muted">-</span>
            <select
              value={filterTierMax}
              onChange={(e) => setFilterTierMax(parseInt(e.target.value))}
              className="rounded border border-border-light bg-bg-light px-2 py-1 text-xs dark:border-border dark:bg-bg"
            >
              {[2, 3, 4, 5, 6, 7, 8].map(t => <option key={t} value={t}>T{t}</option>)}
            </select>
          </div>

          {/* Enchant Range */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-light dark:text-muted">Enchant:</span>
            <select
              value={filterEnchantMin}
              onChange={(e) => setFilterEnchantMin(parseInt(e.target.value))}
              className="rounded border border-border-light bg-bg-light px-2 py-1 text-xs dark:border-border dark:bg-bg"
            >
              {[0, 1, 2, 3, 4].map(e => <option key={e} value={e}>.{e}</option>)}
            </select>
            <span className="text-muted">-</span>
            <select
              value={filterEnchantMax}
              onChange={(e) => setFilterEnchantMax(parseInt(e.target.value))}
              className="rounded border border-border-light bg-bg-light px-2 py-1 text-xs dark:border-border dark:bg-bg"
            >
              {[0, 1, 2, 3, 4].map(e => <option key={e} value={e}>.{e}</option>)}
            </select>
          </div>

          {/* Quick Filters */}
          <label className="flex cursor-pointer items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={filterProfitableOnly}
              onChange={(e) => setFilterProfitableOnly(e.target.checked)}
              className="h-3 w-3"
            />
            <span className="text-green-400">Profitable Only</span>
          </label>

          <label className="flex cursor-pointer items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={filterHasPrices}
              onChange={(e) => setFilterHasPrices(e.target.checked)}
              className="h-3 w-3"
            />
            <span>Has Prices</span>
          </label>

          {/* Results count */}
          <span className="ml-auto text-xs text-muted-light dark:text-muted">
            {filteredAndSortedData.length} / {rowData.length} items
          </span>
        </div>
      </div>

      {/* RRR Breakdown */}
      <div className="rounded-lg border border-border-light bg-surface-light/50 p-3 dark:border-border dark:bg-surface/50">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div>
            <span className="text-muted-light dark:text-muted">Return Rate: </span>
            <span className="font-bold text-green-400">{returnRatePercent.toFixed(2)}%</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {bonusBreakdown.base > 0 && (
              <span className="rounded bg-gray-500/20 px-1.5 py-0.5 text-gray-300">
                +{(bonusBreakdown.base * 100).toFixed(0)}% Base
              </span>
            )}
            {bonusBreakdown.specialty > 0 && (
              <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-green-400">
                +{(bonusBreakdown.specialty * 100).toFixed(0)}% Specialty
              </span>
            )}
            {bonusBreakdown.focus > 0 && (
              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-blue-400">
                +{(bonusBreakdown.focus * 100).toFixed(0)}% Focus
              </span>
            )}
            {bonusBreakdown.total > 0 && (
              <span className="text-muted-light dark:text-muted">
                = {(bonusBreakdown.total * 100).toFixed(0)}% Production Bonus
              </span>
            )}
            {bonusBreakdown.total === 0 && (
              <span className="text-muted-light dark:text-muted">No bonuses active</span>
            )}
          </div>
          {lastUpdated && (
            <div className="ml-auto text-xs text-muted-light dark:text-muted">
              Last updated: {lastUpdated.toLocaleTimeString()} ({server})
            </div>
          )}
        </div>
      </div>

      {/* Best Values Summary */}
      {(bestValues.bestProfit || bestValues.bestProfitPerFocus || bestValues.bestMargin) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {bestValues.bestProfit && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
              <div className="text-xs text-muted-light dark:text-muted">Best Profit</div>
              <div className="text-lg font-bold text-green-400">
                {bestValues.bestProfit.label}: {bestValues.bestProfit.profit.toLocaleString()}
              </div>
            </div>
          )}
          {bestValues.bestProfitPerFocus && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
              <div className="text-xs text-muted-light dark:text-muted">Best Profit/Focus</div>
              <div className="text-lg font-bold text-blue-400">
                {bestValues.bestProfitPerFocus.label}: {bestValues.bestProfitPerFocus.profitPerFocus.toFixed(2)}
              </div>
            </div>
          )}
          {bestValues.bestMargin && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <div className="text-xs text-muted-light dark:text-muted">Best ROI</div>
              <div className="text-lg font-bold text-amber-400">
                {bestValues.bestMargin.label}: {bestValues.bestMargin.profitMargin.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      )}

      {/* Material Type Header */}
      <h2 className="font-display text-xl font-bold text-amber-400 uppercase">
        {materialData?.name}
        <span className="ml-2 text-sm font-normal text-muted-light dark:text-muted">
          (Bonus City: {materialData?.bonusCity})
        </span>
      </h2>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light bg-surface-light/50 dark:border-border dark:bg-surface/50">
              <th
                className="cursor-pointer px-3 py-2 text-left font-medium text-muted-light hover:text-text1-light dark:text-muted dark:hover:text-text1"
                onClick={() => handleSort('tier')}
              >
                {materialData?.rawName}
                <SortIndicator field="tier" />
              </th>
              <th
                className="cursor-pointer px-3 py-2 text-left font-medium text-muted-light hover:text-text1-light dark:text-muted dark:hover:text-text1"
                onClick={() => handleSort('rawPrice')}
              >
                Price
                <SortIndicator field="rawPrice" />
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-light dark:text-muted">
                {materialData?.outputName}
              </th>
              <th
                className="cursor-pointer px-3 py-2 text-left font-medium text-muted-light hover:text-text1-light dark:text-muted dark:hover:text-text1"
                onClick={() => handleSort('refinedPrice')}
              >
                Price
                <SortIndicator field="refinedPrice" />
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-light dark:text-muted">Resources</th>
              <th className="px-3 py-2 text-right font-medium text-muted-light dark:text-muted">Focus</th>
              <th
                className="cursor-pointer px-3 py-2 text-right font-medium text-muted-light hover:text-text1-light dark:text-muted dark:hover:text-text1"
                onClick={() => handleSort('profitPerFocus')}
              >
                Profit/Focus
                <SortIndicator field="profitPerFocus" />
              </th>
              <th
                className="cursor-pointer px-3 py-2 text-right font-medium text-muted-light hover:text-text1-light dark:text-muted dark:hover:text-text1"
                onClick={() => handleSort('profitMargin')}
              >
                ROI %
                <SortIndicator field="profitMargin" />
              </th>
              <th
                className="cursor-pointer px-3 py-2 text-right font-medium text-muted-light hover:text-text1-light dark:text-muted dark:hover:text-text1"
                onClick={() => handleSort('cost')}
              >
                Cost
                <SortIndicator field="cost" />
              </th>
              <th
                className="cursor-pointer px-3 py-2 text-right font-medium text-muted-light hover:text-text1-light dark:text-muted dark:hover:text-text1"
                onClick={() => handleSort('profit')}
              >
                Profit
                <SortIndicator field="profit" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.map((row) => {
              const key = `${row.tier}.${row.enchant}`
              const isBestProfit = bestValues.bestProfit?.label === row.label
              const isBestPPF = bestValues.bestProfitPerFocus?.label === row.label
              const isBestMargin = bestValues.bestMargin?.label === row.label
              const hasPrices = row.rawPrice > 0 && row.refinedPrice > 0

              return (
                <tr
                  key={key}
                  className={`border-b border-border-light/50 hover:bg-surface-light/30 dark:border-border/50 dark:hover:bg-surface/30 ${
                    isBestProfit ? 'bg-green-500/10' : isBestPPF ? 'bg-blue-500/10' : isBestMargin ? 'bg-amber-500/10' : ''
                  }`}
                >
                  {/* Raw Material */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded border text-xs font-bold ${
                        isBestProfit ? 'border-green-400 bg-green-400/20 text-green-400' :
                        isBestPPF ? 'border-blue-400 bg-blue-400/20 text-blue-400' :
                        isBestMargin ? 'border-amber-400 bg-amber-400/20 text-amber-400' :
                        'border-border-light bg-bg-light dark:border-border dark:bg-bg'
                      }`}>
                        {row.label}
                      </div>
                    </div>
                  </td>

                  {/* Raw Price Input */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      placeholder="Price"
                      value={row.rawPrice || ''}
                      onChange={(e) => updateRawPrice(key, parseInt(e.target.value) || 0)}
                      className="w-24 rounded border border-border-light bg-surface-light px-2 py-1 text-sm dark:border-border dark:bg-surface"
                    />
                  </td>

                  {/* Refined Material */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded border text-xs font-bold ${
                        isBestProfit ? 'border-green-400 bg-green-400/20 text-green-400' :
                        isBestPPF ? 'border-blue-400 bg-blue-400/20 text-blue-400' :
                        isBestMargin ? 'border-amber-400 bg-amber-400/20 text-amber-400' :
                        'border-amber-400/50 bg-amber-400/10 text-amber-300'
                      }`}>
                        {row.label}
                      </div>
                    </div>
                  </td>

                  {/* Refined Price Input */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      placeholder="Price"
                      value={row.refinedPrice || ''}
                      onChange={(e) => updateRefinedPrice(key, parseInt(e.target.value) || 0)}
                      className="w-24 rounded border border-border-light bg-surface-light px-2 py-1 text-sm dark:border-border dark:bg-surface"
                    />
                  </td>

                  {/* Resources */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="font-medium">{row.resources.rawQty}x</span>
                      <div className="h-6 w-6 rounded border border-border-light bg-bg-light text-[9px] flex items-center justify-center dark:border-border dark:bg-bg">
                        {row.label}
                      </div>
                      {row.resources.lowerTierQty > 0 && row.tier > 2 && (
                        <>
                          <span className="font-medium ml-1">{row.resources.lowerTierQty}x</span>
                          <div className="h-6 w-6 rounded border border-amber-400/50 bg-amber-400/10 text-[9px] flex items-center justify-center text-amber-300">
                            {row.enchant > 0 ? `T${row.tier}.${row.enchant - 1}` : `T${row.tier - 1}`}
                          </div>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Focus */}
                  <td className="px-3 py-2 text-right font-mono">
                    {useFocus ? Math.round(row.actualFocus) : row.baseFocus}
                  </td>

                  {/* Profit/Focus */}
                  <td className={`px-3 py-2 text-right font-mono ${
                    hasPrices && row.actualFocus > 0 ? getValueColor(row.profitPerFocus, minProfitPerFocus, maxProfitPerFocus) : ''
                  }`}>
                    {hasPrices && row.actualFocus > 0 ? row.profitPerFocus.toFixed(2) : '-'}
                  </td>

                  {/* ROI % */}
                  <td className={`px-3 py-2 text-right font-mono ${
                    hasPrices ? getValueColor(row.profitMargin, minMargin, maxMargin) : ''
                  }`}>
                    {hasPrices ? `${row.profitMargin.toFixed(1)}%` : '-'}
                  </td>

                  {/* Cost */}
                  <td className="px-3 py-2 text-right font-mono">
                    {row.cost > 0 ? row.cost.toLocaleString() : '-'}
                  </td>

                  {/* Profit */}
                  <td className={`px-3 py-2 text-right font-mono ${
                    hasPrices ? getValueColor(row.profit, minProfit, maxProfit) : ''
                  }`}>
                    {hasPrices ? row.profit.toLocaleString() : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm">
        <div className="text-amber-300">
          <strong>Production Bonuses (from wiki):</strong>
        </div>
        <ul className="mt-1 list-inside list-disc text-xs text-muted-light dark:text-muted">
          <li>Royal City Base: <span className="text-gray-300">+18%</span></li>
          <li>Refining Specialty ({materialData?.bonusCity} for {materialData?.name}): <span className="text-green-400">+40%</span> (total 58%)</li>
          <li>Using Focus: <span className="text-blue-400">+59%</span> production bonus</li>
          <li className="mt-1">Formula: <code className="rounded bg-bg/50 px-1">RRR = bonus / (1 + bonus)</code></li>
          <li className="mt-1 text-amber-300/70">Example: 58% → 36.7% RRR | 117% (with focus) → 53.9% RRR</li>
        </ul>
        <div className="mt-2 text-amber-300">
          <strong>Focus Cost:</strong>
        </div>
        <ul className="mt-1 list-inside list-disc text-xs text-muted-light dark:text-muted">
          <li>Focus cost is halved for every 10,000 FCE (Focus Cost Efficiency)</li>
          <li>Mastery levels increase your FCE, reducing focus cost</li>
          <li>Max 40,000 FCE for T4-T8 refining = 6.25% of base cost</li>
        </ul>
      </div>
    </section>
  )
}
