'use client'

import { useState, useEffect } from 'react'
import { useOffline } from '@/hooks/useOffline'
import { LoadingSpinner } from './SkeletonLoader'

interface OfflineBannerProps {
  className?: string
}

export function OfflineBanner({ className = '' }: OfflineBannerProps) {
  const { isOffline, isOnline, wasOffline, downtimeFormatted, refreshConnectivity } = useOffline()
  const [showReconnectedMessage, setShowReconnectedMessage] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Show reconnected message briefly when coming back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnectedMessage(true)
      const timer = setTimeout(() => {
        setShowReconnectedMessage(false)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  const handleRetryConnection = async () => {
    setIsRefreshing(true)
    await refreshConnectivity()
    setIsRefreshing(false)
  }

  // Show reconnected message
  if (showReconnectedMessage && isOnline) {
    return (
      <div className={`bg-green-100 border-l-4 border-green-500 text-green-700 p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">You're back online!</span>
            {downtimeFormatted && (
              <span className="text-sm">
                (offline for {downtimeFormatted})
              </span>
            )}
          </div>
          <button
            onClick={() => setShowReconnectedMessage(false)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // Show offline message
  if (isOffline) {
    return (
      <div className={`bg-red-100 border-l-4 border-red-500 text-red-700 p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">You're offline</span>
            <span className="text-sm">
              Some features may not work properly
            </span>
          </div>
          <button
            onClick={handleRetryConnection}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-red-600 hover:text-red-800 disabled:opacity-50 text-sm"
          >
            {isRefreshing && <LoadingSpinner size="sm" />}
            {isRefreshing ? 'Checking...' : 'Retry'}
          </button>
        </div>
      </div>
    )
  }

  return null
}

// Enhanced network status component
export function NetworkStatus() {
  const { isOffline, isOnline } = useOffline()

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <OfflineBanner />
    </div>
  )
}