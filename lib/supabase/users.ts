import { createSupabaseClient } from './client'

export interface UserProfile {
  id: string
  username: string
  display_name?: string
  bio?: string
  equipment?: string
  created_at: string
  photo_count?: number
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      username,
      display_name,
      bio,
      equipment,
      created_at
    `)
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Failed to fetch user profile:', error)
    return null
  }

  // Get photo count
  const { count } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return {
    ...data,
    photo_count: count || 0
  }
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      username,
      display_name,
      bio,
      equipment,
      created_at
    `)
    .eq('username', username)
    .single()

  if (error) {
    console.error('Failed to fetch user by username:', error)
    return null
  }

  // Get photo count
  const { count } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', data.id)

  return {
    ...data,
    photo_count: count || 0
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('users')
    .update({
      display_name: updates.display_name,
      bio: updates.bio,
      equipment: updates.equipment,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select(`
      id,
      username,
      display_name,
      bio,
      equipment,
      created_at
    `)
    .single()

  if (error) {
    console.error('Failed to update user profile:', error)
    throw error
  }

  // Get photo count
  const { count } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return {
    ...data,
    photo_count: count || 0
  }
}

export async function searchUsers(query: string, limit = 10): Promise<UserProfile[]> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      username,
      display_name,
      bio,
      equipment,
      created_at
    `)
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(limit)

  if (error) {
    console.error('Failed to search users:', error)
    return []
  }

  return data || []
}