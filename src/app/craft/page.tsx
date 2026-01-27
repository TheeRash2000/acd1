'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useCraftingStore } from '@/stores/crafting'
import {
  getArtifactRequirements,
  getCraftingRequirements,
  getCraftableItems,
  getAutoJournalForItem,
  formatJournalName,
  getItemById,
  getItemVariants,
  items,
} from '@/lib/crafting/data'
import {
  calculateTotalMaterialCost,
  getEnchantmentMultiplier,
  getTotalRRR,
  parseItemId,
} from '@/lib/crafting/calculations'
import { useCraftingMarketPrices } from '@/hooks/useCraftingMarketPrices'
import { ItemList } from '@/components/crafting/ItemList'
import { ItemSearchInput } from '@/components/crafting/ItemSearchInput'
import { EnchantmentSelector } from '@/components/crafting/EnchantmentSelector'
import { MaterialList } from '@/components/crafting/MaterialList'
import { ProfitDisplay } from '@/components/crafting/ProfitDisplay'
import { ItemVariants } from '@/components/crafting/ItemVariants'
import { JournalCalculator } from '@/components/crafting/JournalCalculator'
import { RRRSelector } from '@/components/crafting/RRRSelector'
import { GoldeniumRRRSelector } from '@/components/crafting/GoldeniumRRRSelector'
import { FocusCalculator } from '@/components/crafting/FocusCalculator'
import { PriceHistoryChart } from '@/components/crafting/PriceHistoryChart'
import { getGoldeniumRRR } from '@/lib/crafting/calculations'

const CITY_LIST = [
  'Bridgewatch',
  'Lymhurst',
  'Martlock',
  'Fort Sterling',
  'Thetford',
  'Caerleon',
  'Brecilien',
  'BlackMarket',
]
const AUTO_MARKET = 'Auto (best)'
const MARKET_OPTIONS = [AUTO_MARKET, ...CITY_LIST]

const QUALITY_LABELS = ['Normal', 'Good', 'Outstanding', 'Excellent', 'Masterpiece']

function formatPrice(price: number) {
  if (!Number.isFinite(price)) return '--'
  if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M`
  if (price >= 1000) return `${(price / 1000).toFixed(2)}k`
  return price.toFixed(0)
}

const CITY_LABELS: Record<string, string> = {
  BlackMarket: 'Black Market',
}

function normalizeCity(value?: string | null) {
  const trimmed = (value ?? '').replace(/\s+/g, ' ').trim()
  if (/^black market$/i.test(trimmed) || /^blackmarket$/i.test(trimmed)) {
    return 'BlackMarket'
  }
  return trimmed || AUTO_MARKET
}

function formatCityLabel(value: string) {
  return CITY_LABELS[value] ?? value
}

function normalizeMarketItemId(itemId: string) {
  const parsed = parseItemId(itemId)
  if (parsed.enchantment > 0) {
    return `${parsed.baseId}@${parsed.enchantment}`
  }
  return parsed.baseId
}

function getMarketItemCandidates(itemId: string) {
  const normalized = normalizeMarketItemId(itemId)
  return normalized === itemId ? [itemId] : [normalized, itemId]
}

function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function CraftPage() {
  const {
    selectedItem,
    setSelectedItem,
    filters,
    updateFilters,
    inputs,
    updateInputs,
    addHideoutPreset,
    hideoutPresets,
    activeHideoutId,
    setActiveHideout,
    removeHideoutPreset,
  } = useCraftingStore()

  const debouncedSearch = useDebounce(filters.search, 300)
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)
  const [resultsCollapsed, setResultsCollapsed] = useState(false)
  const [inputsCollapsed, setInputsCollapsed] = useState(false)
  const [materialsCollapsed, setMaterialsCollapsed] = useState(false)
  const [profitCollapsed, setProfitCollapsed] = useState(false)
  const [variantsCollapsed, setVariantsCollapsed] = useState(false)
  const [historyCollapsed, setHistoryCollapsed] = useState(false)
  const [journalsCollapsed, setJournalsCollapsed] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)

  const craftableItems = useMemo(() => getCraftableItems(items), [])
  const normalizedBuyCity = normalizeCity(inputs.buyCity)
  const normalizedSellCity = normalizeCity(inputs.sellCity)
  const resolvedBuyCity =
    MARKET_OPTIONS.find((city) => city === normalizedBuyCity) ?? AUTO_MARKET
  const resolvedSellCity =
    MARKET_OPTIONS.find((city) => city === normalizedSellCity) ?? AUTO_MARKET

  useEffect(() => {
    if (inputs.buyCity !== resolvedBuyCity) {
      updateInputs({ buyCity: resolvedBuyCity })
    }
    if (inputs.sellCity !== resolvedSellCity) {
      updateInputs({ sellCity: resolvedSellCity })
    }
  }, [inputs.buyCity, inputs.sellCity, resolvedBuyCity, resolvedSellCity, updateInputs])

  const baseItems = useMemo(() => {
    const base = craftableItems.filter((item) => item.enchantment === 0)
    if (debouncedSearch) return base
    return base
      .filter((item) => item.category === filters.category)
      .filter((item) => (filters.tier === 'all' ? true : String(item.tier) === filters.tier))
      .filter((item) =>
        filters.subcategory === 'all' ? true : item.subcategory.toLowerCase() === filters.subcategory
      )
  }, [filters.category, filters.tier, filters.subcategory, craftableItems, debouncedSearch])

  const filteredItems = useMemo(() => {
    return baseItems.filter((item) => {
      const trimmed = debouncedSearch.trim()
      if (!trimmed) return true
      const search = trimmed.toLowerCase()
      return (
        item.name.toLowerCase().includes(search) ||
        item.item_id.toLowerCase().includes(search) ||
        item.base_item_id.toLowerCase().includes(search) ||
        item.subcategory.toLowerCase().includes(search)
      )
    })
  }, [baseItems, debouncedSearch])

  const sortedItems = useMemo(() => {
    const list = [...filteredItems]
    if (filters.sortBy === 'tier') {
      return list.sort((a, b) => a.tier - b.tier)
    }
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [filteredItems, filters.sortBy])

  const selected = selectedItem ?? sortedItems[0]
  const selectedBase = selected ? parseItemId(selected.item_id) : null
  const requestedEnchantment = inputs.enchantment
  const effectiveItemId = selectedBase
    ? requestedEnchantment > 0
      ? `${selectedBase.baseId}@${requestedEnchantment}`
      : selectedBase.baseId
    : null
  const effectiveItem = effectiveItemId ? getItemById(effectiveItemId) ?? selected : selected

  useEffect(() => {
    if (!selectedItem) return
    const parsed = parseItemId(selectedItem.item_id)
    updateInputs({ enchantment: parsed.enchantment })
  }, [selectedItem, updateInputs])

  useEffect(() => {
    updateInputs({
      includeJournalValue: false,
      useManualJournalValue: false,
      manualJournalValue: 0,
    })
  }, [updateInputs])

  const itemIdsForPricing = useMemo(() => {
    const ids = new Set<string>()
    sortedItems.slice(0, 120).forEach((item) => {
      getMarketItemCandidates(item.item_id).forEach((candidate) => ids.add(candidate))
    })
    if (effectiveItem) {
      getMarketItemCandidates(effectiveItem.item_id).forEach((candidate) => ids.add(candidate))
      getCraftingRequirements(effectiveItem.item_id).forEach((req) => {
        getMarketItemCandidates(req.material_id).forEach((candidate) => ids.add(candidate))
      })
      getArtifactRequirements(effectiveItem.item_id).forEach((req) => {
        getMarketItemCandidates(req.artifact_id).forEach((candidate) => ids.add(candidate))
      })
      getItemVariants(effectiveItem.base_item_id).forEach((variant) => {
        getMarketItemCandidates(variant.item_id).forEach((candidate) => ids.add(candidate))
      })
    }
    return Array.from(ids)
  }, [sortedItems, effectiveItem])

  const { prices, loading, error, lastUpdated } = useCraftingMarketPrices(
    itemIdsForPricing,
    30000,
    refreshTick
  )

  const priceMaps = useMemo(() => {
    const buyMap = new Map<string, number>()
    const sellMap = new Map<string, number>()
    for (const [key, rows] of prices.entries()) {
      const [itemId, city] = key.split(':')
      const normalizedCity = normalizeCity(city)
      const qualityMatch = rows.find(
        (row) =>
          row.quality === inputs.quality && (row.sell_price_min > 0 || row.buy_price_max > 0)
      )
      const row =
        qualityMatch ??
        rows.find((entry) => entry.sell_price_min > 0 || entry.buy_price_max > 0) ??
        rows[0]
      if (!row) continue
      buyMap.set(`${itemId}:${normalizedCity}`, row.sell_price_min || row.buy_price_max || 0)
      sellMap.set(`${itemId}:${normalizedCity}`, row.buy_price_max || row.sell_price_min || 0)
    }
    return { buyMap, sellMap }
  }, [prices, inputs.quality])

  const getBestPrice = (itemId: string, map: Map<string, number>, mode: 'min' | 'max') => {
    let best = mode === 'min' ? Number.POSITIVE_INFINITY : 0
    for (const city of CITY_LIST) {
      const value = map.get(`${itemId}:${city}`) ?? 0
      if (!value) continue
      if (mode === 'min') {
        best = Math.min(best, value)
      } else {
        best = Math.max(best, value)
      }
    }
    if (best === Number.POSITIVE_INFINITY) return 0
    return best
  }

  const getBestPriceCandidates = (
    candidates: string[],
    map: Map<string, number>,
    mode: 'min' | 'max'
  ) => {
    let best = mode === 'min' ? Number.POSITIVE_INFINITY : 0
    for (const candidate of candidates) {
      for (const city of CITY_LIST) {
        const value = map.get(`${candidate}:${city}`) ?? 0
        if (!value) continue
        if (mode === 'min') {
          best = Math.min(best, value)
        } else {
          best = Math.max(best, value)
        }
      }
    }
    if (best === Number.POSITIVE_INFINITY) return 0
    return best
  }

  const getBuyPrice = (itemId: string, city: string) => {
    const candidates = getMarketItemCandidates(itemId)
    if (city === AUTO_MARKET) {
      return getBestPriceCandidates(candidates, priceMaps.buyMap, 'min')
    }
    const normalizedCity = normalizeCity(city)
    const direct = candidates
      .map((candidate) => priceMaps.buyMap.get(`${candidate}:${normalizedCity}`))
      .find((value) => value && value > 0)
    if (direct) return direct
    const fallback = getBestPriceCandidates(candidates, priceMaps.buyMap, 'min')
    if (fallback) return fallback
    const parsed = parseItemId(itemId)
    if (parsed.baseId !== itemId) {
      if (city === AUTO_MARKET) {
        return getBestPriceCandidates([parsed.baseId], priceMaps.buyMap, 'min')
      }
      return (
        priceMaps.buyMap.get(`${parsed.baseId}:${normalizedCity}`) ??
        getBestPriceCandidates([parsed.baseId], priceMaps.buyMap, 'min') ??
        0
      )
    }
    return 0
  }

  const getSellPrice = (itemId: string, city: string) => {
    const candidates = getMarketItemCandidates(itemId)
    if (city === AUTO_MARKET) {
      return getBestPriceCandidates(candidates, priceMaps.sellMap, 'max')
    }
    const normalizedCity = normalizeCity(city)
    const direct = candidates
      .map((candidate) => priceMaps.sellMap.get(`${candidate}:${normalizedCity}`))
      .find((value) => value && value > 0)
    if (direct) return direct
    const fallback = getBestPriceCandidates(candidates, priceMaps.sellMap, 'max')
    if (fallback) return fallback
    const parsed = parseItemId(itemId)
    if (parsed.baseId !== itemId) {
      if (city === AUTO_MARKET) {
        return getBestPriceCandidates([parsed.baseId], priceMaps.sellMap, 'max')
      }
      return (
        priceMaps.sellMap.get(`${parsed.baseId}:${normalizedCity}`) ??
        getBestPriceCandidates([parsed.baseId], priceMaps.sellMap, 'max') ??
        0
      )
    }
    return 0
  }

  const directRequirements = effectiveItem ? getCraftingRequirements(effectiveItem.item_id) : []
  const baseRequirements = selectedBase ? getCraftingRequirements(selectedBase.baseId) : []
  const requirements = directRequirements.length ? directRequirements : baseRequirements

  const directArtifacts = effectiveItem ? getArtifactRequirements(effectiveItem.item_id) : []
  const baseArtifacts = selectedBase ? getArtifactRequirements(selectedBase.baseId) : []
  const artifactRequirements = directArtifacts.length ? directArtifacts : baseArtifacts

  const variants = selectedBase ? getItemVariants(selectedBase.baseId) : []
  const shouldUseEnchantmentMultiplier =
    effectiveItem &&
    effectiveItem.enchantment > 0 &&
    directRequirements.length === 0 &&
    requirements.length > 0
  const enchantmentMultiplier =
    effectiveItem && shouldUseEnchantmentMultiplier
      ? getEnchantmentMultiplier(effectiveItem.enchantment)
      : 1
  const manualMaterialPrices = inputs.manualMaterialPrices ?? {}
  const materialBuyMarkets = inputs.materialBuyMarkets ?? {}
  const resolveMaterialMarket = (materialId: string) => {
    if (!inputs.usePerMaterialMarkets) return resolvedBuyCity
    const selectedMarket = materialBuyMarkets[materialId] ?? resolvedBuyCity
    return normalizeCity(selectedMarket)
  }
  const resolveMaterialPrice = (materialId: string) => {
    if (inputs.useManualMaterialPrices && manualMaterialPrices[materialId] !== undefined) {
      return manualMaterialPrices[materialId]
    }
    return getBuyPrice(materialId, resolveMaterialMarket(materialId))
  }

  const rrr = effectiveItem
    ? getTotalRRR(
        inputs.locationType,
        inputs.city,
        inputs.hideoutConfig,
        effectiveItem,
        inputs.useFocus
      )
    : 0

  const materialCost = effectiveItem
    ? (() => {
        const multiplier = enchantmentMultiplier
        const calculated =
          calculateTotalMaterialCost(
            effectiveItem,
            requirements,
            artifactRequirements,
            inputs.quantity,
            new Map(
              [
                ...requirements.map((req) => [
                  req.material_id,
                  resolveMaterialPrice(req.material_id),
                ]),
                ...artifactRequirements.map((req) => [
                  req.artifact_id,
                  resolveMaterialPrice(req.artifact_id),
                ]),
              ]
            ),
            rrr,
            multiplier
          ) / inputs.quantity
        return inputs.useManualMaterialCost ? inputs.manualMaterialCost : calculated
      })()
    : 0

  const sellPrice = effectiveItem
    ? inputs.useManualSellPrice
      ? inputs.manualSellPrice
      : getSellPrice(effectiveItem.item_id, resolvedSellCity)
    : 0
  const buyPrice = effectiveItem
    ? inputs.useManualBuyPrice
      ? inputs.manualBuyPrice
      : getBuyPrice(effectiveItem.item_id, resolvedBuyCity)
    : 0

  const autoJournal = effectiveItem ? getAutoJournalForItem(effectiveItem) : undefined
  const journalBuyPrice = autoJournal ? getBuyPrice(autoJournal.journal_id, resolvedBuyCity) : 0
  const journalSellPrice = autoJournal ? getSellPrice(autoJournal.journal_id, resolvedSellCity) : 0
  const journalNetValue = journalSellPrice - journalBuyPrice
  const journalBonusEach = inputs.includeJournalValue
    ? inputs.useManualJournalValue
      ? inputs.manualJournalValue
      : journalNetValue
    : 0

  const metrics = useMemo(() => {
    const map: Record<string, { price?: number; margin?: number }> = {}
    sortedItems.slice(0, 120).forEach((item) => {
      const price = getSellPrice(item.item_id, resolvedSellCity)
      if (!price) return
      map[item.item_id] = { price }
    })
    return map
  }, [sortedItems, resolvedSellCity, getSellPrice])

  const subcategories = useMemo(() => {
    const set = new Set<string>()
    craftableItems.filter((item) => item.category === filters.category).forEach((item) => {
      set.add(item.subcategory.toLowerCase())
    })
    return Array.from(set).sort()
  }, [filters.category, craftableItems])

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text1-light dark:text-text1">Crafting Dashboard</h1>
          <p className="text-sm text-muted-light dark:text-muted">
            Real-time crafting profitability with AODP pricing.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-light dark:text-muted">
          <span>Server pricing active</span>
          <span>{loading ? 'Updating...' : 'Live'}</span>
          {lastUpdated && (
            <span>- Updated {new Date(lastUpdated).toLocaleTimeString()}</span>
          )}
          <button
            type="button"
            onClick={() => setRefreshTick((prev) => prev + 1)}
            className="rounded border border-border-light px-2 py-1 text-[11px] text-text1-light hover:bg-bg-light/60 dark:border-border dark:text-text1 dark:hover:bg-bg/60"
          >
            Refresh pricing
          </button>
          {error && <span className="text-red-300">{error}</span>}
        </div>
      </header>

      <nav className="flex flex-wrap items-center gap-2 text-xs">
        {(['gear', 'food', 'potion'] as const).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => updateFilters({ category })}
            className={`rounded border px-3 py-1 ${
              filters.category === category
                ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                : 'border-border-light text-text1-light dark:border-border dark:text-text1'
            }`}
          >
            {category.toUpperCase()}
          </button>
        ))}
        <span className="mx-2 text-muted-light dark:text-muted">|</span>
        <Link
          href="/craft/gear"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:border-amber-400 hover:text-amber-300 dark:border-border dark:text-text1"
        >
          Gear (Goldenium)
        </Link>
        <Link
          href="/craft/food"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:border-amber-400 hover:text-amber-300 dark:border-border dark:text-text1"
        >
          Food (Goldenium)
        </Link>
        <Link
          href="/craft/potions"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:border-amber-400 hover:text-amber-300 dark:border-border dark:text-text1"
        >
          Potions (Goldenium)
        </Link>
        <Link
          href="/craft/refining"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:border-amber-400 hover:text-amber-300 dark:border-border dark:text-text1"
        >
          Refining (Goldenium)
        </Link>
        <Link
          href="/craft/calculator"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          Calculator
        </Link>
      </nav>

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `${filtersCollapsed ? '0' : '280px'} ${
            resultsCollapsed ? '0' : 'minmax(260px, 1fr)'
          } minmax(0, 1.7fr)`,
        }}
      >
        <section
          className={`grid h-fit gap-3 self-start rounded-2xl border border-border-light bg-surface-light p-3 transition-all dark:border-border dark:bg-surface ${
            filtersCollapsed ? 'pointer-events-none opacity-0' : ''
          }`}
        >
          <ItemSearchInput
            items={craftableItems}
            value={filters.search}
            onChange={(value) => updateFilters({ search: value })}
            onSelect={(item) => {
              setSelectedItem(item)
              updateFilters({
                search: item.name,
                category: item.category,
                tier: String(item.tier) as any,
                subcategory: item.subcategory.toLowerCase(),
              })
              updateInputs({ enchantment: item.enchantment })
            }}
          />
          <div className="grid gap-2">
            <div className="grid gap-2">
              <label className="text-[11px] uppercase text-muted-light dark:text-muted">Tier</label>
              <select
                value={filters.tier}
                onChange={(event) => updateFilters({ tier: event.target.value as any })}
                className="rounded border border-border-light bg-bg-light px-2 py-1.5 text-xs dark:border-border dark:bg-bg"
              >
                <option value="all">All tiers</option>
                {['4', '5', '6', '7', '8'].map((tier) => (
                  <option key={tier} value={tier}>
                    T{tier}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-[11px] uppercase text-muted-light dark:text-muted">Subcategory</label>
              <select
                value={filters.subcategory}
                onChange={(event) => updateFilters({ subcategory: event.target.value })}
                className="rounded border border-border-light bg-bg-light px-2 py-1.5 text-xs dark:border-border dark:bg-bg"
              >
                <option value="all">All subcategories</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-[11px] uppercase text-muted-light dark:text-muted">Sort</label>
              <select
                value={filters.sortBy}
                onChange={(event) => updateFilters({ sortBy: event.target.value as any })}
                className="rounded border border-border-light bg-bg-light px-2 py-1.5 text-xs dark:border-border dark:bg-bg"
              >
                <option value="name">Sort by name</option>
                <option value="tier">Sort by tier</option>
              </select>
            </div>
          </div>
          <div className="rounded-lg border border-border-light bg-bg-light/40 p-3 text-[11px] text-muted-light dark:border-border dark:bg-bg/40 dark:text-muted">
            {sortedItems.length} craftable items
          </div>
        </section>

        <section
          className={`grid gap-3 rounded-2xl border border-border-light bg-surface-light p-3 transition-all dark:border-border dark:bg-surface ${
            resultsCollapsed ? 'pointer-events-none opacity-0' : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-light dark:text-muted">
            <span>Results</span>
            <button
              type="button"
              onClick={() => setResultsCollapsed(true)}
              className="rounded border border-border-light px-2 py-1 text-[11px] text-text1-light hover:bg-bg-light/60 dark:border-border dark:text-text1 dark:hover:bg-bg/60"
            >
              Hide
            </button>
          </div>
          <ItemList
            items={sortedItems}
            metrics={metrics}
            selectedItemId={selected?.item_id}
            onSelect={(item) => setSelectedItem(item)}
          />
        </section>

        <section className="grid gap-3 rounded-2xl border border-border-light bg-surface-light p-3 dark:border-border dark:bg-surface">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersCollapsed((prev) => !prev)}
              className="rounded border border-border-light px-2 py-1 text-[11px] text-text1-light hover:bg-bg-light/60 dark:border-border dark:text-text1 dark:hover:bg-bg/60"
            >
              {filtersCollapsed ? 'Show Filters' : 'Hide Filters'}
            </button>
            <button
              type="button"
              onClick={() => setResultsCollapsed((prev) => !prev)}
              className="rounded border border-border-light px-2 py-1 text-[11px] text-text1-light hover:bg-bg-light/60 dark:border-border dark:text-text1 dark:hover:bg-bg/60"
            >
              {resultsCollapsed ? 'Show Results' : 'Hide Results'}
            </button>
          </div>
          {effectiveItem ? (
            <>
              <div className="flex flex-wrap items-center gap-4">
                <img
                  src={`https://render.albiononline.com/v1/item/${effectiveItem.item_id}.png`}
                  alt={effectiveItem.name}
                  className="h-20 w-20 rounded"
                />
                <div>
                  <div className="text-lg text-text1-light dark:text-text1">{effectiveItem.name}</div>
                  <div className="text-xs text-muted-light dark:text-muted">
                    T{effectiveItem.tier} - {effectiveItem.subcategory}
                    {effectiveItem.is_artifact ? ` - ${effectiveItem.artifact_type}` : ''}
                  </div>
                  {effectiveItem.city_bonus && (
                    <div className="text-[11px] text-amber-300">Bonus city: {effectiveItem.city_bonus}</div>
                  )}
                </div>
              </div>

              <div className="grid gap-2 rounded-xl border border-border-light bg-bg-light/40 p-3 text-xs dark:border-border dark:bg-bg/40">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
                  <span>Crafting Inputs</span>
                  <button
                    type="button"
                    onClick={() => setInputsCollapsed((prev) => !prev)}
                    className="rounded border border-border-light px-2 py-1 text-[10px] text-text1-light hover:bg-bg-light/60 dark:border-border dark:text-text1 dark:hover:bg-bg/60"
                  >
                    {inputsCollapsed ? 'Expand' : 'Collapse'}
                  </button>
                </div>
                {!inputsCollapsed && (
                  <>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <EnchantmentSelector
                        value={inputs.enchantment}
                        onChange={(value) => updateInputs({ enchantment: value })}
                        showCostImpact
                      />
                      <div className="grid gap-1 text-xs">
                        <label className="text-muted-light dark:text-muted">Quality</label>
                        <select
                          value={inputs.quality}
                          onChange={(event) => updateInputs({ quality: parseInt(event.target.value, 10) })}
                          className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
                        >
                          {QUALITY_LABELS.map((label, index) => (
                            <option key={label} value={index + 1}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-1 text-xs">
                        <label className="text-muted-light dark:text-muted">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={inputs.quantity}
                          onChange={(event) => updateInputs({ quantity: parseInt(event.target.value, 10) || 1 })}
                          className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
                        />
                      </div>
                      <div className="grid gap-1 text-xs">
                        <label className="text-muted-light dark:text-muted">Station Fee per 100</label>
                        <input
                          type="number"
                          step="1"
                          value={inputs.stationFeePer100}
                          onChange={(event) =>
                            updateInputs({ stationFeePer100: parseFloat(event.target.value) || 0 })
                          }
                          className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
                        />
                        <div className="text-[11px] text-muted-light dark:text-muted">
                          Silver per 100 nutrition
                        </div>
                      </div>
                      <div className="grid gap-1 text-xs">
                        <label className="text-muted-light dark:text-muted">Buy Market</label>
                        <select
                          value={resolvedBuyCity}
                          onChange={(event) => updateInputs({ buyCity: event.target.value })}
                          className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
                        >
                          {MARKET_OPTIONS.map((city) => (
                            <option key={city} value={city}>
                              {formatCityLabel(city)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-1 text-xs">
                        <label className="text-muted-light dark:text-muted">Sell Market</label>
                        <select
                          value={resolvedSellCity}
                          onChange={(event) => updateInputs({ sellCity: event.target.value })}
                          className="rounded border border-border-light bg-bg-light px-3 py-2 text-xs dark:border-border dark:bg-bg"
                        >
                          {MARKET_OPTIONS.map((city) => (
                            <option key={city} value={city}>
                              {formatCityLabel(city)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={inputs.useFocus}
                        onChange={(event) => updateInputs({ useFocus: event.target.checked })}
                      />
                      Use focus
                    </label>
                    <RRRSelector
                      locationType={inputs.locationType}
                      selectedCity={inputs.city}
                      hideoutConfig={inputs.hideoutConfig}
                      onLocationTypeChange={(value) => updateInputs({ locationType: value })}
                      onCityChange={(value) => updateInputs({ city: value })}
                      onHideoutChange={(value) => updateInputs({ hideoutConfig: value })}
                      computedRrr={rrr}
                      savedHideouts={hideoutPresets}
                      activeHideoutId={activeHideoutId}
                      onSelectPreset={(id) => {
                        setActiveHideout(id)
                        const selectedHideout = hideoutPresets.find((preset) => preset.id === id)
                        if (selectedHideout) {
                          updateInputs({ locationType: 'hideout', hideoutConfig: selectedHideout })
                        }
                      }}
                      onRemovePreset={(id) => removeHideoutPreset(id)}
                      onSavePreset={() =>
                        addHideoutPreset({
                          ...inputs.hideoutConfig,
                          isFavorite: false,
                          isActive: true,
                        })
                      }
                    />
                  </>
                )}
              </div>

              <div className="grid gap-2 rounded-xl border border-border-light bg-bg-light/40 p-3 text-xs dark:border-border dark:bg-bg/40">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
                  <span>Journal Bonus</span>
                  <button
                    type="button"
                    onClick={() => setJournalsCollapsed((prev) => !prev)}
                    className="rounded border border-border-light px-2 py-1 text-[10px] text-text1-light hover:bg-bg-light/60 dark:border-border dark:text-text1 dark:hover:bg-bg/60"
                  >
                    {journalsCollapsed ? 'Expand' : 'Collapse'}
                  </button>
                </div>
                {!journalsCollapsed && (
                  <>
                    <div className="grid gap-2 rounded-lg border border-border/40 bg-bg-light/30 p-2 text-[11px] dark:bg-bg/30">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-muted-light dark:text-muted">
                            Auto Journal
                          </div>
                          <div className="text-text1-light dark:text-text1">
                            {autoJournal ? formatJournalName(autoJournal.name) : 'No journal match'}
                          </div>
                        </div>
                        {autoJournal && (
                          <div className="text-right text-[11px] text-muted-light dark:text-muted">
                            Buy: {formatPrice(journalBuyPrice)} · Sell: {formatPrice(journalSellPrice)}
                            <div className="text-[10px] text-muted-light dark:text-muted">
                              Net: {formatPrice(journalNetValue)}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={inputs.includeJournalValue}
                            onChange={(event) =>
                              updateInputs({ includeJournalValue: event.target.checked })
                            }
                          />
                          Include journal net value
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={inputs.useManualJournalValue}
                            onChange={(event) =>
                              updateInputs({ useManualJournalValue: event.target.checked })
                            }
                          />
                          Override journal value
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={inputs.manualJournalValue}
                          onChange={(event) =>
                            updateInputs({ manualJournalValue: parseFloat(event.target.value) || 0 })
                          }
                          disabled={!inputs.useManualJournalValue}
                          className="rounded border border-border-light bg-bg-light px-2 py-1 text-[11px] dark:border-border dark:bg-bg"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="grid gap-2 rounded-xl border border-border-light bg-bg-light/40 p-3 text-xs dark:border-border dark:bg-bg/40">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
                  <span>Materials</span>
                  <button
                    type="button"
                    onClick={() => setMaterialsCollapsed((prev) => !prev)}
                    className="rounded border border-border-light px-2 py-1 text-[10px] text-text1-light hover:bg-bg-light/60 dark:border-border dark:text-text1 dark:hover:bg-bg/60"
                  >
                    {materialsCollapsed ? 'Expand' : 'Collapse'}
                  </button>
                </div>
                {!materialsCollapsed && (
                  <>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={inputs.useManualMaterialPrices}
                        onChange={(event) =>
                          updateInputs({ useManualMaterialPrices: event.target.checked })
                        }
                      />
                      Manual material prices
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={inputs.usePerMaterialMarkets}
                        onChange={(event) =>
                          updateInputs({ usePerMaterialMarkets: event.target.checked })
                        }
                      />
                      Choose buy market per material
                    </label>
                    <MaterialList
                      requirements={requirements}
                      artifactRequirements={artifactRequirements}
                      marketPrices={new Map([
                        ...requirements.map((req) => [
                          req.material_id,
                          resolveMaterialPrice(req.material_id),
                        ]),
                        ...artifactRequirements.map((req) => [
                          req.artifact_id,
                          resolveMaterialPrice(req.artifact_id),
                        ]),
                      ])}
                      rrr={rrr}
                      enchantmentMultiplier={enchantmentMultiplier}
                      useManualPrices={inputs.useManualMaterialPrices}
                      manualPrices={manualMaterialPrices}
                      usePerMaterialMarkets={inputs.usePerMaterialMarkets}
                      materialMarkets={materialBuyMarkets}
                      marketOptions={MARKET_OPTIONS}
                      formatMarketLabel={formatCityLabel}
                      onManualPriceChange={(materialId, price) => {
                        updateInputs({
                          manualMaterialPrices: {
                            ...manualMaterialPrices,
                            [materialId]: price,
                          },
                        })
                      }}
                      onMaterialMarketChange={(materialId, market) => {
                        updateInputs({
                          materialBuyMarkets: {
                            ...materialBuyMarkets,
                            [materialId]: market,
                          },
                        })
                      }}
                    />
                  </>
                )}
              </div>

              <div className="grid gap-2 rounded-xl border border-border-light bg-bg-light/40 p-3 text-xs dark:border-border dark:bg-bg/40">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
                  <span>Profit</span>
                  <button
                    type="button"
                    onClick={() => setProfitCollapsed((prev) => !prev)}
                    className="rounded border border-border-light px-2 py-1 text-[10px] text-text1-light hover:bg-bg-light/60 dark:border-border dark:text-text1 dark:hover:bg-bg/60"
                  >
                    {profitCollapsed ? 'Expand' : 'Collapse'}
                  </button>
                </div>
                {!profitCollapsed && (
                  <>
                    <div className="grid gap-2 rounded-lg border border-border/40 bg-bg-light/30 p-2 text-[11px] dark:bg-bg/30">
                      <div className="text-[10px] uppercase tracking-wide text-muted-light dark:text-muted">
                        Manual Overrides
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={inputs.useManualBuyPrice}
                            onChange={(event) => updateInputs({ useManualBuyPrice: event.target.checked })}
                          />
                          Override buy price
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={inputs.manualBuyPrice}
                          onChange={(event) =>
                            updateInputs({ manualBuyPrice: parseFloat(event.target.value) || 0 })
                          }
                          disabled={!inputs.useManualBuyPrice}
                          className="rounded border border-border-light bg-bg-light px-2 py-1 text-[11px] dark:border-border dark:bg-bg"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={inputs.useManualSellPrice}
                            onChange={(event) => updateInputs({ useManualSellPrice: event.target.checked })}
                          />
                          Override sell price
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={inputs.manualSellPrice}
                          onChange={(event) =>
                            updateInputs({ manualSellPrice: parseFloat(event.target.value) || 0 })
                          }
                          disabled={!inputs.useManualSellPrice}
                          className="rounded border border-border-light bg-bg-light px-2 py-1 text-[11px] dark:border-border dark:bg-bg"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={inputs.useManualMaterialCost}
                            onChange={(event) => updateInputs({ useManualMaterialCost: event.target.checked })}
                          />
                          Override material cost (each)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={inputs.manualMaterialCost}
                          onChange={(event) =>
                            updateInputs({ manualMaterialCost: parseFloat(event.target.value) || 0 })
                          }
                          disabled={!inputs.useManualMaterialCost}
                          className="rounded border border-border-light bg-bg-light px-2 py-1 text-[11px] dark:border-border dark:bg-bg"
                        />
                      </div>
                    </div>
                    <ProfitDisplay
                      buyPrice={buyPrice}
                      sellPrice={sellPrice}
                      materialCost={materialCost}
                      stationFeePer100={inputs.stationFeePer100}
                      itemTier={effectiveItem.tier}
                      quantity={inputs.quantity}
                      journalBonus={journalBonusEach}
                    />
                  </>
                )}
              </div>

              <div className="grid gap-2 rounded-xl border border-border-light bg-bg-light/40 p-3 text-xs dark:border-border dark:bg-bg/40">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
                  <span>Available Variants</span>
                  <button
                    type="button"
                    onClick={() => setVariantsCollapsed((prev) => !prev)}
                    className="rounded border border-border-light px-2 py-1 text-[10px] text-text1-light hover:bg-bg-light/60 dark:border-border dark:text-text1 dark:hover:bg-bg/60"
                  >
                    {variantsCollapsed ? 'Expand' : 'Collapse'}
                  </button>
                </div>
                {!variantsCollapsed && (
                  <ItemVariants
                    variants={variants}
                    prices={new Map(
                      variants.map((variant) => [
                        variant.item_id,
                        getSellPrice(variant.item_id, resolvedSellCity),
                      ])
                    )}
                    onSelect={(variant) => {
                      const baseItem = getItemById(variant.base_item_id) ?? variant
                      setSelectedItem(baseItem)
                      updateInputs({ enchantment: variant.enchantment })
                    }}
                  />
                )}
              </div>

              <div className="grid gap-2 rounded-xl border border-border-light bg-bg-light/40 p-3 text-xs dark:border-border dark:bg-bg/40">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
                  <span>Price History</span>
                  <button
                    type="button"
                    onClick={() => setHistoryCollapsed((prev) => !prev)}
                    className="rounded border border-border-light px-2 py-1 text-[10px] text-text1-light hover:bg-bg-light/60 dark:border-border dark:text-text1 dark:hover:bg-bg/60"
                  >
                    {historyCollapsed ? 'Expand' : 'Collapse'}
                  </button>
                </div>
                {!historyCollapsed && <PriceHistoryChart itemId={effectiveItem.item_id} />}
              </div>

              {!journalsCollapsed && (
                <div className="grid gap-2 rounded-xl border border-border-light bg-bg-light/40 p-3 text-xs dark:border-border dark:bg-bg/40">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
                    <span>Journal Calculator</span>
                    <button
                      type="button"
                      onClick={() => setJournalsCollapsed(true)}
                      className="rounded border border-border-light px-2 py-1 text-[10px] text-text1-light hover:bg-bg-light/60 dark:border-border dark:text-text1 dark:hover:bg-bg/60"
                    >
                      Collapse
                    </button>
                  </div>
                  <JournalCalculator />
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-light dark:text-muted">Select an item to see details.</div>
          )}
        </section>
      </div>
    </section>
  )
}
