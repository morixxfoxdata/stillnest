'use client'

import { useState, useEffect, useRef } from 'react'
import { useToastContext } from '@/components/providers/ToastProvider'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  onClear?: () => void
  initialValue?: string
  className?: string
  showFilters?: boolean
  onFiltersToggle?: () => void
}

export function SearchBar({
  placeholder = "Search photos, users, or tags...",
  onSearch,
  onClear,
  initialValue = "",
  className = "",
  showFilters = false,
  onFiltersToggle
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToastContext()

  useEffect(() => {
    setQuery(initialValue)
  }, [initialValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    
    if (trimmedQuery.length < 2) {
      toast.warning('Search query too short', 'Please enter at least 2 characters')
      return
    }
    
    onSearch(trimmedQuery)
  }

  const handleClear = () => {
    setQuery("")
    onClear?.()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center border rounded-lg transition-colors ${
          isFocused ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-border/80'
        }`}>
          {/* Search icon */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-2.5 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Search button */}
          <button
            type="submit"
            disabled={query.trim().length < 2}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </div>

        {/* Filters toggle */}
        {showFilters && (
          <button
            type="button"
            onClick={onFiltersToggle}
            className="absolute right-0 top-full mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            Filters
          </button>
        )}
      </form>

      {/* Search suggestions could go here */}
    </div>
  )
}