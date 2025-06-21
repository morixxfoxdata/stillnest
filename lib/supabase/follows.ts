import { createSupabaseClient } from './client'
import { UserProfile } from './users'

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export async function followUser(followingId: string, followerId: string): Promise<void> {
  const supabase = createSupabaseClient()
  
  const { error } = await supabase
    .from('follows')
    .insert({
      follower_id: followerId,
      following_id: followingId
    })

  if (error) {
    console.error('Follow user error:', error)
    throw error
  }
}

export async function unfollowUser(followingId: string, followerId: string): Promise<void> {
  const supabase = createSupabaseClient()
  
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)

  if (error) {
    console.error('Unfollow user error:', error)
    throw error
  }
}

export async function isFollowing(followingId: string, followerId: string): Promise<boolean> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Check following status error:', error)
    throw error
  }

  return !!data
}

export async function getFollowers(userId: string, page = 0, limit = 20): Promise<UserProfile[]> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('follows')
    .select(`
      follower_id,
      users!follows_follower_id_fkey (
        id,
        username,
        display_name,
        bio,
        created_at
      )
    `)
    .eq('following_id', userId)
    .range(page * limit, (page + 1) * limit - 1)

  if (error) {
    console.error('Get followers error:', error)
    throw error
  }

  return (data || []).map((follow: any) => ({
    id: follow.users?.id,
    username: follow.users?.username,
    display_name: follow.users?.display_name,
    bio: follow.users?.bio,
    equipment: follow.users?.equipment,
    created_at: follow.users?.created_at,
    photo_count: 0 // We'll get this separately if needed
  })) as UserProfile[]
}

export async function getFollowing(userId: string, page = 0, limit = 20): Promise<UserProfile[]> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('follows')
    .select(`
      following_id,
      users!follows_following_id_fkey (
        id,
        username,
        display_name,
        bio,
        created_at
      )
    `)
    .eq('follower_id', userId)
    .range(page * limit, (page + 1) * limit - 1)

  if (error) {
    console.error('Get following error:', error)
    throw error
  }

  return (data || []).map((follow: any) => ({
    id: follow.users?.id,
    username: follow.users?.username,
    display_name: follow.users?.display_name,
    bio: follow.users?.bio,
    equipment: follow.users?.equipment,
    created_at: follow.users?.created_at,
    photo_count: 0 // We'll get this separately if needed
  })) as UserProfile[]
}

export async function getFollowCounts(userId: string): Promise<{followers: number, following: number}> {
  const supabase = createSupabaseClient()
  
  console.log('Getting follow counts for user:', userId)
  
  const [followersResult, followingResult] = await Promise.all([
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)
  ])

  if (followersResult.error) {
    console.error('Error getting followers count:', followersResult.error)
  }
  if (followingResult.error) {
    console.error('Error getting following count:', followingResult.error)
  }

  const counts = {
    followers: followersResult.count || 0,
    following: followingResult.count || 0
  }
  
  console.log('Follow counts result:', counts)
  
  return counts
}

export async function getUserFollowStatus(userIds: string[], currentUserId: string): Promise<Record<string, boolean>> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', currentUserId)
    .in('following_id', userIds)

  if (error) {
    console.error('Get follow status error:', error)
    return {}
  }

  const followStatus: Record<string, boolean> = {}
  userIds.forEach(userId => {
    followStatus[userId] = false
  })
  
  data.forEach(follow => {
    followStatus[follow.following_id] = true
  })

  return followStatus
}