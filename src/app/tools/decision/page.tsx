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

const CITIES = [
  'Bridgewatch',
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford',
  'Caerleon',
  'Brecilien',
]

const ROYAL_CITIES = ['Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford']

const QUALITIES = [
  { name: 'Normal', value: 1 },
  { name: 'Good', value: 2 },
  { name: 'Outstanding', value: 3 },
  { name: 'Excellent', value: 4 },
  { name: 'Masterpiece', value: 5 },
]

interface CraftDecision {
  recipe: typeof GEAR_RECIPES[0]
  gearPrice: number
  materialCost: number
  artifactCost: number
  totalCost: number
  profit: number
  profitPercent: number
  shouldCraft: boolean
  isInBonusCity: boolean
  effectiveRRR: number
}

export default function DecisionMakerPage() {
  const [server, setServer] = useState('Americas')
  const [materialCity, setMaterialCity] = useState('Bridgewatch')
  const [artifactCity, setArtifactCity] = useState('Caerleon')
  const [sellCity, setSellCity] = useState('Caerleon')
  const [craftCity, setCraftCity] = useState('Bridgewatch')
  const [tier, setTier] = useState(6)
  const [enchant, setEnchant] = useState(0)
  const [quality, setQuality] = useState(1)
  const [useFocus, setUseFocus] = useState(false)
  const [stationFee, setStationFee] = useState(0)
  const [filterCategory, setFilterCategory] = useState<'all' | GearCategory>('all')
  const [filterItemType, setFilterItemType] = useState<'all' | GearItemType>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const [gearPrices, setGearPrices] = useState<Record<string, number>>({})
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

      // Fetch gear prices from sell city
      const gearResponse = await fetch(
        `${apiBase}/api/v2/stats/prices/${gearIds.join(',')}?locations=${sellCity}&qualities=${quality}`
      )
      const gearData = await gearResponse.json()

      const newGearPrices: Record<string, number> = {}
      for (const item of gearData) {
        if (item.sell_price_min > 0) {
          newGearPrices[item.item_id] = item.sell_price_min
        }
      }
      setGearPrices(newGearPrices)

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

      // Fetch artifact prices from artifact city
      if (artifactIds.size > 0) {
        const artifactResponse = await fetch(
          `${apiBase}/api/v2/stats/prices/${Array.from(artifactIds).join(',')}?locations=${artifactCity}&qualities=1`
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
  }, [server, materialCity, artifactCity, sellCity, tier, enchant, quality])

  // Auto-fetch on mount
  useEffect(() => {
    fetchPrices()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate decisions
  const decisions: CraftDecision[] = useMemo(() => {
    const result: CraftDecision[] = []

    // Calculate base RRR
    let baseBonus = PRODUCTION_BONUSES.ROYAL_CITY_BASE // 15% base
    if (useFocus) {
      baseBonus += PRODUCTION_BONUSES.FOCUS_BONUS
    }

    for (const recipe of GEAR_RECIPES) {
      // Apply category filter
      if (filterCategory !== 'all' && recipe.category !== filterCategory) continue
      if (filterItemType !== 'all' && recipe.itemType !== filterItemType) continue

      const gearItemId = getGearItemId(recipe.id, tier, enchant)
      const gearPrice = gearPrices[gearItemId] || 0

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

      // Apply RRR to reduce effective material cost
      materialCost = materialCost * (1 - effectiveRRR)

      // Calculate artifact cost
      let artifactCost = 0
      if (recipe.artifactId) {
        const artifactPrice = artifactPrices[recipe.artifactId] || 0
        artifactCost += artifactPrice * recipe.artifactQty

        if (recipe.artifactHearts > 0) {
          const heartsPrice = artifactPrices['QUESTITEM_TOKEN_AVALON'] || 0
          artifactCost += heartsPrice * recipe.artifactHearts
        }
      }

      const totalCost = materialCost + artifactCost + stationFee
      const profit = gearPrice - totalCost
      const profitPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0
      const shouldCraft = profit > 0 && gearPrice > 0

      result.push({
        recipe,
        gearPrice,
        materialCost,
        artifactCost,
        totalCost,
        profit,
        profitPercent,
        shouldCraft,
        isInBonusCity,
        effectiveRRR,
      })
    }

    // Sort by profit
    result.sort((a, b) => b.profit - a.profit)

    return result
  }, [gearPrices, materialPrices, artifactPrices, tier, enchant, craftCity, useFocus, stationFee, filterCategory, filterItemType])

  const profitableCount = decisions.filter(d => d.shouldCraft).length
  const totalPotentialProfit = decisions.filter(d => d.shouldCraft).reduce((sum, d) => sum + d.profit, 0)

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">
            Crafting Decision Maker
          </h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Analyze which items are profitable to craft with current market prices.
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
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          FLIPPER
        </Link>
        <Link
          href="/tools/decision"
          className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-amber-300"
        >
          DECISION
        </Link>
        <Link
          href="/craft"
          className="ml-auto rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          Crafting
        </Link>
      </nav>

      {/* Settings */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Buy Cities */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Buy Materials</h2>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Material City</label>
              <select
                value={materialCity}
                onChange={(e) => setMaterialCity(e.target.value)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Artifact City</label>
              <select
                value={artifactCity}
                onChange={(e) => setArtifactCity(e.target.value)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Craft & Sell */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Craft & Sell</h2>
          <div className="grid gap-3">
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

        {/* Item Settings */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Item Settings</h2>
          <div className="grid gap-3">
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
                  {[0, 1, 2, 3, 4].map((e) => (
                    <option key={e} value={e}>{e === 0 ? '.0' : `.${e}`}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Quality</label>
              <select
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              >
                {QUALITIES.map((q) => (
                  <option key={q.value} value={q.value}>{q.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Options</h2>
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
              <label className="text-xs text-muted-light dark:text-muted">Station Fee</label>
              <input
                type="number"
                value={stationFee}
                onChange={(e) => setStationFee(parseInt(e.target.value) || 0)}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
            </div>
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

        {/* Summary */}
        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-4">
          <h2 className="mb-3 text-sm font-medium text-green-400">Summary</h2>
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-green-400">{profitableCount}</div>
              <div className="text-xs text-muted-light dark:text-muted">Profitable Items</div>
            </div>
            <div>
              <div className="text-xl font-bold text-text1-light dark:text-text1">
                {totalPotentialProfit.toLocaleString()}
              </div>
              <div className="text-xs text-muted-light dark:text-muted">Total Profit Potential</div>
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

      {/* Decisions Table */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="mb-3">
          <h2 className="text-sm font-medium text-text1-light dark:text-text1">
            Craft Decisions ({decisions.length}) - T{tier}{enchant > 0 ? `.${enchant}` : ''} {QUALITIES.find(q => q.value === quality)?.name}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light dark:border-border">
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Craft?</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Item</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Category</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Material Cost</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Artifact Cost</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Total Cost</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Sell Price</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Profit</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">ROI</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-muted-light dark:text-muted">Bonus City</th>
              </tr>
            </thead>
            <tbody>
              {decisions.slice(0, 100).map((decision, idx) => (
                <tr key={idx} className={`border-b border-border-light/50 dark:border-border/50 ${decision.shouldCraft ? 'bg-green-500/5' : ''}`}>
                  <td className="px-2 py-2">
                    {decision.shouldCraft ? (
                      <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-bold text-green-400">YES</span>
                    ) : (
                      <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">NO</span>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <div className="text-text1-light dark:text-text1">{decision.recipe.name}</div>
                    {decision.recipe.artifactName && (
                      <div className="text-[10px] text-purple-400">{decision.recipe.artifactQty}x {decision.recipe.artifactName}</div>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <span className="rounded bg-surface-light px-1.5 py-0.5 text-xs text-muted-light dark:bg-surface dark:text-muted">
                      {CATEGORY_NAMES[decision.recipe.category]}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right text-text1-light dark:text-text1">
                    {decision.materialCost > 0 ? decision.materialCost.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right text-purple-400">
                    {decision.artifactCost > 0 ? decision.artifactCost.toLocaleString() : '-'}
                  </td>
                  <td className="px-2 py-2 text-right text-text1-light dark:text-text1">
                    {decision.totalCost > 0 ? decision.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {decision.gearPrice > 0 ? (
                      <span className="text-text1-light dark:text-text1">{decision.gearPrice.toLocaleString()}</span>
                    ) : (
                      <span className="text-red-400">No price</span>
                    )}
                  </td>
                  <td className={`px-2 py-2 text-right font-bold ${decision.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {decision.gearPrice > 0 ? decision.profit.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {decision.gearPrice > 0 ? (
                      <span className={decision.profitPercent > 0 ? 'text-green-400' : 'text-red-400'}>
                        {decision.profitPercent.toFixed(1)}%
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-2 py-2 text-center">
                    {decision.isInBonusCity ? (
                      <span className="text-amber-400 font-bold">+15%</span>
                    ) : (
                      <span className="text-muted-light dark:text-muted">{decision.recipe.bonusCity}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {decisions.length === 0 && (
          <div className="py-8 text-center text-muted-light dark:text-muted">
            Loading decisions...
          </div>
        )}
      </div>
    </section>
  )
}
