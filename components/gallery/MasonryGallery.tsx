'use client'

import { useState, useEffect } from 'react'
import { Photo, LayoutStyle } from '@/lib/types'
import PhotoCard from './PhotoCard'
import { GallerySkeleton } from '@/components/ui/SkeletonLoader'

interface MasonryGalleryProps {
  photos: Photo[]
  layout?: LayoutStyle
  showTitles?: boolean
  showCaptions?: boolean
  enableLikes?: boolean
  enableEdit?: boolean
  onDelete?: (photoId: string) => void
  onEdit?: (photo: Photo) => void
  onImageClick?: (photo: Photo) => void
  currentUserId?: string
  onLike?: (photoId: string, isLiked: boolean) => void
  likedPhotos?: Set<string>
  forceColumns?: number // New prop for forcing specific column count
  isLoading?: boolean // New prop for loading state
}

export default function MasonryGallery({ 
  photos, 
  layout = 'masonry',
  showTitles = true,
  showCaptions = true,
  enableLikes = false,
  enableEdit = false,
  onDelete,
  onEdit,
  onImageClick,
  currentUserId,
  onLike,
  likedPhotos,
  forceColumns,
  isLoading = false
}: MasonryGalleryProps) {
  console.log('MasonryGallery props:', { 
    onDelete: !!onDelete, 
    onEdit: !!onEdit, 
    enableEdit,
    photosCount: photos.length 
  })
  const [columns, setColumns] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      // If forceColumns is specified, use it instead of responsive behavior
      if (forceColumns) {
        setColumns(forceColumns)
        return
      }
      
      const width = window.innerWidth
      if (width < 480) {
        setColumns(2) // Small mobile: 2 columns
      } else if (width < 768) {
        setColumns(2) // Large mobile: 2 columns
      } else if (width < 1024) {
        setColumns(3) // Tablet: 3 columns
      } else {
        setColumns(4) // Desktop: 4 columns
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [forceColumns])

  // Show skeleton loading if explicitly loading
  if (isLoading) {
    return <GallerySkeleton columns={forceColumns || columns} count={6} />
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No photos yet</h3>
        <p className="text-muted-foreground">
          Photos will appear here once they&apos;re uploaded
        </p>
      </div>
    )
  }

  const renderGrid = () => {
    switch (layout) {
      case 'staggered':
        // Unique mobile-first staggered layout
        const staggeredCols = forceColumns || (window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 3 : 4)
        return (
          <div className={`grid gap-2 sm:gap-4 lg:gap-6 ${
            staggeredCols === 1 ? 'grid-cols-1' :
            staggeredCols === 2 ? 'grid-cols-2' :
            staggeredCols === 3 ? 'grid-cols-3' : 'grid-cols-4'
          }`}>
            {photos.map((photo, index) => {
              const isOwner = currentUserId === photo.user_id
              // Create interesting staggered pattern
              const isLarge = index % 7 === 0 || index % 11 === 0
              const isWide = index % 5 === 0
              
              return (
                <div 
                  key={photo.id} 
                  className={`
                    ${isLarge ? 'col-span-2 row-span-2' : ''}
                    ${isWide && !isLarge ? 'col-span-2' : ''}
                  `}
                >
                  <PhotoCard 
                    photo={photo}
                    showTitle={showTitles}
                    showCaption={showCaptions}
                    enableLike={enableLikes}
                    enableEdit={enableEdit}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onImageClick={onImageClick}
                    onLike={onLike}
                    isLiked={likedPhotos?.has(photo.id) || false}
                    isOwner={isOwner}
                  />
                </div>
              )
            })}
          </div>
        )
      
      case 'grid':
        const gridCols = forceColumns || (window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 3 : 4)
        return (
          <div className={`grid gap-3 sm:gap-4 lg:gap-6 ${
            gridCols === 1 ? 'grid-cols-1' :
            gridCols === 2 ? 'grid-cols-2' :
            gridCols === 3 ? 'grid-cols-3' : 'grid-cols-4'
          }`}>
            {photos.map((photo) => {
              const isOwner = currentUserId === photo.user_id
              console.log(`Photo ${photo.id}: currentUserId=${currentUserId}, photo.user_id=${photo.user_id}, isOwner=${isOwner}`)
              return (
                <PhotoCard 
                  key={photo.id} 
                  photo={photo}
                  showTitle={showTitles}
                  showCaption={showCaptions}
                  enableLike={enableLikes}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onImageClick={onImageClick}
                  onLike={onLike}
                  isLiked={likedPhotos?.has(photo.id) || false}
                  isOwner={isOwner}
                />
              )
            })}
          </div>
        )
      
      case 'single-column':
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            {photos.map((photo) => {
              const isOwner = currentUserId === photo.user_id
              console.log(`Photo ${photo.id}: currentUserId=${currentUserId}, photo.user_id=${photo.user_id}, isOwner=${isOwner}`)
              return (
                <PhotoCard 
                  key={photo.id} 
                  photo={photo}
                  showTitle={showTitles}
                  showCaption={showCaptions}
                  enableLike={enableLikes}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onImageClick={onImageClick}
                  onLike={onLike}
                  isLiked={likedPhotos?.has(photo.id) || false}
                  isOwner={isOwner}
                />
              )
            })}
          </div>
        )
      
      case 'masonry':
      default:
        // Simple masonry layout using CSS columns
        return (
          <div 
            className="masonry-grid"
            style={{ 
              columnCount: columns,
              columnGap: columns <= 2 ? '0.75rem' : '1.5rem' // Smaller gap on mobile
            }}
          >
            {photos.map((photo) => {
              const isOwner = currentUserId === photo.user_id
              console.log(`Masonry Photo ${photo.id}: currentUserId=${currentUserId}, photo.user_id=${photo.user_id}, isOwner=${isOwner}`)
              return (
                <div key={photo.id} className={`break-inside-avoid ${columns <= 2 ? 'mb-3' : 'mb-6'}`}>
                  <PhotoCard 
                    photo={photo}
                    showTitle={showTitles}
                    showCaption={showCaptions}
                    enableLike={enableLikes}
                    enableEdit={enableEdit}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onImageClick={onImageClick}
                    onLike={onLike}
                    isLiked={likedPhotos?.has(photo.id) || false}
                    isOwner={isOwner}
                  />
                </div>
              )
            })}
          </div>
        )
    }
  }

  return (
    <div className="w-full">
      {renderGrid()}
    </div>
  )
}