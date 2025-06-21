'use client'

import { useEffect, useState } from 'react'
import { Photo } from '@/lib/types'

interface ImageViewerProps {
  photos: Photo[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
}

export default function ImageViewer({ photos, currentIndex, isOpen, onClose }: ImageViewerProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setActiveIndex(currentIndex)
  }, [currentIndex])

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
      
      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      // Handle arrow keys for navigation
      const handleKeyNav = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft' && activeIndex > 0) {
          setActiveIndex(prev => prev - 1)
        } else if (e.key === 'ArrowRight' && activeIndex < photos.length - 1) {
          setActiveIndex(prev => prev + 1)
        }
      }

      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleKeyNav)

      return () => {
        document.body.style.overflow = 'unset'
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('keydown', handleKeyNav)
      }
    }
  }, [isOpen, onClose, activeIndex, photos.length])

  if (!isOpen || !photos[activeIndex]) {
    return null
  }

  const currentPhoto = photos[activeIndex]

  const handlePrevious = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
      setIsLoading(true)
    }
  }

  const handleNext = () => {
    if (activeIndex < photos.length - 1) {
      setActiveIndex(activeIndex + 1)
      setIsLoading(true)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation arrows */}
      {activeIndex > 0 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {activeIndex < photos.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Image container */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
        
        <img
          src={currentPhoto.file_url}
          alt={currentPhoto.title || 'Photo'}
          className="max-w-full max-h-full object-contain"
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </div>

      {/* Image info - mobile only */}
      {(currentPhoto.title || currentPhoto.caption) && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded-lg backdrop-blur-sm md:hidden">
          {currentPhoto.title && (
            <h3 className="font-medium text-lg mb-1">{currentPhoto.title}</h3>
          )}
          {currentPhoto.caption && (
            <p className="text-sm opacity-90">{currentPhoto.caption}</p>
          )}
        </div>
      )}

      {/* Photo counter - mobile only */}
      {photos.length > 1 && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm md:hidden">
          {activeIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  )
}