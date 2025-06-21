import { createSupabaseClient } from './client'
import { Photo } from '@/lib/types'
import { UserProfile } from './users'

export interface SearchFilters {
  query?: string
  tags?: string[]
  dateFrom?: string
  dateTo?: string
  userId?: string
  sortBy?: 'recent' | 'oldest' | 'popular'
}

export interface SearchResults {
  photos: Photo[]
  users: UserProfile[]
  hasMore: boolean
}

export async function searchPhotos(filters: SearchFilters, page = 0, limit = 20): Promise<Photo[]> {
  const supabase = createSupabaseClient()
  
  console.log('Search filters:', filters)
  
  let query = supabase
    .from('photos')
    .select(`
      *,
      users!photos_user_id_fkey (
        username,
        display_name
      )
    `)

  // Search by text (title, caption, tags)
  if (filters.query) {
    const searchQuery = `%${filters.query}%`
    query = query.or(`title.ilike.${searchQuery},caption.ilike.${searchQuery}`)
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    console.log('Filtering by tags:', filters.tags)
    
    // Use overlaps operator for array matching
    // This will find photos that have any of the selected tags
    query = query.overlaps('tags', filters.tags)
    
    console.log('Tag filter applied with overlaps operator')
  }

  // Filter by user
  if (filters.userId) {
    query = query.eq('user_id', filters.userId)
  }

  // Filter by date range
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }

  // Sort options
  switch (filters.sortBy) {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'popular':
      // We'll implement this later with like counts
      query = query.order('created_at', { ascending: false })
      break
    case 'recent':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  // Pagination
  query = query.range(page * limit, (page + 1) * limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Search photos error:', error)
    throw error
  }

  console.log('Search results:', data?.length, 'photos found')
  return data || []
}

export async function searchUsers(query: string, page = 0, limit = 10): Promise<UserProfile[]> {
  const supabase = createSupabaseClient()
  
  // Remove @ symbol if present for database search
  const cleanQuery = query.startsWith('@') ? query.slice(1) : query
  
  console.log('Searching users with query:', query, '-> cleaned:', cleanQuery)
  
  let dbQuery = supabase
    .from('users')
    .select(`
      id,
      username,
      display_name,
      bio,
      equipment,
      created_at
    `)

  // If query starts with @, prioritize username search
  if (query.startsWith('@')) {
    dbQuery = dbQuery.or(`username.ilike.%${cleanQuery}%,username.ilike.${cleanQuery},display_name.ilike.%${cleanQuery}%,bio.ilike.%${cleanQuery}%`)
  } else {
    dbQuery = dbQuery.or(`username.ilike.%${cleanQuery}%,display_name.ilike.%${cleanQuery}%,bio.ilike.%${cleanQuery}%`)
  }

  const { data, error } = await dbQuery.range(page * limit, (page + 1) * limit - 1)

  if (error) {
    console.error('Search users error:', error)
    throw error
  }

  console.log('User search results:', data?.length, 'users found:', data?.map(u => u.username))

  // Get photo counts for each user
  const usersWithCounts = await Promise.all(
    (data || []).map(async (user) => {
      const { count } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      return {
        ...user,
        photo_count: count || 0
      }
    })
  )

  return usersWithCounts
}

export async function getAllTags(limit = 50): Promise<string[]> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('photos')
    .select('tags')
    .not('tags', 'is', null)
    .limit(1000) // Get a good sample

  if (error) {
    console.error('Get tags error:', error)
    return []
  }

  console.log('Raw tags data from database:', data?.slice(0, 5)) // Debug first 5 entries

  // Flatten and count tags
  const tagCounts: Record<string, number> = {}
  
  data.forEach(photo => {
    if (photo.tags && Array.isArray(photo.tags)) {
      photo.tags.forEach(tag => {
        if (typeof tag === 'string' && tag.trim()) {
          const normalizedTag = tag.trim().toLowerCase()
          tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1
        }
      })
    }
  })

  console.log('Processed tag counts:', Object.keys(tagCounts).slice(0, 10)) // Debug first 10 tags

  // Sort by popularity and return top tags
  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([tag]) => tag)
}

export async function getPopularTags(limit = 20): Promise<Array<{tag: string, count: number}>> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('photos')
    .select('tags')
    .not('tags', 'is', null)
    .limit(1000)

  if (error) {
    console.error('Get popular tags error:', error)
    return []
  }

  const tagCounts: Record<string, number> = {}
  
  data.forEach(photo => {
    if (photo.tags && Array.isArray(photo.tags)) {
      photo.tags.forEach(tag => {
        if (typeof tag === 'string' && tag.trim()) {
          const normalizedTag = tag.trim().toLowerCase()
          tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1
        }
      })
    }
  })

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}