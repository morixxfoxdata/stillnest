'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  retry: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
  retry: () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setError(null)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Auth session error:', sessionError)
          setError('Failed to load authentication session')
          return
        }
        
        setUser(session?.user ?? null)
        console.log('Auth session loaded:', !!session?.user)
      } catch (err) {
        console.error('Auth initialization error:', err)
        setError('Failed to initialize authentication')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session?.user)
        setUser(session?.user ?? null)
        setError(null)
        setLoading(false)
        
        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          console.log('User signed out - redirecting to login')
          // Clear any cached data and redirect
          window.location.href = '/auth/login'
        } else if (event === 'SIGNED_IN') {
          console.log('User signed in')
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Auth token refreshed')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, retryCount])

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        setLoading(false)
        throw error
      }
      // Loading will be set to false by the auth state change listener
    } catch (err) {
      console.error('Failed to sign out:', err)
      setLoading(false)
      throw err
    }
  }

  const retry = () => {
    setRetryCount(prev => prev + 1)
    setLoading(true)
  }

  const value = {
    user,
    loading,
    error,
    signOut,
    retry,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}