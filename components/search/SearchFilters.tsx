'use client'

import { useState, useEffect } from 'react'
import { SearchFilters } from '@/lib/supabase/search'

interface SearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  availableTags?: string[]
  isOpen: boolean
  onClose: () => void
}

export function SearchFiltersComponent({
  filters,
  onFiltersChange,
  availableTags = [],
  isOpen,
  onClose
}: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)
  const [tagSearch, setTagSearch] = useState('')

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Filter tags based on search query
  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  )

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      sortBy: 'recent'
    }
    setLocalFilters(resetFilters)
    setTagSearch('')
    onFiltersChange(resetFilters)
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = localFilters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    setLocalFilters(prev => ({
      ...prev,
      tags: newTags.length > 0 ? newTags : undefined
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Search Filters</h3>
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sort by
            </label>
            <select
              value={localFilters.sortBy || 'recent'}
              onChange={(e) => setLocalFilters(prev => ({
                ...prev,
                sortBy: e.target.value as 'recent' | 'oldest' | 'popular'
              }))}
              className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">From</label>
                <input
                  type="date"
                  value={localFilters.dateFrom || ''}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    dateFrom: e.target.value || undefined
                  }))}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">To</label>
                <input
                  type="date"
                  value={localFilters.dateTo || ''}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    dateTo: e.target.value || undefined
                  }))}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags
              </label>
              
              {/* Tag Search */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Selected Tags */}
              {localFilters.tags && localFilters.tags.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-2">Selected tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {localFilters.tags.map(tag => (
                      <button
                        key={`selected-${tag}`}
                        onClick={() => handleTagToggle(tag)}
                        className="px-2 py-1 rounded-full text-xs bg-primary text-primary-foreground hover:bg-primary/80 transition-colors flex items-center gap-1"
                      >
                        #{tag}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Tags */}
              <div className="max-h-32 overflow-y-auto border border-border rounded-md p-2">
                <div className="flex flex-wrap gap-1">
                  {filteredTags.slice(0, 20).map(tag => {
                    const isSelected = localFilters.tags?.includes(tag) || false
                    if (isSelected) return null // Don't show selected tags in the available list
                    
                    return (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                      >
                        #{tag}
                      </button>
                    )
                  })}
                  {filteredTags.length > 20 && (
                    <div className="w-full text-center text-xs text-muted-foreground mt-2">
                      Showing 20 of {filteredTags.length} tags. Search to find more.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 border border-border text-foreground rounded-md hover:bg-muted transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}