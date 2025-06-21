import { useState, useEffect, useRef } from 'react'
import { Photo } from '@/lib/types'
import { LazyImage } from '@/components/ui/LazyImage'
import { Skeleton } from '@/components/ui/SkeletonLoader'

interface PhotoCardProps {
  photo: Photo
  showTitle?: boolean
  showCaption?: boolean
  enableLike?: boolean
  enableEdit?: boolean
  onDelete?: (photoId: string) => void
  onEdit?: (photo: Photo) => void
  isOwner?: boolean
  onImageClick?: (photo: Photo) => void
  onLike?: (photoId: string, isLiked: boolean) => void
  isLiked?: boolean
}

export default function PhotoCard({ 
  photo, 
  showTitle = true, 
  showCaption = true, 
  enableLike = false,
  enableEdit = false,
  onDelete,
  onEdit,
  isOwner = false,
  onImageClick,
  onLike,
  isLiked = false
}: PhotoCardProps) {
  console.log('PhotoCard received props:', {
    photoId: photo.id,
    hasOnDelete: !!onDelete,
    hasOnEdit: !!onEdit,
    isOwner
  })
  const [showMenu, setShowMenu] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Debug: Log the isOwner value
  console.log('isOwner:', isOwner, 'photo.user_id:', photo.user_id)
  

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])
  return (
    <div 
      className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <LazyImage
          src={photo.file_url}
          alt={photo.title || 'Photo'}
          width={photo.width || 400}
          height={photo.height || 600}
          className="cursor-pointer"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onClick={() => {
            console.log('Image clicked:', photo.id)
            console.log('onImageClick function exists:', !!onImageClick)
            onImageClick?.(photo)
          }}
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 pointer-events-none" />
        
        <div 
          className="absolute top-3 right-3 flex gap-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {enableLike && (
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onLike?.(photo.id, !isLiked)
              }}
              className={`${isHovered || showMenu ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white`}
            >
              <svg 
                className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
                fill={isLiked ? "currentColor" : "none"} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
          
          {enableEdit && (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className={`${isHovered || showMenu ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white`}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      console.log('Edit button clicked for photo:', photo.id)
                      console.log('onEdit function exists:', !!onEdit)
                      onEdit?.(photo)
                      setShowMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => {
                      console.log('Delete button clicked for photo:', photo.id)
                      console.log('onDelete function exists:', !!onDelete)
                      console.log('onDelete function:', onDelete)
                      
                      const userConfirmed = confirm(`削除しますか？\n\n"${photo.title || 'Untitled'}"\n\nこの操作は取り消せません。`)
                      console.log('User confirmed delete:', userConfirmed)
                      
                      if (userConfirmed) {
                        console.log('Calling onDelete with photoId:', photo.id)
                        try {
                          onDelete?.(photo.id)
                          console.log('onDelete called successfully')
                        } catch (error) {
                          console.error('Error calling onDelete:', error)
                        }
                      }
                      setShowMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {(showTitle || showCaption) && (
        <div className="p-3 sm:p-4">
          {showTitle && photo.title && (
            <h3 className="font-medium text-foreground text-xs sm:text-sm mb-1 line-clamp-2">
              {photo.title}
            </h3>
          )}
          
          {showCaption && photo.caption && (
            <p className="text-muted-foreground text-xs line-clamp-2 sm:line-clamp-3">
              {photo.caption}
            </p>
          )}
          
          {photo.tags && photo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 sm:mt-2">
              {photo.tags.slice(0, 2).map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {photo.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{photo.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}