'use client'

import Link from 'next/link'
import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  GEAR_RECIPES,
  CATEGORY_NAMES,
  getGearItemId,
  getMaterialItemId,
  type GearCategory,
  type GearItemType,
} from '@/lib/crafting/gear-data'
import {
  calculateRRR,
  PRODUCTION_BONUSES,
} from '@/constants/crafting-bonuses'

// Server to API endpoint mapping
const SERVER_API_ENDPOINTS: Record<string, string> = {
  'Americas': 'https://west.albion-online-data.com',
  'Europe': 'https://europe.albion-online-data.com',
  'Asia': 'https://east.albion-online-data.com',
}

const SERVERS = ['Americas', 'Europe', 'Asia']

const CRAFT_CITIES = [
  'Bridgewatch',
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford',
  'Caerleon',
]

const ROYAL_CITIES = ['Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford']

interface BlackMarketItem {
  recipe: typeof GEAR_RECIPES[0]
  itemId: string
  bmBuyPrice: number
  bmBuyOrderCount: number
  craftCost: number
  profit: number
  profitPercent: number
  isProfitable: boolean
  isInBonusCity: boolean
  effectiveRRR: number
}

export default function BlackMarketFlipperPage() {
  const [server, setServer] = useState('Americas')
  const [materialCity, setMaterialCity] = useState('Caerleon')
  const [craftCity, setCraftCity] = useState('Caerleon')
  const [tier, setTier] = useState(6)
  const [enchant, setEnchant] = useState(0)
  const [useFocus, setUseFocus] = useState(true)
  const [stationFee, setStationFee] = useState(0)
  const [filterCategory, setFilterCategory] = useState<'all' | GearCategory>('all')
  const [filterItemType, setFilterItemType] = useState<'all' | GearItemType>('all')
  const [filterProfitableOnly, setFilterProfitableOnly] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const [bmPrices, setBmPrices] = useState<Record<string, { buyPrice: number; buyCount: number }>>({})
  const [materialPrices, setMaterialPrices] = useState<Record<string, number>>({})
  const [artifactPrices, setArtifactPrices] = useState<Record<string, number>>({})

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
        gearIds.push(getGearItemId(recipe.id, tier, enchant))

        if (recipe.primaryMat) {
          materialIds.add(getMaterialItemId(recipe.primaryMat, tier, enchant))
        }
        if (recipe.secondaryMat) {
          materialIds.add(getMaterialItemId(recipe.secondaryMat, tier, enchant))
        }

        if (recipe.artifactId) {
          artifactIds.add(recipe.artifactId)
          if (recipe.artifactHearts > 0) {
            artifactIds.add('QUESTITEM_TOKEN_AVALON')
          }
        }
      }

      // Fetch Black Market buy orders (we want buy_price_max which is what BM will pay)
      const bmResponse = await fetch(
        `${apiBase}/api/v2/stats/prices/${gearIds.join(',')}?locations=Black Market&qualities=1`
      )
      const bmData = await bmResponse.json()

      const newBmPrices: Record<string, { buyPrice: number; buyCount: number }> = {}
      for (const item of bmData) {
        if (item.buy_price_max > 0) {
          newBmPrices[item.item_id] = {
            buyPrice: item.buy_price_max,
            buyCount: item.buy_price_max_date ? 1 : 0, // Simplified
          }
        }
      }
      setBmPrices(newBmPrices)

      // Fetch material prices from material city
      const materialResponse = await fetch(
        `${apiBase}/api/v2/stats/prices/${Array.from(materialIds).join(',')}?locations=${materialCity}&qualities=1`
      )
      const materialData = await materialResponse.json()

      const newMaterialPrices: Record<string, number> = {}
      for (const item of materialData) {
        if (item.sell_price_min > 0) {
          newMaterialPrices[item.item_id] = item.sell_price_min
        }
      }
      setMaterialPrices(newMaterialPrices)

      // Fetch artifact prices
      if (artifactIds.size > 0) {
        const artifactResponse = await fetch(
          `${apiBase}/api/v2/stats/prices/${Array.from(artifactIds).join(',')}?locations=${materialCity}&qualities=1`
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
  }, [server, materialCity, tier, enchant])

  // Auto-fetch on mount
  useEffect(() => {
    fetchPrices()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate items
  const items: BlackMarketItem[] = useMemo(() => {
    const result: BlackMarketItem[] = []

    // Calculate base RRR
    let baseBonus = PRODUCTION_BONUSES.ROYAL_CITY_BASE
    if (useFocus) {
      baseBonus += PRODUCTION_BONUSES.FOCUS_BONUS
    }

    for (const recipe of GEAR_RECIPES) {
      if (filterCategory !== 'all' && recipe.category !== filterCategory) continue
      if (filterItemType !== 'all' && recipe.itemType !== filterItemType) continue

      const itemId = getGearItemId(recipe.id, tier, enchant)
      const bmData = bmPrices[itemId]

      if (!bmData || bmData.buyPrice <= 0) continue

      // Check if crafting in bonus city
      const isInBonusCity = craftCity === recipe.bonusCity && ROYAL_CITIES.includes(craftCity)
      const totalBonus = isInBonusCity ? baseBonus + (PRODUCTION_BONUSES.CRAFTING_SPECIALTY || 0.15) : baseBonus
      const effectiveRRR = calculateRRR(Math.max(0, totalBonus))

      // Calculate material cost
      let materialCost = 0
      if (recipe.primaryMat) {
        const matId = getMaterialItemId(recipe.primaryMat, tier, enchant)
        const price = materialPrices[matId] || 0
        materialCost += price * recipe.primaryQty
      }
      if (recipe.secondaryMat) {
        const matId = getMaterialItemId(recipe.secondaryMat, tier, enchant)
        const price = materialPrices[matId] || 0
        materialCost += price * recipe.secondaryQty
      }

      // Apply RRR
      materialCost = materialCost * (1 - effectiveRRR)

      // Artifact cost
      let artifactCost = 0
      if (recipe.artifactId) {
        const artifactPrice = artifactPrices[recipe.artifactId] || 0
        artifactCost += artifactPrice * recipe.artifactQty

        if (recipe.artifactHearts > 0) {
          const heartsPrice = artifactPrices['QUESTITEM_TOKEN_AVALON'] || 0
          artifactCost += heartsPrice * recipe.artifactHearts
        }
      }

      const craftCost = materialCost + artifactCost + stationFee
      const profit = bmData.buyPrice - craftCost
      const profitPercent = craftCost > 0 ? (profit / craftCost) * 100 : 0
      const isProfitable = profit > 0

      if (filterProfitableOnly && !isProfitable) continue

      result.push({
        recipe,
        itemId,
        bmBuyPrice: bmData.buyPrice,
        bmBuyOrderCount: bmData.buyCount,
        craftCost,
        profit,
        profitPercent,
        isProfitable,
        isInBonusCity,
        effectiveRRR,
      })
    }

    // Sort by profit
    result.sort((a, b) => b.profit - a.profit)

    return result
  }, [bmPrices, materialPrices, artifactPrices, tier, enchant, craftCity, useFocus, stationFee, filterCategory, filterItemType, filterProfitableOnly])

  const totalPotentialProfit = items.reduce((sum, item) => sum + (item.isProfitable ? item.profit : 0), 0)

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">
            Black Market Flipper
          </h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Find profitable items to craft and sell to the Black Market.
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
          href="/tools/flipper"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          FLIPPER
        </Link>
        <Link
          href="/tools/blackmarket"
          className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-amber-300"
        >
          BLACK MARKET
        </Link>
        <Link
          href="/tools/history"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          HISTORY
        </Link>
        <Link
          href="/tools"
          className="ml-auto rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          All Tools
        </Link>
      </nav>

      {/* Settings */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Server</h2>
          <select
            value={server}
            onChange={(e) => setServer(e.target.value)}
            className="w-full rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
          >
            {SERVERS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Cities</h2>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Buy Materials</label>
              <select
                value={materialCity}
                onChange={(e) => setMaterialCity(e.target.value)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                {CRAFT_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Craft In</label>
              <select
                value={craftCity}
                onChange={(e) => setCraftCity(e.target.value)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                {CRAFT_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Item</h2>
          <div className="grid gap-2">
            <div className="flex gap-2">
              <div className="grid flex-1 gap-1">
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
              <div className="grid flex-1 gap-1">
                <label className="text-xs text-muted-light dark:text-muted">Enchant</label>
                <select
                  value={enchant}
                  onChange={(e) => setEnchant(parseInt(e.target.value))}
                  className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
                >
                  {[0, 1, 2, 3].map((e) => (
                    <option key={e} value={e}>{e === 0 ? '.0' : `.${e}`}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Station Fee</label>
              <input
                type="number"
                value={stationFee}
                onChange={(e) => setStationFee(parseInt(e.target.value) || 0)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Options</h2>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useFocus}
                onChange={(e) => setUseFocus(e.target.checked)}
                className="h-4 w-4"
              />
              <span className={useFocus ? 'text-blue-400' : 'text-muted-light dark:text-muted'}>
                Use Focus (+43.5% RRR)
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filterProfitableOnly}
                onChange={(e) => setFilterProfitableOnly(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-muted-light dark:text-muted">
                Profitable Only
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-4">
          <h2 className="mb-3 text-sm font-medium text-green-400">Summary</h2>
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold text-green-400">{items.length}</div>
              <div className="text-xs text-muted-light dark:text-muted">Profitable Items</div>
            </div>
            <div>
              <div className="text-xl font-bold text-text1-light dark:text-text1">
                {totalPotentialProfit.toLocaleString()}
              </div>
              <div className="text-xs text-muted-light dark:text-muted">Total Potential</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="flex flex-wrap items-center gap-4">
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
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="mb-3">
          <h2 className="text-sm font-medium text-text1-light dark:text-text1">
            Black Market Opportunities - T{tier}{enchant > 0 ? `.${enchant}` : ''}
          </h2>
          <p className="text-xs text-muted-light dark:text-muted">
            Craft in {craftCity}, sell to Black Market in Caerleon
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light dark:border-border">
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Item</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Category</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Craft Cost</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">BM Buy Price</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Profit</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">ROI</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-muted-light dark:text-muted">Bonus City</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 100).map((item, idx) => (
                <tr key={idx} className={`border-b border-border-light/50 dark:border-border/50 ${item.isProfitable ? 'bg-green-500/5' : ''}`}>
                  <td className="px-2 py-2">
                    <div className="text-text1-light dark:text-text1">{item.recipe.name}</div>
                    {item.recipe.artifactName && (
                      <div className="text-[10px] text-purple-400">{item.recipe.artifactQty}x {item.recipe.artifactName}</div>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <span className="rounded bg-surface-light px-1.5 py-0.5 text-xs text-muted-light dark:bg-surface dark:text-muted">
                      {CATEGORY_NAMES[item.recipe.category]}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right text-red-400">
                    {item.craftCost > 0 ? item.craftCost.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right text-green-400 font-bold">
                    {item.bmBuyPrice.toLocaleString()}
                  </td>
                  <td className={`px-2 py-2 text-right font-bold ${item.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.profit > 0 ? '+' : ''}{item.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <span className={item.profitPercent > 0 ? 'text-green-400' : 'text-red-400'}>
                      {item.profitPercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center">
                    {item.isInBonusCity ? (
                      <span className="text-amber-400 font-bold">Yes</span>
                    ) : (
                      <span className="text-muted-light dark:text-muted">{item.recipe.bonusCity}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && !isLoading && (
          <div className="py-8 text-center text-muted-light dark:text-muted">
            No profitable items found. Try different settings or refresh prices.
          </div>
        )}

        {isLoading && (
          <div className="py-8 text-center text-muted-light dark:text-muted">
            Loading Black Market prices...
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <h2 className="mb-2 text-sm font-medium text-text1-light dark:text-text1">Black Market Tips</h2>
        <ul className="space-y-1 text-xs text-muted-light dark:text-muted">
          <li>- Black Market is located in Caerleon and only accepts buy orders (no sell orders)</li>
          <li>- Prices fluctuate based on what mobs in the game world need to drop</li>
          <li>- Lower tier items often have more consistent demand</li>
          <li>- Using focus significantly increases profit margins</li>
          <li>- Craft in the bonus city for extra 15% resource return</li>
        </ul>
      </div>
    </section>
  )
}
