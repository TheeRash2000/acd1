'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMarketServer } from '@/stores/marketServer'
import { parseItemId } from '@/lib/crafting/calculations'

interface Props {
  itemId: string
}

type PriceHistoryData = {
  timestamp: number
  buyPrice: number
  sellPrice: number
  volume: number
}

type Filters = {
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' | '90d'
  dataSource: 'sell' | 'buy' | 'both'
  aggregation: 'raw' | 'hourly' | 'daily'
  market: 'All' | (typeof CITY_LIST)[number]
}

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

const CITY_LABELS: Record<string, string> = {
  BlackMarket: 'Black Market',
}

function normalizeCity(value?: string | null) {
  const trimmed = (value ?? '').replace(/\s+/g, ' ').trim()
  if (/^black market$/i.test(trimmed) || /^blackmarket$/i.test(trimmed)) {
    return 'BlackMarket'
  }
  return trimmed
}

function formatCityLabel(value: string) {
  return CITY_LABELS[value] ?? value
}

const TIME_SCALE: Record<Filters['timeRange'], string> = {
  '1h': '1',
  '6h': '6',
  '24h': '24',
  '7d': '168',
  '30d': '720',
  '90d': '2160',
}

function normalizeMarketItemId(itemId: string) {
  const parsed = parseItemId(itemId)
  if (parsed.enchantment > 0) {
    return `${parsed.baseId}@${parsed.enchantment}`
  }
  return parsed.baseId
}

function normalizeTimestamp(raw: number) {
  if (raw < 10000000000) {
    return raw * 1000
  }
  return raw
}

function formatPrice(price: number) {
  if (!price) return '--'
  if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M`
  if (price >= 1000) return `${(price / 1000).toFixed(2)}k`
  return price.toFixed(0)
}

function formatDate(timestamp: number, range: Filters['timeRange']) {
  const date = new Date(timestamp)
  if (range === '1h' || range === '6h' || range === '24h') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatVolume(volume: number) {
  if (!volume) return '--'
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k`
  return volume.toFixed(0)
}

function groupByBucket(rows: PriceHistoryData[], aggregation: Filters['aggregation']) {
  if (aggregation === 'raw') return rows
  const buckets = new Map<number, PriceHistoryData[]>()
  for (const row of rows) {
    const date = new Date(row.timestamp)
    if (aggregation === 'hourly') {
      date.setMinutes(0, 0, 0)
    } else {
      date.setHours(0, 0, 0, 0)
    }
    const key = date.getTime()
    const list = buckets.get(key) ?? []
    list.push(row)
    buckets.set(key, list)
  }
  return Array.from(buckets.entries())
    .map(([timestamp, entries]) => {
      const buyValues = entries.map((entry) => entry.buyPrice).filter((value) => value > 0)
      const sellValues = entries.map((entry) => entry.sellPrice).filter((value) => value > 0)
      const volume = entries.reduce((sum, entry) => sum + entry.volume, 0)
      return {
        timestamp,
        buyPrice: buyValues.length ? buyValues.reduce((sum, value) => sum + value, 0) / buyValues.length : 0,
        sellPrice: sellValues.length ? sellValues.reduce((sum, value) => sum + value, 0) / sellValues.length : 0,
        volume,
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp)
}

export function PriceHistoryChart({ itemId }: Props) {
  const { server } = useMarketServer()
  const [filters, setFilters] = useState<Filters>({
    timeRange: '24h',
    dataSource: 'sell',
    aggregation: 'hourly',
    market: 'All',
  })
  const [rows, setRows] = useState<PriceHistoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      const marketItemId = normalizeMarketItemId(itemId)
      const locations =
        filters.market === 'All'
          ? API_LOCATIONS.join(',')
          : formatCityLabel(filters.market)
      const params = new URLSearchParams({
        item: marketItemId,
        locations,
        timeScale: TIME_SCALE[filters.timeRange],
        server,
      })
      const res = await fetch(`/api/market/history?${params.toString()}`)
      if (!res.ok) {
        setLoading(false)
        return
      }
      const data = await res.json()
      if (!active || !Array.isArray(data)) {
        setLoading(false)
        return
      }
      const mapped = data
        .flatMap((entry) => {
          const location = normalizeCity(entry.location || entry.city || entry.item_id || '')
          if (filters.market !== 'All' && location && location !== filters.market) {
            return []
          }
          return (entry.data || []).map((row: any) => ({
            timestamp: normalizeTimestamp(row.timestamp),
            buyPrice: row.avg_price_buy ?? row.buy_price_max ?? 0,
            sellPrice: row.avg_price ?? row.sell_price_min ?? 0,
            volume: row.item_count ?? row.volume ?? 0,
          }))
        })
        .filter((row) => row.buyPrice > 0 || row.sellPrice > 0)
      if (!active) return
      setRows(groupByBucket(mapped, filters.aggregation))
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [itemId, server, filters])

  const summary = useMemo(() => {
    if (rows.length === 0) return null
    const values = rows.map((row) => row.sellPrice).filter((value) => value > 0)
    const volumeValues = rows.map((row) => row.volume).filter((value) => value > 0)
    const current = values[values.length - 1] ?? 0
    const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
    const min = values.length ? Math.min(...values) : 0
    const max = values.length ? Math.max(...values) : 0
    const change = values.length > 1 ? current - values[0] : 0
    const changePct = values.length > 1 && values[0] ? (change / values[0]) * 100 : 0
    const volumeTotal = volumeValues.reduce((sum, value) => sum + value, 0)
    const volumeAvg = volumeValues.length ? volumeTotal / volumeValues.length : 0
    return { current, average, min, max, changePct, volumeTotal, volumeAvg }
  }, [rows])

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="grid gap-1">
            <label className="text-[11px] uppercase text-muted-light dark:text-muted">Market</label>
            <select
              value={filters.market}
              onChange={(event) => setFilters((prev) => ({ ...prev, market: event.target.value as Filters['market'] }))}
              className="rounded border border-border-light bg-bg-light px-2 py-1 text-xs dark:border-border dark:bg-bg"
            >
              <option value="All">All cities</option>
              {CITY_LIST.map((city) => (
                <option key={city} value={city}>
                  {formatCityLabel(city)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <label className="text-[11px] uppercase text-muted-light dark:text-muted">Time Range</label>
            <select
              value={filters.timeRange}
              onChange={(event) => setFilters((prev) => ({ ...prev, timeRange: event.target.value as Filters['timeRange'] }))}
              className="rounded border border-border-light bg-bg-light px-2 py-1 text-xs dark:border-border dark:bg-bg"
            >
              <option value="1h">Last hour</option>
              <option value="6h">Last 6 hours</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="grid gap-1">
            <label className="text-[11px] uppercase text-muted-light dark:text-muted">Data Source</label>
            <select
              value={filters.dataSource}
              onChange={(event) => setFilters((prev) => ({ ...prev, dataSource: event.target.value as Filters['dataSource'] }))}
              className="rounded border border-border-light bg-bg-light px-2 py-1 text-xs dark:border-border dark:bg-bg"
            >
              <option value="sell">Sell orders</option>
              <option value="buy">Buy orders</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="grid gap-1">
            <label className="text-[11px] uppercase text-muted-light dark:text-muted">Aggregation</label>
            <select
              value={filters.aggregation}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, aggregation: event.target.value as Filters['aggregation'] }))
              }
              className="rounded border border-border-light bg-bg-light px-2 py-1 text-xs dark:border-border dark:bg-bg"
            >
              <option value="raw">Raw</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
        </div>
        {summary && (
          <div className="grid gap-2 rounded-lg border border-border-light bg-bg-light/40 p-2 text-[11px] dark:border-border dark:bg-bg/40">
            <div className="flex flex-wrap items-center gap-4">
              <span>Current {formatPrice(summary.current)}</span>
              <span>Avg {formatPrice(summary.average)}</span>
              <span>Min {formatPrice(summary.min)}</span>
              <span>Max {formatPrice(summary.max)}</span>
              <span>Vol {formatVolume(summary.volumeAvg)} avg</span>
              <span>Total {formatVolume(summary.volumeTotal)}</span>
              {Number.isFinite(summary.changePct) ? (
                <span className={summary.changePct >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                  {summary.changePct >= 0 ? '+' : ''}{summary.changePct.toFixed(1)}%
                </span>
              ) : (
                <span className="text-muted-light dark:text-muted">--</span>
              )}
            </div>
          </div>
        )}
      </div>

      {loading && <div className="text-xs text-muted-light dark:text-muted">Loading price history...</div>}
      {!loading && rows.length === 0 && (
        <div className="text-xs text-muted-light dark:text-muted">No price data available.</div>
      )}
      {rows.length > 0 && (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => formatDate(Number(value), filters.timeRange)}
                fontSize={10}
                stroke="#94a3b8"
              />
              <YAxis
                yAxisId="price"
                tickFormatter={(value) => formatPrice(Number(value))}
                fontSize={10}
                stroke="#94a3b8"
              />
              <YAxis
                yAxisId="volume"
                orientation="right"
                tickFormatter={(value) => formatVolume(Number(value))}
                fontSize={10}
                stroke="#94a3b8"
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'Volume') return formatVolume(value)
                  return formatPrice(value)
                }}
                labelFormatter={(value) => new Date(Number(value)).toLocaleString()}
              />
              <Legend />
              <Bar yAxisId="volume" dataKey="volume" name="Volume" fill="#334155" />
              {(filters.dataSource === 'sell' || filters.dataSource === 'both') && (
                <Line yAxisId="price" type="monotone" dataKey="sellPrice" stroke="#38a169" name="Sell" dot={false} />
              )}
              {(filters.dataSource === 'buy' || filters.dataSource === 'both') && (
                <Line yAxisId="price" type="monotone" dataKey="buyPrice" stroke="#f56565" name="Buy" dot={false} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
