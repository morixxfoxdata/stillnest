'use client'

import { useState, useCallback } from 'react'

interface RetryableState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  retryCount: number
}

interface UseRetryableOptions {
  maxRetries?: number
  retryDelay?: number
  onError?: (error: Error, retryCount: number) => void
  onSuccess?: () => void
}

export function useRetryable<T>(
  asyncFn: () => Promise<T>,
  options: UseRetryableOptions = {}
) {
  const { 
    maxRetries = 3, 
    retryDelay = 1000,
    onError,
    onSuccess 
  } = options

  const [state, setState] = useState<RetryableState<T>>({
    data: null,
    isLoading: false,
    error: null,
    retryCount: 0
  })

  const execute = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        retryCount: 0
      }))
    } else {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        retryCount: prev.retryCount + 1
      }))
    }

    try {
      const result = await asyncFn()
      setState(prev => ({
        ...prev,
        data: result,
        isLoading: false,
        error: null
      }))
      onSuccess?.()
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      
      setState(prev => {
        const newRetryCount = isRetry ? prev.retryCount : 0
        onError?.(err, newRetryCount)
        
        return {
          ...prev,
          isLoading: false,
          error: err,
          retryCount: newRetryCount
        }
      })
      
      throw err
    }
  }, [asyncFn, onError, onSuccess])

  const retry = useCallback(async () => {
    if (state.retryCount >= maxRetries) {
      return
    }

    // Add delay before retry
    if (retryDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }

    return execute(true)
  }, [execute, state.retryCount, maxRetries, retryDelay])

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      retryCount: 0
    })
  }, [])

  return {
    ...state,
    execute,
    retry,
    reset,
    canRetry: state.retryCount < maxRetries && !!state.error,
    isMaxRetriesReached: state.retryCount >= maxRetries
  }
}