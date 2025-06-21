import { createSupabaseClient } from './client'
import { createSupabaseServerClient, createSupabaseClientFallback } from './server'

export async function signUp(email: string, password: string, username: string) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  })

  if (error) {
    throw error
  }

  // Create user profile in our users table
  if (data.user) {
    try {
      await supabase
        .from('users')
        .insert({
          id: data.user.id,
          username: username,
          created_at: new Date().toISOString()
        })
    } catch (profileError) {
      console.log('Profile creation error (may already exist):', profileError)
      // Don't throw error as this might be a duplicate
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const supabase = createSupabaseClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return null
    }

    return user
  } catch {
    // Fallback for client-side usage
    const supabase = createSupabaseClientFallback()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return null
    }

    return user
  }
}

export async function getSession() {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return null
    }

    return session
  } catch {
    // Fallback for client-side usage
    const supabase = createSupabaseClientFallback()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return null
    }

    return session
  }
}