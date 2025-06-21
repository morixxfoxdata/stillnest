'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/ui/Header'
import BottomNavigation from '@/components/ui/BottomNavigation'
import MasonryGallery from '@/components/gallery/MasonryGallery'
import ImageViewer from '@/components/gallery/ImageViewer'
import PhotoEditModal from '@/components/gallery/PhotoEditModal'
import LayoutToggle, { LayoutMode } from '@/components/ui/LayoutToggle'
import { getUserByUsername, UserProfile } from '@/lib/supabase/users'
import { getUserPhotos, deletePhoto, updatePhoto } from '@/lib/supabase/photos'
import { getUserLikes, likePhoto, unlikePhoto } from '@/lib/supabase/likes'
import { isFollowing, getFollowCounts } from '@/lib/supabase/follows'
import { Photo } from '@/lib/types'
import { useToastContext } from '@/components/providers/ToastProvider'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { FollowButton } from '@/components/ui/FollowButton'

export default function UserProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const toast = useToastContext()
  const username = params.username as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [profileLoading, setProfileLoading] = useState(true)
  const [photosLoading, setPhotosLoading] = useState(true)
  const [viewerPhotoIndex, setViewerPhotoIndex] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)
  const [isUserFollowing, setIsUserFollowing] = useState(false)
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('double')

  const isOwnProfile = user?.id === profile?.id

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }

    if (user && username) {
      loadProfile()
      loadUserLikes()
    }
  }, [user, loading, router, username])

  const loadProfile = async () => {
    try {
      setProfileLoading(true)
      const userProfile = await getUserByUsername(username)
      
      if (!userProfile) {
        toast.error('User not found', `No user found with username @${username}`)
        router.push('/discover')
        return
      }
      
      setProfile(userProfile)
      loadPhotos(userProfile.id, 0, false)
      
      // Always load follow counts
      loadFollowCounts(userProfile.id)
      
      // Load follow status only if not own profile
      if (user && userProfile.id !== user.id) {
        loadFollowStatus(userProfile.id)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Failed to load profile', 'Please try again.')
    } finally {
      setProfileLoading(false)
    }
  }

  const loadPhotos = useCallback(async (userId: string, page = 0, append = false) => {
    try {
      if (!append) setPhotosLoading(true)
      else setIsFetchingNextPage(true)
      
      const userPhotos = await getUserPhotos(userId, page, 20)
      
      if (append) {
        setPhotos(prev => [...prev, ...userPhotos])
      } else {
        setPhotos(userPhotos)
      }
      
      setHasNextPage(userPhotos.length === 20)
      
    } catch (error) {
      console.error('Failed to load photos:', error)
      toast.error('Failed to load photos', 'Please try again.')
    } finally {
      setPhotosLoading(false)
      setIsFetchingNextPage(false)
    }
  }, [toast])

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

  const handleImageClick = (photo: Photo) => {
    const index = photos.findIndex(p => p.id === photo.id)
    if (index !== -1) {
      setViewerPhotoIndex(index)
      setIsViewerOpen(true)
    }
  }

  const handleCloseViewer = () => {
    setIsViewerOpen(false)
  }

  const loadFollowStatus = async (userId: string) => {
    if (!user) return
    
    try {
      const following = await isFollowing(userId, user.id)
      setIsUserFollowing(following)
    } catch (error) {
      console.error('Failed to load follow status:', error)
    }
  }

  const loadFollowCounts = async (userId: string) => {
    try {
      console.log('Loading follow counts for user:', userId)
      const counts = await getFollowCounts(userId)
      console.log('Loaded follow counts:', counts)
      setFollowCounts(counts)
    } catch (error) {
      console.error('Failed to load follow counts:', error)
    }
  }

  const handleFollowChange = async (following: boolean) => {
    setIsUserFollowing(following)
    
    // Optimistic update
    setFollowCounts(prev => ({
      ...prev,
      followers: following ? prev.followers + 1 : prev.followers - 1
    }))
    
    // Refresh counts from database to ensure accuracy
    if (profile) {
      try {
        const updatedCounts = await getFollowCounts(profile.id)
        setFollowCounts(updatedCounts)
      } catch (error) {
        console.error('Failed to refresh follow counts:', error)
      }
    }
  }

  const handleEditPhoto = (photo: Photo) => {
    setEditingPhoto(photo)
    setIsEditModalOpen(true)
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!user || !profile) return
    
    const confirmDelete = window.confirm('Are you sure you want to delete this photo? This action cannot be undone.')
    if (!confirmDelete) return

    try {
      await deletePhoto(photoId, user.id)
      
      // Remove photo from local state
      setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photoId))
      
      toast.success('Photo deleted successfully')
    } catch (error) {
      console.error('Failed to delete photo:', error)
      toast.error('Failed to delete photo', 'Please try again.')
    }
  }

  const handleSavePhoto = async (photoId: string, updates: {
    title?: string
    caption?: string
    tags?: string[]
  }) => {
    if (!user) return

    try {
      const savedPhoto = await updatePhoto(photoId, updates, user.id)
      
      // Update photo in local state
      setPhotos(prevPhotos => 
        prevPhotos.map(p => p.id === savedPhoto.id ? savedPhoto : p)
      )
      
      setIsEditModalOpen(false)
      setEditingPhoto(null)
      toast.success('Photo updated successfully')
    } catch (error) {
      console.error('Failed to update photo:', error)
      toast.error('Failed to update photo', 'Please try again.')
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingPhoto(null)
  }

  const fetchNextPage = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage && profile) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      loadPhotos(profile.id, nextPage, true)
    }
  }, [currentPage, isFetchingNextPage, hasNextPage, profile, loadPhotos])

  const { lastElementRef } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  })

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

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading profile...</span>
          </div>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="text-center py-16">
            <h2 className="text-xl font-medium text-foreground mb-4">
              User not found
            </h2>
            <p className="text-muted-foreground mb-8">
              The user @{username} could not be found.
            </p>
            <Link 
              href="/discover"
              className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Discover
            </Link>
          </div>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                @{profile.username}
              </p>
            </div>
            
            <div className="flex gap-3">
              {isOwnProfile ? (
                <>
                  <Link 
                    href="/settings"
                    className="px-4 py-2 border border-border text-foreground rounded-md hover:bg-muted transition-colors text-sm font-medium"
                  >
                    Edit Profile
                  </Link>
                </>
              ) : (
                <FollowButton
                  userId={profile.id}
                  currentUserId={user!.id}
                  isFollowing={isUserFollowing}
                  onFollowChange={handleFollowChange}
                />
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="mb-6">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{profile.photo_count}</div>
                <div className="text-sm text-muted-foreground">
                  {profile.photo_count === 1 ? 'Photo' : 'Photos'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{followCounts.followers}</div>
                <div className="text-sm text-muted-foreground">
                  {followCounts.followers === 1 ? 'Follower' : 'Followers'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{followCounts.following}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            </div>
            {/* Member since row */}
            <div className="text-center sm:text-left">
              <div className="text-lg font-medium text-foreground">Member since</div>
              <div className="text-sm text-muted-foreground">{joinDate}</div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mb-4">
              <p className="text-foreground">{profile.bio}</p>
            </div>
          )}

          {/* Equipment */}
          {profile.equipment && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Equipment</h3>
              <p className="text-foreground text-sm">{profile.equipment}</p>
            </div>
          )}
        </div>

        {/* Photos Gallery */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {isOwnProfile ? 'Your Photos' : 'Photos'}
            </h2>
            
            {/* Layout Toggle - only show on mobile */}
            <div className="md:hidden">
              <LayoutToggle
                initialMode={layoutMode}
                onModeChange={setLayoutMode}
              />
            </div>
          </div>
          
          {photosLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading photos...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium text-foreground mb-4">
                {isOwnProfile ? 'No photos yet' : 'No photos'}
              </h3>
              <p className="text-muted-foreground mb-8">
                {isOwnProfile 
                  ? 'Start building your photography collection'
                  : `${profile.username} hasn't shared any photos yet`
                }
              </p>
              {isOwnProfile && (
                <Link 
                  href="/upload"
                  className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Upload your first photo
                </Link>
              )}
            </div>
          ) : (
            <>
              <MasonryGallery 
                photos={photos}
                layout="staggered"
                showTitles={true}
                showCaptions={true}
                enableLikes={!isOwnProfile}
                enableEdit={isOwnProfile}
                onImageClick={handleImageClick}
                onLike={handleLike}
                onEdit={handleEditPhoto}
                onDelete={handleDeletePhoto}
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
      </div>

      <ImageViewer
        photos={photos}
        currentIndex={viewerPhotoIndex}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
      />

      {editingPhoto && (
        <PhotoEditModal
          photo={editingPhoto}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSavePhoto}
        />
      )}
      
      <BottomNavigation />
    </div>
  )
}