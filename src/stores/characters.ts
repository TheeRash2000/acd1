import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Character = { name: string; server: string; lastFetched: number }

type State = {
  characters: Character[]
  activeName: string | null
  addCharacter: (character: Character) => void
  setActiveName: (name: string | null) => void
  removeCharacter: (name: string, server: string) => void
}

export const useCharacters = create(
  persist<State>(
    (set) => ({
      characters: [],
      activeName: null,
      addCharacter: (character) =>
        set((state) => {
          const existingIndex = state.characters.findIndex(
            (item) => item.name === character.name && item.server === character.server
          )
          const nextCharacters = [...state.characters]
          if (existingIndex >= 0) {
            nextCharacters[existingIndex] = character
          } else {
            nextCharacters.push(character)
          }
          return { characters: nextCharacters, activeName: character.name }
        }),
      setActiveName: (name) => set(() => ({ activeName: name })),
      removeCharacter: (name, server) =>
        set((state) => ({
          characters: state.characters.filter((item) => !(item.name === name && item.server === server)),
          activeName: state.activeName === name ? null : state.activeName,
        })),
    }),
    { name: 'characters' }
  )
)
