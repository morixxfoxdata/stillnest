import { createSupabaseClient } from './client'

export interface Like {
  id: string
  user_id: string
  photo_id: string
  created_at: string
}

export async function likePhoto(photoId: string, userId: string): Promise<void> {
  const supabase = createSupabaseClient()
  const { error } = await supabase
    .from('likes')
    .insert({
      photo_id: photoId,
      user_id: userId
    })

  if (error) {
    throw error
  }
}

export async function unlikePhoto(photoId: string, userId: string): Promise<void> {
  const supabase = createSupabaseClient()
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('photo_id', photoId)
    .eq('user_id', userId)

  if (error) {
    throw error
  }
}

export async function getUserLikes(userId: string): Promise<string[]> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('likes')
    .select('photo_id')
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  return data?.map(like => like.photo_id) || []
}

export async function isPhotoLikedByUser(photoId: string, userId: string): Promise<boolean> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('photo_id', photoId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw error
  }

  return !!data
}

export async function getPhotoLikeCount(photoId: string): Promise<number> {
  const supabase = createSupabaseClient()
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('photo_id', photoId)

  if (error) {
    throw error
  }

  return count || 0
}