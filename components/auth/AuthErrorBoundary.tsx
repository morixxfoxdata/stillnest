'use client'

import { useAuth } from './AuthProvider'
import { useToastContext } from '@/components/providers/ToastProvider'
import { useEffect } from 'react'

interface AuthErrorBoundaryProps {
  children: React.ReactNode
}

export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  const { error, retry, loading } = useAuth()
  const toast = useToastContext()

  useEffect(() => {
    if (error) {
      toast.error('Authentication Error', error)
    }
  }, [error, toast])

  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-auto text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Authentication Error
          </h2>
          <p className="text-muted-foreground mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <button
              onClick={retry}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="w-full px-4 py-2 border border-border text-foreground rounded-md hover:bg-muted transition-colors"
            >
              Go to login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}