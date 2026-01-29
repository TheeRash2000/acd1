'use client'

import Link from 'next/link'
import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  GEAR_RECIPES,
  CATEGORY_NAMES,
  getMaterialItemId,
  type GearRecipe,
  type MaterialType,
} from '@/lib/crafting/gear-data'

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

const MATERIAL_NAMES: Record<string, string> = {
  PLANKS: 'Planks',
  METALBAR: 'Metal Bar',
  LEATHER: 'Leather',
  CLOTH: 'Cloth',
}

interface QueueItem {
  recipe: GearRecipe
  quantity: number
  tier: number
  enchant: number
}

interface MaterialNeed {
  materialType: MaterialType
  tier: number
  enchant: number
  itemId: string
  quantity: number
  prices: Record<string, number>
  lowestCity: string
  lowestPrice: number
}

export default function CraftingQueuePage() {
  const [server, setServer] = useState('Americas')
  const [tier, setTier] = useState(6)
  const [enchant, setEnchant] = useState(0)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [materialPrices, setMaterialPrices] = useState<Record<string, Record<string, number>>>({})

  // Filter recipes for search
  const filteredRecipes = useMemo(() => {
    if (!searchTerm.trim()) return []
    const term = searchTerm.toLowerCase()
    return GEAR_RECIPES.filter(r => r.name.toLowerCase().includes(term)).slice(0, 10)
  }, [searchTerm])

  // Add item to queue
  const addToQueue = (recipe: GearRecipe) => {
    const existing = queue.find(q => q.recipe.id === recipe.id && q.tier === tier && q.enchant === enchant)
    if (existing) {
      setQueue(queue.map(q =>
        q.recipe.id === recipe.id && q.tier === tier && q.enchant === enchant
          ? { ...q, quantity: q.quantity + 1 }
          : q
      ))
    } else {
      setQueue([...queue, { recipe, quantity: 1, tier, enchant }])
    }
    setSearchTerm('')
  }

  // Remove item from queue
  const removeFromQueue = (index: number) => {
    setQueue(queue.filter((_, i) => i !== index))
  }

  // Update quantity
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromQueue(index)
    } else {
      setQueue(queue.map((item, i) => i === index ? { ...item, quantity } : item))
    }
  }

  // Calculate total materials needed
  const materialNeeds: MaterialNeed[] = useMemo(() => {
    const needs: Record<string, { type: MaterialType; tier: number; enchant: number; qty: number }> = {}

    for (const item of queue) {
      if (item.recipe.primaryMat) {
        const key = `${item.recipe.primaryMat}_${item.tier}_${item.enchant}`
        if (!needs[key]) {
          needs[key] = { type: item.recipe.primaryMat, tier: item.tier, enchant: item.enchant, qty: 0 }
        }
        needs[key].qty += item.recipe.primaryQty * item.quantity
      }
      if (item.recipe.secondaryMat) {
        const key = `${item.recipe.secondaryMat}_${item.tier}_${item.enchant}`
        if (!needs[key]) {
          needs[key] = { type: item.recipe.secondaryMat, tier: item.tier, enchant: item.enchant, qty: 0 }
        }
        needs[key].qty += item.recipe.secondaryQty * item.quantity
      }
    }

    return Object.entries(needs).map(([key, need]) => {
      const itemId = getMaterialItemId(need.type, need.tier, need.enchant)
      const prices = materialPrices[itemId] || {}

      let lowestCity = ''
      let lowestPrice = Infinity

      for (const [city, price] of Object.entries(prices)) {
        if (price > 0 && price < lowestPrice) {
          lowestPrice = price
          lowestCity = city
        }
      }

      return {
        materialType: need.type,
        tier: need.tier,
        enchant: need.enchant,
        itemId,
        quantity: need.qty,
        prices,
        lowestCity,
        lowestPrice: lowestPrice === Infinity ? 0 : lowestPrice,
      }
    })
  }, [queue, materialPrices])

  // Fetch material prices
  const fetchPrices = useCallback(async () => {
    if (materialNeeds.length === 0) return

    setIsLoading(true)
    try {
      const apiBase = SERVER_API_ENDPOINTS[server]
      const itemIds = materialNeeds.map(n => n.itemId)

      const response = await fetch(
        `${apiBase}/api/v2/stats/prices/${itemIds.join(',')}?locations=${CITIES.join(',')}&qualities=1`
      )
      const data = await response.json()

      const newPrices: Record<string, Record<string, number>> = {}
      for (const item of data) {
        if (!newPrices[item.item_id]) {
          newPrices[item.item_id] = {}
        }
        if (item.sell_price_min > 0) {
          newPrices[item.item_id][item.city] = item.sell_price_min
        }
      }

      setMaterialPrices(newPrices)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    } finally {
      setIsLoading(false)
    }
  }, [server, materialNeeds])

  // Fetch prices when queue changes
  useEffect(() => {
    if (queue.length > 0) {
      fetchPrices()
    }
  }, [queue.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate total cost
  const totalCost = useMemo(() => {
    return materialNeeds.reduce((sum, need) => {
      return sum + (need.lowestPrice * need.quantity)
    }, 0)
  }, [materialNeeds])

  // Generate shopping list by city
  const shoppingListByCity = useMemo(() => {
    const byCity: Record<string, { material: string; quantity: number; price: number; total: number }[]> = {}

    for (const need of materialNeeds) {
      if (!need.lowestCity) continue
      if (!byCity[need.lowestCity]) {
        byCity[need.lowestCity] = []
      }
      byCity[need.lowestCity].push({
        material: `T${need.tier}${need.enchant > 0 ? `.${need.enchant}` : ''} ${MATERIAL_NAMES[need.materialType] || need.materialType}`,
        quantity: need.quantity,
        price: need.lowestPrice,
        total: need.lowestPrice * need.quantity,
      })
    }

    return byCity
  }, [materialNeeds])

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">
            Crafting Queue
          </h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Plan your crafting and generate a shopping list for materials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchPrices}
            disabled={isLoading || queue.length === 0}
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
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          DECISION
        </Link>
        <Link
          href="/tools/queue"
          className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-amber-300"
        >
          QUEUE
        </Link>
        <Link
          href="/craft"
          className="ml-auto rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          Crafting
        </Link>
      </nav>

      {/* Add Items */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface md:col-span-2">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Add Items</h2>
          <div className="grid gap-3">
            <div className="flex gap-2">
              <div className="grid flex-1 gap-1">
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
            <div className="relative">
              <label className="text-xs text-muted-light dark:text-muted">Search Item</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for gear to add..."
                className="mt-1 w-full rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
              {filteredRecipes.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded border border-border-light bg-surface-light shadow-lg dark:border-border dark:bg-surface">
                  {filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      onClick={() => addToQueue(recipe)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-amber-400/10"
                    >
                      <div className="text-text1-light dark:text-text1">{recipe.name}</div>
                      <div className="text-xs text-muted-light dark:text-muted">
                        {CATEGORY_NAMES[recipe.category]} - {recipe.itemType}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-4">
          <h2 className="mb-3 text-sm font-medium text-green-400">Total Cost</h2>
          <div className="text-3xl font-bold text-green-400">{totalCost.toLocaleString()}</div>
          <div className="text-xs text-muted-light dark:text-muted">silver (at lowest prices)</div>
          <div className="mt-4 text-sm text-muted-light dark:text-muted">
            {queue.length} items in queue
          </div>
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Crafting Queue</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light dark:border-border">
                  <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Item</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-muted-light dark:text-muted">Tier</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Materials</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-muted-light dark:text-muted">Qty</th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-muted-light dark:text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item, idx) => (
                  <tr key={idx} className="border-b border-border-light/50 dark:border-border/50">
                    <td className="px-2 py-2 text-text1-light dark:text-text1">{item.recipe.name}</td>
                    <td className="px-2 py-2 text-center">
                      <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-xs text-amber-300">
                        T{item.tier}{item.enchant > 0 ? `.${item.enchant}` : ''}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs text-muted-light dark:text-muted">
                      {item.recipe.primaryMat && `${item.recipe.primaryQty * item.quantity}x ${item.recipe.primaryMat}`}
                      {item.recipe.secondaryMat && `, ${item.recipe.secondaryQty * item.quantity}x ${item.recipe.secondaryMat}`}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateQuantity(idx, item.quantity - 1)}
                          className="rounded bg-surface-light px-2 py-0.5 hover:bg-red-400/20 dark:bg-surface"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-text1-light dark:text-text1">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(idx, item.quantity + 1)}
                          className="rounded bg-surface-light px-2 py-0.5 hover:bg-green-400/20 dark:bg-surface"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => removeFromQueue(idx)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setQueue([])}
              className="rounded border border-red-400 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10"
            >
              Clear Queue
            </button>
          </div>
        </div>
      )}

      {/* Materials Needed */}
      {materialNeeds.length > 0 && (
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Materials Needed</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light dark:border-border">
                  <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Material</th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Quantity</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Best City</th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Price Each</th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Total</th>
                </tr>
              </thead>
              <tbody>
                {materialNeeds.map((need, idx) => (
                  <tr key={idx} className="border-b border-border-light/50 dark:border-border/50">
                    <td className="px-2 py-2">
                      <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-xs text-amber-300 mr-2">
                        T{need.tier}{need.enchant > 0 ? `.${need.enchant}` : ''}
                      </span>
                      <span className="text-text1-light dark:text-text1">{MATERIAL_NAMES[need.materialType] || need.materialType}</span>
                    </td>
                    <td className="px-2 py-2 text-right text-text1-light dark:text-text1">{need.quantity.toLocaleString()}</td>
                    <td className="px-2 py-2 text-green-400 font-bold">{need.lowestCity || '-'}</td>
                    <td className="px-2 py-2 text-right text-text1-light dark:text-text1">
                      {need.lowestPrice > 0 ? need.lowestPrice.toLocaleString() : '-'}
                    </td>
                    <td className="px-2 py-2 text-right font-bold text-green-400">
                      {need.lowestPrice > 0 ? (need.lowestPrice * need.quantity).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Shopping List by City */}
      {Object.keys(shoppingListByCity).length > 0 && (
        <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">Shopping List by City</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(shoppingListByCity).map(([city, items]) => (
              <div key={city} className="rounded border border-border-light p-3 dark:border-border">
                <h3 className="mb-2 font-medium text-amber-400">{city}</h3>
                <div className="space-y-1 text-xs">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-muted-light dark:text-muted">{item.quantity}x {item.material}</span>
                      <span className="text-text1-light dark:text-text1">{item.total.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-border-light pt-1 dark:border-border">
                    <div className="flex justify-between font-bold">
                      <span className="text-text1-light dark:text-text1">Total</span>
                      <span className="text-green-400">
                        {items.reduce((sum, i) => sum + i.total, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {queue.length === 0 && (
        <div className="rounded-2xl border border-border-light bg-surface-light p-8 text-center dark:border-border dark:bg-surface">
          <div className="text-muted-light dark:text-muted">
            Search for items above to add them to your crafting queue.
          </div>
        </div>
      )}
    </section>
  )
}
