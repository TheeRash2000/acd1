'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useAuth } from '@/components/auth'
import { uploadToCloud, getLocalData } from '@/lib/sync/syncService'

interface AutoSyncOptions {
  debounceMs?: number
  enabled?: boolean
}

interface AutoSyncState {
  lastSyncedAt: Date | null
  isSyncing: boolean
  error: string | null
}

/**
 * Hook for automatic cloud syncing when data changes
 */
export function useAutoSync(options: AutoSyncOptions = {}) {
  const { debounceMs = 5000, enabled = true } = options
  const { user, isConfigured } = useAuth()
  const [state, setState] = useState<AutoSyncState>({
    lastSyncedAt: null,
    isSyncing: false,
    error: null,
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastDataHashRef = useRef<string | null>(null)

  // Create a simple hash of the data to detect changes
  const getDataHash = useCallback(() => {
    const data = getLocalData()
    return JSON.stringify({
      characters: data.characters.length,
      builds: data.builds.length,
      favorites: data.favorites.length,
      // Include a sample of actual data for change detection
      charIds: data.characters.map(c => c.id).join(','),
      buildIds: data.builds.map(b => b.id).join(','),
    })
  }, [])

  const syncNow = useCallback(async () => {
    if (!user || !isConfigured || state.isSyncing) return

    setState(prev => ({ ...prev, isSyncing: true, error: null }))

    try {
      const result = await uploadToCloud(user.id)
      if (result.success) {
        setState(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncedAt: new Date(),
          error: null,
        }))
        lastDataHashRef.current = getDataHash()
      } else {
        setState(prev => ({
          ...prev,
          isSyncing: false,
          error: result.message,
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
    if (!enabled || !user || !isConfigured) return

    const currentHash = getDataHash()
    if (currentHash !== lastDataHashRef.current) {
      // Data changed, schedule sync
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        syncNow()
      }, debounceMs)
    }
  }, [enabled, user, isConfigured, getDataHash, debounceMs, syncNow])

  // Set up storage event listener for changes
  useEffect(() => {
    if (!enabled || !user || !isConfigured) return

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
    const pollInterval = setInterval(checkAndSync, 10000) // Check every 10 seconds

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(pollInterval)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, user, isConfigured, getDataHash, checkAndSync])

  // Sync on visibility change (when user returns to tab)
  useEffect(() => {
    if (!enabled || !user || !isConfigured) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndSync()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, user, isConfigured, checkAndSync])

  return {
    ...state,
    syncNow,
    isEnabled: enabled && !!user && isConfigured,
  }
}
