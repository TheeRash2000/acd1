import { useEffect, useState } from 'react'
import { useMarketServer } from '@/stores/marketServer'

export interface MarketData {
  itemId: string
  city: string
  quality: string
  sellPriceMin: number
  sellPriceMax: number
  buyPriceMin: number
  buyPriceMax: number
  sellPriceMinDate?: string
  buyPriceMaxDate?: string
  timestamp: number
}

const qualityMap: Record<number, string> = {
  1: 'Normal',
  2: 'Good',
  3: 'Outstanding',
  4: 'Excellent',
  5: 'Masterpiece',
}

export function useMarketData(itemIds: string[], refreshInterval = 300000) {
  const { server } = useMarketServer()
  const [data, setData] = useState<MarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (itemIds.length === 0) {
      setData([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        server,
        items: itemIds.join(','),
        locations: [
          'Bridgewatch',
          'Fort Sterling',
          'Lymhurst',
          'Martlock',
          'Thetford',
          'Caerleon',
          'Brecilien',
          'Black Market',
        ].join(','),
      })
      const response = await fetch(`/api/market?${params.toString()}`, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to load market data')
      }
      const raw = await response.json()
      const now = Date.now()
      const transformed: MarketData[] = raw.map((item: any) => ({
        itemId: item.item_id,
        city: item.city ?? 'Unknown',
        quality: qualityMap[item.quality] ?? String(item.quality ?? 'Normal'),
        sellPriceMin: item.sell_price_min ?? 0,
        sellPriceMax: item.sell_price_max ?? 0,
        buyPriceMin: item.buy_price_min ?? 0,
        buyPriceMax: item.buy_price_max ?? 0,
        sellPriceMinDate: item.sell_price_min_date,
        buyPriceMaxDate: item.buy_price_max_date,
        timestamp: now,
      }))
      setData(transformed)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load market data')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      fetchData()
    }, refreshInterval)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchData()
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility)
    }
    return () => {
      clearInterval(interval)
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility)
      }
    }
  }, [refreshInterval, server, itemIds.join(',')])

  return { data, loading, error, refetch: fetchData }
}
