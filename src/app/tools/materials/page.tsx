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

// Bonus cities for each material
const MATERIAL_BONUS_CITIES: Record<string, string> = {
  LEATHER: 'Martlock',
  CLOTH: 'Lymhurst',
  METALBAR: 'Thetford',
  PLANKS: 'Fort Sterling',
  STONEBLOCK: 'Bridgewatch',
}

const MATERIAL_TYPES = [
  { id: 'LEATHER', name: 'Leather', rawName: 'Hide', bonusCity: 'Martlock' },
  { id: 'CLOTH', name: 'Cloth', rawName: 'Fiber', bonusCity: 'Lymhurst' },
  { id: 'METALBAR', name: 'Metal Bar', rawName: 'Ore', bonusCity: 'Thetford' },
  { id: 'PLANKS', name: 'Planks', rawName: 'Wood', bonusCity: 'Fort Sterling' },
  { id: 'STONEBLOCK', name: 'Stone Block', rawName: 'Stone', bonusCity: 'Bridgewatch' },
]

const TIERS = [
  { tier: 4, enchants: [0, 1, 2, 3, 4] },
  { tier: 5, enchants: [0, 1, 2, 3, 4] },
  { tier: 6, enchants: [0, 1, 2, 3, 4] },
  { tier: 7, enchants: [0, 1, 2, 3, 4] },
  { tier: 8, enchants: [0, 1, 2, 3, 4] },
]

function getMaterialItemId(matType: string, tier: number, enchant: number): string {
  const baseId = `T${tier}_${matType}`
  if (enchant === 0) return baseId
  return `${baseId}_LEVEL${enchant}@${enchant}`
}

function getTierLabel(tier: number, enchant: number): string {
  if (enchant === 0) return `T${tier}`
  return `T${tier}.${enchant}`
}

interface PriceData {
  itemId: string
  city: string
  sellPrice: number
  buyPrice: number
  sellDate: string
  buyDate: string
}

interface HistoryDataPoint {
  itemCount: number
  avg: number
  timestamp: string
}

interface HistoryData {
  itemId: string
  city: string
  history: HistoryDataPoint[]
}

interface MaterialRow {
  tier: number
  enchant: number
  tierLabel: string
  itemId: string
  prices: Record<string, PriceData>
  lowestSellCity: string
  lowestSellPrice: number
  highestBuyCity: string
  highestBuyPrice: number
  spreadDiff: number
}

// Simple bar chart component for price history
function PriceChart({ data, label, color }: { data: HistoryDataPoint[], label: string, color: string }) {
  if (!data || data.length === 0) {
    return <div className="text-xs text-muted">No history data</div>
  }

  const maxAvg = Math.max(...data.map(d => d.avg))
  const minAvg = Math.min(...data.map(d => d.avg))
  const totalVolume = data.reduce((sum, d) => sum + d.itemCount, 0)
  const avgPrice = data.reduce((sum, d) => sum + d.avg * d.itemCount, 0) / totalVolume || 0

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-muted-light dark:text-muted">{label}</span>
        <span className="text-text1-light dark:text-text1">
          Avg: {Math.round(avgPrice).toLocaleString()} | Vol: {totalVolume.toLocaleString()}
        </span>
      </div>
      <div className="flex items-end gap-0.5 h-16">
        {data.slice(-14).map((point, idx) => {
          const height = maxAvg > minAvg ? ((point.avg - minAvg) / (maxAvg - minAvg)) * 100 : 50
          return (
            <div
              key={idx}
              className="flex-1 min-w-1 rounded-t transition-all hover:opacity-80"
              style={{
                height: `${Math.max(10, height)}%`,
                backgroundColor: color,
              }}
              title={`${new Date(point.timestamp).toLocaleDateString()}: ${Math.round(point.avg).toLocaleString()} (${point.itemCount} items)`}
            />
          )
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted">
        <span>{data.length > 0 ? new Date(data[Math.max(0, data.length - 14)].timestamp).toLocaleDateString() : ''}</span>
        <span>{data.length > 0 ? new Date(data[data.length - 1].timestamp).toLocaleDateString() : ''}</span>
      </div>
    </div>
  )
}

type DisplayMode = 'sell' | 'buy' | 'both' | 'spread'

export default function MaterialPriceFinderPage() {
  const [server, setServer] = useState('Americas')
  const [materialType, setMaterialType] = useState('METALBAR')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [priceData, setPriceData] = useState<Record<string, PriceData>>({})
  const [historyData, setHistoryData] = useState<Record<string, HistoryData>>({})
  const [displayMode, setDisplayMode] = useState<DisplayMode>('both')
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  const selectedMaterial = MATERIAL_TYPES.find(m => m.id === materialType)
  const bonusCity = selectedMaterial?.bonusCity || ''

  // Fetch prices from API
  const fetchPrices = useCallback(async () => {
    setIsLoading(true)
    try {
      const apiBase = SERVER_API_ENDPOINTS[server]

      // Build list of all item IDs for this material
      const itemIds: string[] = []
      for (const { tier, enchants } of TIERS) {
        for (const enchant of enchants) {
          itemIds.push(getMaterialItemId(materialType, tier, enchant))
        }
      }

      // Fetch current prices
      const priceResponse = await fetch(
        `${apiBase}/api/v2/stats/prices/${itemIds.join(',')}?locations=${CITIES.join(',')}&qualities=1`
      )
      const data = await priceResponse.json()

      const newPriceData: Record<string, PriceData> = {}
      for (const item of data) {
        const key = `${item.item_id}_${item.city}`
        newPriceData[key] = {
          itemId: item.item_id,
          city: item.city,
          sellPrice: item.sell_price_min || 0,
          buyPrice: item.buy_price_max || 0,
          sellDate: item.sell_price_min_date || '',
          buyDate: item.buy_price_max_date || '',
        }
      }
      setPriceData(newPriceData)

      // Fetch history data for the bonus city
      const historyResponse = await fetch(
        `${apiBase}/api/v2/stats/history/${itemIds.join(',')}?locations=${bonusCity}&time-scale=6`
      )
      const histData = await historyResponse.json()

      const newHistoryData: Record<string, HistoryData> = {}
      for (const item of histData) {
        const key = `${item.item_id}_${item.location}`
        newHistoryData[key] = {
          itemId: item.item_id,
          city: item.location,
          history: item.data || [],
        }
      }
      setHistoryData(newHistoryData)

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    } finally {
      setIsLoading(false)
    }
  }, [server, materialType, bonusCity])

  // Auto-fetch on mount and when material/server changes
  useEffect(() => {
    fetchPrices()
  }, [materialType, server]) // eslint-disable-line react-hooks/exhaustive-deps

  // Process price data into rows
  const rows: MaterialRow[] = useMemo(() => {
    const result: MaterialRow[] = []

    for (const { tier, enchants } of TIERS) {
      for (const enchant of enchants) {
        const itemId = getMaterialItemId(materialType, tier, enchant)
        const tierLabel = getTierLabel(tier, enchant)

        const prices: Record<string, PriceData> = {}
        let lowestSellPrice = Infinity
        let lowestSellCity = ''
        let highestBuyPrice = 0
        let highestBuyCity = ''

        for (const city of CITIES) {
          const key = `${itemId}_${city}`
          const data = priceData[key]
          if (data) {
            prices[city] = data

            // Track lowest sell price
            if (data.sellPrice > 0 && data.sellPrice < lowestSellPrice) {
              lowestSellPrice = data.sellPrice
              lowestSellCity = city
            }

            // Track highest buy price
            if (data.buyPrice > highestBuyPrice) {
              highestBuyPrice = data.buyPrice
              highestBuyCity = city
            }
          }
        }

        result.push({
          tier,
          enchant,
          tierLabel,
          itemId,
          prices,
          lowestSellCity,
          lowestSellPrice: lowestSellPrice === Infinity ? 0 : lowestSellPrice,
          highestBuyCity,
          highestBuyPrice,
          spreadDiff: (lowestSellPrice !== Infinity && highestBuyPrice > 0)
            ? lowestSellPrice - highestBuyPrice
            : 0,
        })
      }
    }

    return result
  }, [priceData, materialType])

  // Get cell styling based on price comparison
  const getCellStyle = (city: string, row: MaterialRow, isBuy: boolean) => {
    if (isBuy) {
      if (city === row.highestBuyCity && row.highestBuyPrice > 0) {
        return 'bg-blue-500/20 text-blue-400 font-bold'
      }
    } else {
      if (city === row.lowestSellCity && row.lowestSellPrice > 0) {
        return 'bg-green-500/20 text-green-400 font-bold'
      }
    }
    return ''
  }

  // Format price cell content
  const formatPriceCell = (data: PriceData | undefined, mode: DisplayMode) => {
    if (!data) return <span className="text-muted">-</span>

    const sell = data.sellPrice
    const buy = data.buyPrice

    switch (mode) {
      case 'sell':
        return sell > 0 ? sell.toLocaleString() : '-'
      case 'buy':
        return buy > 0 ? buy.toLocaleString() : '-'
      case 'spread':
        if (sell > 0 && buy > 0) {
          const spread = sell - buy
          return (
            <span className={spread > 0 ? 'text-green-400' : 'text-red-400'}>
              {spread > 0 ? '+' : ''}{spread.toLocaleString()}
            </span>
          )
        }
        return '-'
      case 'both':
      default:
        return (
          <div className="flex flex-col text-xs leading-tight">
            <span className={sell > 0 ? '' : 'text-muted'}>{sell > 0 ? sell.toLocaleString() : '-'}</span>
            <span className={`text-blue-400 ${buy > 0 ? '' : 'opacity-50'}`}>{buy > 0 ? buy.toLocaleString() : '-'}</span>
          </div>
        )
    }
  }

  // Get history for selected tier in bonus city
  const selectedHistory = selectedTier
    ? historyData[`${selectedTier}_${bonusCity}`]?.history || []
    : []

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">
            Material Price Finder
          </h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Compare material prices across all cities. Green = lowest sell, Blue = highest buy order.
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
          className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-amber-300"
        >
          MATERIALS
        </Link>
        <Link
          href="/tools/transport"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
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

      {/* Settings and Chart Panel */}
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Settings</h2>
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
              <label className="text-xs text-muted-light dark:text-muted">Material</label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                {MATERIAL_TYPES.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Display Mode</label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value as DisplayMode)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                <option value="both">Sell / Buy Orders</option>
                <option value="sell">Sell Orders Only</option>
                <option value="buy">Buy Orders Only</option>
                <option value="spread">Spread (Sell - Buy)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Price History Chart in Bonus City */}
        <div className="rounded-2xl border border-amber-400/50 bg-amber-400/5 p-4 lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-amber-300">
              {selectedMaterial?.name} Price History - {bonusCity}
              <span className="ml-2 text-xs text-muted">(Bonus City +15% RRR)</span>
            </h2>
            {selectedTier && (
              <span className="rounded bg-amber-400/20 px-2 py-1 text-xs text-amber-300">
                {rows.find(r => r.itemId === selectedTier)?.tierLabel || selectedTier}
              </span>
            )}
          </div>

          {selectedTier ? (
            <PriceChart
              data={selectedHistory}
              label="14-Day Price History"
              color="rgba(251, 191, 36, 0.6)"
            />
          ) : (
            <div className="flex items-center justify-center h-24 text-muted">
              Click a tier row to view price history
            </div>
          )}

          {/* Quick stats for bonus city */}
          {selectedTier && selectedHistory.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
              <div className="rounded bg-surface-light dark:bg-surface p-2">
                <div className="text-muted">Min Price</div>
                <div className="text-text1-light dark:text-text1 font-medium">
                  {Math.round(Math.min(...selectedHistory.map(h => h.avg))).toLocaleString()}
                </div>
              </div>
              <div className="rounded bg-surface-light dark:bg-surface p-2">
                <div className="text-muted">Max Price</div>
                <div className="text-text1-light dark:text-text1 font-medium">
                  {Math.round(Math.max(...selectedHistory.map(h => h.avg))).toLocaleString()}
                </div>
              </div>
              <div className="rounded bg-surface-light dark:bg-surface p-2">
                <div className="text-muted">Avg Price</div>
                <div className="text-text1-light dark:text-text1 font-medium">
                  {Math.round(selectedHistory.reduce((sum, h) => sum + h.avg, 0) / selectedHistory.length).toLocaleString()}
                </div>
              </div>
              <div className="rounded bg-surface-light dark:bg-surface p-2">
                <div className="text-muted">Total Volume</div>
                <div className="text-text1-light dark:text-text1 font-medium">
                  {selectedHistory.reduce((sum, h) => sum + h.itemCount, 0).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price Table */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-muted">
            {displayMode === 'both' && 'Top: Sell Order (Instant Buy) | Bottom: Buy Order (Instant Sell)'}
            {displayMode === 'sell' && 'Showing: Sell Orders (price to buy instantly)'}
            {displayMode === 'buy' && 'Showing: Buy Orders (price to sell instantly)'}
            {displayMode === 'spread' && 'Showing: Price Spread (Sell - Buy)'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light dark:border-border">
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Tier</th>
                {CITIES.map((city) => (
                  <th
                    key={city}
                    className={`px-2 py-2 text-right text-xs font-medium ${city === bonusCity ? 'text-amber-400' : 'text-muted-light dark:text-muted'}`}
                  >
                    {city.split(' ')[0]}
                  </th>
                ))}
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Best</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.tierLabel}
                  onClick={() => setSelectedTier(row.itemId)}
                  className={`border-b border-border-light/50 dark:border-border/50 cursor-pointer hover:bg-amber-400/5 ${selectedTier === row.itemId ? 'bg-amber-400/10' : ''}`}
                >
                  <td className="px-2 py-2">
                    <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-xs text-amber-300">
                      {row.tierLabel}
                    </span>
                  </td>
                  {CITIES.map((city) => {
                    const data = row.prices[city]
                    const sellStyle = getCellStyle(city, row, false)
                    const buyStyle = getCellStyle(city, row, true)

                    return (
                      <td
                        key={city}
                        className={`px-2 py-2 text-right ${displayMode === 'sell' ? sellStyle : displayMode === 'buy' ? buyStyle : ''}`}
                      >
                        {displayMode === 'both' && data ? (
                          <div className="flex flex-col text-xs leading-tight">
                            <span className={sellStyle}>{data.sellPrice > 0 ? data.sellPrice.toLocaleString() : '-'}</span>
                            <span className={`text-blue-400 ${buyStyle}`}>{data.buyPrice > 0 ? data.buyPrice.toLocaleString() : '-'}</span>
                          </div>
                        ) : (
                          formatPriceCell(data, displayMode)
                        )}
                      </td>
                    )
                  })}
                  <td className="px-2 py-2 text-right text-xs">
                    <div className="flex flex-col">
                      {row.lowestSellPrice > 0 && (
                        <span className="text-green-400">{row.lowestSellCity.split(' ')[0]}</span>
                      )}
                      {row.highestBuyPrice > 0 && (
                        <span className="text-blue-400">{row.highestBuyCity.split(' ')[0]}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-green-500/20"></div>
          <span className="text-muted-light dark:text-muted">Lowest Sell Order (Buy Here)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-500/20"></div>
          <span className="text-muted-light dark:text-muted">Highest Buy Order (Sell Here)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-amber-400/20"></div>
          <span className="text-muted-light dark:text-muted">Bonus City (+15% RRR for refining)</span>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <h3 className="mb-2 text-sm font-medium text-text1-light dark:text-text1">Understanding the Data</h3>
        <div className="grid gap-2 text-xs text-muted-light dark:text-muted">
          <p>
            <span className="font-medium text-text1-light dark:text-text1">Sell Orders (top)</span> - The price to buy materials instantly from the market.
          </p>
          <p>
            <span className="font-medium text-blue-400">Buy Orders (bottom)</span> - The price you&apos;ll get if you sell materials instantly to existing orders.
          </p>
          <p>
            <span className="font-medium text-amber-400">Bonus City</span> - Refining in this city gives +15% resource return rate for this material.
          </p>
          <p>
            <span className="font-medium">Spread</span> - The difference between sell and buy prices. Larger spreads = more profit potential for market makers.
          </p>
        </div>
      </div>
    </section>
  )
}
