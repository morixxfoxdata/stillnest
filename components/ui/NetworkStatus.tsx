'use client'

import { useEffect, useState } from 'react'
import { useToastContext } from '@/components/providers/ToastProvider'

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)
  const toast = useToastContext()

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        toast.success('Connection restored', 'You are back online.')
        setWasOffline(false)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      toast.warning(
        'No internet connection', 
        'Some features may not work properly while offline.'
      )
    }

    // Check initial status
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [toast, wasOffline])

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 text-sm z-50">
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span>No internet connection - Working offline</span>
      </div>
    </div>
  )
}