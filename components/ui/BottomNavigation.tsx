'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getUserProfile } from '@/lib/supabase/users'

export default function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [username, setUsername] = useState<string | null>(null)
  const [navigating, setNavigating] = useState(false)

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

  const handleNavigation = (href: string, e: React.MouseEvent, isDisabled?: boolean) => {
    e.preventDefault()
    if (href === pathname || isDisabled || href === '#') return // Don't navigate if already on the page or disabled
    
    setNavigating(true)
    router.push(href)
    
    // Reset navigating state after a short delay
    setTimeout(() => setNavigating(false), 300)
  }

  const navItems = [
    {
      href: '/gallery',
      label: 'Feed',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      )
    },
    {
      href: '/search',
      label: 'Search',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      href: '/upload',
      label: 'Upload',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      isHighlight: true
    },
    {
      href: '/discover',
      label: 'Discover',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    ...(user ? [{
      href: username ? `/user/${username}` : '#',
      label: 'Profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      disabled: !username
    }] : [])
  ]

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-3 sm:hidden z-50 shadow-lg">
        <div className="flex justify-around items-center max-w-sm mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const isHighlight = item.isHighlight
            const isItemDisabled = item.disabled || navigating
            
            return (
              <button
                key={item.href}
                onClick={(e) => handleNavigation(item.href, e, item.disabled)}
                className={`
                  flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-colors duration-200 min-w-0 flex-1 active:scale-95
                  ${isHighlight 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : isActive 
                      ? 'text-gray-900 bg-gray-100' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                  ${isItemDisabled ? 'opacity-60' : ''}
                `}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                disabled={isItemDisabled}
              >
                <div className={`${isHighlight ? 'scale-110' : isActive ? 'scale-105' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-xs mt-1 font-medium ${isHighlight ? 'text-white' : ''}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Bottom padding for content to not be hidden behind fixed nav */}
      <div className="h-24 sm:hidden" />
    </>
  )
}