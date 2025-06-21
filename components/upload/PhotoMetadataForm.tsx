'use client'

import { useState } from 'react'

interface PhotoMetadata {
  title: string
  caption: string
  tags: string[]
}

interface PhotoMetadataFormProps {
  initialData?: Partial<PhotoMetadata>
  onSave: (metadata: PhotoMetadata) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function PhotoMetadataForm({
  initialData = {},
  onSave,
  onCancel,
  isLoading = false
}: PhotoMetadataFormProps) {
  const [title, setTitle] = useState(initialData.title || '')
  const [caption, setCaption] = useState(initialData.caption || '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(initialData.tags || [])

  const handleAddTag = () => {
    const newTag = tagInput.trim().toLowerCase()
    if (newTag && !tags.includes(newTag) && tags.length < 10) {
      setTags([...tags, newTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title: title.trim(),
      caption: caption.trim(),
      tags
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto mx-4">
        <div className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6">
            Add Photo Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Title (optional)
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your photo a title"
                maxLength={100}
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {title.length}/100 characters
              </p>
            </div>

            {/* Caption */}
            <div>
              <label htmlFor="caption" className="block text-sm font-medium text-foreground mb-2">
                Caption (optional)
              </label>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Tell the story behind your photo..."
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {caption.length}/500 characters
              </p>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-2">
                Tags (optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="landscape, nature, street..."
                  className="flex-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 10}
                  className="px-3 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              
              {/* Tag display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                {tags.length}/10 tags • Press Enter or click Add to create tags
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full sm:flex-1 px-4 py-2 border border-border text-foreground rounded-md hover:bg-muted transition-colors disabled:opacity-50 order-2 sm:order-1"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 order-1 sm:order-2"
              >
                {isLoading ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}