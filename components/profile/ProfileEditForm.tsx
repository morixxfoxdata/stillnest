'use client'

import { useState } from 'react'
import { UserProfile, updateUserProfile } from '@/lib/supabase/users'
import { useToastContext } from '@/components/providers/ToastProvider'

interface ProfileEditFormProps {
  profile: UserProfile
  onProfileUpdate: (updatedProfile: UserProfile) => void
}

export function ProfileEditForm({ profile, onProfileUpdate }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    equipment: profile.equipment || ''
  })
  const [loading, setLoading] = useState(false)
  const toast = useToastContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (loading) return

    try {
      setLoading(true)
      
      const updatedProfile = await updateUserProfile(profile.id, formData)
      
      if (updatedProfile) {
        onProfileUpdate(updatedProfile)
        toast.success('Profile updated successfully')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile', 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const hasChanges = 
    formData.display_name !== (profile.display_name || '') ||
    formData.bio !== (profile.bio || '') ||
    formData.equipment !== (profile.equipment || '')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display Name */}
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-foreground mb-2">
          Display Name
        </label>
        <input
          type="text"
          id="display_name"
          name="display_name"
          value={formData.display_name}
          onChange={handleChange}
          placeholder="Your display name"
          className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          maxLength={50}
        />
        <p className="text-xs text-muted-foreground mt-1">
          This is how your name will appear to other users
        </p>
      </div>

      {/* Username (read-only) */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={profile.username}
          disabled
          className="w-full p-3 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Username cannot be changed
        </p>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about yourself and your photography..."
          rows={4}
          className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          maxLength={500}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-muted-foreground">
            Share your photography style, interests, or inspiration
          </p>
          <span className="text-xs text-muted-foreground">
            {formData.bio.length}/500
          </span>
        </div>
      </div>

      {/* Equipment */}
      <div>
        <label htmlFor="equipment" className="block text-sm font-medium text-foreground mb-2">
          Equipment
        </label>
        <input
          type="text"
          id="equipment"
          name="equipment"
          value={formData.equipment}
          onChange={handleChange}
          placeholder="Camera, lenses, editing software..."
          className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          maxLength={200}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-muted-foreground">
            Share the gear and tools you use for photography
          </p>
          <span className="text-xs text-muted-foreground">
            {formData.equipment.length}/200
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !hasChanges}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            loading || !hasChanges
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border border-current border-t-transparent"></div>
              <span>Saving...</span>
            </div>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  )
}