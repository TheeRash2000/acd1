'use client'

import type { Item } from '@/lib/crafting/types'

interface Props {
  variants: Item[]
  prices: Map<string, number>
  onSelect: (item: Item) => void
}

function formatPrice(price: number) {
  if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M`
  if (price >= 1000) return `${(price / 1000).toFixed(2)}k`
  return price.toFixed(0)
}

export function ItemVariants({ variants, prices, onSelect }: Props) {
  if (variants.length === 0) return null

  return (
    <div className="grid gap-3 rounded-xl border border-border-light bg-bg-light/40 p-3 text-xs dark:border-border dark:bg-bg/40">
      <div className="text-[11px] uppercase tracking-wide text-muted-light dark:text-muted">
        Available Variants
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {variants.map((variant) => (
          <button
            key={variant.item_id}
            type="button"
            onClick={() => onSelect(variant)}
            className="rounded-lg border border-border/60 bg-bg/40 p-2 text-left hover:border-amber-400/60"
          >
            <div className="flex items-center gap-2">
              <img
                src={`https://render.albiononline.com/v1/item/${variant.item_id}.png`}
                alt={variant.name}
                className="h-10 w-10 rounded"
              />
              <div>
                <div className="text-[11px] text-muted-light dark:text-muted">
                  T{variant.tier}
                  {variant.enchantment > 0 ? ` .${variant.enchantment}` : ''}
                </div>
                <div className="text-xs text-text1-light dark:text-text1">{variant.name}</div>
                <div className="text-[11px] text-muted-light dark:text-muted">
                  {formatPrice(prices.get(variant.item_id) || 0)}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
