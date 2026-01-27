'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMarketServer } from '@/stores/marketServer'
import { parseItemId } from '@/lib/crafting/calculations'

type PriceEntry = {
  item_id: string
  city: string
  buy_price_max: number
  sell_price_min: number
  quality: number
  update: string
}

const API_LOCATIONS = [
  'Bridgewatch',
  'Lymhurst',
  'Martlock',
  'Fort Sterling',
  'Thetford',
  'Caerleon',
  'Brecilien',
  'Black Market',
]

const normalizeCity = (value?: string | null) => {
  const trimmed = (value ?? '').replace(/\s+/g, ' ').trim()
  if (/^black market$/i.test(trimmed) || /^blackmarket$/i.test(trimmed)) {
    return 'BlackMarket'
  }
  return trimmed
}

const normalizeItemId = (itemId: string) => {
  const parsed = parseItemId(itemId)
  if (parsed.enchantment > 0) {
    return `${parsed.baseId}@${parsed.enchantment}`
  }
  return parsed.baseId
}

export function useCraftingMarketPrices(
  itemIds: string[],
  refreshMs = 60000,
  refreshToken = 0
) {
  const { server } = useMarketServer()
  const [prices, setPrices] = useState<Map<string, PriceEntry[]>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  const dedupedItems = useMemo(() => {
    const mapped = itemIds.flatMap((itemId) => {
      const normalized = normalizeItemId(itemId)
      return normalized === itemId ? [itemId] : [itemId, normalized]
    })
    return Array.from(new Set(mapped))
  }, [itemIds])

  useEffect(() => {
    if (dedupedItems.length === 0) return
    let cancelled = false

    const fetchBatch = async (batch: string[]) => {
      const params = new URLSearchParams()
      params.set('items', batch.join(','))
      params.set('locations', API_LOCATIONS.join(','))
      params.set('server', server)
      const res = await fetch(`/api/market?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) {
        throw new Error('Failed to fetch market prices')
      }
      const data = (await res.json()) as PriceEntry[]
      return data
    }

  const fetchPrices = async () => {
      setLoading(true)
      setError(null)
      try {
        const batchSize = 50
        const batches: string[][] = []
        for (let i = 0; i < dedupedItems.length; i += batchSize) {
          batches.push(dedupedItems.slice(i, i + batchSize))
        }
        const results = await Promise.allSettled(batches.map(fetchBatch))
        const merged = results
          .filter((result) => result.status === 'fulfilled')
          .flatMap((result) => result.value)
        if (cancelled) return
        const map = new Map<string, PriceEntry[]>()
        for (const row of merged) {
          const city = normalizeCity(row.city)
          if (!city) continue
          const normalizedItemId = normalizeItemId(row.item_id)
          const keys = normalizedItemId === row.item_id
            ? [`${row.item_id}:${city}`]
            : [`${row.item_id}:${city}`, `${normalizedItemId}:${city}`]
          for (const key of keys) {
            const list = map.get(key) ?? []
            list.push(row)
            map.set(key, list)
          }
        }
        setPrices(map)
        setLastUpdated(Date.now())
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? 'Failed to fetch market prices')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPrices()
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      fetchPrices()
    }, refreshMs)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchPrices()
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility)
    }
    return () => {
      cancelled = true
      clearInterval(interval)
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility)
      }
    }
  }, [dedupedItems, server, refreshMs, refreshToken])

  return { prices, loading, error, lastUpdated }
}
