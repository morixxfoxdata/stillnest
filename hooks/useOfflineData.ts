'use client'

import { useState, useEffect, useCallback } from 'react'
import { useOffline } from './useOffline'

interface OfflineDataOptions<T> {
  key: string
  fetchFn: () => Promise<T>
  ttl?: number // Time to live in milliseconds
  dependencies?: any[] // Dependencies that trigger refetch
  fallbackData?: T
  onError?: (error: Error) => void
}

interface OfflineDataState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  isStale: boolean
  lastFetched: Date | null
  source: 'cache' | 'network' | 'fallback'
}

export function useOfflineData<T>({
  key,
  fetchFn,
  ttl = 5 * 60 * 1000, // 5 minutes default
  dependencies = [],
  fallbackData,
  onError
}: OfflineDataOptions<T>) {
  const { isOnline, isOffline } = useOffline()
  
  const [state, setState] = useState<OfflineDataState<T>>({
    data: null,
    isLoading: true,
    error: null,
    isStale: false,
    lastFetched: null,
    source: 'cache'
  })

  // Generate storage key
  const storageKey = `stillnest_offline_${key}`

  // Load data from localStorage
  const loadFromStorage = useCallback((): { data: T | null; timestamp: number | null } => {
    if (typeof window === 'undefined') return { data: null, timestamp: null }
    
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          data: parsed.data,
          timestamp: parsed.timestamp
        }
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error)
    }
    
    return { data: null, timestamp: null }
  }, [storageKey])

  // Save data to localStorage
  const saveToStorage = useCallback((data: T) => {
    if (typeof window === 'undefined') return
    
    try {
      const toStore = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(storageKey, JSON.stringify(toStore))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }, [storageKey])

  // Check if cached data is stale
  const isDataStale = useCallback((timestamp: number | null): boolean => {
    if (!timestamp) return true
    return Date.now() - timestamp > ttl
  }, [ttl])

  // Fetch data from network
  const fetchFromNetwork = useCallback(async (): Promise<T> => {
    try {
      const data = await fetchFn()
      saveToStorage(data)
      return data
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Network fetch failed')
      onError?.(err)
      throw err
    }
  }, [fetchFn, saveToStorage, onError])

  // Main data loading function
  const loadData = useCallback(async (forceRefresh = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    // First, try to load from cache
    const { data: cachedData, timestamp } = loadFromStorage()
    const isCacheStale = isDataStale(timestamp)

    // If we have cached data and we're offline, use it
    if (cachedData && isOffline) {
      setState({
        data: cachedData,
        isLoading: false,
        error: null,
        isStale: isCacheStale,
        lastFetched: timestamp ? new Date(timestamp) : null,
        source: 'cache'
      })
      return cachedData
    }

    // If we have fresh cached data and we're not forcing refresh, use it
    if (cachedData && !isCacheStale && !forceRefresh && isOnline) {
      setState({
        data: cachedData,
        isLoading: false,
        error: null,
        isStale: false,
        lastFetched: timestamp ? new Date(timestamp) : null,
        source: 'cache'
      })
      return cachedData
    }

    // Try to fetch from network if online
    if (isOnline) {
      try {
        const networkData = await fetchFromNetwork()
        setState({
          data: networkData,
          isLoading: false,
          error: null,
          isStale: false,
          lastFetched: new Date(),
          source: 'network'
        })
        return networkData
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Network error')
        
        // If we have cached data, use it as fallback
        if (cachedData) {
          setState({
            data: cachedData,
            isLoading: false,
            error: err,
            isStale: true,
            lastFetched: timestamp ? new Date(timestamp) : null,
            source: 'cache'
          })
          return cachedData
        }
        
        // If we have fallback data, use it
        if (fallbackData) {
          setState({
            data: fallbackData,
            isLoading: false,
            error: err,
            isStale: true,
            lastFetched: null,
            source: 'fallback'
          })
          return fallbackData
        }
        
        // No data available, show error
        setState({
          data: null,
          isLoading: false,
          error: err,
          isStale: false,
          lastFetched: null,
          source: 'network'
        })
        throw err
      }
    }

    // Offline and no cached data
    if (fallbackData) {
      setState({
        data: fallbackData,
        isLoading: false,
        error: new Error('Offline - using fallback data'),
        isStale: true,
        lastFetched: null,
        source: 'fallback'
      })
      return fallbackData
    }

    // No data available
    const offlineError = new Error('No cached data available offline')
    setState({
      data: null,
      isLoading: false,
      error: offlineError,
      isStale: false,
      lastFetched: null,
      source: 'cache'
    })
    throw offlineError
  }, [
    loadFromStorage,
    isDataStale,
    isOffline,
    isOnline,
    fetchFromNetwork,
    fallbackData
  ])

  // Refresh data
  const refresh = useCallback(() => {
    return loadData(true)
  }, [loadData])

  // Clear cached data
  const clearCache = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  // Load data on mount and dependency changes
  useEffect(() => {
    loadData()
  }, [loadData, ...dependencies])

  // Retry when coming back online
  useEffect(() => {
    if (isOnline && state.error && state.source === 'cache') {
      loadData()
    }
  }, [isOnline, state.error, state.source, loadData])

  return {
    ...state,
    refresh,
    clearCache,
    // Helper flags
    isFromCache: state.source === 'cache',
    isFromNetwork: state.source === 'network',
    isFromFallback: state.source === 'fallback',
    canRefresh: isOnline && !state.isLoading
  }
}