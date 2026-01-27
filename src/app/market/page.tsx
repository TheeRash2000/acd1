'use client'

import { useEffect, useMemo, useState } from 'react'
import { MarketTable } from '@/components/MarketTable'
import { MarketFilters } from '@/components/MarketFilters'
import { MarketSearch } from '@/components/MarketSearch'
import { getAllItems, Item } from '@/lib/items'
import { useMarketData } from '@/hooks/useMarketData'
import { useFavorites } from '@/hooks/useFavorites'
import { useCharacterSync } from '@/stores/characterSync'
import { ItemDetailModal } from '@/components/ItemDetailModal'
import { BuildPanel } from '@/components/BuildPanel'

type SortBy = 'name' | 'tier' | 'price' | 'volume'
type SortOrder = 'asc' | 'desc'

function parseSearch(input: string) {
  const tokens = input
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  let tier: number | undefined
  let enchant: number | undefined
  const terms: string[] = []

  for (const token of tokens) {
    const tierMatch = token.match(/^t?([1-8])$/)
    const enchantMatch = token.match(/^\.(\d)$/)
    const tierEnchantMatch = token.match(/^([1-8])\.(\d)$/)

    if (tierEnchantMatch) {
      tier = Number(tierEnchantMatch[1])
      enchant = Number(tierEnchantMatch[2])
      continue
    }

    if (tierMatch) {
      tier = Number(tierMatch[1])
      continue
    }

    if (enchantMatch) {
      enchant = Number(enchantMatch[1])
      continue
    }

    terms.push(token)
  }

  return { terms, tier, enchant }
}

export default function MarketPage() {
  const [items, setItems] = useState<Item[]>([])
  const [itemsLoading, setItemsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    tier: 'all',
    enchant: 'all',
    slot: 'all',
    category: 'all',
    quality: 'all',
    city: 'all',
  })
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    let active = true
    setItemsLoading(true)
    getAllItems()
      .then((loaded) => {
        if (!active) return
        setItems(loaded)
      })
      .finally(() => {
        if (!active) return
        setItemsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(() => {
    const unique = new Set<string>()
    for (const item of items) {
      if (item.itemClass) unique.add(item.itemClass)
    }
    return Array.from(unique).sort()
  }, [items])

  const baseFilteredItems = useMemo(() => {
    const parsed = parseSearch(search)
    return items.filter((item) => {
      if (parsed.terms.length > 0) {
        const haystack = `${item.name} ${item.id}`.toLowerCase()
        const matchesAll = parsed.terms.every((term) => haystack.includes(term))
        if (!matchesAll) return false
      }

      if (parsed.tier && item.tier !== parsed.tier) return false

      if (parsed.enchant !== undefined) {
        if ((item.enchantment ?? 0) !== parsed.enchant) return false
      }

      if (filters.tier !== 'all' && item.tier !== Number(filters.tier)) return false

      if (filters.enchant !== 'all') {
        if (filters.enchant === 'none' && item.enchantment) return false
        if (filters.enchant !== 'none' && item.enchantment !== Number(filters.enchant)) return false
      }

      if (filters.slot !== 'all' && item.slot !== filters.slot) return false

      if (filters.category !== 'all' && item.itemClass !== filters.category) return false

      return true
    })
  }, [filters.category, filters.enchant, filters.slot, filters.tier, items, search])

  const MARKET_ITEM_LIMIT = 200

  const itemIdsForMarket = useMemo(() => {
    return baseFilteredItems.slice(0, MARKET_ITEM_LIMIT).map((item) => item.id)
  }, [baseFilteredItems])

  const { data: marketData, loading, error, refetch } = useMarketData(itemIdsForMarket)
  const { favorites, toggleFavorite } = useFavorites()
  const { characters } = useCharacterSync()

  const entriesByItem = useMemo(() => {
    const map = new Map<string, (typeof marketData)[number][]>()
    for (const entry of marketData) {
      const list = map.get(entry.itemId) ?? []
      list.push(entry)
      map.set(entry.itemId, list)
    }
    return map
  }, [marketData])

  const marketStats = useMemo(() => {
    const map = new Map<string, { price: number; volume: number }>()
    for (const [itemId, entries] of entriesByItem.entries()) {
      let minSell = 0
      let maxBuy = 0
      let volume = 0
      for (const entry of entries) {
        if (entry.sellPriceMin > 0) {
          minSell = minSell === 0 ? entry.sellPriceMin : Math.min(minSell, entry.sellPriceMin)
          volume += 1
        }
        if (entry.buyPriceMax > 0) {
          maxBuy = Math.max(maxBuy, entry.buyPriceMax)
          volume += 1
        }
      }
      const price = minSell > 0 ? minSell : maxBuy
      map.set(itemId, { price, volume })
    }
    return map
  }, [entriesByItem])

  const filteredItems = useMemo(() => {
    const qualityFiltered = baseFilteredItems.filter((item) => {
      if (filters.quality === 'all' && filters.city === 'all') return true
      const entries = entriesByItem.get(item.id) ?? []
      if (filters.city !== 'all' && !entries.some((entry) => entry.city === filters.city)) return false
      if (filters.quality === 'all') return true
      return entries.some((entry) => entry.quality === filters.quality)
    })

    const sorted = qualityFiltered.sort((a, b) => {
      let aVal: string | number = ''
      let bVal: string | number = ''

      switch (sortBy) {
        case 'tier':
          aVal = a.tier
          bVal = b.tier
          break
        case 'price':
          aVal = marketStats.get(a.id)?.price ?? 0
          bVal = marketStats.get(b.id)?.price ?? 0
          break
        case 'volume':
          aVal = marketStats.get(a.id)?.volume ?? 0
          bVal = marketStats.get(b.id)?.volume ?? 0
          break
        case 'name':
        default:
          aVal = a.name
          bVal = b.name
      }

      if (aVal === bVal) return 0

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      }
      return aVal < bVal ? 1 : -1
    })

    return sorted
  }, [baseFilteredItems, filters.city, filters.quality, entriesByItem, marketStats, sortBy, sortOrder])

  const totalCount = items.length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">Market Browser</h1>
          <p className="text-sm text-muted-light dark:text-muted">Live prices from Albion Online Data Project.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refetch} disabled={loading} className="btn-secondary">
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setPanelOpen(true)}
          >
            Build Panel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <MarketSearch search={search} setSearch={setSearch} />
          <div className="flex flex-wrap items-end gap-2">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortBy)}
              className="rounded border border-border bg-surface px-3 py-2 text-sm text-text1-light dark:text-text1"
            >
              <option value="name">Name</option>
              <option value="tier">Tier</option>
              <option value="price">Price</option>
              <option value="volume">Volume</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="rounded border border-border px-3 py-2 text-sm text-text1-light hover:bg-surface dark:text-text1"
            >
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>
            {itemsLoading && <span className="text-xs text-muted-light dark:text-muted">Loading items...</span>}
          </div>
        </div>
        <MarketFilters filters={filters} setFilters={setFilters} categories={categories} />
      </div>

      {characters.filter(Boolean).length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-3 text-sm">
          <span className="text-muted-light dark:text-muted">IP Calculator:</span>
          <select
            value={selectedCharacter}
            onChange={(event) => setSelectedCharacter(event.target.value)}
            className="rounded border border-border bg-surface px-3 py-2 text-sm text-text1-light dark:text-text1"
          >
            <option value="">Select character...</option>
            {characters
              .filter((character) => character?.name)
              .map((character) => (
                <option key={`${character.name}-${character.server}`} value={character.name}>
                  {character.name}
                </option>
              ))}
          </select>
        </div>
      )}

      <MarketTable
        items={filteredItems}
        marketData={marketData}
        selectedCity={filters.city}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onItemClick={(itemId) => {
          setSelectedItem(itemId)
          if (!selectedCharacter && characters.length > 0) {
            setSelectedCharacter(characters[0].name)
          }
        }}
        loading={loading || itemsLoading}
        error={error}
      />

      <div className="text-center text-xs text-muted-light dark:text-muted">
        Showing {filteredItems.length} of {totalCount} items.
        {filteredItems.length > MARKET_ITEM_LIMIT &&
          ` Pricing limited to first ${MARKET_ITEM_LIMIT} results. Narrow your search for full coverage.`}
        {marketData.length > 0 && ` Last updated: ${new Date(marketData[0].timestamp).toLocaleTimeString()}.`}
      </div>

      <ItemDetailModal
        isOpen={!!selectedItem}
        closeModal={() => setSelectedItem(null)}
        itemId={selectedItem ?? ''}
        characterName={selectedCharacter}
        onOpenBuildPanel={() => setPanelOpen(true)}
      />

      <BuildPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        characterName={selectedCharacter}
      />
    </div>
  )
}
