// Island Management Store
// Uses localStorage for persistence

import { BuildingType, ISLAND_PLOT_COUNTS, type FarmingCity } from './farming-data'

// ============ TYPES ============

export interface Worker {
  id: string
  name: string
  discord: string
  notes: string
  createdAt: string
  payRate: number // silver per day
}

// A plot configuration within an island
export interface PlotConfig {
  id: string
  buildingType: BuildingType
  cropOrAnimalId: string // e.g., 'wheat', 'chicken'
}

// A physical island with tier, city, and plot configurations
export interface Island {
  id: string
  name: string
  tier: 1 | 2 | 3 | 4 | 5 | 6
  city: FarmingCity
  workerId: string | null // null = unassigned
  plots: PlotConfig[] // Each plot can have different building/crop
  notes: string
  createdAt: string
}

// Legacy interface for backwards compatibility - will be migrated
export interface IslandAssignment {
  id: string
  islandName: string
  workerId: string | null // null = unassigned
  buildingType: BuildingType
  cropOrAnimalId: string // e.g., 'wheat', 'chicken'
  plotCount: number
  notes: string
  createdAt: string
  // New fields for upgraded islands
  tier?: 1 | 2 | 3 | 4 | 5 | 6
  city?: FarmingCity
  plots?: PlotConfig[]
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

// Helper to get max plots for an island tier
export function getMaxPlotsForTier(tier: number): number {
  return ISLAND_PLOT_COUNTS[tier] || 1
}

// Helper to create a default plot config
export function createDefaultPlot(id?: string): PlotConfig {
  return {
    id: id || generateId(),
    buildingType: 'farm',
    cropOrAnimalId: 'wheat',
  }
}

// Migrate old island format to new format with tier/city/plots
export function migrateIsland(island: IslandAssignment): IslandAssignment {
  if (island.tier && island.city && island.plots) {
    return island // Already migrated
  }

  // Convert old format to new format
  const tier = Math.min(6, Math.max(1, island.plotCount)) as 1 | 2 | 3 | 4 | 5 | 6
  const plots: PlotConfig[] = []

  // Create plots based on plotCount, all with the same building/crop
  for (let i = 0; i < island.plotCount; i++) {
    plots.push({
      id: `${island.id}-plot-${i}`,
      buildingType: island.buildingType,
      cropOrAnimalId: island.cropOrAnimalId,
    })
  }

  return {
    ...island,
    tier,
    city: 'Bridgewatch' as FarmingCity, // Default city
    plots,
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
      const store: IslandStore = {
        ...getDefaultStore(),
        ...parsed,
        settings: {
          ...getDefaultStore().settings,
          ...parsed.settings,
        },
      }
      // Migrate old islands to new format
      store.islands = store.islands.map(migrateIsland)
      return store
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
  const id = generateId()

  // Ensure we have the new format fields
  const tier = (island.tier || Math.min(6, Math.max(1, island.plotCount || 1))) as 1 | 2 | 3 | 4 | 5 | 6
  const city = island.city || 'Bridgewatch' as FarmingCity
  const maxPlots = getMaxPlotsForTier(tier)

  // Generate plots if not provided
  let plots = island.plots
  if (!plots || plots.length === 0) {
    plots = []
    const plotCount = island.plotCount || tier
    for (let i = 0; i < Math.min(plotCount, maxPlots); i++) {
      plots.push({
        id: `${id}-plot-${i}`,
        buildingType: island.buildingType || 'farm',
        cropOrAnimalId: island.cropOrAnimalId || 'wheat',
      })
    }
  }

  const newIsland: IslandAssignment = {
    ...island,
    id,
    tier,
    city,
    plots,
    plotCount: plots.length,
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
    islands: store.islands.map(i => {
      if (i.id !== islandId) return i

      const updated = { ...i, ...updates }

      // If tier changed, adjust plots
      if (updates.tier && updates.tier !== i.tier) {
        const maxPlots = getMaxPlotsForTier(updates.tier)
        if (updated.plots && updated.plots.length > maxPlots) {
          updated.plots = updated.plots.slice(0, maxPlots)
        }
        updated.plotCount = updated.plots?.length || 0
      }

      return updated
    }),
  }
}

export function updatePlot(store: IslandStore, islandId: string, plotId: string, updates: Partial<PlotConfig>): IslandStore {
  return {
    ...store,
    islands: store.islands.map(island => {
      if (island.id !== islandId || !island.plots) return island
      return {
        ...island,
        plots: island.plots.map(plot =>
          plot.id === plotId ? { ...plot, ...updates } : plot
        ),
      }
    }),
  }
}

export function addPlotToIsland(store: IslandStore, islandId: string, plotConfig?: Partial<PlotConfig>): IslandStore {
  return {
    ...store,
    islands: store.islands.map(island => {
      if (island.id !== islandId) return island

      const maxPlots = getMaxPlotsForTier(island.tier || 1)
      const currentPlots = island.plots || []

      if (currentPlots.length >= maxPlots) return island // Can't add more plots

      const newPlot: PlotConfig = {
        id: `${islandId}-plot-${currentPlots.length}`,
        buildingType: plotConfig?.buildingType || 'farm',
        cropOrAnimalId: plotConfig?.cropOrAnimalId || 'wheat',
      }

      return {
        ...island,
        plots: [...currentPlots, newPlot],
        plotCount: currentPlots.length + 1,
      }
    }),
  }
}

export function removePlotFromIsland(store: IslandStore, islandId: string, plotId: string): IslandStore {
  return {
    ...store,
    islands: store.islands.map(island => {
      if (island.id !== islandId || !island.plots) return island
      const newPlots = island.plots.filter(p => p.id !== plotId)
      return {
        ...island,
        plots: newPlots,
        plotCount: newPlots.length,
      }
    }),
  }
}

// Set all plots on an island to the same configuration
export function setAllPlotsUniform(store: IslandStore, islandId: string, buildingType: BuildingType, cropOrAnimalId: string): IslandStore {
  return {
    ...store,
    islands: store.islands.map(island => {
      if (island.id !== islandId || !island.plots) return island
      return {
        ...island,
        buildingType,
        cropOrAnimalId,
        plots: island.plots.map(plot => ({
          ...plot,
          buildingType,
          cropOrAnimalId,
        })),
      }
    }),
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
