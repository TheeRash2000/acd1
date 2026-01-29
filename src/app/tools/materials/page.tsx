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

interface MaterialRow {
  tier: number
  enchant: number
  tierLabel: string
  prices: Record<string, PriceData>
  lowestCity: string
  lowestPrice: number
  highestCity: string
  highestPrice: number
  priceDiff: number
}

export default function MaterialPriceFinderPage() {
  const [server, setServer] = useState('Americas')
  const [materialType, setMaterialType] = useState('METALBAR')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [priceData, setPriceData] = useState<Record<string, PriceData>>({})
  const [showBuyOrders, setShowBuyOrders] = useState(false)

  const selectedMaterial = MATERIAL_TYPES.find(m => m.id === materialType)

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
          sellDate: item.sell_price_min_date || '',
          buyDate: item.buy_price_max_date || '',
        }
      }
      setPriceData(newPriceData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    } finally {
      setIsLoading(false)
    }
  }, [server, materialType])

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
        let lowestPrice = Infinity
        let lowestCity = ''
        let highestPrice = 0
        let highestCity = ''

        for (const city of CITIES) {
          const key = `${itemId}_${city}`
          const data = priceData[key]
          if (data) {
            prices[city] = data
            const price = showBuyOrders ? data.buyPrice : data.sellPrice
            if (price > 0 && price < lowestPrice) {
              lowestPrice = price
              lowestCity = city
            }
            if (price > highestPrice) {
              highestPrice = price
              highestCity = city
            }
          }
        }

        result.push({
          tier,
          enchant,
          tierLabel,
          prices,
          lowestCity,
          lowestPrice: lowestPrice === Infinity ? 0 : lowestPrice,
          highestCity,
          highestPrice,
          priceDiff: highestPrice - (lowestPrice === Infinity ? 0 : lowestPrice),
        })
      }
    }

    return result
  }, [priceData, materialType, showBuyOrders])

  // Get cell color based on if it's lowest/highest
  const getCellColor = (city: string, row: MaterialRow) => {
    if (city === row.lowestCity && row.lowestPrice > 0) return 'bg-green-500/20 text-green-400 font-bold'
    if (city === row.highestCity && row.highestPrice > 0) return 'bg-red-500/10 text-red-400'
    return ''
  }

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">
            Material Price Finder
          </h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Compare material prices across all cities to find the best deals.
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

      {/* Settings */}
      <div className="grid gap-4 md:grid-cols-4">
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
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showBuyOrders}
                onChange={(e) => setShowBuyOrders(e.target.checked)}
                className="h-4 w-4"
              />
              <span className={showBuyOrders ? 'text-blue-400' : 'text-muted-light dark:text-muted'}>
                Show Buy Orders
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface md:col-span-3">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">
            {selectedMaterial?.name} - Bonus City: <span className="text-amber-400">{selectedMaterial?.bonusCity}</span>
          </h2>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {CITIES.map((city) => (
              <div
                key={city}
                className={`rounded p-2 ${city === selectedMaterial?.bonusCity ? 'bg-amber-400/20 text-amber-300 font-bold' : 'bg-surface-light dark:bg-surface text-muted-light dark:text-muted'}`}
              >
                {city}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Price Table */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light dark:border-border">
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Tier</th>
                {CITIES.map((city) => (
                  <th
                    key={city}
                    className={`px-2 py-2 text-right text-xs font-medium ${city === selectedMaterial?.bonusCity ? 'text-amber-400' : 'text-muted-light dark:text-muted'}`}
                  >
                    {city.split(' ')[0]}
                  </th>
                ))}
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Diff</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.tierLabel} className="border-b border-border-light/50 dark:border-border/50">
                  <td className="px-2 py-2">
                    <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-xs text-amber-300">
                      {row.tierLabel}
                    </span>
                  </td>
                  {CITIES.map((city) => {
                    const data = row.prices[city]
                    const price = showBuyOrders ? data?.buyPrice : data?.sellPrice
                    return (
                      <td key={city} className={`px-2 py-2 text-right ${getCellColor(city, row)}`}>
                        {price && price > 0 ? price.toLocaleString() : '-'}
                      </td>
                    )
                  })}
                  <td className="px-2 py-2 text-right">
                    {row.priceDiff > 0 ? (
                      <span className="text-green-400">+{row.priceDiff.toLocaleString()}</span>
                    ) : '-'}
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
          <span className="text-muted-light dark:text-muted">Lowest Price (Buy Here)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-red-500/10"></div>
          <span className="text-muted-light dark:text-muted">Highest Price</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-amber-400/20"></div>
          <span className="text-muted-light dark:text-muted">Bonus City (+15% RRR)</span>
        </div>
      </div>
    </section>
  )
}
