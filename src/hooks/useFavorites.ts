import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  favorites: string[]
  toggleFavorite: (itemId: string) => void
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: [],
      toggleFavorite: (itemId: string) =>
        set((state) => ({
          favorites: state.favorites.includes(itemId)
            ? state.favorites.filter((id) => id !== itemId)
            : [...state.favorites, itemId],
        })),
    }),
    { name: 'albion-market-favorites' }
  )
)
