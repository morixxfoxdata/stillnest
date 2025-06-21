import { createSupabaseClient } from './client'
import { createSupabaseServerClient, createSupabaseClientFallback } from './server'
import { Photo } from '@/lib/types'

export interface CreatePhotoData {
  title?: string
  caption?: string
  tags?: string[]
  series_id?: string
  file_url: string
  thumbnail_url?: string
  width?: number
  height?: number
}

export async function createPhoto(photoData: CreatePhotoData, userId: string): Promise<Photo> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('photos')
    .insert({
      ...photoData,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create photo: ${error.message}`)
  }

  return data
}

export async function getUserPhotos(userId: string, page = 0, limit = 20): Promise<Photo[]> {
  try {
    const supabase = createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      throw new Error(`Failed to fetch photos: ${error.message}`)
    }

    return data || []
  } catch {
    // Fallback for client-side usage
    const supabase = createSupabaseClientFallback()
    
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      throw new Error(`Failed to fetch photos: ${error.message}`)
    }

    return data || []
  }
}

export async function getAllPhotos(page = 0, limit = 20): Promise<Photo[]> {
  try {
    const supabase = createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('photos')
      .select(`
        *,
        users!photos_user_id_fkey (
          username,
          display_name
        )
      `)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      throw new Error(`Failed to fetch photos: ${error.message}`)
    }

    return data || []
  } catch {
    // Fallback for client-side usage
    const supabase = createSupabaseClientFallback()
    
    const { data, error } = await supabase
      .from('photos')
      .select(`
        *,
        users!photos_user_id_fkey (
          username,
          display_name
        )
      `)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      throw new Error(`Failed to fetch photos: ${error.message}`)
    }

    return data || []
  }
}

export async function deletePhoto(photoId: string, userId: string): Promise<void> {
  const supabase = createSupabaseClient()
  
  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to delete photo: ${error.message}`)
  }
}

export async function updatePhoto(
  photoId: string, 
  updates: Partial<CreatePhotoData>, 
  userId: string
): Promise<Photo> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('photos')
    .update(updates)
    .eq('id', photoId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update photo: ${error.message}`)
  }

  return data
}

export async function getFollowingUserPhotos(userId: string, page = 0, limit = 20): Promise<Photo[]> {
  try {
    const supabase = createSupabaseServerClient()
    
    // First get the list of users that the current user is following
    const { data: followingData, error: followingError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)

    if (followingError) {
      throw new Error(`Failed to get following users: ${followingError.message}`)
    }

    // If not following anyone, return empty array
    if (!followingData || followingData.length === 0) {
      return []
    }

    const followingIds = followingData.map(follow => follow.following_id)

    // Get photos from followed users
    const { data, error } = await supabase
      .from('photos')
      .select(`
        *,
        users!photos_user_id_fkey (
          username,
          display_name
        )
      `)
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      throw new Error(`Failed to fetch following user photos: ${error.message}`)
    }

    return data || []
  } catch {
    // Fallback for client-side usage
    const supabase = createSupabaseClientFallback()
    
    // First get the list of users that the current user is following
    const { data: followingData, error: followingError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)

    if (followingError) {
      throw new Error(`Failed to get following users: ${followingError.message}`)
    }

    // If not following anyone, return empty array
    if (!followingData || followingData.length === 0) {
      return []
    }

    const followingIds = followingData.map(follow => follow.following_id)

    // Get photos from followed users
    const { data, error } = await supabase
      .from('photos')
      .select(`
        *,
        users!photos_user_id_fkey (
          username,
          display_name
        )
      `)
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      throw new Error(`Failed to fetch following user photos: ${error.message}`)
    }

    return data || []
  }
}