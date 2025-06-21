'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  sizes?: string
  priority?: boolean
  placeholder?: string
  onLoad?: () => void
  onClick?: () => void
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  sizes,
  priority = false,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA5MEM3NSA4Ni42ODYzIDc3LjY4NjMgODQgODEgODRIODVDODguMzEzNyA4NCA5MSA4Ni42ODYzIDkxIDkwVjkxSDc1VjkwWiIgZmlsbD0iI0QxRDVEQiIvPgo8cGF0aCBkPSJNMTI1IDExNUMxMjUgMTExLjY4NiAxMjcuNjg2IDEwOSAxMzEgMTA5SDEzNUMxMzguMzE0IDEwOSAxNDEgMTExLjY4NiAxNDEgMTE1VjExNkgxMjVWMTE1WiIgZmlsbD0iI0QxRDVEQiIvPgo8L3N2Zz4K',
  onLoad,
  onClick
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px'
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
  }

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center">
            <svg className="w-8 h-8 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-xs text-muted-foreground">Failed to load</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      {isInView && !hasError && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-auto transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          sizes={sizes}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          placeholder="blur"
          blurDataURL={placeholder}
        />
      )}
    </div>
  )
}