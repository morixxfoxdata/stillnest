'use client'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  const style = {
    width: width || undefined,
    height: height || undefined,
  }

  return (
    <div 
      className={`animate-pulse bg-muted rounded ${className}`}
      style={style}
    />
  )
}

export function PhotoCardSkeleton() {
  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="w-full aspect-[4/3]" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <Skeleton className="h-5 w-3/4" />
        
        {/* Caption skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* User info skeleton */}
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

export function GallerySkeleton({ columns = 2, count = 6 }: { columns?: number; count?: number }) {
  return (
    <div className={`grid gap-4 ${
      columns === 1 ? 'grid-cols-1' :
      columns === 2 ? 'grid-cols-2' :
      columns === 3 ? 'grid-cols-3' : 'grid-cols-4'
    }`}>
      {Array.from({ length: count }, (_, i) => (
        <PhotoCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile header skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>
        
        {/* Bio skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      
      {/* Gallery skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <GallerySkeleton />
      </div>
    </div>
  )
}

export function SearchSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search bar skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full max-w-2xl" />
      </div>
      
      {/* Results skeleton */}
      <GallerySkeleton count={8} />
    </div>
  )
}

export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }
  
  return (
    <div className={`animate-spin rounded-full border-2 border-muted border-t-primary ${sizeClasses[size]} ${className}`} />
  )
}

export function CenteredLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}