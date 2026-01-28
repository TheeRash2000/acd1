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
  CRAFTING_BONUSES,
} from '@/constants/crafting-bonuses'

// Material types with verified data from spreadsheet
const MATERIAL_TYPES: {
  id: RefiningMaterialType
  name: string
  rawName: string
  outputName: string
  bonusCity: string
  rawItemPrefix: string
  refinedItemPrefix: string
}[] = [
  { id: 'hide', name: 'Leather', rawName: 'Hide', outputName: 'Leather', bonusCity: 'Martlock', rawItemPrefix: 'HIDE', refinedItemPrefix: 'LEATHER' },
  { id: 'fiber', name: 'Cloth', rawName: 'Fiber', outputName: 'Cloth', bonusCity: 'Lymhurst', rawItemPrefix: 'FIBER', refinedItemPrefix: 'CLOTH' },
  { id: 'ore', name: 'Metal', rawName: 'Ore', outputName: 'Metal Bar', bonusCity: 'Thetford', rawItemPrefix: 'ORE', refinedItemPrefix: 'METALBAR' },
  { id: 'wood', name: 'Planks', rawName: 'Wood', outputName: 'Planks', bonusCity: 'Fort Sterling', rawItemPrefix: 'WOOD', refinedItemPrefix: 'PLANKS' },
  { id: 'stone', name: 'Stone Block', rawName: 'Stone', outputName: 'Stone Block', bonusCity: 'Bridgewatch', rawItemPrefix: 'ROCK', refinedItemPrefix: 'STONEBLOCK' },
]

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
  rawItemId: string
  refinedItemId: string
}

// Generate item ID for Albion Online Data API
function getItemId(prefix: string, tier: number, enchant: number): string {
  if (enchant === 0) {
    return `T${tier}_${prefix}`
  }
  return `T${tier}_${prefix}_LEVEL${enchant}@${enchant}`
}

export default function RefiningPage() {
  // Settings state
  const [materialType, setMaterialType] = useState<RefiningMaterialType>('hide')
  const [amount, setAmount] = useState(1)
  const [shopFee, setShopFee] = useState(100)
  const [marketTax, setMarketTax] = useState(0)
  const [useFocus, setUseFocus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Mastery levels per tier
  const [masteryT4, setMasteryT4] = useState(0)
  const [masteryT5, setMasteryT5] = useState(0)
  const [masteryT6, setMasteryT6] = useState(0)
  const [masteryT7, setMasteryT7] = useState(0)
  const [masteryT8, setMasteryT8] = useState(0)

  // Cities
  const [craftCity, setCraftCity] = useState('Martlock')
  const [sellCity, setSellCity] = useState('Martlock')
  const [server, setServer] = useState('West')

  // Prices - keyed by "tier.enchant"
  const [rawPrices, setRawPrices] = useState<Record<string, number>>({})
  const [refinedPrices, setRefinedPrices] = useState<Record<string, number>>({})

  const materialData = MATERIAL_TYPES.find((m) => m.id === materialType)

  // Auto-calculate RRR based on city and material
  const calculatedRRR = useMemo(() => {
    if (!materialData) return 0

    let totalBonus = 0

    // City bonus: +15% if crafting in the material's bonus city
    const isInBonusCity = craftCity === materialData.bonusCity
    if (isInBonusCity) {
      totalBonus += CRAFTING_BONUSES.CITY_BONUS // 0.15
    }

    // Focus bonus: +59% if using focus
    if (useFocus) {
      totalBonus += CRAFTING_BONUSES.FOCUS_BONUS // 0.59
    }

    // Calculate RRR using formula: RRR = totalBonus / (1 + totalBonus)
    return calculateRRR(totalBonus)
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
      const lowerTierKey = row.tier > 2 ? `${row.tier - 1}.${row.enchant}` : null
      const lowerTierPrice = lowerTierKey ? (refinedPrices[lowerTierKey] ?? 0) : 0

      // Calculate cost with return rate
      const rawCost = rawPrice * resources.rawQty * (1 - calculatedRRR)
      const lowerTierCost = lowerTierPrice * resources.lowerTierQty * (1 - calculatedRRR)
      const stationCost = (shopFee / 100) * baseFocus
      const totalCost = (rawCost + lowerTierCost + stationCost) * amount

      // Calculate profit
      const sellValue = refinedPrice * amount * (1 - marketTax)
      const profit = sellValue - totalCost

      // Profit per focus
      const totalFocusUsed = useFocus ? actualFocus * amount : 0
      const profitPerFocus = totalFocusUsed > 0 ? profit / totalFocusUsed : 0

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
        rawItemId,
        refinedItemId,
      }
    })
  }, [materialData, rawPrices, refinedPrices, amount, shopFee, calculatedRRR, marketTax, useFocus, calculateActualFocus])

  const updateRawPrice = (key: string, value: number) => {
    setRawPrices((prev) => ({ ...prev, [key]: value }))
  }

  const updateRefinedPrice = (key: string, value: number) => {
    setRefinedPrices((prev) => ({ ...prev, [key]: value }))
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

      // Fetch from API - use craftCity for raw materials, sellCity for refined
      const buyLocation = CITY_API_LOCATIONS[craftCity] || craftCity
      const sellLocation = CITY_API_LOCATIONS[sellCity] || sellCity
      const locations = buyLocation === sellLocation ? buyLocation : `${buyLocation},${sellLocation}`

      const apiUrl = `https://west.albion-online-data.com/api/v2/stats/prices/${itemList}?locations=${locations}`

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
            // Use sell_price_min as that's what we'd buy at
            const price = item.sell_price_min || 0
            if (price > 0) {
              newRawPrices[key] = price
            }
          }

          // Refined items - use sell price from sell city
          if (itemId === refinedItemId && city === sellLocation) {
            // Use sell_price_min as that's the current market price
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">Mastery T4</label>
          <input
            type="number"
            min="0"
            max="100"
            value={masteryT4}
            onChange={(e) => setMasteryT4(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
            className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">Mastery T5</label>
          <input
            type="number"
            min="0"
            max="100"
            value={masteryT5}
            onChange={(e) => setMasteryT5(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
            className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">Mastery T6</label>
          <input
            type="number"
            min="0"
            max="100"
            value={masteryT6}
            onChange={(e) => setMasteryT6(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
            className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">Mastery T7</label>
          <input
            type="number"
            min="0"
            max="100"
            value={masteryT7}
            onChange={(e) => setMasteryT7(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
            className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">Mastery T8</label>
          <input
            type="number"
            min="0"
            max="100"
            value={masteryT8}
            onChange={(e) => setMasteryT8(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
            className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
          />
        </div>
      </div>

      {/* Controls Row 3 - Cities and Actions */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">
            Craft City
            {materialData && craftCity === materialData.bonusCity && (
              <span className="ml-1 text-green-400">+15%</span>
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
                {city} {materialData && city === materialData.bonusCity ? '(Bonus)' : ''}
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

      {/* RRR Breakdown */}
      <div className="rounded-lg border border-border-light bg-surface-light/50 p-3 dark:border-border dark:bg-surface/50">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div>
            <span className="text-muted-light dark:text-muted">Return Rate: </span>
            <span className="font-bold text-green-400">{returnRatePercent.toFixed(2)}%</span>
          </div>
          <div className="text-xs text-muted-light dark:text-muted">
            {craftCity === materialData?.bonusCity && (
              <span className="mr-2 text-green-400">+15% City Bonus</span>
            )}
            {useFocus && (
              <span className="text-blue-400">+59% Focus Bonus</span>
            )}
            {craftCity !== materialData?.bonusCity && !useFocus && (
              <span>No bonuses active</span>
            )}
          </div>
          {lastUpdated && (
            <div className="ml-auto text-xs text-muted-light dark:text-muted">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

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
              <th className="px-3 py-2 text-left font-medium text-muted-light dark:text-muted">
                {materialData?.rawName}
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-light dark:text-muted">Price</th>
              <th className="px-3 py-2 text-left font-medium text-muted-light dark:text-muted">
                {materialData?.outputName}
              </th>
              <th className="px-3 py-2 text-left font-medium text-muted-light dark:text-muted">Price</th>
              <th className="px-3 py-2 text-left font-medium text-muted-light dark:text-muted">Resources</th>
              <th className="px-3 py-2 text-right font-medium text-muted-light dark:text-muted">Focus</th>
              <th className="px-3 py-2 text-right font-medium text-muted-light dark:text-muted">Profit/Focus</th>
              <th className="px-3 py-2 text-right font-medium text-muted-light dark:text-muted">Cost</th>
              <th className="px-3 py-2 text-right font-medium text-muted-light dark:text-muted">Profit</th>
            </tr>
          </thead>
          <tbody>
            {rowData.map((row) => {
              const key = `${row.tier}.${row.enchant}`
              return (
                <tr
                  key={key}
                  className="border-b border-border-light/50 hover:bg-surface-light/30 dark:border-border/50 dark:hover:bg-surface/30"
                >
                  {/* Raw Material */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded border border-border-light bg-bg-light text-xs font-bold dark:border-border dark:bg-bg">
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
                      <div className="flex h-10 w-10 items-center justify-center rounded border border-amber-400/50 bg-amber-400/10 text-xs font-bold text-amber-300">
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
                            T{row.tier - 1}
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
                  <td className={`px-3 py-2 text-right font-mono ${row.profitPerFocus > 0 ? 'text-green-400' : row.profitPerFocus < 0 ? 'text-red-400' : ''}`}>
                    {useFocus && row.actualFocus > 0 ? row.profitPerFocus.toFixed(2) : '-'}
                  </td>

                  {/* Cost */}
                  <td className="px-3 py-2 text-right font-mono">
                    {row.cost > 0 ? row.cost.toLocaleString() : '-'}
                  </td>

                  {/* Profit */}
                  <td className={`px-3 py-2 text-right font-mono ${row.profit > 0 ? 'text-green-400' : row.profit < 0 ? 'text-red-400' : ''}`}>
                    {row.rawPrice > 0 || row.refinedPrice > 0 ? row.profit.toLocaleString() : '-'}
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
          <strong>How RRR is calculated:</strong>
        </div>
        <ul className="mt-1 list-inside list-disc text-xs text-muted-light dark:text-muted">
          <li>City Bonus: +15% when crafting in {materialData?.bonusCity} (bonus city for {materialData?.name})</li>
          <li>Focus Bonus: +59% when using focus</li>
          <li>Formula: RRR = totalBonus / (1 + totalBonus)</li>
          <li className="mt-1 text-amber-300/70">Note: No hideout bonuses apply to refining</li>
        </ul>
      </div>
    </section>
  )
}
