import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type State = { dark: boolean; setDark: (v: boolean) => void }

export const useTheme = create(
  persist<State>(
    (set) => ({ dark: true, setDark: (v) => set({ dark: v }) }),
    { name: 'theme' }
  )
)
