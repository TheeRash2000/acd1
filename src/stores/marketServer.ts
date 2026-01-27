import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MarketServer = 'europe' | 'america' | 'asia'

interface MarketServerState {
  server: MarketServer
  setServer: (server: MarketServer) => void
}

export const useMarketServer = create<MarketServerState>()(
  persist(
    (set) => ({
      server: 'europe',
      setServer: (server) => set({ server }),
    }),
    { name: 'albion-market-server' }
  )
)
