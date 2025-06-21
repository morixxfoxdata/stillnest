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
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    wasOffline: false,
    lastOnlineAt: new Date(),
    downtime: 0
  })

  const [offlineStartTime, setOfflineStartTime] = useState<Date | null>(null)

  // Ping function to verify actual connectivity
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      // Try to fetch a small resource from the same origin
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
      })
      return response.ok
    } catch {
      // If fetch fails, try a reliable external endpoint
      try {
        const response = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
        })
        return true // If we reach here, we have connectivity
      } catch {
        return false
      }
    }
  }, [])

  const updateOnlineStatus = useCallback(async (navigatorOnline: boolean) => {
    if (navigatorOnline) {
      // Browser says online, but verify with actual request
      const isActuallyOnline = await checkConnectivity()
      
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
  }, [checkConnectivity, offlineStartTime])

  useEffect(() => {
    // Initial check
    updateOnlineStatus(navigator.onLine)

    const handleOnline = () => updateOnlineStatus(true)
    const handleOffline = () => updateOnlineStatus(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic connectivity check (every 30 seconds when online)
    const connectivityCheck = setInterval(async () => {
      if (navigator.onLine) {
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
  }, [updateOnlineStatus, checkConnectivity, state.isOnline])

  // Manual connectivity check function
  const refreshConnectivity = useCallback(async () => {
    await updateOnlineStatus(navigator.onLine)
  }, [updateOnlineStatus])

  return {
    ...state,
    refreshConnectivity,
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