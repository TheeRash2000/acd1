// Island Management Store
// Uses localStorage for persistence

import { BuildingType } from './farming-data'

// ============ TYPES ============

export interface Worker {
  id: string
  name: string
  discord: string
  notes: string
  createdAt: string
  payRate: number // silver per day
}

export interface IslandAssignment {
  id: string
  islandName: string
  workerId: string | null // null = unassigned
  buildingType: BuildingType
  cropOrAnimalId: string // e.g., 'wheat', 'chicken'
  plotCount: number
  notes: string
  createdAt: string
}

export interface FarmingDay {
  id: string
  islandId: string
  workerId: string
  date: string // YYYY-MM-DD
  completed: boolean
  notes: string
}

export interface IslandStore {
  workers: Worker[]
  islands: IslandAssignment[]
  farmingDays: FarmingDay[]
  settings: {
    hasPremium: boolean
    useFocus: boolean
    rngBuffer: number // decimal, e.g., 0.10 for 10%
  }
}

const STORAGE_KEY = 'albion-island-manager'

// ============ STORAGE HELPERS ============

function getDefaultStore(): IslandStore {
  return {
    workers: [],
    islands: [],
    farmingDays: [],
    settings: {
      hasPremium: true,
      useFocus: true,
      rngBuffer: 0.10,
    },
  }
}

export function loadStore(): IslandStore {
  if (typeof window === 'undefined') return getDefaultStore()

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge with defaults to ensure all fields exist
      return {
        ...getDefaultStore(),
        ...parsed,
        settings: {
          ...getDefaultStore().settings,
          ...parsed.settings,
        },
      }
    }
  } catch (e) {
    console.error('Failed to load island store:', e)
  }
  return getDefaultStore()
}

export function saveStore(store: IslandStore): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch (e) {
    console.error('Failed to save island store:', e)
  }
}

// ============ WORKER OPERATIONS ============

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function addWorker(store: IslandStore, worker: Omit<Worker, 'id' | 'createdAt'>): IslandStore {
  const newWorker: Worker = {
    ...worker,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  return {
    ...store,
    workers: [...store.workers, newWorker],
  }
}

export function updateWorker(store: IslandStore, workerId: string, updates: Partial<Worker>): IslandStore {
  return {
    ...store,
    workers: store.workers.map(w =>
      w.id === workerId ? { ...w, ...updates } : w
    ),
  }
}

export function deleteWorker(store: IslandStore, workerId: string): IslandStore {
  // Also unassign from islands and remove farming days
  return {
    ...store,
    workers: store.workers.filter(w => w.id !== workerId),
    islands: store.islands.map(i =>
      i.workerId === workerId ? { ...i, workerId: null } : i
    ),
    farmingDays: store.farmingDays.filter(fd => fd.workerId !== workerId),
  }
}

// ============ ISLAND OPERATIONS ============

export function addIsland(store: IslandStore, island: Omit<IslandAssignment, 'id' | 'createdAt'>): IslandStore {
  const newIsland: IslandAssignment = {
    ...island,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  return {
    ...store,
    islands: [...store.islands, newIsland],
  }
}

export function updateIsland(store: IslandStore, islandId: string, updates: Partial<IslandAssignment>): IslandStore {
  return {
    ...store,
    islands: store.islands.map(i =>
      i.id === islandId ? { ...i, ...updates } : i
    ),
  }
}

export function deleteIsland(store: IslandStore, islandId: string): IslandStore {
  return {
    ...store,
    islands: store.islands.filter(i => i.id !== islandId),
    farmingDays: store.farmingDays.filter(fd => fd.islandId !== islandId),
  }
}

export function assignWorkerToIsland(store: IslandStore, islandId: string, workerId: string | null): IslandStore {
  return updateIsland(store, islandId, { workerId })
}

// ============ FARMING DAY OPERATIONS ============

export function toggleFarmingDay(
  store: IslandStore,
  islandId: string,
  workerId: string,
  date: string,
  completed?: boolean
): IslandStore {
  const existingIdx = store.farmingDays.findIndex(
    fd => fd.islandId === islandId && fd.date === date
  )

  if (existingIdx >= 0) {
    // Toggle or set specific value
    const existing = store.farmingDays[existingIdx]
    const newCompleted = completed !== undefined ? completed : !existing.completed

    if (!newCompleted && existing.notes === '') {
      // Remove if unchecking and no notes
      return {
        ...store,
        farmingDays: store.farmingDays.filter((_, idx) => idx !== existingIdx),
      }
    }

    return {
      ...store,
      farmingDays: store.farmingDays.map((fd, idx) =>
        idx === existingIdx ? { ...fd, completed: newCompleted } : fd
      ),
    }
  } else {
    // Add new
    const newDay: FarmingDay = {
      id: generateId(),
      islandId,
      workerId,
      date,
      completed: completed !== undefined ? completed : true,
      notes: '',
    }
    return {
      ...store,
      farmingDays: [...store.farmingDays, newDay],
    }
  }
}

export function getFarmingDaysForWorker(
  store: IslandStore,
  workerId: string,
  startDate: string,
  endDate: string
): FarmingDay[] {
  return store.farmingDays.filter(fd =>
    fd.workerId === workerId &&
    fd.date >= startDate &&
    fd.date <= endDate
  )
}

export function getFarmingDaysForIsland(
  store: IslandStore,
  islandId: string,
  startDate: string,
  endDate: string
): FarmingDay[] {
  return store.farmingDays.filter(fd =>
    fd.islandId === islandId &&
    fd.date >= startDate &&
    fd.date <= endDate
  )
}

// ============ CALCULATION HELPERS ============

export function countCompletedDays(farmingDays: FarmingDay[]): number {
  return farmingDays.filter(fd => fd.completed).length
}

export function countSkippedDays(farmingDays: FarmingDay[], totalDays: number): number {
  const completed = countCompletedDays(farmingDays)
  return totalDays - completed
}

export function calculateWorkerPay(
  store: IslandStore,
  workerId: string,
  startDate: string,
  endDate: string
): { completedDays: number; totalPay: number; worker: Worker | undefined } {
  const worker = store.workers.find(w => w.id === workerId)
  if (!worker) return { completedDays: 0, totalPay: 0, worker: undefined }

  const farmingDays = getFarmingDaysForWorker(store, workerId, startDate, endDate)
  const completedDays = countCompletedDays(farmingDays)
  const totalPay = completedDays * worker.payRate

  return { completedDays, totalPay, worker }
}

// ============ SETTINGS OPERATIONS ============

export function updateSettings(store: IslandStore, settings: Partial<IslandStore['settings']>): IslandStore {
  return {
    ...store,
    settings: {
      ...store.settings,
      ...settings,
    },
  }
}

// ============ GROUPING HELPERS ============

export function getIslandsByWorker(store: IslandStore): Map<string | null, IslandAssignment[]> {
  const grouped = new Map<string | null, IslandAssignment[]>()

  for (const island of store.islands) {
    const key = island.workerId
    const existing = grouped.get(key) || []
    grouped.set(key, [...existing, island])
  }

  return grouped
}

export function getWorkerById(store: IslandStore, workerId: string): Worker | undefined {
  return store.workers.find(w => w.id === workerId)
}

// ============ DATE HELPERS ============

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getDateRange(days: number): { startDate: string; endDate: string } {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  }
}

export function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    dates.push(formatDate(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}
