'use client'

import { useState, useEffect } from 'react'
import { Photo } from '@/lib/types'

interface PhotoEditModalProps {
  photo: Photo | null
  isOpen: boolean
  onClose: () => void
  onSave: (photoId: string, updates: {
    title?: string
    caption?: string
    tags?: string[]
  }) => void
}

export default function PhotoEditModal({ photo, isOpen, onClose, onSave }: PhotoEditModalProps) {
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (photo) {
      setTitle(photo.title || '')
      setCaption(photo.caption || '')
      setTagsInput(photo.tags?.join(', ') || '')
    }
  }, [photo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!photo) return

    setSaving(true)
    
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    try {
      await onSave(photo.id, {
        title: title.trim() || undefined,
        caption: caption.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined
      })
      onClose()
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !photo) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">写真を編集</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4 sm:mb-6">
            <img
              src={photo.file_url}
              alt={photo.title || 'Photo'}
              className="w-full h-32 sm:h-48 object-contain bg-gray-50 rounded-lg"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                タイトル
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                placeholder="写真のタイトルを入力..."
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
                キャプション
              </label>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                placeholder="写真の説明やストーリーを入力..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {caption.length}/500文字
              </p>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                タグ
              </label>
              <input
                id="tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                placeholder="風景, ポートレート, モノクロ (カンマ区切り)"
              />
              <p className="text-xs text-gray-500 mt-1">
                カンマで区切って複数のタグを入力できます
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors order-2 sm:order-1"
                disabled={saving}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}