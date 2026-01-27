import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ItemQuality = 'normal' | 'good' | 'outstanding' | 'excellent' | 'masterpiece'

export type BuildItemRef = {
  uniquename: string
  tier: number
  enchant: number
  quality: ItemQuality
}

export type Build = {
  id: string
  name: string
  weapon?: BuildItemRef
  offhand?: BuildItemRef
  head?: BuildItemRef
  chest?: BuildItemRef
  shoes?: BuildItemRef
  cape?: BuildItemRef
  mount?: BuildItemRef
  food?: BuildItemRef
  potion?: BuildItemRef
  ip: number
  manualIp: number | null
  timestamp: number
}

type BuildDraft = Omit<Build, 'id' | 'timestamp'>

type BuildState = {
  current: BuildDraft
  builds: Build[]
  setName: (name: string) => void
  setSlot: (slot: keyof BuildDraft, item?: BuildItemRef) => void
  setIp: (ip: number) => void
  setManualIp: (ip: number | null) => void
  resetCurrent: () => void
  saveBuild: () => void
  loadBuild: (id: string) => void
  removeBuild: (id: string) => void
}

const emptyDraft: BuildDraft = {
  name: 'New Build',
  ip: 0,
  manualIp: null,
}

export const useBuilds = create(
  persist<BuildState>(
    (set, get) => ({
      current: { ...emptyDraft },
      builds: [],
      setName: (name) => set((state) => ({ current: { ...state.current, name } })),
      setSlot: (slot, item) =>
        set((state) => ({
          current: { ...state.current, [slot]: item },
        })),
      setIp: (ip) => set((state) => ({ current: { ...state.current, ip } })),
      setManualIp: (manualIp) =>
        set((state) => ({ current: { ...state.current, manualIp } })),
      resetCurrent: () => set(() => ({ current: { ...emptyDraft } })),
      saveBuild: () =>
        set((state) => {
          const existingIndex = state.builds.findIndex((build) => build.name === state.current.name)
          const nextBuild: Build = {
            ...state.current,
            id: existingIndex >= 0 ? state.builds[existingIndex].id : crypto.randomUUID(),
            timestamp: Date.now(),
          }
          const nextBuilds = [...state.builds]
          if (existingIndex >= 0) {
            nextBuilds[existingIndex] = nextBuild
          } else {
            nextBuilds.unshift(nextBuild)
          }
          return { builds: nextBuilds.slice(0, 3), current: { ...nextBuild } }
        }),
      loadBuild: (id) =>
        set((state) => {
          const build = state.builds.find((item) => item.id === id)
          return build ? { current: { ...build } } : {}
        }),
      removeBuild: (id) =>
        set((state) => ({
          builds: state.builds.filter((build) => build.id !== id),
        })),
    }),
    { name: 'builds' }
  )
)
