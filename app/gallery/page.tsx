'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/ui/Header'
import BottomNavigation from '@/components/ui/BottomNavigation'
import MasonryGallery from '@/components/gallery/MasonryGallery'
import ImageViewer from '@/components/gallery/ImageViewer'
import LayoutToggle, { LayoutMode } from '@/components/ui/LayoutToggle'
import { getFollowingUserPhotos } from '@/lib/supabase/photos'
import { getUserLikes, likePhoto, unlikePhoto } from '@/lib/supabase/likes'
import { Photo } from '@/lib/types'
import { useToastContext } from '@/components/providers/ToastProvider'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

export default function GalleryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const toast = useToastContext()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [photosLoading, setPhotosLoading] = useState(true)
  const [viewerPhotoIndex, setViewerPhotoIndex] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set())
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('double')

  const loadFollowingPhotos = useCallback(async (page = 0, append = false) => {
    if (!user) return
    
    try {
      if (!append) setPhotosLoading(true)
      else setIsFetchingNextPage(true)
      
      const followingPhotos = await getFollowingUserPhotos(user.id, page, 20)
      
      if (append) {
        setPhotos(prev => [...prev, ...followingPhotos])
      } else {
        setPhotos(followingPhotos)
      }
      
      // Check if there are more photos
      setHasNextPage(followingPhotos.length === 20)
      
    } catch (error) {
      console.error('Failed to load following photos:', error)
      toast.error(
        'Failed to load feed',
        'Please check your internet connection and try again.'
      )
    } finally {
      setPhotosLoading(false)
      setIsFetchingNextPage(false)
    }
  }, [user, toast])


  const handleImageClick = (photo: Photo) => {
    console.log('handleImageClick called with photo:', photo.id)
    const index = photos.findIndex(p => p.id === photo.id)
    console.log('Photo index found:', index)
    if (index !== -1) {
      setViewerPhotoIndex(index)
      setIsViewerOpen(true)
      console.log('Viewer should open now')
    }
  }

  const handleCloseViewer = () => {
    setIsViewerOpen(false)
  }

  const loadUserLikes = async () => {
    if (!user) return
    
    try {
      const userLikedPhotos = await getUserLikes(user.id)
      setLikedPhotos(new Set(userLikedPhotos))
    } catch (error) {
      console.error('Failed to load user likes:', error)
    }
  }

  const handleLike = async (photoId: string, isLiked: boolean) => {
    if (!user) return

    // Optimistic update
    if (isLiked) {
      setLikedPhotos(prev => new Set(prev).add(photoId))
    } else {
      setLikedPhotos(prev => {
        const newSet = new Set(prev)
        newSet.delete(photoId)
        return newSet
      })
    }

    try {
      if (isLiked) {
        await likePhoto(photoId, user.id)
      } else {
        await unlikePhoto(photoId, user.id)
      }
    } catch (error) {
      console.error('Failed to like/unlike photo:', error)
      
      // Revert optimistic update on error
      if (isLiked) {
        setLikedPhotos(prev => {
          const newSet = new Set(prev)
          newSet.delete(photoId)
          return newSet
        })
      } else {
        setLikedPhotos(prev => new Set(prev).add(photoId))
      }
      
      toast.error('Failed to update like', 'Please try again.')
    }
  }

  const fetchNextPage = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      loadFollowingPhotos(nextPage, true)
    }
  }, [currentPage, isFetchingNextPage, hasNextPage, loadFollowingPhotos])

  const { lastElementRef } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      loadFollowingPhotos(0, false)
      loadUserLikes()
    }
  }, [user, loading, router, loadFollowingPhotos])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Your Feed</h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              {photosLoading ? 'Loading feed...' : `Latest photos from people you follow`}
            </p>
          </div>
          
          {/* Layout Toggle - only show on mobile */}
          <div className="md:hidden flex justify-end">
            <LayoutToggle
              initialMode={layoutMode}
              onModeChange={setLayoutMode}
            />
          </div>
        </div>

        {/* Feed */}
        {photosLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your feed...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-medium text-foreground mb-4">
              Your feed is empty
            </h2>
            <p className="text-muted-foreground mb-8">
              Follow other photographers to see their latest photos in your feed
            </p>
            <Link 
              href="/discover"
              className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Discover photographers
            </Link>
          </div>
        ) : (
          <>
            <MasonryGallery 
              photos={photos}
              layout="staggered"
              showTitles={true}
              showCaptions={true}
              enableLikes={true}
              onLike={handleLike}
              likedPhotos={likedPhotos}
              onImageClick={handleImageClick}
              forceColumns={layoutMode === 'single' ? 1 : layoutMode === 'double' ? 2 : undefined}
            />
            
            {/* Load more trigger */}
            {hasNextPage && (
              <div ref={lastElementRef} className="h-20 flex items-center justify-center">
                {isFetchingNextPage && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="text-muted-foreground">Loading more photos...</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ImageViewer
        photos={photos}
        currentIndex={viewerPhotoIndex}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
      />
      
      <BottomNavigation />
    </div>
  )
}