'use client'

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { getItemById, Item } from '@/lib/items'
import { useCharacterSpecs } from '@/hooks/useCharacterSpecs'
import { IPDisplay } from '@/components/IPDisplay'
import { useMarketServer } from '@/stores/marketServer'
import itemsIndex from '@/lib/data/generated/itemsIndex.json'
import { useBuilds, type BuildItemRef } from '@/stores/builds'

interface Props {
  isOpen: boolean
  closeModal: () => void
  itemId: string
  characterName: string
  onOpenBuildPanel?: () => void
}

export function ItemDetailModal({ isOpen, closeModal, itemId, characterName, onOpenBuildPanel }: Props) {
  const [item, setItem] = useState<Item | null>(null)
  const { specs, hasCharacter } = useCharacterSpecs(characterName)
  const [ipResult, setIPResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'player' | 'economy'>('player')
  const [marketRows, setMarketRows] = useState<any[]>([])
  const [marketLoading, setMarketLoading] = useState(false)
  const [historyRows, setHistoryRows] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [timeRangeDays, setTimeRangeDays] = useState(7)
  const { server } = useMarketServer()
  const { setSlot } = useBuilds()

  useEffect(() => {
    let active = true
    if (!itemId) {
      setItem(null)
      return
    }
    getItemById(itemId).then((loaded) => {
      if (!active) return
      setItem(loaded ?? null)
    })
    return () => {
      active = false
    }
  }, [itemId])

  useEffect(() => {
    if (!itemId || activeTab !== 'economy') return
    let active = true
    setMarketLoading(true)
    const params = new URLSearchParams({
      server,
      items: itemId,
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
    fetch(`/api/market?${params.toString()}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to load market data')
        return response.json()
      })
      .then((rows) => {
        if (!active) return
        setMarketRows(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!active) return
        setMarketRows([])
      })
      .finally(() => {
        if (!active) return
        setMarketLoading(false)
      })
    return () => {
      active = false
    }
  }, [activeTab, itemId, server])

  useEffect(() => {
    if (!itemId || activeTab !== 'economy') return
    let active = true
    setHistoryLoading(true)
    const params = new URLSearchParams({
      server,
      item: itemId,
      timeScale: '24',
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
      qualities: '1,2,3,4,5',
    })
    fetch(`/api/market/history?${params.toString()}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to load market history')
        return response.json()
      })
      .then((rows) => {
        if (!active) return
        setHistoryRows(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!active) return
        setHistoryRows([])
      })
      .finally(() => {
        if (!active) return
        setHistoryLoading(false)
      })
    return () => {
      active = false
    }
  }, [activeTab, itemId, server, timeRangeDays])

  useEffect(() => {
    let active = true
    if (!item || !hasCharacter) {
      setIPResult(null)
      return
    }
    setLoading(true)
    fetch('/api/ip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: item.id,
        quality: 'Excellent',
        characterSpecs: specs,
        contentType: 'openWorld',
      }),
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.error ?? 'IP calculation failed')
        }
        if (!active) return
        setIPResult(data)
      })
      .catch(() => {
        if (!active) return
        setIPResult(null)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [item, hasCharacter, specs])

  if (!item) return null

  const handleAddToBuild = () => {
    const indexEntry = (itemsIndex as Record<string, any>)[item.id]
    const slotType = indexEntry?.slotType ?? item.slot
    const buildSlot = resolveBuildSlot(slotType)
    if (!buildSlot) return
    const ref: BuildItemRef = {
      uniquename: item.id,
      tier: item.tier ?? 0,
      enchant: item.enchantment ?? 0,
      quality: 'normal',
    }
    setSlot(buildSlot, ref)
    if (onOpenBuildPanel) onOpenBuildPanel()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-surface p-6 text-left align-middle shadow-xl transition-all">
                <div className="mb-4 flex items-center justify-between">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-text1-light dark:text-text1">
                    {item.name}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md p-2 text-muted-light hover:bg-surface dark:text-muted"
                    onClick={closeModal}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-4 flex gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => setActiveTab('player')}
                    className={`rounded-full border px-4 py-2 ${
                      activeTab === 'player'
                        ? 'border-amber-400 bg-amber-400 text-black'
                        : 'border-border text-text1-light dark:text-text1'
                    }`}
                  >
                    Player
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('economy')}
                    className={`rounded-full border px-4 py-2 ${
                      activeTab === 'economy'
                        ? 'border-amber-400 bg-amber-400 text-black'
                        : 'border-border text-text1-light dark:text-text1'
                    }`}
                  >
                    Economy
                  </button>
                </div>

                {activeTab === 'player' && (
                  <div className="grid gap-6 md:grid-cols-[260px_1fr]">
                    <div className="space-y-4">
                      <img
                        src={`https://render.albiononline.com/v1/item/${item.id}`}
                        alt={item.name}
                        className="mx-auto h-32 w-32 rounded-lg"
                      />

                      <div className="space-y-2 text-sm text-text1-light dark:text-text1">
                        <DetailRow label="ID" value={item.id} mono />
                        <DetailRow label="Tier" value={`T${item.tier}`} />
                        <DetailRow label="Enchant" value={item.enchantment ? `.${item.enchantment}` : 'None'} />
                        <DetailRow label="Slot" value={item.slot} />
                        <DetailRow label="Class" value={item.itemClass} />
                        <DetailRow label="Base IP" value={String(item.power ?? '--')} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-lg border border-border bg-surface/60 p-4">
                        <h4 className="mb-2 text-sm font-semibold text-text1-light dark:text-text1">IP Calculator</h4>
                        {loading ? (
                          <div className="text-xs text-muted-light dark:text-muted">Calculating...</div>
                        ) : ipResult ? (
                          <IPDisplay result={ipResult} showDebug />
                        ) : (
                          <div className="text-xs text-muted-light dark:text-muted">
                            Select a character to see IP.
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg border border-border bg-surface/60 p-4">
                        <h4 className="mb-2 text-sm font-semibold text-text1-light dark:text-text1">Progression</h4>
                        <DetailRow label="Mastery" value={item.masteryTable} mono />
                        <DetailRow label="Specialization" value={item.specTable} mono />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'economy' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text1-light dark:text-text1">Economy</span>
                        <span className="text-xs text-muted-light dark:text-muted">Server: {server.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setTimeRangeDays(1)}
                          className={timeRangeDays === 1 ? 'btn-forge px-3 py-1' : 'btn-secondary px-3 py-1'}
                        >
                          1D
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimeRangeDays(7)}
                          className={timeRangeDays === 7 ? 'btn-forge px-3 py-1' : 'btn-secondary px-3 py-1'}
                        >
                          7D
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimeRangeDays(30)}
                          className={timeRangeDays === 30 ? 'btn-forge px-3 py-1' : 'btn-secondary px-3 py-1'}
                        >
                          30D
                        </button>
                      </div>
                    </div>

                    <EconomySummary
                      historyRows={historyRows}
                      historyLoading={historyLoading}
                      marketRows={marketRows}
                      marketLoading={marketLoading}
                      timeRangeDays={timeRangeDays}
                    />

                    <EconomyPerCity
                      historyRows={historyRows}
                      historyLoading={historyLoading}
                      timeRangeDays={timeRangeDays}
                    />
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleAddToBuild}
                    className="btn-forge"
                  >
                    Add to Build
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

function resolveBuildSlot(slotType: string | undefined) {
  switch (slotType) {
    case 'weapon':
    case 'mainhand':
      return 'weapon'
    case 'offhand':
      return 'offhand'
    case 'head':
      return 'head'
    case 'chest':
    case 'armor':
      return 'chest'
    case 'shoes':
      return 'shoes'
    case 'cape':
      return 'cape'
    case 'mount':
      return 'mount'
    case 'food':
      return 'food'
    case 'potion':
      return 'potion'
    default:
      return null
  }
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-light dark:text-muted">{label}</span>
      <span className={mono ? 'text-xs font-mono text-text1-light dark:text-text1' : 'text-sm'}>
        {value}
      </span>
    </div>
  )
}

function formatPrice(price: number): string {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`
  if (price >= 1000) return `${(price / 1000).toFixed(1)}k`
  return price.toLocaleString()
}

function getCityStatus(avgPrice: number, volume: number) {
  if (!avgPrice || volume === 0) {
    return { label: 'No data', className: 'bg-red-500/70' }
  }
  if (volume >= 50) {
    return { label: 'Active', className: 'bg-emerald-400' }
  }
  return { label: 'Low volume', className: 'bg-amber-400' }
}

const CITY_ORDER = [
  'Bridgewatch',
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford',
  'Caerleon',
  'Brecilien',
  'Black Market',
] as const

function aggregateHistory(rows: any[], rangeDays: number) {
  const totals: Record<string, { sum: number; count: number }> = {}
  let overallSum = 0
  let overallCount = 0
  let latestTimestamp = 0

  for (const row of rows) {
    const data = Array.isArray(row.data) ? row.data : []
    for (const point of data) {
      const timestamp = new Date(point.timestamp ?? 0).getTime()
      if (timestamp > latestTimestamp) latestTimestamp = timestamp
    }
  }

  const cutoff = latestTimestamp
    ? latestTimestamp - rangeDays * 24 * 60 * 60 * 1000
    : 0

  for (const row of rows) {
    const city = row.location ?? 'Unknown'
    if (!totals[city]) totals[city] = { sum: 0, count: 0 }
    const data = Array.isArray(row.data) ? row.data : []
    for (const point of data) {
      const timestamp = new Date(point.timestamp ?? 0).getTime()
      if (!timestamp || (cutoff && timestamp < cutoff)) continue
      const count = Number(point.item_count ?? 0)
      const price = Number(point.avg_price ?? 0)
      if (!count || !price) continue
      totals[city].sum += price * count
      totals[city].count += count
      overallSum += price * count
      overallCount += count
    }
  }

  const perCity = CITY_ORDER.map((city) => {
    const stats = totals[city] ?? { sum: 0, count: 0 }
    return {
      city,
      avgPrice: stats.count ? stats.sum / stats.count : 0,
      volume: stats.count,
    }
  })

  return {
    overallAvg: overallCount ? overallSum / overallCount : 0,
    overallVolume: overallCount,
    perCity,
  }
}

function EconomySummary({
  historyRows,
  historyLoading,
  marketRows,
  marketLoading,
  timeRangeDays,
}: {
  historyRows: any[]
  historyLoading: boolean
  marketRows: any[]
  marketLoading: boolean
  timeRangeDays: number
}) {
  const { overallAvg, overallVolume } = aggregateHistory(historyRows, timeRangeDays)

  const sellMin = marketRows.reduce((best, row) => {
    const value = Number(row.sell_price_min ?? 0)
    if (!value) return best
    return best === 0 || value < best ? value : best
  }, 0)

  const buyMax = marketRows.reduce((best, row) => {
    const value = Number(row.buy_price_max ?? 0)
    if (!value) return best
    return value > best ? value : best
  }, 0)

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-lg border border-border bg-surface/60 p-4">
        <div className="text-xs text-muted-light dark:text-muted">Average Price</div>
        <div className="text-lg font-semibold text-text1-light dark:text-text1">
          {historyLoading ? 'Loading...' : overallAvg ? formatPrice(overallAvg) : '--'}
        </div>
        <div className="text-[11px] text-muted-light dark:text-muted">Weighted across all cities.</div>
      </div>
      <div className="rounded-lg border border-border bg-surface/60 p-4">
        <div className="text-xs text-muted-light dark:text-muted">Volume Sold</div>
        <div className="text-lg font-semibold text-text1-light dark:text-text1">
          {historyLoading ? 'Loading...' : overallVolume ? overallVolume.toLocaleString() : '--'}
        </div>
        <div className="text-[11px] text-muted-light dark:text-muted">Historical item count.</div>
      </div>
      <div className="rounded-lg border border-border bg-surface/60 p-4">
        <div className="text-xs text-muted-light dark:text-muted">Current Best</div>
        <div className="text-sm text-text1-light dark:text-text1">
          Sell {marketLoading ? '...' : sellMin ? formatPrice(sellMin) : '--'}
        </div>
        <div className="text-sm text-text1-light dark:text-text1">
          Buy {marketLoading ? '...' : buyMax ? formatPrice(buyMax) : '--'}
        </div>
      </div>
    </div>
  )
}

function EconomyPerCity({
  historyRows,
  historyLoading,
  timeRangeDays,
}: {
  historyRows: any[]
  historyLoading: boolean
  timeRangeDays: number
}) {
  const { perCity } = aggregateHistory(historyRows, timeRangeDays)
  const missingCount = perCity.filter((city) => !city.avgPrice).length
  const [expandedCity, setExpandedCity] = useState<string | null>(null)

  return (
    <div className="rounded-lg border border-border bg-surface/60 p-4">
      <div className="mb-2 flex items-center justify-between text-sm font-semibold text-text1-light dark:text-text1">
        <span>Per City Average</span>
        {missingCount > 0 && (
          <span className="text-xs font-normal text-muted-light dark:text-muted">
            {missingCount} missing - run data client
          </span>
        )}
      </div>
      {historyLoading ? (
        <div className="text-xs text-muted-light dark:text-muted">Loading city averages...</div>
      ) : perCity.length === 0 ? (
        <div className="text-xs text-muted-light dark:text-muted">No history data yet.</div>
      ) : (
        <div className="grid gap-2 text-xs md:grid-cols-2">
          {perCity.map((city) => {
            const status = getCityStatus(city.avgPrice, city.volume)
            const isExpanded = expandedCity === city.city
            return (
              <div key={city.city} className="rounded-md border border-border/60 bg-surface/40 p-2">
                <button
                  type="button"
                  onClick={() => setExpandedCity(isExpanded ? null : city.city)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${status.className}`} />
                    <span className="font-medium text-text1-light dark:text-text1">{city.city}</span>
                  </div>
                  <span className="text-muted-light dark:text-muted">
                    {city.avgPrice ? `Avg ${formatPrice(city.avgPrice)}` : 'No data'}
                  </span>
                </button>
                {isExpanded && (
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-light dark:text-muted">
                    <span>Volume</span>
                    <span>{city.volume ? city.volume.toLocaleString() : '0'}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
