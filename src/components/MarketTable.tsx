'use client'

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import AutoSizer from 'react-virtualized-auto-sizer'
import { VariableSizeList as List } from 'react-window'
import type { MarketData } from '@/hooks/useMarketData'
import type { Item } from '@/lib/items'

interface Props {
  items: Item[]
  marketData: MarketData[]
  selectedCity: string
  favorites: string[]
  onToggleFavorite: (itemId: string) => void
  loading: boolean
  error: string | null
  onItemClick?: (itemId: string) => void
}

export function MarketTable({
  items,
  marketData,
  selectedCity,
  favorites,
  onToggleFavorite,
  loading,
  error,
  onItemClick,
}: Props) {
  const marketMap = useMemo(() => {
    const map = new Map<string, MarketData[]>()
    for (const entry of marketData) {
      const list = map.get(entry.itemId) ?? []
      list.push(entry)
      map.set(entry.itemId, list)
    }
    return map
  }, [marketData])

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const listRef = useRef<List>(null)

  useEffect(() => {
    listRef.current?.resetAfterIndex(0)
  }, [expanded, items.length])

  const toggleExpanded = (itemId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const handleItemClick = useCallback(
    (itemId: string) => {
      if (onItemClick) onItemClick(itemId)
    },
    [onItemClick]
  )

  const handleFavoriteClick = useCallback(
    (event: React.MouseEvent, itemId: string) => {
      event.stopPropagation()
      onToggleFavorite(itemId)
    },
    [onToggleFavorite]
  )

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted-light dark:text-muted">
        Loading market data...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-red-400">
        Error: {error}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted-light dark:text-muted">
        No items match your filters.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="grid grid-cols-[2fr_0.6fr_0.6fr_1fr_1fr_1fr_0.4fr] border-b border-border bg-surface/60 px-3 py-2 text-xs uppercase tracking-wide text-muted-light dark:text-muted">
        <div>Item</div>
        <div>Tier</div>
        <div>Enchant</div>
        <div>Sell Min</div>
        <div>Buy Max</div>
        <div>City</div>
        <div>Fav</div>
      </div>
      <div className="h-[70vh]">
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemCount={items.length}
              itemSize={(index) => (expanded.has(items[index].id) ? 140 : 64)}
              itemData={{
                items,
                marketMap,
                selectedCity,
                favorites,
                expanded,
                toggleExpanded,
                onItemClick: handleItemClick,
                onToggleFavorite: handleFavoriteClick,
              }}
              ref={listRef}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  )
}

function formatPrice(price: number): string {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`
  if (price >= 1000) return `${(price / 1000).toFixed(1)}k`
  return price.toLocaleString()
}

const Row = ({
  index,
  style,
  data,
}: {
  index: number
  style: React.CSSProperties
  data: {
    items: Item[]
    marketMap: Map<string, MarketData[]>
    selectedCity: string
    favorites: string[]
    expanded: Set<string>
    toggleExpanded: (itemId: string) => void
    onItemClick?: (itemId: string) => void
    onToggleFavorite: (event: React.MouseEvent, itemId: string) => void
  }
}) => {
  const item = data.items[index]
  const entries = data.marketMap.get(item.id) ?? []
  const cityEntries =
    data.selectedCity === 'all'
      ? entries
      : entries.filter((entry) => entry.city === data.selectedCity)
  const itemData =
    cityEntries.find((entry) => entry.sellPriceMin > 0) ??
    cityEntries.find((entry) => entry.buyPriceMax > 0) ??
    cityEntries[0]
  const isFavorite = data.favorites.includes(item.id)
  const isExpanded = data.expanded.has(item.id)

  return (
    <div style={style} className="border-b border-border/40 text-sm">
      <div
        className="grid grid-cols-[2fr_0.6fr_0.6fr_1fr_1fr_1fr_0.4fr] items-center gap-2 px-3 py-2 hover:bg-surface/40"
        onClick={() => data.onItemClick?.(item.id)}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              data.toggleExpanded(item.id)
            }}
            className="rounded border border-border px-2 py-1 text-xs text-muted-light hover:bg-surface dark:text-muted"
          >
            {isExpanded ? 'Hide' : 'Cities'}
          </button>
          <img
            src={`https://render.albiononline.com/v1/item/${item.id}`}
            alt={item.name}
            className="h-9 w-9 rounded"
            loading="lazy"
          />
          <div>
            <div className="font-medium text-text1-light dark:text-text1">{item.name}</div>
            <div className="text-xs text-muted-light dark:text-muted">{item.itemClass}</div>
          </div>
        </div>
        <div className="text-text1-light dark:text-text1">T{item.tier}</div>
        <div className="text-text1-light dark:text-text1">
          {item.enchantment ? `.${item.enchantment}` : '--'}
        </div>
        <div className="text-text1-light dark:text-text1">
          {itemData?.sellPriceMin ? formatPrice(itemData.sellPriceMin) : '--'}
        </div>
        <div className="text-text1-light dark:text-text1">
          {itemData?.buyPriceMax ? formatPrice(itemData.buyPriceMax) : '--'}
        </div>
        <div className="text-text1-light dark:text-text1">{itemData?.city ?? '--'}</div>
        <div>
          <button
            type="button"
            onClick={(event) => data.onToggleFavorite(event, item.id)}
            className="rounded p-1 hover:bg-surface"
          >
            {isFavorite ? (
              <StarSolidIcon className="h-5 w-5 text-amber-400" />
            ) : (
              <StarIcon className="h-5 w-5 text-muted-light dark:text-muted" />
            )}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="bg-surface/20 px-6 py-2 text-xs text-muted-light dark:text-muted">
          <div className="grid gap-2 md:grid-cols-2">
            {entries.length === 0 && <div>No city prices yet.</div>}
            {entries.map((entry) => (
              <div key={`${entry.itemId}-${entry.city}-${entry.quality}`} className="flex justify-between">
                <span>{entry.city}</span>
                <span>
                  Sell {entry.sellPriceMin ? formatPrice(entry.sellPriceMin) : '--'} - Buy{' '}
                  {entry.buyPriceMax ? formatPrice(entry.buyPriceMax) : '--'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
