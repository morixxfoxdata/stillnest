'use client'

import { useState } from 'react'
import { followUser, unfollowUser } from '@/lib/supabase/follows'
import { useToastContext } from '@/components/providers/ToastProvider'

interface FollowButtonProps {
  userId: string
  currentUserId: string
  isFollowing: boolean
  onFollowChange?: (isFollowing: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
  className?: string
}

export function FollowButton({
  userId,
  currentUserId,
  isFollowing,
  onFollowChange,
  size = 'md',
  variant = 'default',
  className = ''
}: FollowButtonProps) {
  const [loading, setLoading] = useState(false)
  const [localIsFollowing, setLocalIsFollowing] = useState(isFollowing)
  const toast = useToastContext()

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const getButtonClasses = () => {
    const baseClasses = `font-medium rounded-md transition-colors ${sizeClasses[size]} ${className}`
    
    if (localIsFollowing) {
      return variant === 'outline'
        ? `${baseClasses} border border-border text-foreground hover:bg-red-50 hover:border-red-300 hover:text-red-600`
        : `${baseClasses} bg-muted text-foreground hover:bg-red-500 hover:text-white`
    } else {
      return variant === 'outline'
        ? `${baseClasses} border border-primary text-primary hover:bg-primary hover:text-primary-foreground`
        : `${baseClasses} bg-primary text-primary-foreground hover:bg-primary/90`
    }
  }

  const handleClick = async () => {
    if (loading || userId === currentUserId) return

    setLoading(true)
    
    // Optimistic update
    const newFollowingState = !localIsFollowing
    setLocalIsFollowing(newFollowingState)

    try {
      if (localIsFollowing) {
        await unfollowUser(userId, currentUserId)
        toast.success('Unfollowed successfully')
      } else {
        await followUser(userId, currentUserId)
        toast.success('Following user')
      }
      
      onFollowChange?.(newFollowingState)
    } catch (error) {
      console.error('Follow/unfollow error:', error)
      
      // Revert optimistic update
      setLocalIsFollowing(localIsFollowing)
      
      toast.error(
        'Action failed',
        localIsFollowing ? 'Failed to unfollow user' : 'Failed to follow user'
      )
    } finally {
      setLoading(false)
    }
  }

  // Don't show follow button for own profile
  if (userId === currentUserId) {
    return null
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${getButtonClasses()} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent"></div>
          <span>{localIsFollowing ? 'Unfollowing...' : 'Following...'}</span>
        </div>
      ) : (
        <span>{localIsFollowing ? 'Following' : 'Follow'}</span>
      )}
    </button>
  )
}