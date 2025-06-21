'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadPhoto, validateImageFile } from '@/lib/supabase/storage'
import { createPhoto } from '@/lib/supabase/photos'
import PhotoMetadataForm from './PhotoMetadataForm'

interface PhotoUploadProps {
  userId: string
  onUploadComplete?: (photoId: string) => void
  onUploadError?: (error: string) => void
}

interface UploadingFile {
  file: File
  id: string
  progress: number
  error?: string
  url?: string
  uploadResult?: {
    url: string
    path: string
    width?: number
    height?: number
  }
}

export default function PhotoUpload({ userId, onUploadComplete, onUploadError }: PhotoUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const [pendingMetadata, setPendingMetadata] = useState<{
    fileId: string
    fileName: string
  } | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        onUploadError?.(validation.error || 'Invalid file')
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Add files to uploading state
    const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(2),
      progress: 0
    }))

    setUploadingFiles(prev => [...prev, ...newUploadingFiles])

    // Upload files
    for (const uploadingFile of newUploadingFiles) {
      try {
        // Update progress
        setUploadingFiles(prev => 
          prev.map(f => f.id === uploadingFile.id ? { ...f, progress: 50 } : f)
        )

        // Upload to storage
        const uploadResult = await uploadPhoto(uploadingFile.file, userId)
        
        // Update progress and store upload result
        setUploadingFiles(prev => 
          prev.map(f => f.id === uploadingFile.id ? { 
            ...f, 
            progress: 75, 
            url: uploadResult.url,
            uploadResult 
          } : f)
        )

        // Show metadata form
        setPendingMetadata({
          fileId: uploadingFile.id,
          fileName: uploadingFile.file.name
        })

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        
        setUploadingFiles(prev => 
          prev.map(f => f.id === uploadingFile.id ? { ...f, error: errorMessage } : f)
        )
        
        onUploadError?.(errorMessage)
      }
    }
  }, [userId, onUploadError])

  const handleMetadataSave = async (metadata: { title: string; caption: string; tags: string[] }) => {
    if (!pendingMetadata) return

    const uploadingFile = uploadingFiles.find(f => f.id === pendingMetadata.fileId)
    if (!uploadingFile?.uploadResult) return

    try {
      // Create photo record with metadata
      const photo = await createPhoto({
        file_url: uploadingFile.uploadResult.url,
        width: uploadingFile.uploadResult.width,
        height: uploadingFile.uploadResult.height,
        title: metadata.title || undefined,
        caption: metadata.caption,
        tags: metadata.tags.length > 0 ? metadata.tags : undefined
      }, userId)

      // Complete upload
      setUploadingFiles(prev => 
        prev.map(f => f.id === pendingMetadata.fileId ? { ...f, progress: 100 } : f)
      )

      onUploadComplete?.(photo.id)
      setPendingMetadata(null)

      // Remove from uploading list after delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== pendingMetadata.fileId))
      }, 2000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save photo'
      setUploadingFiles(prev => 
        prev.map(f => f.id === pendingMetadata.fileId ? { ...f, error: errorMessage } : f)
      )
      onUploadError?.(errorMessage)
      setPendingMetadata(null)
    }
  }

  const handleMetadataSkip = async () => {
    if (!pendingMetadata) return

    const uploadingFile = uploadingFiles.find(f => f.id === pendingMetadata.fileId)
    if (!uploadingFile?.uploadResult) return

    try {
      // Create photo record without metadata
      const photo = await createPhoto({
        file_url: uploadingFile.uploadResult.url,
        width: uploadingFile.uploadResult.width,
        height: uploadingFile.uploadResult.height,
        title: undefined
      }, userId)

      // Complete upload
      setUploadingFiles(prev => 
        prev.map(f => f.id === pendingMetadata.fileId ? { ...f, progress: 100 } : f)
      )

      onUploadComplete?.(photo.id)
      setPendingMetadata(null)

      // Remove from uploading list after delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== pendingMetadata.fileId))
      }, 2000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save photo'
      setUploadingFiles(prev => 
        prev.map(f => f.id === pendingMetadata.fileId ? { ...f, error: errorMessage } : f)
      )
      onUploadError?.(errorMessage)
      setPendingMetadata(null)
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false)
  })

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors cursor-pointer
          ${isDragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-border hover:border-primary/50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          
          <div className="px-4">
            <p className="text-base sm:text-lg font-medium text-foreground">
              {isDragActive ? 'Drop your photos here' : 'Upload your photos'}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
              Drag & drop or click to select<br className="sm:hidden" />
              <span className="hidden sm:inline"> • </span>JPEG, PNG, WebP • Max 10MB each
            </p>
          </div>
        </div>
      </div>

      {/* Upload progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="font-medium text-foreground">Uploading Photos</h3>
          
          {uploadingFiles.map(file => (
            <div key={file.id} className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {file.file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {file.error ? 'Failed' : `${file.progress}%`}
                </span>
              </div>
              
              {file.error ? (
                <div className="text-xs text-red-600">{file.error}</div>
              ) : (
                <div className="w-full bg-background rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              )}
              
              {file.url && file.progress === 100 && (
                <div className="mt-2 flex items-center text-xs text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Upload complete
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Metadata Form Modal */}
      {pendingMetadata && (
        <PhotoMetadataForm
          initialData={{
            title: ''
          }}
          onSave={handleMetadataSave}
          onCancel={handleMetadataSkip}
        />
      )}
    </div>
  )
}