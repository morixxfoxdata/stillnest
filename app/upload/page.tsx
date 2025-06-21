'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/ui/Header'
import BottomNavigation from '@/components/ui/BottomNavigation'
import PhotoUpload from '@/components/upload/PhotoUpload'

export default function UploadPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Upload Photos</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Share your photography with the Stillnest community
          </p>
        </div>

        {/* Success and redirect message */}
        {isRedirecting && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-green-800 font-medium">アップロード完了！</p>
                <p className="text-green-700 text-sm">ギャラリーページに移動します...</p>
              </div>
            </div>
          </div>
        )}

        <PhotoUpload 
          userId={user.id}
          onUploadComplete={(photoId) => {
            console.log('Photo uploaded:', photoId)
            setIsRedirecting(true)
            // Redirect to gallery after successful upload
            setTimeout(() => {
              router.push('/gallery')
            }, 2000) // Wait 2 seconds to show success message
          }}
          onUploadError={(error) => {
            console.error('Upload error:', error)
            alert('アップロードに失敗しました: ' + error)
          }}
        />

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-medium text-foreground mb-2">Upload Guidelines</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Only original photography is allowed</li>
            <li>• Maximum file size: 10MB per image</li>
            <li>• Supported formats: JPEG, PNG, WebP</li>
            <li>• High-quality images are encouraged</li>
            <li>• Add titles and captions to help others appreciate your work</li>
          </ul>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  )
}