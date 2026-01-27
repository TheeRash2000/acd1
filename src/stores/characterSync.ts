import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DESTINY_NODE_NAMES, DESTINY_NODE_TABLE_IDS, nodeNameToTableId } from '@/lib/destinyMapping'

type CharacterSpecs = Record<string, number>

export interface Character {
  name: string
  server: string
  specs: CharacterSpecs
}

type CharacterSyncState = {
  characters: Array<Character | null>
  activeIndex: number
  setActiveIndex: (index: number) => void
  setCharacter: (index: number, name: string, server: string) => void
  setSpecValue: (index: number, tableId: string, value: number) => void
  setSpecs: (index: number, specs: CharacterSpecs) => void
  resetSpecs: (index: number) => void
}

function clampSpec(value: number) {
  return Math.max(0, Math.min(120, Math.round(value)))
}

const ALL_NODE_IDS = DESTINY_NODE_TABLE_IDS
const NAME_TO_ID = new Map(
  DESTINY_NODE_NAMES.map((name) => [name, nodeNameToTableId(name)])
)

export function createEmptySpecs(): CharacterSpecs {
  const specs: CharacterSpecs = {}
  for (const tableId of ALL_NODE_IDS) {
    specs[tableId] = 0
  }
  return specs
}

function mergeSpecs(existing?: CharacterSpecs): CharacterSpecs {
  const specs = createEmptySpecs()
  if (existing) {
    for (const [key, value] of Object.entries(existing)) {
      if (key in specs) {
        specs[key] = value
        continue
      }
      const mapped = NAME_TO_ID.get(key)
      if (mapped) specs[mapped] = value
    }
  }
  return specs
}

export function getSpecBonus(tableId: string, specs?: CharacterSpecs) {
  const state = useCharacterSync.getState()
  const stateSpecs = specs ?? state.characters[state.activeIndex]?.specs ?? {}
  const level = stateSpecs[tableId] ?? 0
  return Number((level * 0.2).toFixed(1))
}

export const useCharacterSync = create<CharacterSyncState>()(
  persist(
    (set) => ({
      characters: [null, null, null],
      activeIndex: 0,
      setActiveIndex: (index) => set({ activeIndex: Math.max(0, Math.min(2, index)) }),
      setCharacter: (index, name, server) =>
        set((state) => {
          const next = [...state.characters]
          next[index] = { name, server, specs: mergeSpecs(state.characters[index]?.specs) }
          return { characters: next }
        }),
      setSpecValue: (index, tableId, value) =>
        set((state) => {
          const target = state.characters[index]
          if (!target) return state
          const specs = { ...mergeSpecs(target.specs), [tableId]: clampSpec(value) }
          const next = [...state.characters]
          next[index] = { ...target, specs }
          return { characters: next }
        }),
      setSpecs: (index, specs) =>
        set((state) => {
          const target = state.characters[index]
          if (!target) return state
          const next = [...state.characters]
          next[index] = { ...target, specs: mergeSpecs(specs) }
          return { characters: next }
        }),
      resetSpecs: (index) =>
        set((state) => {
          const target = state.characters[index]
          if (!target) return state
          const next = [...state.characters]
          next[index] = { ...target, specs: createEmptySpecs() }
          return { characters: next }
        }),
    }),
    {
      name: 'character-sync',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const nextCharacters = state.characters.map((character) =>
          character ? { ...character, specs: mergeSpecs(character.specs) } : null
        )
        state.characters = nextCharacters
      },
    }
  )
)
