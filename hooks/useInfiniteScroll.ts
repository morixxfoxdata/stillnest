import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  rootMargin?: string
  threshold?: number
}

export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  rootMargin = '100px',
  threshold = 0.1
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver>()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isFetchingNextPage) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }, {
      rootMargin,
      threshold
    })
    
    if (node) observerRef.current.observe(node)
  }, [isFetchingNextPage, hasNextPage, fetchNextPage, rootMargin, threshold])

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return { lastElementRef, loadMoreRef }
}