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
import { getAllPhotos } from '@/lib/supabase/photos'
import { likePhoto, unlikePhoto, getUserLikes } from '@/lib/supabase/likes'
import { searchPhotos, getAllTags, SearchFilters } from '@/lib/supabase/search'
import { Photo } from '@/lib/types'
import { useToastContext } from '@/components/providers/ToastProvider'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchFiltersComponent } from '@/components/search/SearchFilters'

export default function DiscoverPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const toast = useToastContext()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [photosLoading, setPhotosLoading] = useState(true)
  const [viewerPhotoIndex, setViewerPhotoIndex] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ sortBy: 'recent' })
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('double')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      loadAllPhotos(0, false, false, '', { sortBy: 'recent' })
      loadUserLikes()
      loadAvailableTags()
    }
  }, [user, loading, router])

  const loadAllPhotos = async (page = 0, append = false, searchMode = isSearchMode, query = searchQuery, filters = searchFilters) => {
    try {
      if (!append) setPhotosLoading(true)
      else setIsFetchingNextPage(true)
      
      let allPhotos: Photo[]
      
      if (searchMode) {
        // Use search with filters
        const searchFilters = {
          ...filters,
          query: query || undefined
        }
        allPhotos = await searchPhotos(searchFilters, page, 20)
      } else {
        // Use regular getAllPhotos
        allPhotos = await getAllPhotos(page, 20)
      }
      
      if (append) {
        setPhotos(prev => [...prev, ...allPhotos])
      } else {
        setPhotos(allPhotos)
      }
      
      setHasNextPage(allPhotos.length === 20)
      
    } catch (error) {
      console.error('Failed to load photos:', error)
      toast.error(
        'Failed to load photos',
        'Please check your internet connection and try again.'
      )
    } finally {
      setPhotosLoading(false)
      setIsFetchingNextPage(false)
    }
  }

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

  const loadAvailableTags = async () => {
    try {
      const tags = await getAllTags(200) // Increase to 200 tags for better search experience
      setAvailableTags(tags)
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setIsSearchMode(true)
    setCurrentPage(0)
    // Pass the new values directly to avoid stale state
    loadAllPhotos(0, false, true, query, searchFilters)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setIsSearchMode(false)
    setSearchFilters({ sortBy: 'recent' })
    setCurrentPage(0)
    // Pass the new values directly to avoid stale state
    loadAllPhotos(0, false, false, '', { sortBy: 'recent' })
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setSearchFilters(newFilters)
    setIsSearchMode(true)
    setCurrentPage(0)
    // Pass the new values directly to avoid stale state
    loadAllPhotos(0, false, true, searchQuery, newFilters)
  }

  const fetchNextPage = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      loadAllPhotos(nextPage, true)
    }
  }, [currentPage, isFetchingNextPage, hasNextPage, isSearchMode, searchQuery, searchFilters])

  const { lastElementRef } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  })

  const loadUserLikes = async () => {
    if (!user) return
    
    try {
      const userLikedPhotos = await getUserLikes(user.id)
      setLikedPhotos(new Set(userLikedPhotos))
    } catch (error) {
      console.error('Failed to load user likes:', error)
      toast.error(
        'Failed to load your liked photos',
        'Some like indicators may not be accurate.'
      )
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
      
      toast.error(
        'Failed to update like',
        'Please check your internet connection and try again.'
      )
    }
  }

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
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Discover</h1>
              <p className="text-muted-foreground mt-2">
                Explore the quiet photography community
              </p>
            </div>
            
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <SearchBar
              onSearch={handleSearch}
              onClear={handleClearSearch}
              initialValue={searchQuery}
              showFilters={false}
            />
            {isSearchMode && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {searchQuery ? `Searching for "${searchQuery}"` : 'Showing filtered results'}
                </span>
                {searchFilters.tags && searchFilters.tags.length > 0 && (
                  <span>• {searchFilters.tags.length} tag filter{searchFilters.tags.length !== 1 ? 's' : ''}</span>
                )}
                <button
                  onClick={handleClearSearch}
                  className="text-primary hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile Controls */}
          <div className="md:hidden flex items-center justify-end gap-2 mt-6">
            <button
              onClick={() => setIsFiltersOpen(true)}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              title="Filters"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
            </button>
            <LayoutToggle
              initialMode={layoutMode}
              onModeChange={setLayoutMode}
            />
          </div>
        </div>

        {/* Gallery */}
        {photosLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading photos...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-medium text-foreground mb-4">
              No photos to discover yet
            </h2>
            <p className="text-muted-foreground mb-8">
              Be the first to share your photography with the community
            </p>
            <Link 
              href="/upload"
              className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors sm:hidden"
            >
              Upload your photos
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
              onImageClick={handleImageClick}
              onLike={handleLike}
              likedPhotos={likedPhotos}
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

      <SearchFiltersComponent
        filters={searchFilters}
        onFiltersChange={handleFiltersChange}
        availableTags={availableTags}
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
      />
      
      <BottomNavigation />
    </div>
  )
}