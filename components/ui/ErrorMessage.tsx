'use client'

import { ReactNode } from 'react'
import { LoadingSpinner } from './SkeletonLoader'

interface ErrorMessageProps {
  title?: string
  message?: string
  error?: Error
  onRetry?: () => void
  isRetrying?: boolean
  canRetry?: boolean
  retryCount?: number
  maxRetries?: number
  children?: ReactNode
  className?: string
  variant?: 'default' | 'inline' | 'minimal'
}

export function ErrorMessage({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  isRetrying = false,
  canRetry = true,
  retryCount = 0,
  maxRetries = 3,
  children,
  className = '',
  variant = 'default'
}: ErrorMessageProps) {
  const getErrorMessage = () => {
    if (message) return message
    if (error) {
      // Handle common error types with user-friendly messages
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return 'Network connection problem. Please check your internet connection and try again.'
      }
      if (error.message.includes('unauthorized') || error.message.includes('401')) {
        return 'Your session has expired. Please sign in again.'
      }
      if (error.message.includes('forbidden') || error.message.includes('403')) {
        return 'You don\'t have permission to access this content.'
      }
      if (error.message.includes('not found') || error.message.includes('404')) {
        return 'The requested content could not be found.'
      }
      if (error.message.includes('server') || error.message.includes('500')) {
        return 'Server error. Our team has been notified and is working on a fix.'
      }
      return error.message
    }
    return 'An unexpected error occurred. Please try again.'
  }

  if (variant === 'minimal') {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-sm text-red-600 mb-2">{getErrorMessage()}</p>
        {canRetry && onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="text-xs text-primary hover:underline disabled:opacity-50"
          >
            {isRetrying ? 'Retrying...' : 'Try again'}
          </button>
        )}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md ${className}`}>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm text-red-700">{getErrorMessage()}</p>
        </div>
        {canRetry && onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 flex items-center gap-1"
          >
            {isRetrying && <LoadingSpinner size="sm" />}
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{getErrorMessage()}</p>
      
      {children}
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {canRetry && onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isRetrying && <LoadingSpinner size="sm" />}
            {isRetrying ? 'Retrying...' : 'Try again'}
          </button>
        )}
        
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 border border-border text-foreground rounded-md hover:bg-muted transition-colors font-medium"
        >
          Refresh page
        </button>
      </div>
      
      {retryCount > 0 && (
        <p className="text-xs text-muted-foreground mt-4">
          Retry attempt {retryCount} of {maxRetries}
        </p>
      )}
      
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-6 text-left max-w-2xl mx-auto">
          <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
            Error Details (Development Only)
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto">
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </div>
  )
}