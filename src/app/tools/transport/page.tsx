'use client'

import Link from 'next/link'
import { useState, useCallback, useEffect, useMemo } from 'react'

// Server to API endpoint mapping
const SERVER_API_ENDPOINTS: Record<string, string> = {
  'Americas': 'https://west.albion-online-data.com',
  'Europe': 'https://europe.albion-online-data.com',
  'Asia': 'https://east.albion-online-data.com',
}

const SERVERS = ['Americas', 'Europe', 'Asia']

const CITIES = [
  'Bridgewatch',
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford',
  'Caerleon',
  'Brecilien',
]

const MATERIAL_TYPES = [
  { id: 'LEATHER', name: 'Leather', weight: 1.52 },
  { id: 'CLOTH', name: 'Cloth', weight: 0.76 },
  { id: 'METALBAR', name: 'Metal Bar', weight: 2.28 },
  { id: 'PLANKS', name: 'Planks', weight: 1.14 },
  { id: 'STONEBLOCK', name: 'Stone Block', weight: 3.04 },
]

const TIERS = [
  { tier: 4, enchants: [0, 1, 2, 3] },
  { tier: 5, enchants: [0, 1, 2, 3] },
  { tier: 6, enchants: [0, 1, 2, 3] },
  { tier: 7, enchants: [0, 1, 2, 3] },
  { tier: 8, enchants: [0, 1, 2, 3] },
]

// Weight multiplier per tier (higher tier = heavier)
const TIER_WEIGHT_MULTIPLIER: Record<number, number> = {
  4: 1,
  5: 1.5,
  6: 2.25,
  7: 3.38,
  8: 5.06,
}

function getMaterialItemId(matType: string, tier: number, enchant: number): string {
  const baseId = `T${tier}_${matType}`
  if (enchant === 0) return baseId
  return `${baseId}_LEVEL${enchant}@${enchant}`
}

function getTierLabel(tier: number, enchant: number): string {
  if (enchant === 0) return `T${tier}`
  return `T${tier}.${enchant}`
}

function getMaterialWeight(matId: string, tier: number): number {
  const mat = MATERIAL_TYPES.find(m => m.id === matId)
  if (!mat) return 1
  return mat.weight * TIER_WEIGHT_MULTIPLIER[tier]
}

interface PriceData {
  itemId: string
  city: string
  sellPrice: number
  buyPrice: number
}

type SellStrategy = 'sell_order' | 'instant_sell'

interface TransportRoute {
  material: string
  materialName: string
  tier: number
  enchant: number
  tierLabel: string
  fromCity: string
  toCity: string
  buyPrice: number           // Price to buy in source city (sell order = instant buy)
  destSellPrice: number      // Lowest sell order in destination (your competition)
  destBuyPrice: number       // Highest buy order in destination (instant sell)
  profitPerUnit: number      // Based on selected strategy
  profitPerWeight: number
  weight: number
  maxUnits: number           // Based on carry capacity only
  totalProfit: number
}

export default function TransportCalculatorPage() {
  const [server, setServer] = useState('Americas')
  const [fromCity, setFromCity] = useState('Fort Sterling')
  const [toCity, setToCity] = useState('Thetford')
  const [maxWeight, setMaxWeight] = useState(5000) // Mammoth capacity
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [priceData, setPriceData] = useState<Record<string, PriceData>>({})
  const [taxRate, setTaxRate] = useState(0.065) // 6.5% setup fee
  const [sellStrategy, setSellStrategy] = useState<SellStrategy>('sell_order')

  // Fetch prices from API
  const fetchPrices = useCallback(async () => {
    setIsLoading(true)
    try {
      const apiBase = SERVER_API_ENDPOINTS[server]

      // Build list of all item IDs
      const itemIds: string[] = []
      for (const mat of MATERIAL_TYPES) {
        for (const { tier, enchants } of TIERS) {
          for (const enchant of enchants) {
            itemIds.push(getMaterialItemId(mat.id, tier, enchant))
          }
        }
      }

      const response = await fetch(
        `${apiBase}/api/v2/stats/prices/${itemIds.join(',')}?locations=${CITIES.join(',')}&qualities=1`
      )
      const data = await response.json()

      const newPriceData: Record<string, PriceData> = {}
      for (const item of data) {
        const key = `${item.item_id}_${item.city}`
        newPriceData[key] = {
          itemId: item.item_id,
          city: item.city,
          sellPrice: item.sell_price_min || 0,
          buyPrice: item.buy_price_max || 0,
        }
      }
      setPriceData(newPriceData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    } finally {
      setIsLoading(false)
    }
  }, [server])

  // Auto-fetch on mount
  useEffect(() => {
    fetchPrices()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate profitable routes
  const routes: TransportRoute[] = useMemo(() => {
    const result: TransportRoute[] = []

    for (const mat of MATERIAL_TYPES) {
      for (const { tier, enchants } of TIERS) {
        for (const enchant of enchants) {
          const itemId = getMaterialItemId(mat.id, tier, enchant)
          const tierLabel = getTierLabel(tier, enchant)
          const weight = getMaterialWeight(mat.id, tier)

          const fromKey = `${itemId}_${fromCity}`
          const toKey = `${itemId}_${toCity}`

          const fromData = priceData[fromKey]
          const toData = priceData[toKey]

          if (!fromData || !toData) continue

          // Buy price = sell order in source city (instant buy)
          const buyPrice = fromData.sellPrice
          // Destination prices
          const destSellPrice = toData.sellPrice  // Competition's price
          const destBuyPrice = toData.buyPrice    // Instant sell price

          if (buyPrice <= 0) continue

          // Calculate profit based on strategy
          let sellPrice: number
          if (sellStrategy === 'instant_sell') {
            sellPrice = destBuyPrice
          } else {
            sellPrice = destSellPrice
          }

          if (sellPrice <= 0) continue

          const sellAfterTax = sellPrice * (1 - taxRate)
          const profitPerUnit = sellAfterTax - buyPrice

          if (profitPerUnit <= 0) continue

          const profitPerWeight = profitPerUnit / weight
          // Max units is based purely on carry capacity
          const maxUnits = Math.floor(maxWeight / weight)
          const totalProfit = profitPerUnit * maxUnits

          result.push({
            material: mat.id,
            materialName: mat.name,
            tier,
            enchant,
            tierLabel,
            fromCity,
            toCity,
            buyPrice,
            destSellPrice,
            destBuyPrice,
            profitPerUnit,
            profitPerWeight,
            weight,
            maxUnits,
            totalProfit,
          })
        }
      }
    }

    // Sort by profit per weight (best silver/kg)
    result.sort((a, b) => b.profitPerWeight - a.profitPerWeight)

    return result
  }, [priceData, fromCity, toCity, maxWeight, taxRate, sellStrategy])

  // Calculate optimal load (greedy algorithm by profit/weight)
  const optimalLoad = useMemo(() => {
    let remainingWeight = maxWeight
    const load: { route: TransportRoute; units: number; profit: number }[] = []

    for (const route of routes) {
      if (remainingWeight <= 0) break

      const maxUnitsCanCarry = Math.floor(remainingWeight / route.weight)
      if (maxUnitsCanCarry <= 0) continue

      const units = maxUnitsCanCarry
      const profit = route.profitPerUnit * units
      const usedWeight = units * route.weight

      load.push({ route, units, profit })
      remainingWeight -= usedWeight
    }

    const totalProfit = load.reduce((sum, item) => sum + item.profit, 0)
    const usedWeight = maxWeight - remainingWeight

    return { load, totalProfit, usedWeight }
  }, [routes, maxWeight])

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">
            Transport Calculator
          </h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Find the most profitable materials to haul between cities.
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
          href="/tools/materials"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          MATERIALS
        </Link>
        <Link
          href="/tools/transport"
          className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-amber-300"
        >
          TRANSPORT
        </Link>
        <Link
          href="/tools/flipper"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          FLIPPER
        </Link>
        <Link
          href="/craft"
          className="ml-auto rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          Crafting
        </Link>
      </nav>

      {/* Settings */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Route</h2>
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
              <label className="text-xs text-muted-light dark:text-muted">From City</label>
              <select
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">To City</label>
              <select
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Settings</h2>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Max Weight (kg)</label>
              <input
                type="number"
                value={maxWeight}
                onChange={(e) => setMaxWeight(parseInt(e.target.value) || 0)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Market Tax</label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                <option value={0}>No Tax</option>
                <option value={0.04}>4% (Setup)</option>
                <option value={0.065}>6.5% (Setup + Premium)</option>
                <option value={0.08}>8% (Normal)</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button onClick={() => setMaxWeight(1500)} className="rounded bg-surface-light px-2 py-1 hover:bg-amber-400/20 dark:bg-surface">Ox</button>
              <button onClick={() => setMaxWeight(3000)} className="rounded bg-surface-light px-2 py-1 hover:bg-amber-400/20 dark:bg-surface">Beetle</button>
              <button onClick={() => setMaxWeight(5000)} className="rounded bg-surface-light px-2 py-1 hover:bg-amber-400/20 dark:bg-surface">Mammoth</button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Sell Strategy</h2>
          <div className="grid gap-3">
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="radio"
                name="sellStrategy"
                checked={sellStrategy === 'sell_order'}
                onChange={() => setSellStrategy('sell_order')}
                className="mt-1 h-4 w-4"
              />
              <div>
                <span className={sellStrategy === 'sell_order' ? 'text-amber-400' : 'text-text1-light dark:text-text1'}>
                  Place Sell Order
                </span>
                <p className="text-xs text-muted">Match lowest sell price, wait for buyer</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="radio"
                name="sellStrategy"
                checked={sellStrategy === 'instant_sell'}
                onChange={() => setSellStrategy('instant_sell')}
                className="mt-1 h-4 w-4"
              />
              <div>
                <span className={sellStrategy === 'instant_sell' ? 'text-blue-400' : 'text-text1-light dark:text-text1'}>
                  Instant Sell
                </span>
                <p className="text-xs text-muted">Sell to highest buy order immediately</p>
              </div>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-4">
          <h2 className="mb-3 text-sm font-medium text-green-400">Optimal Load</h2>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-400">{optimalLoad.totalProfit.toLocaleString()}</div>
              <div className="text-xs text-muted-light dark:text-muted">Total Profit</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-text1-light dark:text-text1">{optimalLoad.usedWeight.toFixed(1)} kg</div>
              <div className="text-xs text-muted-light dark:text-muted">of {maxWeight} kg</div>
            </div>
          </div>
          <div className="space-y-1 text-xs">
            {optimalLoad.load.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-muted-light dark:text-muted">
                  {item.units}x {item.route.tierLabel} {item.route.materialName}
                </span>
                <span className="text-green-400">+{item.profit.toLocaleString()}</span>
              </div>
            ))}
            {optimalLoad.load.length > 5 && (
              <div className="text-muted-light dark:text-muted">+{optimalLoad.load.length - 5} more items...</div>
            )}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4">
        <h2 className="mb-2 text-sm font-medium text-blue-400">How the Calculator Works</h2>
        <div className="grid gap-2 text-xs text-muted-light dark:text-muted md:grid-cols-2">
          <div>
            <p className="font-medium text-text1-light dark:text-text1 mb-1">Max Units Calculation:</p>
            <p>Max Units = Floor(Carry Capacity / Item Weight)</p>
            <p className="mt-1">This is the maximum you <em>could</em> carry based on weight alone.</p>
          </div>
          <div>
            <p className="font-medium text-text1-light dark:text-text1 mb-1">Important Limitations:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Does NOT check if enough items are available to buy</li>
              <li>Does NOT verify buy order volume at destination</li>
              <li>Always verify market depth in-game before hauling</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Routes Table */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="mb-3">
          <h2 className="text-sm font-medium text-text1-light dark:text-text1">
            Profitable Routes ({routes.length})
          </h2>
          <p className="text-xs text-muted-light dark:text-muted">
            {fromCity} → {toCity} | Strategy: {sellStrategy === 'instant_sell' ? 'Instant Sell to Buy Orders' : 'Place Sell Order'} | Sorted by silver per kg
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light dark:border-border">
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Material</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-muted-light dark:text-muted">Tier</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-red-400">Buy @</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-amber-400" title="Lowest sell order at destination (your competition)">Dest Sell</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-blue-400" title="Highest buy order at destination (instant sell)">Dest Buy</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Profit/Unit</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Silver/kg</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted" title="Max units based on carry capacity">Max Units</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Max Profit</th>
              </tr>
            </thead>
            <tbody>
              {routes.slice(0, 50).map((route, idx) => (
                <tr key={idx} className="border-b border-border-light/50 dark:border-border/50">
                  <td className="px-2 py-2 text-text1-light dark:text-text1">{route.materialName}</td>
                  <td className="px-2 py-2 text-center">
                    <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-xs text-amber-300">
                      {route.tierLabel}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right text-red-400">{route.buyPrice.toLocaleString()}</td>
                  <td className="px-2 py-2 text-right text-amber-400">
                    {route.destSellPrice > 0 ? route.destSellPrice.toLocaleString() : '-'}
                  </td>
                  <td className="px-2 py-2 text-right text-blue-400">
                    {route.destBuyPrice > 0 ? route.destBuyPrice.toLocaleString() : '-'}
                  </td>
                  <td className="px-2 py-2 text-right text-text1-light dark:text-text1">
                    {route.profitPerUnit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-2 py-2 text-right font-bold text-green-400">
                    {route.profitPerWeight.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </td>
                  <td className="px-2 py-2 text-right text-muted-light dark:text-muted">{route.maxUnits}</td>
                  <td className="px-2 py-2 text-right text-green-400 font-bold">
                    {route.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {routes.length === 0 && (
          <div className="py-8 text-center text-muted-light dark:text-muted">
            No profitable routes found. Try a different city combination or sell strategy.
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-red-400 font-medium">Buy @</span>
          <span className="text-muted">Price to buy in source city (sell orders)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-medium">Dest Sell</span>
          <span className="text-muted">Lowest sell order at destination (competition)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-medium">Dest Buy</span>
          <span className="text-muted">Highest buy order at destination (instant sell)</span>
        </div>
      </div>
    </section>
  )
}
