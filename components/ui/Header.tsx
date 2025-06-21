'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToastContext } from '@/components/providers/ToastProvider'
import { getUserProfile } from '@/lib/supabase/users'

export default function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const toast = useToastContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.id)
          setUsername(profile?.username || null)
        } catch (error) {
          console.error('Failed to load user profile:', error)
        }
      } else {
        setUsername(null)
      }
    }

    loadUserProfile()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsMenuOpen(false)
      toast.success('Signed out successfully')
      // AuthProvider will handle the redirect automatically
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out', 'Please try again.')
    }
  }

  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? "/gallery" : "/"} className="flex items-center">
            <h1 className="text-xl font-bold text-foreground">Stillnest</h1>
          </Link>

          {/* Navigation */}
          {user ? (
            <div className="flex items-center gap-6">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link 
                  href="/gallery" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Feed
                </Link>
                <Link 
                  href="/discover" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Discover
                </Link>
                <Link 
                  href="/search" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Search
                </Link>
                <Link 
                  href="/upload" 
                  className="hidden md:flex px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
                >
                  Upload
                </Link>
              </nav>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <svg className="w-4 h-4 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border">
                        @{username || user.email}
                      </div>
                      
                      {/* Mobile Navigation Links */}
                      <div className="md:hidden">
                        <Link 
                          href="/gallery"
                          className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Feed
                        </Link>
                        <Link 
                          href="/discover"
                          className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Discover
                        </Link>
                        <Link 
                          href="/search"
                          className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Search
                        </Link>
                        <div className="border-t border-border my-1"></div>
                      </div>
                      
                      {username && (
                        <Link 
                          href={`/user/${username}`}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Profile
                        </Link>
                      )}
                      <Link 
                        href="/settings"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          handleSignOut()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                href="/auth/login" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Close menu when clicking outside */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  )
}