import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GoldeniumCraftingConfig, HideoutConfig, Item, SavedHideout } from '@/lib/crafting/types'

export type CraftingCategory = 'gear' | 'food' | 'potion' | 'refining'

export interface CraftingFilters {
  search: string
  tier: 'all' | '4' | '5' | '6' | '7' | '8'
  category: CraftingCategory
  subcategory: string
  sortBy: 'name' | 'tier' | 'profit' | 'roi'
}

export interface CraftingInputs {
  quality: number
  quantity: number
  city: string
  buyCity: string
  sellCity: string
  stationFeePer100: number
  useFocus: boolean
  enchantment: number
  useManualMaterialPrices: boolean
  manualMaterialPrices: Record<string, number>
  usePerMaterialMarkets: boolean
  materialBuyMarkets: Record<string, string>
  useManualSellPrice: boolean
  manualSellPrice: number
  useManualBuyPrice: boolean
  manualBuyPrice: number
  useManualMaterialCost: boolean
  manualMaterialCost: number
  includeJournalValue: boolean
  useManualJournalValue: boolean
  manualJournalValue: number
  locationType: 'city' | 'hideout'
  hideoutConfig: HideoutConfig
  // Goldenium RRR settings
  goldeniumConfig: GoldeniumCraftingConfig
}

interface CraftingState {
  selectedItem: Item | null
  filters: CraftingFilters
  inputs: CraftingInputs
  hideoutPresets: SavedHideout[]
  activeHideoutId: string | null
  setSelectedItem: (item: Item | null) => void
  updateFilters: (filters: Partial<CraftingFilters>) => void
  updateInputs: (inputs: Partial<CraftingInputs>) => void
  addHideoutPreset: (preset: Omit<SavedHideout, 'id' | 'lastUsed'>) => void
  updateHideoutPreset: (id: string, updates: Partial<SavedHideout>) => void
  removeHideoutPreset: (id: string) => void
  setActiveHideout: (id: string | null) => void
}

const defaultHideout: HideoutConfig = {
  name: '',
  buildingType: 'forge',
  buildingTier: 1,
  foodBonus: 0,
  mapQualityBonus: 0,
  energyLevel: 100,
  isActive: true,
}

export const useCraftingStore = create<CraftingState>()(
  persist(
    (set) => ({
      selectedItem: null,
      filters: {
        search: '',
        tier: 'all',
        category: 'gear',
        subcategory: 'all',
        sortBy: 'name',
      },
      inputs: {
        quality: 1,
        quantity: 1,
        city: 'Bridgewatch',
        buyCity: 'Auto (best)',
        sellCity: 'Auto (best)',
        stationFeePer100: 500,
        useFocus: false,
        enchantment: 0,
        useManualMaterialPrices: false,
        manualMaterialPrices: {},
        usePerMaterialMarkets: false,
        materialBuyMarkets: {},
        useManualSellPrice: false,
        manualSellPrice: 0,
        useManualBuyPrice: false,
        manualBuyPrice: 0,
        useManualMaterialCost: false,
        manualMaterialCost: 0,
        includeJournalValue: false,
        useManualJournalValue: false,
        manualJournalValue: 0,
        locationType: 'city',
        hideoutConfig: defaultHideout,
        // Goldenium RRR defaults
        goldeniumConfig: {
          zoneQuality: 1,
          hideoutPower: 1,
          useCityBonus: false,
          useFocus: false,
          isOnIsland: false,
        },
      },
      hideoutPresets: [],
      activeHideoutId: null,
      setSelectedItem: (item) => set({ selectedItem: item }),
      updateFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      updateInputs: (inputs) =>
        set((state) => ({ inputs: { ...state.inputs, ...inputs } })),
      addHideoutPreset: (preset) =>
        set((state) => {
          const newPreset: SavedHideout = {
            ...preset,
            id: `${Date.now()}`,
            lastUsed: Date.now(),
            isFavorite: preset.isFavorite ?? false,
          }
          return { hideoutPresets: [...state.hideoutPresets, newPreset] }
        }),
      updateHideoutPreset: (id, updates) =>
        set((state) => ({
          hideoutPresets: state.hideoutPresets.map((preset) =>
            preset.id === id ? { ...preset, ...updates, lastUsed: Date.now() } : preset
          ),
        })),
      removeHideoutPreset: (id) =>
        set((state) => ({
          hideoutPresets: state.hideoutPresets.filter((preset) => preset.id !== id),
          activeHideoutId: state.activeHideoutId === id ? null : state.activeHideoutId,
        })),
      setActiveHideout: (id) =>
        set((state) => ({
          activeHideoutId: id,
          hideoutPresets: state.hideoutPresets.map((preset) =>
            preset.id === id ? { ...preset, lastUsed: Date.now() } : preset
          ),
        })),
    }),
    { name: 'crafting-dashboard' }
  )
)
