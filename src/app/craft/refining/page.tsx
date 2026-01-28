'use client'

import Link from 'next/link'
import { useMemo, useState, useCallback } from 'react'
import {
  REFINING_BASE_FOCUS,
  REFINING_BONUS_CITIES,
  REFINING_OUTPUT_NAMES,
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
}[] = [
  { id: 'hide', name: 'Leather', rawName: 'Hide', outputName: 'Leather', bonusCity: 'Martlock' },
  { id: 'fiber', name: 'Cloth', rawName: 'Fiber', outputName: 'Cloth', bonusCity: 'Lymhurst' },
  { id: 'ore', name: 'Metal', rawName: 'Ore', outputName: 'Metal Bar', bonusCity: 'Thetford' },
  { id: 'wood', name: 'Planks', rawName: 'Wood', outputName: 'Planks', bonusCity: 'Fort Sterling' },
  { id: 'stone', name: 'Stone Block', rawName: 'Stone', outputName: 'Stone Block', bonusCity: 'Bridgewatch' },
]

const CITIES = [
  'Bridgewatch',
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford',
  'Caerleon',
  'Brecilien',
]

const SERVERS = ['Americas (West)', 'Americas (East)', 'Europe', 'Asia']

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
}

export default function RefiningPage() {
  // Settings state
  const [materialType, setMaterialType] = useState<RefiningMaterialType>('hide')
  const [amount, setAmount] = useState(1)
  const [shopFee, setShopFee] = useState(100)
  const [returnRate, setReturnRate] = useState(15.2)
  const [marketTax, setMarketTax] = useState(0)
  const [useFocus, setUseFocus] = useState(false)

  // Mastery levels per tier
  const [masteryT4, setMasteryT4] = useState(0)
  const [masteryT5, setMasteryT5] = useState(0)
  const [masteryT6, setMasteryT6] = useState(0)
  const [masteryT7, setMasteryT7] = useState(0)
  const [masteryT8, setMasteryT8] = useState(0)

  // Cities
  const [startCity, setStartCity] = useState('Martlock')
  const [endCity, setEndCity] = useState('Martlock')
  const [server, setServer] = useState('Americas (West)')

  // Prices - keyed by "tier.enchant"
  const [rawPrices, setRawPrices] = useState<Record<string, number>>({})
  const [refinedPrices, setRefinedPrices] = useState<Record<string, number>>({})

  const materialData = MATERIAL_TYPES.find((m) => m.id === materialType)

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
      specLevel: 0, // Using mastery only for now
      specUniqueFCE: REFINING_FCE_VALUES.specUniqueFCE,
      mutualSpecLevels: 0,
      specMutualFCE: REFINING_FCE_VALUES.specMutualFCE,
    })

    return calculateFocusCost(baseFocus, totalFCE)
  }, [getMasteryForTier])

  // Calculate row data
  const rowData = useMemo((): RefiningRowData[] => {
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

      // Calculate cost
      const rawCost = rawPrice * resources.rawQty * (1 - returnRate / 100)
      const lowerTierCost = lowerTierPrice * resources.lowerTierQty * (1 - returnRate / 100)
      const stationCost = (shopFee / 100) * baseFocus
      const totalCost = (rawCost + lowerTierCost + stationCost) * amount

      // Calculate profit
      const sellValue = refinedPrice * amount * (1 - marketTax)
      const profit = sellValue - totalCost

      // Profit per focus
      const totalFocusUsed = useFocus ? actualFocus * amount : 0
      const profitPerFocus = totalFocusUsed > 0 ? profit / totalFocusUsed : 0

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
      }
    })
  }, [rawPrices, refinedPrices, amount, shopFee, returnRate, marketTax, useFocus, calculateActualFocus])

  const updateRawPrice = (key: string, value: number) => {
    setRawPrices((prev) => ({ ...prev, [key]: value }))
  }

  const updateRefinedPrice = (key: string, value: number) => {
    setRefinedPrices((prev) => ({ ...prev, [key]: value }))
  }

  const handleGetPrices = async () => {
    // TODO: Implement price fetching from API
    console.log('Fetching prices for', materialType, 'from', startCity, 'to', endCity)
  }

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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
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

        {/* Rate of Return */}
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">Rate Of Return %</label>
          <input
            type="number"
            step="0.1"
            value={returnRate}
            onChange={(e) => setReturnRate(Math.max(0, parseFloat(e.target.value) || 0))}
            className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
          />
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
            Start City <span className="text-[10px] text-muted-light/60 dark:text-muted/60">(buy)</span>
          </label>
          <select
            value={startCity}
            onChange={(e) => setStartCity(e.target.value)}
            className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-muted-light dark:text-muted">
            End City <span className="text-[10px] text-muted-light/60 dark:text-muted/60">(sell)</span>
          </label>
          <select
            value={endCity}
            onChange={(e) => setEndCity(e.target.value)}
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
            className="rounded bg-green-500 px-4 py-2 text-sm font-bold text-black hover:bg-green-400"
          >
            GET CURRENT PRICES
          </button>
        </div>
      </div>

      {/* Use Focus Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="useFocus"
          checked={useFocus}
          onChange={(e) => setUseFocus(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="useFocus" className="text-sm">
          Use Focus (adds +59% return rate when checked)
        </label>
      </div>

      {/* Material Type Header */}
      <h2 className="font-display text-xl font-bold text-amber-400 uppercase">
        {materialData?.name}
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
                    {row.baseFocus}
                  </td>

                  {/* Profit/Focus */}
                  <td className={`px-3 py-2 text-right font-mono ${row.profitPerFocus > 0 ? 'text-green-400' : row.profitPerFocus < 0 ? 'text-red-400' : ''}`}>
                    {useFocus && row.actualFocus > 0 ? row.profitPerFocus.toFixed(2) : '0'}
                  </td>

                  {/* Cost */}
                  <td className="px-3 py-2 text-right font-mono">
                    {row.cost > 0 ? row.cost.toFixed(0) : '0'}
                  </td>

                  {/* Profit */}
                  <td className={`px-3 py-2 text-right font-mono ${row.profit > 0 ? 'text-green-400' : row.profit < 0 ? 'text-red-400' : ''}`}>
                    {row.profit !== 0 ? row.profit.toFixed(0) : '0'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-300">
        <strong>Bonus City for {materialData?.name}:</strong> {materialData?.bonusCity}
        <br />
        <span className="text-xs text-muted-light dark:text-muted">
          Craft in the bonus city for +15% return rate. No hideout bonuses apply to refining.
        </span>
      </div>
    </section>
  )
}
