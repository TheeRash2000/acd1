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
  'Black Market',
]

// Popular items for flipping
const ITEM_CATEGORIES = [
  {
    name: 'Weapons - Swords',
    items: ['MAIN_SWORD', '2H_CLAYMORE', '2H_DUALSWORD', 'MAIN_SCIMITAR_MORGANA', '2H_CLEAVER_HELL', '2H_DUAL_SWORD_AVALON'],
  },
  {
    name: 'Weapons - Axes',
    items: ['MAIN_AXE', '2H_AXE', '2H_HALBERD', '2H_HALBERD_MORGANA', '2H_SCYTHE_HELL', '2H_AXE_AVALON'],
  },
  {
    name: 'Weapons - Maces',
    items: ['MAIN_MACE', '2H_MACE', '2H_FLAIL', '2H_DUALMACE', '2H_MACE_MORGANA', '2H_FLAIL_HELL'],
  },
  {
    name: 'Weapons - Bows',
    items: ['2H_BOW', '2H_WARBOW', '2H_LONGBOW', '2H_LONGBOW_UNDEAD', '2H_BOW_HELL', '2H_BOW_AVALON'],
  },
  {
    name: 'Weapons - Crossbows',
    items: ['2H_CROSSBOW', '2H_CROSSBOWLARGE', 'MAIN_1HCROSSBOW', '2H_REPEATINGCROSSBOW_UNDEAD', '2H_DUALCROSSBOW_HELL'],
  },
  {
    name: 'Weapons - Staves',
    items: ['MAIN_FIRESTAFF', '2H_FIRESTAFF', '2H_INFERNOSTAFF', 'MAIN_FROSTSTAFF', '2H_FROSTSTAFF', '2H_GLACIALSTAFF'],
  },
  {
    name: 'Armor - Plate',
    items: ['HEAD_PLATE_SET1', 'ARMOR_PLATE_SET1', 'SHOES_PLATE_SET1', 'HEAD_PLATE_SET2', 'ARMOR_PLATE_SET2', 'SHOES_PLATE_SET2'],
  },
  {
    name: 'Armor - Leather',
    items: ['HEAD_LEATHER_SET1', 'ARMOR_LEATHER_SET1', 'SHOES_LEATHER_SET1', 'HEAD_LEATHER_SET2', 'ARMOR_LEATHER_SET2', 'SHOES_LEATHER_SET2'],
  },
  {
    name: 'Armor - Cloth',
    items: ['HEAD_CLOTH_SET1', 'ARMOR_CLOTH_SET1', 'SHOES_CLOTH_SET1', 'HEAD_CLOTH_SET2', 'ARMOR_CLOTH_SET2', 'SHOES_CLOTH_SET2'],
  },
]

const TIERS = [4, 5, 6, 7, 8]
const ENCHANTS = [0, 1, 2, 3, 4]

function getItemId(baseId: string, tier: number, enchant: number): string {
  const itemId = `T${tier}_${baseId}`
  return enchant > 0 ? `${itemId}@${enchant}` : itemId
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
}

interface FlipOpportunity {
  itemId: string
  baseId: string
  tier: number
  enchant: number
  tierLabel: string
  buyCity: string
  sellCity: string
  buyPrice: number
  sellPrice: number
  profit: number
  profitPercent: number
}

export default function ItemFlipperPage() {
  const [server, setServer] = useState('Americas')
  const [selectedCategory, setSelectedCategory] = useState(0)
  const [customItems, setCustomItems] = useState('')
  const [tier, setTier] = useState(6)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [priceData, setPriceData] = useState<Record<string, PriceData>>({})
  const [taxRate, setTaxRate] = useState(0.065)
  const [minProfit, setMinProfit] = useState(10000)

  const currentItems = customItems.trim()
    ? customItems.split(',').map(s => s.trim().toUpperCase())
    : ITEM_CATEGORIES[selectedCategory].items

  // Fetch prices from API
  const fetchPrices = useCallback(async () => {
    setIsLoading(true)
    try {
      const apiBase = SERVER_API_ENDPOINTS[server]

      // Build list of all item IDs
      const itemIds: string[] = []
      for (const baseId of currentItems) {
        for (const t of TIERS) {
          for (const e of ENCHANTS) {
            itemIds.push(getItemId(baseId, t, e))
          }
        }
      }

      // Fetch in batches to avoid URL length limits
      const batchSize = 100
      const allPriceData: Record<string, PriceData> = {}

      for (let i = 0; i < itemIds.length; i += batchSize) {
        const batch = itemIds.slice(i, i + batchSize)
        const response = await fetch(
          `${apiBase}/api/v2/stats/prices/${batch.join(',')}?locations=${CITIES.join(',')}&qualities=1,2,3`
        )
        const data = await response.json()

        for (const item of data) {
          const key = `${item.item_id}_${item.city}`
          allPriceData[key] = {
            itemId: item.item_id,
            city: item.city,
            sellPrice: item.sell_price_min || 0,
            buyPrice: item.buy_price_max || 0,
          }
        }
      }

      setPriceData(allPriceData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    } finally {
      setIsLoading(false)
    }
  }, [server, currentItems])

  // Auto-fetch on mount
  useEffect(() => {
    fetchPrices()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Find flip opportunities
  const opportunities: FlipOpportunity[] = useMemo(() => {
    const result: FlipOpportunity[] = []

    for (const baseId of currentItems) {
      for (const t of TIERS) {
        for (const e of ENCHANTS) {
          const itemId = getItemId(baseId, t, e)
          const tierLabel = getTierLabel(t, e)

          // Find best buy and sell prices across cities
          let bestBuyCity = ''
          let bestBuyPrice = Infinity
          let bestSellCity = ''
          let bestSellPrice = 0

          for (const city of CITIES) {
            const key = `${itemId}_${city}`
            const data = priceData[key]
            if (!data) continue

            // Black Market: Can only SELL TO, not buy from
            if (city === 'Black Market') {
              // For selling to BM, use buy price (what BM will pay)
              if (data.buyPrice > bestSellPrice) {
                bestSellPrice = data.buyPrice
                bestSellCity = city
              }
            } else {
              // For buying, use sell price (instant buy) - not from BM
              if (data.sellPrice > 0 && data.sellPrice < bestBuyPrice) {
                bestBuyPrice = data.sellPrice
                bestBuyCity = city
              }

              // For selling to regular market, use sell price (what we can list at)
              if (data.sellPrice > bestSellPrice) {
                bestSellPrice = data.sellPrice
                bestSellCity = city
              }
            }
          }

          if (bestBuyPrice === Infinity || bestSellPrice === 0) continue
          if (bestBuyCity === bestSellCity) continue

          // No tax when selling to Black Market (instant sell to buy order)
          const isSellingToBM = bestSellCity === 'Black Market'
          const sellAfterTax = isSellingToBM ? bestSellPrice : bestSellPrice * (1 - taxRate)
          const profit = sellAfterTax - bestBuyPrice

          if (profit < minProfit) continue

          const profitPercent = (profit / bestBuyPrice) * 100

          result.push({
            itemId,
            baseId,
            tier: t,
            enchant: e,
            tierLabel,
            buyCity: bestBuyCity,
            sellCity: bestSellCity,
            buyPrice: bestBuyPrice,
            sellPrice: bestSellPrice,
            profit,
            profitPercent,
          })
        }
      }
    }

    // Sort by profit
    result.sort((a, b) => b.profit - a.profit)

    return result
  }, [priceData, currentItems, taxRate, minProfit])

  // Get item name from ID (simplified)
  const getItemName = (baseId: string): string => {
    return baseId
      .replace(/_/g, ' ')
      .replace(/2H /g, '')
      .replace(/MAIN /g, '')
      .split(' ')
      .map(w => w.charAt(0) + w.slice(1).toLowerCase())
      .join(' ')
  }

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">
            Item Flipper
          </h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Find profitable items to buy low in one city and sell high in another.
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
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          TRANSPORT
        </Link>
        <Link
          href="/tools/flipper"
          className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-amber-300"
        >
          FLIPPER
        </Link>
        <Link
          href="/tools/blackmarket"
          className="rounded border border-red-400/50 px-3 py-1 text-red-300 hover:bg-red-400/10"
        >
          BLACK MARKET
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
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Min Profit</label>
              <input
                type="number"
                value={minProfit}
                onChange={(e) => setMinProfit(parseInt(e.target.value) || 0)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface md:col-span-2">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Item Category</h2>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(parseInt(e.target.value))}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                {ITEM_CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={idx}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Custom Items (comma-separated IDs)</label>
              <input
                type="text"
                value={customItems}
                onChange={(e) => setCustomItems(e.target.value)}
                placeholder="e.g. MAIN_SWORD, 2H_CLAYMORE"
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-4">
          <h2 className="mb-3 text-sm font-medium text-green-400">Summary</h2>
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-green-400">{opportunities.length}</div>
              <div className="text-xs text-muted-light dark:text-muted">Flip Opportunities</div>
            </div>
            {opportunities.length > 0 && (
              <div>
                <div className="text-xl font-bold text-text1-light dark:text-text1">
                  {opportunities[0].profit.toLocaleString()}
                </div>
                <div className="text-xs text-muted-light dark:text-muted">Best Profit</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="mb-3">
          <h2 className="text-sm font-medium text-text1-light dark:text-text1">
            Flip Opportunities ({opportunities.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light dark:border-border">
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Item</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-muted-light dark:text-muted">Tier</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Buy City</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Buy Price</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Sell City</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Sell Price</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Profit</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">ROI</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.slice(0, 50).map((opp, idx) => (
                <tr key={idx} className="border-b border-border-light/50 dark:border-border/50">
                  <td className="px-2 py-2 text-text1-light dark:text-text1">{getItemName(opp.baseId)}</td>
                  <td className="px-2 py-2 text-center">
                    <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-xs text-amber-300">
                      {opp.tierLabel}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-red-400">{opp.buyCity}</td>
                  <td className="px-2 py-2 text-right text-red-400">{opp.buyPrice.toLocaleString()}</td>
                  <td className="px-2 py-2 text-green-400">{opp.sellCity}</td>
                  <td className="px-2 py-2 text-right text-green-400">{opp.sellPrice.toLocaleString()}</td>
                  <td className="px-2 py-2 text-right font-bold text-green-400">
                    +{opp.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <span className={opp.profitPercent > 20 ? 'text-green-400 font-bold' : 'text-text1-light dark:text-text1'}>
                      {opp.profitPercent.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {opportunities.length === 0 && !isLoading && (
          <div className="py-8 text-center text-muted-light dark:text-muted">
            No flip opportunities found. Try lowering minimum profit or selecting different items.
          </div>
        )}

        {isLoading && (
          <div className="py-8 text-center text-muted-light dark:text-muted">
            Loading prices...
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <h2 className="mb-2 text-sm font-medium text-text1-light dark:text-text1">Tips</h2>
        <ul className="space-y-1 text-xs text-muted-light dark:text-muted">
          <li>- Black Market prices can be very profitable but fluctuate rapidly</li>
          <li>- Higher tier items have larger margins but require more capital</li>
          <li>- Check price history before committing to large flips</li>
          <li>- Consider transport time and risk when calculating profits</li>
        </ul>
      </div>
    </section>
  )
}
