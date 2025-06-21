'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import Header from '@/components/ui/Header'
import BottomNavigation from '@/components/ui/BottomNavigation'
import { SearchBar } from '@/components/search/SearchBar'
import { FollowButton } from '@/components/ui/FollowButton'
import { searchUsers } from '@/lib/supabase/search'
import { getUserFollowStatus } from '@/lib/supabase/follows'
import { UserProfile } from '@/lib/supabase/users'
import { useToastContext } from '@/components/providers/ToastProvider'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

export default function SearchPageContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToastContext()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }
  }, [user, loading, router])

  useEffect(() => {
    const queryParam = searchParams.get('q')
    if (queryParam && queryParam !== query) {
      setQuery(queryParam)
      handleSearch(queryParam)
    }
  }, [searchParams])

  const handleSearch = useCallback(async (searchQuery: string, page = 0, append = false) => {
    if (!user) return
    
    try {
      if (!append) {
        setSearching(true)
        setUsers([])
        setCurrentPage(0)
      } else {
        setIsFetchingNextPage(true)
      }

      const results = await searchUsers(searchQuery, page, 20)
      
      if (append) {
        setUsers(prev => [...prev, ...results])
      } else {
        setUsers(results)
      }
      
      setHasNextPage(results.length === 20)
      setHasSearched(true)
      
      // Load follow status for results
      if (results.length > 0) {
        // Get follow status for all results at once
        const userIds = results.filter(result => result.id !== user.id).map(result => result.id)
        if (userIds.length > 0) {
          const statusMap = await getUserFollowStatus(userIds, user.id)
          setFollowStatus(prev => ({ ...prev, ...statusMap }))
        }
      }
      
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Search failed', 'Please try again.')
    } finally {
      setSearching(false)
      setIsFetchingNextPage(false)
    }
  }, [user, toast])

  const handleClear = () => {
    setQuery('')
    setUsers([])
    setHasSearched(false)
    setFollowStatus({})
    router.push('/search')
  }

  const handleFollowChange = (userId: string, isFollowing: boolean) => {
    setFollowStatus(prev => ({
      ...prev,
      [userId]: isFollowing
    }))
  }

  const fetchNextPage = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage && query) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      handleSearch(query, nextPage, true)
    }
  }, [currentPage, isFetchingNextPage, hasNextPage, query, handleSearch])

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Search</h1>
          <p className="text-muted-foreground">
            Find photographers and discover new perspectives
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mb-8">
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClear}
            initialValue={query}
            placeholder="Search for photographers..."
          />
        </div>

        {/* Results */}
        {searching ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching...</p>
          </div>
        ) : hasSearched ? (
          users.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-xl font-medium text-foreground mb-4">
                No results found
              </h2>
              <p className="text-muted-foreground mb-8">
                Try different keywords or check your spelling
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  {users.length} photographer{users.length !== 1 ? 's' : ''} found
                </h2>
              </div>
              
              <div className="grid gap-4 sm:gap-6">
                {users.map((userProfile) => (
                  <div 
                    key={userProfile.id}
                    className="bg-background border border-border rounded-lg p-4 sm:p-6 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <Link 
                        href={`/user/${userProfile.username}`}
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {userProfile.display_name || userProfile.username}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              @{userProfile.username}
                            </p>
                          </div>
                        </div>
                        
                        {userProfile.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {userProfile.bio}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{userProfile.photo_count || 0} photos</span>
                          <span>
                            Joined {new Date(userProfile.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short'
                            })}
                          </span>
                        </div>
                      </Link>
                      
                      {userProfile.id !== user.id && (
                        <FollowButton
                          userId={userProfile.id}
                          currentUserId={user.id}
                          isFollowing={followStatus[userProfile.id] || false}
                          onFollowChange={(following) => handleFollowChange(userProfile.id, following)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Load more trigger */}
              {hasNextPage && (
                <div ref={lastElementRef} className="h-20 flex items-center justify-center mt-8">
                  {isFetchingNextPage && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="text-muted-foreground">Loading more...</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-foreground mb-4">
              Search for photographers
            </h2>
            <p className="text-muted-foreground">
              Enter a name or username to find photographers in the community
            </p>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  )
}