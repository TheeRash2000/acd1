
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { BuildPanel } from '@/components/BuildPanel'
import { useBuilds, type BuildItemRef } from '@/stores/builds'
import { useMarketServer } from '@/stores/marketServer'

type PackageSize = 'small' | 'medium' | 'large'
type RiskLevel = 'low' | 'medium' | 'high'

type CityKey =
  | 'martlock'
  | 'bridgewatch'
  | 'lymhurst'
  | 'fortsterling'
  | 'thetford'
  | 'caerleon'

type RouteKey = `${CityKey}-${CityKey}`

type ProfitResult = {
  cost: number
  reward: number
  profit: number
  profitPercent: number
  silverPerHour: number
  estimatedMinutes: number
  riskLevel: RiskLevel
  redZoneCount: number
  heartsSpent: number
  heartsReceived: number
  netHearts: number
  requiredWeight: number
}

type RouteRow = ProfitResult & {
  key: RouteKey
  origin: CityKey
  destination: CityKey
  size: PackageSize
  distance: 'short' | 'long'
  canCarryStatus: 'ok' | 'no' | 'warn'
}

type CityPrice = {
  buy: number
  sell: number
}

type HeartPriceMap = Record<CityKey, Record<CityKey, CityPrice>>

const MISSIONS: Record<PackageSize, { weight: number; cost: number; shortReward: number; longReward: number; caerleonReward: number }> = {
  small: { weight: 125, cost: 3, shortReward: 4, longReward: 5, caerleonReward: 6 },
  medium: { weight: 688, cost: 7, shortReward: 9, longReward: 11, caerleonReward: 12 },
  large: { weight: 1623, cost: 15, shortReward: 18, longReward: 21, caerleonReward: 22 },
}

const CITIES: Record<CityKey, { name: string; heart: string; heartId: string; color: string }> = {
  martlock: { name: 'Martlock', heart: 'Highland Heart', heartId: 'T1_FACTION_HIGHLAND_TOKEN_1', color: '#4A90A4' },
  bridgewatch: { name: 'Bridgewatch', heart: 'Beast Heart', heartId: 'T1_FACTION_STEPPE_TOKEN_1', color: '#D4A44A' },
  lymhurst: { name: 'Lymhurst', heart: 'Tree Heart', heartId: 'T1_FACTION_FOREST_TOKEN_1', color: '#5A9A5A' },
  fortsterling: { name: 'Fort Sterling', heart: 'Mountain Heart', heartId: 'T1_FACTION_MOUNTAIN_TOKEN_1', color: '#8A8A9A' },
  thetford: { name: 'Thetford', heart: 'Swamp Heart', heartId: 'T1_FACTION_SWAMP_TOKEN_1', color: '#7A5A8A' },
  caerleon: { name: 'Caerleon', heart: 'Rogue Heart', heartId: 'T1_FACTION_CAERLEON_TOKEN_1', color: '#9A4A4A' },
}

const ROUTES: Record<RouteKey, { distance: 'short' | 'long'; minutes: number; risk: RiskLevel; redZones: number }> = {
  'martlock-bridgewatch': { distance: 'short', minutes: 5, risk: 'low', redZones: 0 },
  'martlock-lymhurst': { distance: 'long', minutes: 8, risk: 'medium', redZones: 1 },
  'martlock-fortsterling': { distance: 'long', minutes: 9, risk: 'medium', redZones: 1 },
  'martlock-thetford': { distance: 'long', minutes: 11, risk: 'high', redZones: 3 },
  'martlock-caerleon': { distance: 'long', minutes: 7, risk: 'high', redZones: 2 },

  'bridgewatch-martlock': { distance: 'short', minutes: 5, risk: 'low', redZones: 0 },
  'bridgewatch-lymhurst': { distance: 'short', minutes: 4, risk: 'low', redZones: 0 },
  'bridgewatch-fortsterling': { distance: 'long', minutes: 8, risk: 'medium', redZones: 1 },
  'bridgewatch-thetford': { distance: 'long', minutes: 7, risk: 'medium', redZones: 1 },
  'bridgewatch-caerleon': { distance: 'long', minutes: 5, risk: 'high', redZones: 2 },

  'lymhurst-martlock': { distance: 'long', minutes: 8, risk: 'medium', redZones: 1 },
  'lymhurst-bridgewatch': { distance: 'short', minutes: 4, risk: 'low', redZones: 0 },
  'lymhurst-fortsterling': { distance: 'long', minutes: 9, risk: 'medium', redZones: 1 },
  'lymhurst-thetford': { distance: 'short', minutes: 5, risk: 'low', redZones: 0 },
  'lymhurst-caerleon': { distance: 'long', minutes: 4, risk: 'high', redZones: 2 },

  'fortsterling-martlock': { distance: 'long', minutes: 9, risk: 'medium', redZones: 1 },
  'fortsterling-bridgewatch': { distance: 'long', minutes: 8, risk: 'medium', redZones: 1 },
  'fortsterling-lymhurst': { distance: 'long', minutes: 9, risk: 'medium', redZones: 1 },
  'fortsterling-thetford': { distance: 'long', minutes: 12, risk: 'high', redZones: 2 },
  'fortsterling-caerleon': { distance: 'long', minutes: 6, risk: 'high', redZones: 2 },

  'thetford-martlock': { distance: 'long', minutes: 11, risk: 'high', redZones: 3 },
  'thetford-bridgewatch': { distance: 'long', minutes: 7, risk: 'medium', redZones: 1 },
  'thetford-lymhurst': { distance: 'short', minutes: 5, risk: 'low', redZones: 0 },
  'thetford-fortsterling': { distance: 'long', minutes: 12, risk: 'high', redZones: 2 },
  'thetford-caerleon': { distance: 'long', minutes: 6, risk: 'high', redZones: 2 },

  'caerleon-martlock': { distance: 'long', minutes: 7, risk: 'high', redZones: 2 },
  'caerleon-bridgewatch': { distance: 'long', minutes: 5, risk: 'high', redZones: 2 },
  'caerleon-lymhurst': { distance: 'long', minutes: 4, risk: 'high', redZones: 2 },
  'caerleon-fortsterling': { distance: 'long', minutes: 6, risk: 'high', redZones: 2 },
  'caerleon-thetford': { distance: 'long', minutes: 6, risk: 'high', redZones: 2 },
}
const CITY_KEYS = Object.keys(CITIES) as CityKey[]
const CITY_NAME_TO_KEY = Object.fromEntries(CITY_KEYS.map((key) => [CITIES[key].name, key])) as Record<string, CityKey>
const PACKAGE_SIZES: PackageSize[] = ['small', 'medium', 'large']

const HEART_IDS = [
  'T1_FACTION_HIGHLAND_TOKEN_1',
  'T1_FACTION_STEPPE_TOKEN_1',
  'T1_FACTION_FOREST_TOKEN_1',
  'T1_FACTION_MOUNTAIN_TOKEN_1',
  'T1_FACTION_SWAMP_TOKEN_1',
  'T1_FACTION_CAERLEON_TOKEN_1',
].join(',')

const CACHE_DURATION = 5 * 60 * 1000

function createEmptyPriceMap(): HeartPriceMap {
  const map = {} as HeartPriceMap
  CITY_KEYS.forEach((heartKey) => {
    const cityMap = {} as Record<CityKey, CityPrice>
    CITY_KEYS.forEach((cityKey) => {
      cityMap[cityKey] = { buy: 0, sell: 0 }
    })
    map[heartKey] = cityMap
  })
  return map
}

function createEmptyOverrides() {
  const map = {} as Record<CityKey, { buy?: number; sell?: number }>
  CITY_KEYS.forEach((key) => {
    map[key] = {}
  })
  return map
}

function createFlatPriceTrends() {
  const map = {} as Record<CityKey, 'up' | 'down' | 'flat'>
  CITY_KEYS.forEach((key) => {
    map[key] = 'flat'
  })
  return map
}

const MOUNT_CATALOG: Array<{ id: string; name: string; capacity: number; speed: number }> = [
  { id: 'T4_MOUNT_GIANTSTAG', name: 'Giant Stag', capacity: 1787, speed: 95 },
  { id: 'T7_MOUNT_MONITORLIZARD_ADC', name: 'Monitor Lizard', capacity: 1116, speed: 90 },
  { id: 'T5_MOUNT_OX', name: 'Transport Ox', capacity: 1489, speed: 75 },
  { id: 'T6_MOUNT_GIANTSTAG_MOOSE', name: 'Giant Moose', capacity: 893, speed: 85 },
  { id: 'T8_MOUNT_OX', name: 'Transport Ox (T8)', capacity: 2000, speed: 72 },
]

const numberFormatter = new Intl.NumberFormat('en-US')

function formatNumber(value: number) {
  return numberFormatter.format(Math.round(value))
}

function formatCompact(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}m`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return `${Math.round(value)}`
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '--'
  return `${value.toFixed(1)}%`
}

function formatAveragePrice(buy: number, sell: number) {
  if (buy > 0 && sell > 0) return formatNumber((buy + sell) / 2)
  if (buy > 0) return formatNumber(buy)
  if (sell > 0) return formatNumber(sell)
  return '0'
}

function formatTimeAgo(timestamp: number | null) {
  if (!timestamp) return 'Never'
  const minutes = Math.floor((Date.now() - timestamp) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes === 1) return '1 minute ago'
  if (minutes < 60) return `${minutes} minutes ago`
  const hours = Math.floor(minutes / 60)
  if (hours === 1) return '1 hour ago'
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

function calculateProfit(
  origin: CityKey,
  destination: CityKey,
  size: PackageSize,
  buyPrice: number,
  sellPrice: number
): ProfitResult {
  const mission = MISSIONS[size]
  const routeKey = `${origin}-${destination}` as RouteKey
  const route = ROUTES[routeKey]

  let rewardHearts: number
  if (origin === 'caerleon' || destination === 'caerleon') {
    rewardHearts = mission.caerleonReward
  } else if (route.distance === 'long') {
    rewardHearts = mission.longReward
  } else {
    rewardHearts = mission.shortReward
  }

  const cost = mission.cost * buyPrice
  const reward = rewardHearts * sellPrice
  const profit = reward - cost
  const profitPercent = cost > 0 ? (profit / cost) * 100 : 0
  const silverPerHour = route.minutes > 0 ? Math.round((profit / route.minutes) * 60) : 0

  return {
    cost,
    reward,
    profit,
    profitPercent,
    silverPerHour,
    estimatedMinutes: route.minutes,
    riskLevel: route.risk,
    redZoneCount: route.redZones,
    heartsSpent: mission.cost,
    heartsReceived: rewardHearts,
    netHearts: rewardHearts - mission.cost,
    requiredWeight: mission.weight,
  }
}

function getRiskBadge(risk: RiskLevel) {
  if (risk === 'low') return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
  if (risk === 'medium') return 'bg-amber-500/20 text-amber-200 border-amber-500/40'
  return 'bg-red-500/20 text-red-200 border-red-500/40'
}

function getCarryStatus(requiredWeight: number, mountCapacity?: number): 'ok' | 'no' | 'warn' {
  if (!mountCapacity) return 'warn'
  return mountCapacity >= requiredWeight ? 'ok' : 'no'
}

function getCarryLabel(status: 'ok' | 'no' | 'warn') {
  if (status === 'ok') return 'OK'
  if (status === 'no') return 'NO'
  return 'WARN'
}

function getTrendLabel(trend: 'up' | 'down' | 'flat') {
  if (trend === 'up') return 'up'
  if (trend === 'down') return 'down'
  return 'flat'
}

function cityLabel(key: CityKey) {
  return CITIES[key].name
}

function mountLabel(mount?: BuildItemRef, catalog?: { name: string; capacity: number }) {
  if (!mount || !mount.uniquename) return 'No mount equipped'
  return catalog ? `${catalog.name} (${Math.round(catalog.capacity)} kg)` : mount.uniquename
}

function getTierFromId(id: string) {
  const match = id.match(/^T(\d)_/)
  if (!match) return 4
  const tier = Number(match[1])
  return Number.isFinite(tier) ? tier : 4
}
export default function HeartRunsCalculator() {
  const { current } = useBuilds()
  const { server } = useMarketServer()
  const [origin, setOrigin] = useState<CityKey>('martlock')
  const [destination, setDestination] = useState<CityKey>('bridgewatch')
  const [buyCity, setBuyCity] = useState<CityKey>('martlock')
  const [sellCity, setSellCity] = useState<CityKey>('bridgewatch')
  const [buyMode, setBuyMode] = useState<'market' | 'manual'>('market')
  const [sellMode, setSellMode] = useState<'market' | 'manual'>('market')
  const [manualBuyPrice, setManualBuyPrice] = useState('')
  const [manualSellPrice, setManualSellPrice] = useState('')
  const [packageSize, setPackageSize] = useState<PackageSize>('medium')
  const [prices, setPrices] = useState<HeartPriceMap>(() => createEmptyPriceMap())
  const [overrides] = useState<Record<CityKey, { buy?: number; sell?: number }>>(
    () => createEmptyOverrides()
  )
  const [priceTrends, setPriceTrends] = useState<Record<CityKey, 'up' | 'down' | 'flat'>>(
    () => createFlatPriceTrends()
  )
  const [selectedHeart, setSelectedHeart] = useState<CityKey>('martlock')
  const [pricesLastUpdated, setPricesLastUpdated] = useState<number | null>(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [buildPanelOpen, setBuildPanelOpen] = useState(true)
  const pricesRef = useRef(prices)

  const [tableSort, setTableSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'profit',
    direction: 'desc',
  })
  const [filterSize, setFilterSize] = useState<PackageSize | 'all'>('all')
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all')
  const [canCarryOnly, setCanCarryOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [showAllRoutes, setShowAllRoutes] = useState(false)

  useEffect(() => {
    if (origin === destination) {
      const fallback = CITY_KEYS.find((key) => key !== origin)
      if (fallback) setDestination(fallback)
    }
  }, [origin, destination])

  useEffect(() => {
    setBuyCity(origin)
  }, [origin])

  useEffect(() => {
    setSellCity(destination)
  }, [destination])

  useEffect(() => {
    pricesRef.current = prices
  }, [prices])

  const mountCatalogEntry = useMemo(() => {
    const id = current.mount?.uniquename
    if (!id) return undefined
    return MOUNT_CATALOG.find((mount) => mount.id === id)
  }, [current.mount])

  const mountCapacity = mountCatalogEntry?.capacity
  const requiredWeight = MISSIONS[packageSize]?.weight ?? 0
  const canCarry = getCarryStatus(requiredWeight, mountCapacity) === 'ok'

  const mountContext = useMemo(
    () => ({
      requiredWeight,
      mountCapacity,
      canCarry,
    }),
    [requiredWeight, mountCapacity, canCarry]
  )

  const fetchPrices = async () => {
    try {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      setPriceLoading(true)
      setPriceError(null)
      const locations = CITY_KEYS.map((key) => CITIES[key].name).join(',')
      const params = new URLSearchParams({
        server,
        items: HEART_IDS,
        locations,
      })
      const response = await fetch(`/api/market?${params.toString()}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`Price fetch failed (${response.status})`)
      const data = (await response.json()) as Array<{
        item_id: string
        city?: string
        location?: string
        quality?: number
        sell_price_min?: number
        sell_price_max?: number
        buy_price_min?: number
        buy_price_max?: number
      }>

      const nextPrices: HeartPriceMap = createEmptyPriceMap()

      data.forEach((entry) => {
        const marketCityKey = CITY_NAME_TO_KEY[entry.city ?? entry.location ?? ''] as CityKey | undefined
        const itemHeartKey = CITY_KEYS.find((key) => CITIES[key].heartId === entry.item_id)
        if (!marketCityKey || !itemHeartKey) return
        const sellMin = entry.sell_price_min ?? 0
        const buyMax = entry.buy_price_max ?? 0
        const current = nextPrices[itemHeartKey][marketCityKey]
        const bestBuy = sellMin > 0 ? (current.buy === 0 ? sellMin : Math.min(current.buy, sellMin)) : current.buy
        const bestSell = buyMax > 0 ? Math.max(current.sell, buyMax) : current.sell
        nextPrices[itemHeartKey][marketCityKey] = { buy: bestBuy, sell: bestSell }
      })

      setPriceTrends((prev) => {
        const next: Record<CityKey, 'up' | 'down' | 'flat'> = { ...prev }
        CITY_KEYS.forEach((key) => {
          const previous = pricesRef.current[key]?.[key]?.sell ?? 0
          const current = nextPrices[key]?.[key]?.sell ?? 0
          if (previous === 0) {
            next[key] = 'flat'
          } else if (current > previous) {
            next[key] = 'up'
          } else if (current < previous) {
            next[key] = 'down'
          } else {
            next[key] = 'flat'
          }
        })
        return next
      })

      setPrices(nextPrices)
      setPricesLastUpdated(Date.now())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch prices'
      setPriceError(message)
    } finally {
      setPriceLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      fetchPrices()
    }, CACHE_DURATION)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchPrices()
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
  }, [server])

  const effectivePriceMatrix = useMemo(() => {
    const next = createEmptyPriceMap()
    CITY_KEYS.forEach((heartKey) => {
      CITY_KEYS.forEach((cityKey) => {
        const base = prices[heartKey]?.[cityKey] ?? { buy: 0, sell: 0 }
        next[heartKey][cityKey] = { ...base }
      })
    })
    CITY_KEYS.forEach((key) => {
      const override = overrides[key]
      if (override.buy && override.buy > 0) next[key][key] = { ...next[key][key], buy: override.buy }
      if (override.sell && override.sell > 0) next[key][key] = { ...next[key][key], sell: override.sell }
    })
    return next
  }, [prices, overrides])

  const hasMarketData = useMemo(() => {
    return CITY_KEYS.some((heart) =>
      CITY_KEYS.some((city) => effectivePriceMatrix[heart][city].buy > 0 || effectivePriceMatrix[heart][city].sell > 0)
    )
  }, [effectivePriceMatrix])

  const bestPricesByHeart = useMemo(() => {
    const bestBuy: Record<CityKey, CityKey | null> = {} as Record<CityKey, CityKey | null>
    const bestSell: Record<CityKey, CityKey | null> = {} as Record<CityKey, CityKey | null>
    CITY_KEYS.forEach((heart) => {
      let buyCity: CityKey | null = null
      let sellCity: CityKey | null = null
      CITY_KEYS.forEach((city) => {
        const price = effectivePriceMatrix[heart][city]
        if (price.buy > 0 && (buyCity === null || price.buy < effectivePriceMatrix[heart][buyCity].buy)) {
          buyCity = city
        }
        if (price.sell > 0 && (sellCity === null || price.sell > effectivePriceMatrix[heart][sellCity].sell)) {
          sellCity = city
        }
      })
      bestBuy[heart] = buyCity
      bestSell[heart] = sellCity
    })
    return { buy: bestBuy, sell: bestSell }
  }, [effectivePriceMatrix])

  const selectedBuyPrice = useMemo(() => {
    if (buyMode === 'manual') return Number(manualBuyPrice) || 0
    return effectivePriceMatrix[origin]?.[buyCity]?.buy ?? 0
  }, [buyMode, manualBuyPrice, effectivePriceMatrix, origin, buyCity])

  const selectedSellPrice = useMemo(() => {
    if (sellMode === 'manual') return Number(manualSellPrice) || 0
    return effectivePriceMatrix[destination]?.[sellCity]?.sell ?? 0
  }, [sellMode, manualSellPrice, effectivePriceMatrix, destination, sellCity])
  const calculated = useMemo(() => {
    if (!origin || !destination || !packageSize) return null
    if (!ROUTES[`${origin}-${destination}` as RouteKey]) return null
    return calculateProfit(origin, destination, packageSize, selectedBuyPrice, selectedSellPrice)
  }, [origin, destination, packageSize, selectedBuyPrice, selectedSellPrice])

  const routeRows = useMemo(() => {
    const rows: RouteRow[] = []
    CITY_KEYS.forEach((from) => {
      CITY_KEYS.forEach((to) => {
        if (from === to) return
        const routeKey = `${from}-${to}` as RouteKey
        const route = ROUTES[routeKey]
        if (!route) return
        PACKAGE_SIZES.forEach((size) => {
          const buyPrice = buyMode === 'manual' ? Number(manualBuyPrice) || 0 : effectivePriceMatrix[from]?.[buyCity]?.buy ?? 0
          const sellPrice = sellMode === 'manual' ? Number(manualSellPrice) || 0 : effectivePriceMatrix[to]?.[sellCity]?.sell ?? 0
          const result = calculateProfit(from, to, size, buyPrice, sellPrice)
          const status = getCarryStatus(result.requiredWeight, mountCapacity)
          rows.push({
            ...result,
            key: routeKey,
            origin: from,
            destination: to,
            size,
            distance: route.distance,
            canCarryStatus: status,
          })
        })
      })
    })
    return rows
  }, [buyMode, manualBuyPrice, sellMode, manualSellPrice, effectivePriceMatrix, buyCity, sellCity, mountCapacity])

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return routeRows.filter((row) => {
      if (filterSize !== 'all' && row.size !== filterSize) return false
      if (filterRisk !== 'all' && row.riskLevel !== filterRisk) return false
      if (canCarryOnly && row.canCarryStatus !== 'ok') return false
      if (term) {
        const originName = cityLabel(row.origin).toLowerCase()
        const destinationName = cityLabel(row.destination).toLowerCase()
        const routeName = `${originName}-${destinationName}`
        if (!originName.includes(term) && !destinationName.includes(term) && !routeName.includes(term)) {
          return false
        }
      }
      return true
    })
  }, [routeRows, filterSize, filterRisk, canCarryOnly, search])

  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows]
    const direction = tableSort.direction === 'asc' ? 1 : -1
    sorted.sort((a, b) => {
      const column = tableSort.column
      if (column === 'route') {
        const left = `${a.origin}-${a.destination}`
        const right = `${b.origin}-${b.destination}`
        return left.localeCompare(right) * direction
      }
      if (column === 'size') return a.size.localeCompare(b.size) * direction
      if (column === 'risk') return a.riskLevel.localeCompare(b.riskLevel) * direction
      if (column === 'time') return (a.estimatedMinutes - b.estimatedMinutes) * direction
      if (column === 'profit') return (a.profit - b.profit) * direction
      if (column === 'percent') return (a.profitPercent - b.profitPercent) * direction
      if (column === 'perHour') return (a.silverPerHour - b.silverPerHour) * direction
      if (column === 'cost') return (a.cost - b.cost) * direction
      if (column === 'reward') return (a.reward - b.reward) * direction
      if (column === 'weight') return (a.requiredWeight - b.requiredWeight) * direction
      if (column === 'carry') return a.canCarryStatus.localeCompare(b.canCarryStatus) * direction
      return 0
    })
    return sorted
  }, [filteredRows, tableSort])

  const bestRoute = useMemo(() => {
    if (routeRows.length === 0) return null
    return routeRows.reduce((best, row) => (row.profit > best.profit ? row : best), routeRows[0])
  }, [routeRows])

  const safestRoute = useMemo(() => {
    const lowRisk = routeRows.filter((row) => row.riskLevel === 'low' && row.profit > 0)
    if (lowRisk.length === 0) return null
    return lowRisk.reduce((best, row) => (row.profit > best.profit ? row : best), lowRisk[0])
  }, [routeRows])

  const fastestRoute = useMemo(() => {
    if (routeRows.length === 0) return null
    return routeRows.reduce(
      (best, row) => (row.silverPerHour > best.silverPerHour ? row : best),
      routeRows[0]
    )
  }, [routeRows])

  const mountSuggestions = useMemo(() => {
    if (!requiredWeight) return []
    return MOUNT_CATALOG.filter((mount) => mount.capacity >= requiredWeight)
      .sort((a, b) => b.speed - a.speed)
      .slice(0, 5)
  }, [requiredWeight])

  const handleQuickSelect = (row: RouteRow | null) => {
    if (!row) return
    setOrigin(row.origin)
    setDestination(row.destination)
    setBuyCity(row.origin)
    setSellCity(row.destination)
    setPackageSize(row.size)
  }

  const profitBarWidth = useMemo(() => {
    if (!calculated || calculated.cost <= 0) return 0
    const ratio = Math.min(Math.max(calculated.profit / calculated.cost, -1), 2)
    return Math.round(((ratio + 1) / 3) * 100)
  }, [calculated])

  const canCarryStatus = getCarryStatus(requiredWeight, mountCapacity)
  const visibleRows = showAllRoutes ? sortedRows : sortedRows.slice(0, 20)
  const priceStatus = priceLoading
    ? 'Fetching prices...'
    : priceError
      ? `Error: ${priceError}`
      : `Updated ${formatTimeAgo(pricesLastUpdated)}`

  const handleSort = (column: string) => {
    setTableSort((prev) =>
      prev.column === column ? { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { column, direction: 'desc' }
    )
  }

  const heartMatrix = effectivePriceMatrix[selectedHeart]
  const bestBuyCity = bestPricesByHeart.buy[selectedHeart]
  const bestSellCity = bestPricesByHeart.sell[selectedHeart]

  return (
    <div className="space-y-6 text-slate-100">
      <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm text-slate-400">Route setup</div>
              <div className="text-lg font-semibold text-amber-300">
                {cityLabel(origin)} → {cityLabel(destination)} ({packageSize})
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="rounded-full border border-slate-700 px-2 py-1">{priceStatus}</span>
              <button
                type="button"
                onClick={() => fetchPrices()}
                className="rounded border border-slate-700 px-3 py-1 text-xs font-semibold text-amber-200 hover:border-amber-300"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">Origin</label>
              <select
                className="w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
                value={origin}
                onChange={(event) => setOrigin(event.target.value as CityKey)}
              >
                {CITY_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {CITIES[key].name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">Destination</label>
              <select
                className="w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
                value={destination}
                onChange={(event) => setDestination(event.target.value as CityKey)}
              >
                {CITY_KEYS.filter((key) => key !== origin).map((key) => (
                  <option key={key} value={key}>
                    {CITIES[key].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">Package size</label>
              <div className="flex gap-2">
                {PACKAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setPackageSize(size)}
                    className={`flex-1 rounded border px-3 py-2 text-sm capitalize transition ${
                      packageSize === size
                        ? 'border-amber-300 bg-amber-300/10 text-amber-100'
                        : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">Buy price</label>
              <div className="flex gap-2">
                <select
                  className="w-32 rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
                  value={buyMode}
                  onChange={(event) => setBuyMode(event.target.value as 'market' | 'manual')}
                >
                  <option value="market">Market</option>
                  <option value="manual">Manual</option>
                </select>
                {buyMode === 'market' ? (
                  <select
                    className="flex-1 rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
                    value={buyCity}
                    onChange={(event) => setBuyCity(event.target.value as CityKey)}
                  >
                    {CITY_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {CITIES[key].name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="flex-1 rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
                    placeholder="Enter price"
                    value={manualBuyPrice}
                    onChange={(event) => setManualBuyPrice(event.target.value)}
                  />
                )}
              </div>
              <div className="text-xs text-slate-500">
                Using {buyMode === 'manual' ? 'manual value' : cityLabel(buyCity)} · {selectedBuyPrice ? `${formatNumber(selectedBuyPrice)} silver` : 'no data'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">Sell price</label>
              <div className="flex gap-2">
                <select
                  className="w-32 rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
                  value={sellMode}
                  onChange={(event) => setSellMode(event.target.value as 'market' | 'manual')}
                >
                  <option value="market">Market</option>
                  <option value="manual">Manual</option>
                </select>
                {sellMode === 'market' ? (
                  <select
                    className="flex-1 rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
                    value={sellCity}
                    onChange={(event) => setSellCity(event.target.value as CityKey)}
                  >
                    {CITY_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {CITIES[key].name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="flex-1 rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
                    placeholder="Enter price"
                    value={manualSellPrice}
                    onChange={(event) => setManualSellPrice(event.target.value)}
                  />
                )}
              </div>
              <div className="text-xs text-slate-500">
                Using {sellMode === 'manual' ? 'manual value' : cityLabel(sellCity)} · {selectedSellPrice ? `${formatNumber(selectedSellPrice)} silver` : 'no data'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold text-amber-200">Run snapshot</div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className={`rounded-full border px-2 py-1 ${
                calculated?.riskLevel === 'low'
                  ? 'border-emerald-400 text-emerald-200'
                  : calculated?.riskLevel === 'medium'
                    ? 'border-amber-300 text-amber-200'
                    : 'border-red-400 text-red-200'
              }`}>
                Risk: {calculated ? calculated.riskLevel : '--'}
              </span>
              <span className="rounded-full border border-slate-800 px-2 py-1">
                Weight {requiredWeight ? `${formatNumber(requiredWeight)} kg` : '--'} ({getCarryLabel(canCarryStatus)})
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Profit</div>
              <div className="text-2xl font-semibold text-emerald-300">
                {calculated ? formatNumber(calculated.profit) : '--'}
              </div>
              <div className="mt-1 text-xs text-slate-500">Per run</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Margin</div>
              <div className="text-2xl font-semibold text-amber-200">
                {calculated ? formatPercent(calculated.profitPercent) : '--'}
              </div>
              <div className="mt-1 text-xs text-slate-500">Profit %</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Silver / hour</div>
              <div className="text-2xl font-semibold text-sky-200">
                {calculated ? formatNumber(calculated.silverPerHour) : '--'}
              </div>
              <div className="mt-1 text-xs text-slate-500">Time {calculated?.estimatedMinutes ?? '--'}m</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Hearts</div>
              <div className="text-2xl font-semibold text-pink-200">
                {calculated ? `${calculated.heartsSpent} → ${calculated.heartsReceived}` : '--'}
              </div>
              <div className="mt-1 text-xs text-slate-500">Net {calculated ? calculated.netHearts : '--'}</div>
            </div>
          </div>

          <div className="relative mt-2 h-2 rounded-full bg-slate-800">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-red-400"
              style={{ width: `${profitBarWidth}%` }}
            />
          </div>
          <div className="text-xs text-slate-500">Profit vs cost ratio bar</div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold text-amber-200">Route ideas</div>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                className="rounded border border-slate-700 px-3 py-1 text-slate-200 hover:border-amber-300"
                onClick={() => handleQuickSelect(bestRoute)}
                disabled={!bestRoute}
              >
                Best profit
              </button>
              <button
                type="button"
                className="rounded border border-slate-700 px-3 py-1 text-slate-200 hover:border-emerald-300"
                onClick={() => handleQuickSelect(safestRoute)}
                disabled={!safestRoute}
              >
                Safest
              </button>
              <button
                type="button"
                className="rounded border border-slate-700 px-3 py-1 text-slate-200 hover:border-sky-300"
                onClick={() => handleQuickSelect(fastestRoute)}
                disabled={!fastestRoute}
              >
                Highest silver/hr
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[bestRoute, safestRoute, fastestRoute].map((row, index) => (
              <div key={index} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  {index === 0 ? 'Best profit' : index === 1 ? 'Safest' : 'Silver / hour'}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-100">
                  {row ? `${cityLabel(row.origin)} → ${cityLabel(row.destination)}` : '--'}
                </div>
                <div className="text-xs text-slate-500">{row ? row.size : '--'} · {row ? row.riskLevel : '--'} · {row ? `${row.estimatedMinutes}m` : '--'}</div>
                <div className="mt-2 text-lg font-semibold text-emerald-300">
                  {row ? formatNumber(row.profit) : '--'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-amber-200">Routes</div>
              <div className="text-xs text-slate-500">Sorted by {tableSort.column} ({tableSort.direction})</div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input
                className="w-40 rounded border border-slate-800 bg-slate-950 px-2 py-1"
                placeholder="Search city"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
                className="rounded border border-slate-800 bg-slate-950 px-2 py-1"
                value={filterSize}
                onChange={(event) => setFilterSize(event.target.value as PackageSize | 'all')}
              >
                <option value="all">All sizes</option>
                {PACKAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <select
                className="rounded border border-slate-800 bg-slate-950 px-2 py-1"
                value={filterRisk}
                onChange={(event) => setFilterRisk(event.target.value as RiskLevel | 'all')}
              >
                <option value="all">All risk</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <label className="flex items-center gap-2 text-slate-400">
                <input
                  type="checkbox"
                  checked={canCarryOnly}
                  onChange={(event) => setCanCarryOnly(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950"
                />
                Can carry
              </label>
              <button
                type="button"
                className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-amber-300"
                onClick={() => setShowAllRoutes((value) => !value)}
              >
                {showAllRoutes ? 'Show top 20' : 'Show all'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  {[
                    ['route', 'Route'],
                    ['size', 'Size'],
                    ['profit', 'Profit'],
                    ['percent', '%'],
                    ['perHour', 'Silver/hr'],
                    ['time', 'Time'],
                    ['risk', 'Risk'],
                    ['weight', 'Weight'],
                    ['carry', 'Carry'],
                  ].map(([key, label]) => (
                    <th
                      key={key}
                      className="cursor-pointer border-b border-slate-800 px-3 py-2 text-left"
                      onClick={() => handleSort(key)}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={`${row.key}-${row.size}`} className="odd:bg-slate-900/40 even:bg-slate-900/20">
                    <td className="border-b border-slate-800 px-3 py-2 font-semibold">
                      {cityLabel(row.origin)} → {cityLabel(row.destination)}
                    </td>
                    <td className="border-b border-slate-800 px-3 py-2 capitalize">{row.size}</td>
                    <td className="border-b border-slate-800 px-3 py-2 text-emerald-300">{formatNumber(row.profit)}</td>
                    <td className="border-b border-slate-800 px-3 py-2">{formatPercent(row.profitPercent)}</td>
                    <td className="border-b border-slate-800 px-3 py-2 text-sky-200">{formatNumber(row.silverPerHour)}</td>
                    <td className="border-b border-slate-800 px-3 py-2">{row.estimatedMinutes}m</td>
                    <td className="border-b border-slate-800 px-3 py-2">
                      <span className={`rounded-full border px-2 py-1 text-xs ${getRiskBadge(row.riskLevel)}`}>
                        {row.riskLevel}
                      </span>
                    </td>
                    <td className="border-b border-slate-800 px-3 py-2">{formatNumber(row.requiredWeight)} kg</td>
                    <td className="border-b border-slate-800 px-3 py-2">
                      <span
                        className={`rounded-full border px-2 py-1 text-xs ${
                          row.canCarryStatus === 'ok'
                            ? 'border-emerald-400 text-emerald-200'
                            : row.canCarryStatus === 'warn'
                              ? 'border-amber-300 text-amber-200'
                              : 'border-red-400 text-red-200'
                        }`}
                      >
                        {getCarryLabel(row.canCarryStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!hasMarketData && (
            <div className="rounded border border-dashed border-slate-700 bg-slate-900/40 p-3 text-sm text-slate-400">
              Waiting for market data... switch to manual prices if needed.
            </div>
          )}
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-amber-200">Heart prices</div>
              <div className="text-xs text-slate-500">Select a heart to inspect city prices</div>
            </div>
            <select
              className="rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
              value={selectedHeart}
              onChange={(event) => setSelectedHeart(event.target.value as CityKey)}
            >
              {CITY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {CITIES[key].heart}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">Best buy</div>
              <div className="text-sm font-semibold text-slate-100">
                {bestBuyCity ? cityLabel(bestBuyCity) : '--'}
              </div>
              <div className="text-xs text-slate-500">{bestBuyCity ? formatNumber(heartMatrix?.[bestBuyCity]?.buy ?? 0) : '--'}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">Best sell</div>
              <div className="text-sm font-semibold text-slate-100">
                {bestSellCity ? cityLabel(bestSellCity) : '--'}
              </div>
              <div className="text-xs text-slate-500">{bestSellCity ? formatNumber(heartMatrix?.[bestSellCity]?.sell ?? 0) : '--'}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">Trend ({cityLabel(selectedHeart)})</div>
              <div className="text-sm font-semibold text-slate-100">{getTrendLabel(priceTrends[selectedHeart])}</div>
              <div className="text-xs text-slate-500">Own city average {formatAveragePrice(heartMatrix?.[selectedHeart]?.buy ?? 0, heartMatrix?.[selectedHeart]?.sell ?? 0)}</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="border-b border-slate-800 px-3 py-2 text-left">City</th>
                  <th className="border-b border-slate-800 px-3 py-2 text-left">Buy</th>
                  <th className="border-b border-slate-800 px-3 py-2 text-left">Sell</th>
                  <th className="border-b border-slate-800 px-3 py-2 text-left">Avg</th>
                </tr>
              </thead>
              <tbody>
                {CITY_KEYS.map((cityKey) => {
                  const entry = heartMatrix?.[cityKey]
                  return (
                    <tr key={cityKey} className="odd:bg-slate-900/40 even:bg-slate-900/20">
                      <td className="border-b border-slate-800 px-3 py-2">{cityLabel(cityKey)}</td>
                      <td className="border-b border-slate-800 px-3 py-2 text-emerald-300">
                        {entry?.buy ? formatNumber(entry.buy) : '--'}
                      </td>
                      <td className="border-b border-slate-800 px-3 py-2 text-sky-200">
                        {entry?.sell ? formatNumber(entry.sell) : '--'}
                      </td>
                      <td className="border-b border-slate-800 px-3 py-2 text-slate-200">
                        {entry ? formatAveragePrice(entry.buy, entry.sell) : '--'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-xl">
        <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-200">
          <span>Build & carry check</span>
          <button
            type="button"
            className="text-xs text-amber-300 hover:text-amber-200"
            onClick={() => setBuildPanelOpen((value) => !value)}
          >
            {buildPanelOpen ? 'Hide' : 'Show'}
          </button>
        </div>
        {buildPanelOpen ? (
          <BuildPanel
            isOpen={true}
            variant="embedded"
            characterName=""
            mountContext={mountContext}
            onClose={() => setBuildPanelOpen(false)}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-400">
            Build panel hidden. Show to adjust mount & loadout.
          </div>
        )}
      </div>
    </div>
  )
}
