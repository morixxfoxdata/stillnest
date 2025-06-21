import { createSupabaseClient } from './client'

export interface UploadResult {
  url: string
  path: string
  width?: number
  height?: number
}

export async function uploadPhoto(file: File, userId: string): Promise<UploadResult> {
  const supabase = createSupabaseClient()
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(fileName)

  // Get image dimensions
  const dimensions = await getImageDimensions(file)

  return {
    url: publicUrl,
    path: fileName,
    width: dimensions?.width,
    height: dimensions?.height
  }
}

export async function deletePhoto(path: string): Promise<void> {
  const supabase = createSupabaseClient()
  
  const { error } = await supabase.storage
    .from('photos')
    .remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(null)
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    
    img.src = url
  })
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed'
    }
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image must be smaller than 10MB'
    }
  }
  
  return { valid: true }
}