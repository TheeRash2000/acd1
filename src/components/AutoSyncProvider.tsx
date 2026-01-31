'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useAuth } from '@/components/auth'
import { getLocalData } from '@/lib/sync/syncService'

interface AutoSyncState {
  lastSyncedAt: Date | null
  isSyncing: boolean
  error: string | null
}

/**
 * Provider component for automatic cloud syncing
 * Renders a subtle indicator when syncing
 */
export function AutoSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, isConfigured } = useAuth()
  const [state, setState] = useState<AutoSyncState>({
    lastSyncedAt: null,
    isSyncing: false,
    error: null,
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastDataHashRef = useRef<string | null>(null)
  const debounceMs = 5000

  // Create a simple hash of the data to detect changes
  const getDataHash = useCallback(() => {
    try {
      const data = getLocalData()
      return JSON.stringify({
        characters: data.characters.length,
        builds: data.builds.length,
        favorites: data.favorites.length,
        charIds: data.characters.map(c => c.id).join(','),
        buildIds: data.builds.map(b => b.id).join(','),
        // Include update timestamps for change detection
        charUpdates: data.characters.map(c => c.updatedAt).join(','),
      })
    } catch {
      return null
    }
  }, [])

  const syncNow = useCallback(async () => {
    if (!user || !isConfigured || state.isSyncing) return

    setState(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      const localData = getLocalData()
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localData),
      })

      if (res.ok) {
        setState(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncedAt: new Date(),
          error: null,
        }))
        lastDataHashRef.current = getDataHash()
      } else {
        const data = await res.json()
        setState(prev => ({
          ...prev,
          isSyncing: false,
          error: data.error || 'Sync failed',
        }))
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Sync failed',
      }))
    }
  }, [user, isConfigured, state.isSyncing, getDataHash])

  // Check for changes and schedule sync
  const checkAndSync = useCallback(() => {
    if (!user || !isConfigured) return

    const currentHash = getDataHash()
    if (currentHash && currentHash !== lastDataHashRef.current) {
      // Data changed, schedule sync
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        syncNow()
      }, debounceMs)
    }
  }, [user, isConfigured, getDataHash, syncNow])

  // Set up storage event listener for changes
  useEffect(() => {
    if (!user || !isConfigured) return

    // Initialize hash
    lastDataHashRef.current = getDataHash()

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'destiny-board-storage' ||
        e.key === 'builds' ||
        e.key === 'albion-market-favorites'
      ) {
        checkAndSync()
      }
    }

    // Also poll periodically since storage events don't fire in same tab
    const pollInterval = setInterval(checkAndSync, 15000) // Check every 15 seconds

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(pollInterval)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [user, isConfigured, getDataHash, checkAndSync])

  // Sync on visibility change (when user returns to tab)
  useEffect(() => {
    if (!user || !isConfigured) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndSync()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, isConfigured, checkAndSync])

  return (
    <>
      {children}
      {/* Sync indicator */}
      {state.isSyncing && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-surface-light px-3 py-2 text-xs shadow-lg dark:bg-surface">
          <svg className="h-4 w-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-muted-light dark:text-muted">Syncing...</span>
        </div>
      )}
    </>
  )
}
