'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import Header from '@/components/ui/Header'
import BottomNavigation from '@/components/ui/BottomNavigation'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'
import { getUserProfile, UserProfile } from '@/lib/supabase/users'
import { useToastContext } from '@/components/providers/ToastProvider'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const toast = useToastContext()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      loadProfile()
    }
  }, [user, loading, router])

  const loadProfile = async () => {
    if (!user) return

    try {
      setProfileLoading(true)
      const userProfile = await getUserProfile(user.id)
      
      if (!userProfile) {
        toast.error('Profile not found', 'Unable to load your profile.')
        router.push('/gallery')
        return
      }
      
      setProfile(userProfile)
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Failed to load profile', 'Please try again.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
  }

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
            <span className="ml-3">Loading settings...</span>
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
              Profile not found
            </h2>
            <p className="text-muted-foreground mb-8">
              Unable to load your profile settings.
            </p>
            <button 
              onClick={() => router.push('/gallery')}
              className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Gallery
            </button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your profile and account preferences
            </p>
          </div>

          {/* Profile Section */}
          <div className="bg-background border border-border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Profile Information
                </h2>
                <p className="text-sm text-muted-foreground">
                  Update your public profile information
                </p>
              </div>
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            <ProfileEditForm 
              profile={profile} 
              onProfileUpdate={handleProfileUpdate}
            />
          </div>

          {/* Account Section */}
          <div className="bg-background border border-border rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Account Information
              </h2>
              <p className="text-sm text-muted-foreground">
                View your account details
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <div className="p-3 border border-border rounded-lg bg-muted">
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Contact support to change your email address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Member Since
                </label>
                <div className="p-3 border border-border rounded-lg bg-muted">
                  <span className="text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  )
}