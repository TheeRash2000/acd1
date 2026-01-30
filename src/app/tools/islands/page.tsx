'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import {
  CROPS,
  ANIMALS,
  HERBS,
  BUILDING_NAMES,
  SEEDS_PER_PLOT,
  ANIMALS_PER_PLOT,
  FARMING_CITIES,
  ISLAND_PLOT_COUNTS,
  CITY_BONUS_PERCENT,
  calculateCropOutput,
  calculateAnimalOutput,
  getCropById,
  getAnimalById,
  hasCityBonus,
  type BuildingType,
  type FarmingCity,
} from '@/lib/island/farming-data'
import {
  loadStore,
  saveStore,
  addWorker,
  updateWorker,
  deleteWorker,
  addIsland,
  updateIsland,
  deleteIsland,
  toggleFarmingDay,
  getIslandsByWorker,
  getWorkerById,
  calculateWorkerPay,
  updateSettings,
  getDatesInRange,
  formatDate,
  updatePlot,
  addPlotToIsland,
  removePlotFromIsland,
  setAllPlotsUniform,
  getMaxPlotsForTier,
  type IslandStore,
  type Worker,
  type IslandAssignment,
  type PlotConfig,
} from '@/lib/island/island-store'

type TabType = 'islands' | 'workers' | 'tracker' | 'dashboard'

export default function IslandManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('islands')
  const [store, setStore] = useState<IslandStore>(() => loadStore())

  useEffect(() => {
    saveStore(store)
  }, [store])

  const tabs: { id: TabType; label: string }[] = [
    { id: 'islands', label: 'Islands' },
    { id: 'workers', label: 'Workers' },
    { id: 'tracker', label: 'Tracker' },
    { id: 'dashboard', label: 'Dashboard' },
  ]

  return (
    <section className="grid gap-6">
      <header>
        <h1 className="font-display text-2xl text-text1-light dark:text-text1">
          Island Management
        </h1>
        <p className="text-sm text-muted-light dark:text-muted">
          Manage islands, workers, and track farming operations.
        </p>
      </header>

      <nav className="flex flex-wrap items-center gap-2 text-xs">
        <Link
          href="/tools"
          className="rounded border border-border-light px-3 py-1 text-text1-light hover:text-accent dark:border-border dark:text-text1"
        >
          All Tools
        </Link>
        <span className="text-muted-light dark:text-muted">|</span>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded border px-3 py-1 ${
              activeTab === tab.id
                ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                : 'border-border-light text-text1-light hover:text-accent dark:border-border dark:text-text1'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={store.settings.hasPremium}
              onChange={(e) => setStore(updateSettings(store, { hasPremium: e.target.checked }))}
              className="h-4 w-4"
            />
            <span className={store.settings.hasPremium ? 'text-amber-400' : 'text-muted-light dark:text-muted'}>
              Premium Account
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={store.settings.useFocus}
              onChange={(e) => setStore(updateSettings(store, { useFocus: e.target.checked }))}
              className="h-4 w-4"
            />
            <span className={store.settings.useFocus ? 'text-blue-400' : 'text-muted-light dark:text-muted'}>
              Use Focus
            </span>
          </label>
          <div className="flex items-center gap-2 text-sm">
            <label className="text-muted-light dark:text-muted">RNG Buffer:</label>
            <select
              value={store.settings.rngBuffer}
              onChange={(e) => setStore(updateSettings(store, { rngBuffer: parseFloat(e.target.value) }))}
              className="rounded border border-border-light bg-surface-light px-2 py-1 text-sm dark:border-border dark:bg-surface"
            >
              <option value={0}>0%</option>
              <option value={0.05}>5%</option>
              <option value={0.10}>10%</option>
              <option value={0.15}>15%</option>
              <option value={0.20}>20%</option>
            </select>
          </div>
        </div>
      </div>

      {activeTab === 'islands' && <IslandsTab store={store} setStore={setStore} />}
      {activeTab === 'workers' && <WorkersTab store={store} setStore={setStore} />}
      {activeTab === 'tracker' && <TrackerTab store={store} setStore={setStore} />}
      {activeTab === 'dashboard' && <DashboardTab store={store} />}
    </section>
  )
}

// Helper to get items for a building type
function getItemsForBuilding(buildingType: BuildingType) {
  if (buildingType === 'farm') return CROPS
  if (buildingType === 'herb_garden') return HERBS
  if (buildingType === 'pasture' || buildingType === 'kennel') {
    return ANIMALS.filter(a => a.building === buildingType)
  }
  return []
}

// Helper to get item data by building type and ID
function getItemData(buildingType: BuildingType, itemId: string) {
  if (buildingType === 'farm') return getCropById(itemId)
  if (buildingType === 'herb_garden') return HERBS.find(h => h.id === itemId)
  if (buildingType === 'pasture' || buildingType === 'kennel') return getAnimalById(itemId)
  return undefined
}

// ============ ISLANDS TAB ============
function IslandsTab({ store, setStore }: { store: IslandStore; setStore: (s: IslandStore) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [configMode, setConfigMode] = useState<'uniform' | 'custom'>('uniform')
  const [formData, setFormData] = useState({
    islandName: '',
    tier: 6 as 1 | 2 | 3 | 4 | 5 | 6,
    city: 'Bridgewatch' as FarmingCity,
    buildingType: 'farm' as BuildingType,
    cropOrAnimalId: 'wheat',
    workerId: null as string | null,
    notes: '',
  })

  const maxPlots = getMaxPlotsForTier(formData.tier)
  const availableItems = useMemo(() => getItemsForBuilding(formData.buildingType), [formData.buildingType])

  const resetForm = () => {
    setFormData({
      islandName: '',
      tier: 6,
      city: 'Bridgewatch',
      buildingType: 'farm',
      cropOrAnimalId: 'wheat',
      workerId: null,
      notes: '',
    })
    setEditingId(null)
    setShowForm(false)
    setConfigMode('uniform')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setStore(updateIsland(store, editingId, {
        islandName: formData.islandName,
        tier: formData.tier,
        city: formData.city,
        buildingType: formData.buildingType,
        cropOrAnimalId: formData.cropOrAnimalId,
        workerId: formData.workerId,
        notes: formData.notes,
        plotCount: maxPlots,
      }))
      // If uniform mode, set all plots to same config
      if (configMode === 'uniform') {
        setStore(prev => setAllPlotsUniform(prev, editingId, formData.buildingType, formData.cropOrAnimalId))
      }
    } else {
      setStore(addIsland(store, {
        islandName: formData.islandName,
        tier: formData.tier,
        city: formData.city,
        buildingType: formData.buildingType,
        cropOrAnimalId: formData.cropOrAnimalId,
        workerId: formData.workerId,
        notes: formData.notes,
        plotCount: maxPlots,
      }))
    }
    resetForm()
  }

  const handleEdit = (island: IslandAssignment) => {
    setFormData({
      islandName: island.islandName,
      tier: island.tier || 6,
      city: island.city || 'Bridgewatch',
      buildingType: island.buildingType,
      cropOrAnimalId: island.cropOrAnimalId,
      workerId: island.workerId,
      notes: island.notes,
    })
    setEditingId(island.id)
    setShowForm(true)
    // Check if plots are uniform
    const plots = island.plots || []
    const allSame = plots.every(p =>
      p.buildingType === island.buildingType && p.cropOrAnimalId === island.cropOrAnimalId
    )
    setConfigMode(allSame ? 'uniform' : 'custom')
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this island? This will also remove all farming day records.')) {
      setStore(deleteIsland(store, id))
    }
  }

  const handlePlotChange = (islandId: string, plotId: string, field: 'buildingType' | 'cropOrAnimalId', value: string) => {
    if (field === 'buildingType') {
      const bt = value as BuildingType
      const defaultItem = bt === 'farm' ? 'wheat' : bt === 'herb_garden' ? 'agaric' : 'chicken'
      setStore(updatePlot(store, islandId, plotId, { buildingType: bt, cropOrAnimalId: defaultItem }))
    } else {
      setStore(updatePlot(store, islandId, plotId, { cropOrAnimalId: value }))
    }
  }

  const islandsByWorker = getIslandsByWorker(store)
  const sortedWorkerIds = Array.from(islandsByWorker.keys()).sort((a, b) => {
    if (a === null) return 1
    if (b === null) return -1
    const workerA = getWorkerById(store, a)
    const workerB = getWorkerById(store, b)
    return (workerA?.name || '').localeCompare(workerB?.name || '')
  })

  return (
    <div className="grid gap-4">
      {/* Add/Edit Form */}
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-text1-light dark:text-text1">
            {editingId ? 'Edit Island' : 'Add Island'}
          </h2>
          <button
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-xs text-amber-300 hover:bg-amber-400/20"
          >
            {showForm ? 'Cancel' : '+ Add Island'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="grid gap-1">
                <label className="text-xs text-muted-light dark:text-muted">Island Name</label>
                <input
                  type="text"
                  value={formData.islandName}
                  onChange={(e) => setFormData({ ...formData, islandName: e.target.value })}
                  placeholder="e.g., Wheat Farm 1, Main Island"
                  required
                  className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-xs text-muted-light dark:text-muted">Island Tier ({maxPlots} plots)</label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 })}
                  className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
                >
                  {[1, 2, 3, 4, 5, 6].map((t) => (
                    <option key={t} value={t}>T{t} Island ({ISLAND_PLOT_COUNTS[t]} plots)</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1">
                <label className="text-xs text-muted-light dark:text-muted">City (for bonus)</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value as FarmingCity })}
                  className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
                >
                  {FARMING_CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1">
                <label className="text-xs text-muted-light dark:text-muted">Assigned Worker</label>
                <select
                  value={formData.workerId || ''}
                  onChange={(e) => setFormData({ ...formData, workerId: e.target.value || null })}
                  className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
                >
                  <option value="">Unassigned</option>
                  {store.workers.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Configuration Mode */}
            <div className="flex items-center gap-4 border-t border-border-light pt-4 dark:border-border">
              <span className="text-xs text-muted-light dark:text-muted">Plot Configuration:</span>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="configMode"
                  checked={configMode === 'uniform'}
                  onChange={() => setConfigMode('uniform')}
                />
                <span className={configMode === 'uniform' ? 'text-amber-400' : ''}>All Same</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="configMode"
                  checked={configMode === 'custom'}
                  onChange={() => setConfigMode('custom')}
                />
                <span className={configMode === 'custom' ? 'text-amber-400' : ''}>Custom (per plot)</span>
              </label>
            </div>

            {/* Uniform mode - single selection for all plots */}
            {configMode === 'uniform' && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-1">
                  <label className="text-xs text-muted-light dark:text-muted">Building Type (all {maxPlots} plots)</label>
                  <select
                    value={formData.buildingType}
                    onChange={(e) => {
                      const bt = e.target.value as BuildingType
                      setFormData({
                        ...formData,
                        buildingType: bt,
                        cropOrAnimalId: bt === 'farm' ? 'wheat' : bt === 'herb_garden' ? 'agaric' : 'chicken',
                      })
                    }}
                    className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
                  >
                    {Object.entries(BUILDING_NAMES).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-xs text-muted-light dark:text-muted">Crop / Animal</label>
                  <select
                    value={formData.cropOrAnimalId}
                    onChange={(e) => setFormData({ ...formData, cropOrAnimalId: e.target.value })}
                    className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
                  >
                    {availableItems.map((item) => {
                      const hasBonus = hasCityBonus(item.bonusCity, formData.city)
                      return (
                        <option key={item.id} value={item.id}>
                          T{item.tier} {item.name} {hasBonus ? `(+${CITY_BONUS_PERCENT}% in ${formData.city})` : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div className="grid gap-1">
                  <label className="text-xs text-muted-light dark:text-muted">Notes</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional notes..."
                    className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
                  />
                </div>
              </div>
            )}

            {/* Custom mode info - plots configured after creation */}
            {configMode === 'custom' && (
              <div className="rounded bg-blue-500/10 p-3 text-xs text-blue-400">
                Custom mode: Create the island first, then configure each plot individually from the island card below.
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="rounded bg-amber-400 px-4 py-2 text-sm font-medium text-black hover:bg-amber-300"
              >
                {editingId ? 'Update Island' : 'Add Island'}
              </button>
              {formData.buildingType === 'farm' && (() => {
                const item = getItemData(formData.buildingType, formData.cropOrAnimalId)
                if (item && hasCityBonus(item.bonusCity, formData.city)) {
                  return (
                    <span className="text-xs text-green-400">
                      +{CITY_BONUS_PERCENT}% bonus in {formData.city}!
                    </span>
                  )
                }
                return null
              })()}
            </div>
          </form>
        )}
      </div>

      {/* Islands List grouped by Worker */}
      {sortedWorkerIds.map((workerId) => {
        const worker = workerId ? getWorkerById(store, workerId) : null
        const islands = islandsByWorker.get(workerId) || []

        return (
          <div key={workerId || 'unassigned'} className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-text1-light dark:text-text1">
              <span className={`h-3 w-3 rounded-full ${worker ? 'bg-green-400' : 'bg-gray-400'}`} />
              {worker ? worker.name : 'Unassigned'}
              <span className="text-xs text-muted-light dark:text-muted">
                ({islands.length} island{islands.length !== 1 ? 's' : ''})
              </span>
            </h3>

            <div className="grid gap-3">
              {islands.map((island) => (
                <IslandCard
                  key={island.id}
                  island={island}
                  store={store}
                  onEdit={() => handleEdit(island)}
                  onDelete={() => handleDelete(island.id)}
                  onPlotChange={handlePlotChange}
                />
              ))}
              {islands.length === 0 && (
                <div className="py-4 text-center text-sm text-muted-light dark:text-muted">
                  No islands assigned
                </div>
              )}
            </div>
          </div>
        )
      })}

      {store.islands.length === 0 && (
        <div className="rounded-2xl border border-border-light bg-surface-light p-8 text-center dark:border-border dark:bg-surface">
          <p className="text-muted-light dark:text-muted">
            No islands configured yet. Click &quot;+ Add Island&quot; to get started.
          </p>
        </div>
      )}
    </div>
  )
}

// Island Card Component with expandable plot config
function IslandCard({
  island,
  store,
  onEdit,
  onDelete,
  onPlotChange,
}: {
  island: IslandAssignment
  store: IslandStore
  onEdit: () => void
  onDelete: () => void
  onPlotChange: (islandId: string, plotId: string, field: 'buildingType' | 'cropOrAnimalId', value: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const plots = island.plots || []
  const city = island.city || 'Bridgewatch'

  // Group plots by type for summary
  const plotSummary = useMemo(() => {
    const summary: Record<string, { count: number; hasBonus: boolean }> = {}
    for (const plot of plots) {
      const item = getItemData(plot.buildingType, plot.cropOrAnimalId)
      if (item) {
        const key = `T${item.tier} ${item.name}`
        const hasBonus = hasCityBonus(item.bonusCity, city)
        if (!summary[key]) {
          summary[key] = { count: 0, hasBonus }
        }
        summary[key].count++
      }
    }
    return summary
  }, [plots, city])

  return (
    <div className="rounded border border-border-light/50 bg-background-light p-3 dark:border-border/50 dark:bg-background">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text1-light dark:text-text1">
              {island.islandName}
            </span>
            <span className="rounded bg-surface-light px-1.5 py-0.5 text-xs dark:bg-surface">
              T{island.tier || '?'}
            </span>
            <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-xs text-blue-400">
              {city}
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-light dark:text-muted">
            {Object.entries(plotSummary).map(([name, { count, hasBonus }], idx) => (
              <span key={name}>
                {idx > 0 && ', '}
                {count}x {name}
                {hasBonus && <span className="text-green-400"> (+{CITY_BONUS_PERCENT}%)</span>}
              </span>
            ))}
          </div>
          {island.notes && (
            <div className="mt-1 text-xs italic text-muted-light dark:text-muted">
              {island.notes}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded border border-border-light px-2 py-1 text-xs text-text1-light hover:text-accent dark:border-border dark:text-text1"
          >
            {expanded ? 'Hide Plots' : 'Show Plots'}
          </button>
          <button
            onClick={onEdit}
            className="rounded border border-border-light px-2 py-1 text-xs text-text1-light hover:text-accent dark:border-border dark:text-text1"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="rounded border border-red-500/50 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Expanded plot configuration */}
      {expanded && (
        <div className="mt-3 border-t border-border-light pt-3 dark:border-border">
          <div className="mb-2 text-xs font-medium text-muted-light dark:text-muted">
            Plot Configuration ({plots.length} / {getMaxPlotsForTier(island.tier || 6)} plots)
          </div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {plots.map((plot, idx) => {
              const items = getItemsForBuilding(plot.buildingType)
              const item = getItemData(plot.buildingType, plot.cropOrAnimalId)
              const hasBonus = item ? hasCityBonus(item.bonusCity, city) : false

              return (
                <div
                  key={plot.id}
                  className={`rounded border p-2 ${
                    hasBonus
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-border-light/30 bg-surface-light dark:border-border/30 dark:bg-surface'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-light dark:text-muted">
                      Plot {idx + 1}
                    </span>
                    {hasBonus && (
                      <span className="text-xs text-green-400">+{CITY_BONUS_PERCENT}%</span>
                    )}
                  </div>
                  <div className="grid gap-1">
                    <select
                      value={plot.buildingType}
                      onChange={(e) => onPlotChange(island.id, plot.id, 'buildingType', e.target.value)}
                      className="rounded border border-border-light bg-surface-light px-2 py-1 text-xs dark:border-border dark:bg-surface"
                    >
                      {Object.entries(BUILDING_NAMES).map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                      ))}
                    </select>
                    <select
                      value={plot.cropOrAnimalId}
                      onChange={(e) => onPlotChange(island.id, plot.id, 'cropOrAnimalId', e.target.value)}
                      className="rounded border border-border-light bg-surface-light px-2 py-1 text-xs dark:border-border dark:bg-surface"
                    >
                      {items.map((itm) => (
                        <option key={itm.id} value={itm.id}>
                          T{itm.tier} {itm.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ============ WORKERS TAB ============
function WorkersTab({ store, setStore }: { store: IslandStore; setStore: (s: IslandStore) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    discord: '',
    notes: '',
    payRate: 50000,
  })

  const resetForm = () => {
    setFormData({ name: '', discord: '', notes: '', payRate: 50000 })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setStore(updateWorker(store, editingId, formData))
    } else {
      setStore(addWorker(store, formData))
    }
    resetForm()
  }

  const handleEdit = (worker: Worker) => {
    setFormData({
      name: worker.name,
      discord: worker.discord,
      notes: worker.notes,
      payRate: worker.payRate,
    })
    setEditingId(worker.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this worker? They will be unassigned from all islands.')) {
      setStore(deleteWorker(store, id))
    }
  }

  const getWorkerIslandCount = (workerId: string): number => {
    return store.islands.filter(i => i.workerId === workerId).length
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-text1-light dark:text-text1">
            {editingId ? 'Edit Worker' : 'Add Worker'}
          </h2>
          <button
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            className="rounded border border-amber-400 bg-amber-400/10 px-3 py-1 text-xs text-amber-300 hover:bg-amber-400/20"
          >
            {showForm ? 'Cancel' : '+ Add Worker'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Worker's name"
                required
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Discord</label>
              <input
                type="text"
                value={formData.discord}
                onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                placeholder="Discord#1234"
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Pay Rate (silver/day)</label>
              <input
                type="number"
                min={0}
                value={formData.payRate}
                onChange={(e) => setFormData({ ...formData, payRate: parseInt(e.target.value) || 0 })}
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs text-muted-light dark:text-muted">Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Personal remarks..."
                className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="rounded bg-amber-400 px-4 py-2 text-sm font-medium text-black hover:bg-amber-300"
              >
                {editingId ? 'Update' : 'Add Worker'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <h2 className="mb-3 text-sm font-medium text-text1-light dark:text-text1">
          Workers ({store.workers.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light dark:border-border">
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Name</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Discord</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Pay Rate</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-muted-light dark:text-muted">Islands</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Notes</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-muted-light dark:text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {store.workers.map((worker) => (
                <tr key={worker.id} className="border-b border-border-light/50 dark:border-border/50">
                  <td className="px-2 py-2 font-medium text-text1-light dark:text-text1">{worker.name}</td>
                  <td className="px-2 py-2 text-blue-400">{worker.discord || '-'}</td>
                  <td className="px-2 py-2 text-right text-amber-400">{worker.payRate.toLocaleString()}</td>
                  <td className="px-2 py-2 text-center">
                    <span className="rounded bg-surface-light px-2 py-0.5 text-xs dark:bg-surface">
                      {getWorkerIslandCount(worker.id)}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-muted-light dark:text-muted">{worker.notes || '-'}</td>
                  <td className="px-2 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(worker)} className="rounded border border-border-light px-2 py-1 text-xs hover:text-accent dark:border-border">Edit</button>
                      <button onClick={() => handleDelete(worker.id)} className="rounded border border-red-500/50 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {store.workers.length === 0 && (
          <div className="py-8 text-center text-muted-light dark:text-muted">
            No workers added yet.
          </div>
        )}
      </div>
    </div>
  )
}

// ============ TRACKER TAB ============
function TrackerTab({ store, setStore }: { store: IslandStore; setStore: (s: IslandStore) => void }) {
  const [selectedWorker, setSelectedWorker] = useState<string | 'all'>('all')
  const [daysToShow, setDaysToShow] = useState(7)

  const endDate = formatDate(new Date())
  const startDateObj = new Date()
  startDateObj.setDate(startDateObj.getDate() - daysToShow + 1)
  const startDate = formatDate(startDateObj)
  const dates = getDatesInRange(startDate, endDate)

  const workersWithIslands = store.workers.filter(w =>
    store.islands.some(i => i.workerId === w.id)
  )
  const filteredWorkers = selectedWorker === 'all'
    ? workersWithIslands
    : workersWithIslands.filter(w => w.id === selectedWorker)

  const handleToggleDay = (islandId: string, workerId: string, date: string) => {
    setStore(toggleFarmingDay(store, islandId, workerId, date))
  }

  const isDayCompleted = (islandId: string, date: string): boolean => {
    return store.farmingDays.some(fd => fd.islandId === islandId && fd.date === date && fd.completed)
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-light dark:text-muted">Worker:</label>
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
            >
              <option value="all">All Workers</option>
              {workersWithIslands.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-light dark:text-muted">Days:</label>
            <select
              value={daysToShow}
              onChange={(e) => setDaysToShow(parseInt(e.target.value))}
              className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
            >
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {filteredWorkers.map((worker) => {
        const workerIslands = store.islands.filter(i => i.workerId === worker.id)
        const { completedDays, totalPay } = calculateWorkerPay(store, worker.id, startDate, endDate)
        const totalPossibleDays = workerIslands.length * daysToShow

        return (
          <div key={worker.id} className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-medium text-text1-light dark:text-text1">{worker.name}</h3>
                <p className="text-xs text-muted-light dark:text-muted">{worker.discord}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-amber-400">{totalPay.toLocaleString()} silver</div>
                <div className="text-xs text-muted-light dark:text-muted">
                  {completedDays} / {totalPossibleDays} days ({worker.payRate.toLocaleString()}/day)
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-light dark:border-border">
                    <th className="px-2 py-2 text-left text-xs font-medium text-muted-light dark:text-muted">Island</th>
                    {dates.map((date) => (
                      <th key={date} className="px-1 py-2 text-center text-xs font-medium text-muted-light dark:text-muted">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workerIslands.map((island) => (
                    <tr key={island.id} className="border-b border-border-light/50 dark:border-border/50">
                      <td className="px-2 py-2 text-text1-light dark:text-text1">{island.islandName}</td>
                      {dates.map((date) => {
                        const completed = isDayCompleted(island.id, date)
                        return (
                          <td key={date} className="px-1 py-2 text-center">
                            <button
                              onClick={() => handleToggleDay(island.id, worker.id, date)}
                              className={`h-6 w-6 rounded ${completed ? 'bg-green-500 text-white' : 'border border-border-light hover:border-amber-400 dark:border-border'}`}
                            >
                              {completed && '✓'}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {filteredWorkers.length === 0 && (
        <div className="rounded-2xl border border-border-light bg-surface-light p-8 text-center dark:border-border dark:bg-surface">
          <p className="text-muted-light dark:text-muted">No workers with assigned islands found.</p>
        </div>
      )}

      {filteredWorkers.length > 0 && (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-4">
          <h3 className="mb-2 text-sm font-medium text-green-400">Payment Summary</h3>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {filteredWorkers.map((worker) => {
              const { completedDays, totalPay } = calculateWorkerPay(store, worker.id, startDate, endDate)
              return (
                <div key={worker.id} className="flex items-center justify-between rounded bg-surface-light p-2 dark:bg-surface">
                  <span className="text-text1-light dark:text-text1">{worker.name}</span>
                  <div className="text-right">
                    <div className="font-bold text-amber-400">{totalPay.toLocaleString()}</div>
                    <div className="text-xs text-muted-light dark:text-muted">{completedDays} days</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ============ DASHBOARD TAB ============
function DashboardTab({ store }: { store: IslandStore }) {
  const [daysToCalculate, setDaysToCalculate] = useState(7)

  const workerCalculations = useMemo(() => {
    const islandsByWorker = getIslandsByWorker(store)
    const results: {
      workerId: string | null
      workerName: string
      inputs: { item: string; amount: number; amountWithBuffer: number }[]
      outputs: { item: string; amount: number; hasBonus: boolean }[]
    }[] = []

    for (const [workerId, islands] of islandsByWorker) {
      const worker = workerId ? getWorkerById(store, workerId) : null
      const inputs: { item: string; amount: number; amountWithBuffer: number }[] = []
      const outputs: { item: string; amount: number; hasBonus: boolean }[] = []

      for (const island of islands) {
        const city = island.city || 'Bridgewatch'
        const plots = island.plots || []

        // Group plots by type for calculation
        const plotGroups: Record<string, { buildingType: BuildingType; cropOrAnimalId: string; count: number }> = {}
        for (const plot of plots) {
          const key = `${plot.buildingType}-${plot.cropOrAnimalId}`
          if (!plotGroups[key]) {
            plotGroups[key] = { buildingType: plot.buildingType, cropOrAnimalId: plot.cropOrAnimalId, count: 0 }
          }
          plotGroups[key].count++
        }

        for (const group of Object.values(plotGroups)) {
          const isFarm = group.buildingType === 'farm'
          const isHerb = group.buildingType === 'herb_garden'

          if (isFarm) {
            const crop = getCropById(group.cropOrAnimalId)
            if (crop) {
              const calc = calculateCropOutput(
                crop, group.count, store.settings.hasPremium, store.settings.useFocus,
                daysToCalculate, store.settings.rngBuffer, city
              )
              const hasBonus = hasCityBonus(crop.bonusCity, city)
              inputs.push({
                item: `${crop.seedName}`,
                amount: calc.seedsNeeded,
                amountWithBuffer: calc.seedsNeededWithBuffer,
              })
              outputs.push({
                item: crop.name,
                amount: calc.expectedCropYield,
                hasBonus,
              })
              outputs.push({
                item: `${crop.seedName} (returned)`,
                amount: calc.expectedSeedReturn,
                hasBonus,
              })
            }
          } else if (isHerb) {
            const herb = HERBS.find(h => h.id === group.cropOrAnimalId)
            if (herb) {
              const seedsNeeded = group.count * SEEDS_PER_PLOT * daysToCalculate
              const seedsWithBuffer = Math.ceil(seedsNeeded * (1 + store.settings.rngBuffer))
              const avgYield = store.settings.hasPremium ? 9 : 4.5
              const hasBonus = hasCityBonus(herb.bonusCity, city)
              const multiplier = hasBonus ? 1.1 : 1

              inputs.push({
                item: herb.seedName,
                amount: seedsNeeded,
                amountWithBuffer: seedsWithBuffer,
              })
              outputs.push({
                item: herb.name,
                amount: Math.floor(seedsNeeded * avgYield * multiplier),
                hasBonus,
              })
            }
          } else {
            const animal = getAnimalById(group.cropOrAnimalId)
            if (animal) {
              const calc = calculateAnimalOutput(
                animal, group.count, store.settings.hasPremium, store.settings.useFocus,
                false, daysToCalculate, store.settings.rngBuffer, city
              )
              const hasBonus = hasCityBonus(animal.bonusCity, city)
              inputs.push({
                item: animal.babyName,
                amount: calc.animalsNeeded,
                amountWithBuffer: calc.animalsNeeded,
              })
              inputs.push({
                item: `Feed (crops)`,
                amount: calc.feedNeeded,
                amountWithBuffer: calc.feedNeededWithBuffer,
              })
              if (animal.produceType !== 'none' && animal.produceName) {
                outputs.push({
                  item: animal.produceName,
                  amount: calc.expectedProduce,
                  hasBonus,
                })
              }
              outputs.push({
                item: `${animal.babyName} (returned)`,
                amount: calc.expectedOffspring,
                hasBonus: false,
              })
            }
          }
        }
      }

      results.push({ workerId, workerName: worker?.name || 'Unassigned', inputs, outputs })
    }

    return results
  }, [store, daysToCalculate])

  // Aggregate totals
  const aggregatedInputs = useMemo(() => {
    const agg: Record<string, { amount: number; amountWithBuffer: number }> = {}
    for (const wc of workerCalculations) {
      for (const input of wc.inputs) {
        if (!agg[input.item]) agg[input.item] = { amount: 0, amountWithBuffer: 0 }
        agg[input.item].amount += input.amount
        agg[input.item].amountWithBuffer += input.amountWithBuffer
      }
    }
    return Object.entries(agg).map(([item, data]) => ({ item, ...data }))
  }, [workerCalculations])

  const aggregatedOutputs = useMemo(() => {
    const agg: Record<string, { amount: number; hasBonus: boolean }> = {}
    for (const wc of workerCalculations) {
      for (const output of wc.outputs) {
        if (!agg[output.item]) agg[output.item] = { amount: 0, hasBonus: output.hasBonus }
        agg[output.item].amount += output.amount
      }
    }
    return Object.entries(agg).map(([item, data]) => ({ item, ...data }))
  }, [workerCalculations])

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-light dark:text-muted">Calculate for:</label>
            <select
              value={daysToCalculate}
              onChange={(e) => setDaysToCalculate(parseInt(e.target.value))}
              className="rounded border border-border-light bg-surface-light px-3 py-2 text-sm dark:border-border dark:bg-surface"
            >
              <option value={1}>1 Day</option>
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
            </select>
          </div>
          <div className="text-xs text-muted-light dark:text-muted">
            RNG Buffer: +{(store.settings.rngBuffer * 100).toFixed(0)}% | City Bonus: +{CITY_BONUS_PERCENT}%
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
          <h3 className="mb-3 text-sm font-medium text-red-400">
            Total Inputs Required ({daysToCalculate} days)
          </h3>
          <div className="space-y-2">
            {aggregatedInputs.map((input, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-text1-light dark:text-text1">{input.item}</span>
                <div className="text-right">
                  <span className="font-bold text-red-400">{input.amountWithBuffer.toLocaleString()}</span>
                  {input.amountWithBuffer !== input.amount && (
                    <span className="ml-1 text-xs text-muted-light dark:text-muted">
                      (base: {input.amount.toLocaleString()})
                    </span>
                  )}
                </div>
              </div>
            ))}
            {aggregatedInputs.length === 0 && (
              <p className="text-muted-light dark:text-muted">No islands configured</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-4">
          <h3 className="mb-3 text-sm font-medium text-green-400">
            Expected Outputs ({daysToCalculate} days)
          </h3>
          <div className="space-y-2">
            {aggregatedOutputs.map((output, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-text1-light dark:text-text1">
                  {output.item}
                  {output.hasBonus && <span className="ml-1 text-xs text-green-400">(+{CITY_BONUS_PERCENT}%)</span>}
                </span>
                <span className="font-bold text-green-400">{output.amount.toLocaleString()}</span>
              </div>
            ))}
            {aggregatedOutputs.length === 0 && (
              <p className="text-muted-light dark:text-muted">No islands configured</p>
            )}
          </div>
        </div>
      </div>

      {workerCalculations.map((wc) => (
        <div key={wc.workerId || 'unassigned'} className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-text1-light dark:text-text1">
            <span className={`h-3 w-3 rounded-full ${wc.workerId ? 'bg-green-400' : 'bg-gray-400'}`} />
            {wc.workerName}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-medium text-red-400">Inputs</h4>
              <div className="space-y-1">
                {wc.inputs.map((input, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-muted-light dark:text-muted">{input.item}</span>
                    <span className="font-medium text-red-400">{input.amountWithBuffer.toLocaleString()}</span>
                  </div>
                ))}
                {wc.inputs.length === 0 && <p className="text-xs text-muted-light dark:text-muted">No islands</p>}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-medium text-green-400">Outputs</h4>
              <div className="space-y-1">
                {wc.outputs.map((output, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-muted-light dark:text-muted">
                      {output.item}
                      {output.hasBonus && <span className="ml-1 text-green-400">(+{CITY_BONUS_PERCENT}%)</span>}
                    </span>
                    <span className="font-medium text-green-400">{output.amount.toLocaleString()}</span>
                  </div>
                ))}
                {wc.outputs.length === 0 && <p className="text-xs text-muted-light dark:text-muted">No outputs</p>}
              </div>
            </div>
          </div>
        </div>
      ))}

      {store.islands.length === 0 && (
        <div className="rounded-2xl border border-border-light bg-surface-light p-8 text-center dark:border-border dark:bg-surface">
          <p className="text-muted-light dark:text-muted">No islands configured yet.</p>
        </div>
      )}

      <div className="rounded-2xl border border-border-light bg-surface-light p-4 dark:border-border dark:bg-surface">
        <h3 className="mb-2 text-sm font-medium text-text1-light dark:text-text1">Calculation Notes</h3>
        <ul className="space-y-1 text-xs text-muted-light dark:text-muted">
          <li>- Input amounts include +{(store.settings.rngBuffer * 100).toFixed(0)}% RNG buffer</li>
          <li>- Premium: {store.settings.hasPremium ? 'Yes (2x yields)' : 'No'}</li>
          <li>- Focus: {store.settings.useFocus ? 'Yes (guaranteed seed return)' : 'No'}</li>
          <li>- City Bonus: +{CITY_BONUS_PERCENT}% yield when crop/animal matches city</li>
          <li>- Crop yield avg: {store.settings.hasPremium ? '9' : '4.5'} per seed</li>
          <li>- Each plot holds 9 seeds or 9 animals</li>
        </ul>
      </div>
    </div>
  )
}
