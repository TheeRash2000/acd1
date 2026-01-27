'use client'

import { memo } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList as List } from 'react-window'
import type { Item } from '@/lib/crafting/types'

interface ItemMetric {
  price?: number
  margin?: number
}

interface Props {
  items: Item[]
  metrics: Record<string, ItemMetric>
  selectedItemId?: string | null
  onSelect: (item: Item) => void
}

const Row = memo(function Row({
  index,
  style,
  data,
}: {
  index: number
  style: React.CSSProperties
  data: {
    items: Item[]
    metrics: Record<string, ItemMetric>
    selectedItemId?: string | null
    onSelect: (item: Item) => void
  }
}) {
  const item = data.items[index]
  const metric = data.metrics[item.item_id]
  const isSelected = data.selectedItemId === item.item_id

  return (
    <div
      style={style}
      onClick={() => data.onSelect(item)}
      className={`flex cursor-pointer items-center gap-3 border-b border-border/40 px-3 py-1.5 text-xs hover:bg-bg-light/60 dark:hover:bg-bg/60 ${
        isSelected ? 'bg-bg-light/70 dark:bg-bg/70' : ''
      }`}
    >
      <img
        src={`https://render.albiononline.com/v1/item/${item.item_id}.png`}
        alt={item.name}
        className="h-9 w-9 rounded"
      />
      <div className="flex-1">
        <div className="text-text1-light dark:text-text1">{item.name}</div>
        <div className="text-[11px] text-muted-light dark:text-muted">
          T{item.tier} - {item.subcategory}
        </div>
      </div>
      <div className="text-right">
        <div className="text-text1-light dark:text-text1">
          {metric?.price ? metric.price.toLocaleString() : '--'}
        </div>
        <div className={`text-[11px] ${metric?.margin && metric.margin >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
          {metric?.margin !== undefined ? `${metric.margin >= 0 ? '+' : ''}${metric.margin.toFixed(1)}%` : '--'}
        </div>
      </div>
    </div>
  )
})

export function ItemList({ items, metrics, selectedItemId, onSelect }: Props) {
  return (
    <div className="h-[520px] rounded-xl border border-border-light bg-bg-light/40 dark:border-border dark:bg-bg/40">
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={58}
            itemData={{ items, metrics, selectedItemId, onSelect }}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  )
}
