'use client'

import { useState, useEffect, useCallback } from 'react'

interface OfflineState {
  isOnline: boolean
  isOffline: boolean
  wasOffline: boolean
  lastOnlineAt: Date | null
  downtime: number // milliseconds
}

export function useOffline() {
  const [state, setState] = useState<OfflineState>({
    isOnline: true, // Start optimistically online
    isOffline: false,
    wasOffline: false,
    lastOnlineAt: new Date(),
    downtime: 0
  })

  const [offlineStartTime, setOfflineStartTime] = useState<Date | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Ping function to verify actual connectivity
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      // Try to fetch a small resource from the same origin with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      return response.ok
    } catch {
      // If that fails, we're likely offline or having connectivity issues
      // Don't fall back to external services to avoid unnecessary requests
      return false
    }
  }, [])

  const updateOnlineStatus = useCallback(async (navigatorOnline: boolean, skipConnectivityCheck = false) => {
    if (navigatorOnline) {
      // Browser says online, but verify with actual request (unless skipped)
      const isActuallyOnline = skipConnectivityCheck || await checkConnectivity()
      
      if (isActuallyOnline) {
        const now = new Date()
        const downtime = offlineStartTime ? now.getTime() - offlineStartTime.getTime() : 0
        
        setState(prev => ({
          ...prev,
          isOnline: true,
          isOffline: false,
          lastOnlineAt: now,
          downtime: prev.wasOffline ? downtime : 0
        }))
        
        setOfflineStartTime(null)
      } else {
        // Browser says online but we can't connect
        if (!offlineStartTime) {
          setOfflineStartTime(new Date())
        }
        
        setState(prev => ({
          ...prev,
          isOnline: false,
          isOffline: true,
          wasOffline: true
        }))
      }
    } else {
      // Browser says offline
      if (!offlineStartTime) {
        setOfflineStartTime(new Date())
      }
      
      setState(prev => ({
        ...prev,
        isOnline: false,
        isOffline: true,
        wasOffline: true
      }))
    }
    
    if (!isInitialized) {
      setIsInitialized(true)
    }
  }, [checkConnectivity, offlineStartTime, isInitialized])

  useEffect(() => {
    // Initial check - trust navigator.onLine on first load if it says online
    if (typeof navigator !== 'undefined') {
      updateOnlineStatus(navigator.onLine, navigator.onLine) // Skip connectivity check if navigator says online
    }

    const handleOnline = () => updateOnlineStatus(true)
    const handleOffline = () => updateOnlineStatus(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic connectivity check (every 30 seconds when online)
    const connectivityCheck = setInterval(async () => {
      if (navigator.onLine && isInitialized) {
        const isActuallyOnline = await checkConnectivity()
        if (!isActuallyOnline && state.isOnline) {
          updateOnlineStatus(false)
        }
      }
    }, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(connectivityCheck)
    }
  }, [updateOnlineStatus, checkConnectivity, state.isOnline, isInitialized])

  // Manual connectivity check function
  const refreshConnectivity = useCallback(async () => {
    await updateOnlineStatus(navigator.onLine)
  }, [updateOnlineStatus])

  return {
    ...state,
    refreshConnectivity,
    isInitialized,
    // Helper functions
    hasBeenOffline: state.wasOffline,
    downtimeFormatted: state.downtime > 0 ? formatDowntime(state.downtime) : null,
  }
}

function formatDowntime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}