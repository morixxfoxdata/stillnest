'use client'

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items in cache
  persist?: boolean // Whether to persist to localStorage
}

class Cache<T> {
  private cache = new Map<string, CacheItem<T>>()
  private readonly ttl: number
  private readonly maxSize: number
  private readonly persist: boolean
  private readonly storageKey: string

  constructor(name: string, options: CacheOptions = {}) {
    this.ttl = options.ttl || 5 * 60 * 1000 // 5 minutes default
    this.maxSize = options.maxSize || 100
    this.persist = options.persist || false
    this.storageKey = `stillnest_cache_${name}`

    if (this.persist && typeof window !== 'undefined') {
      this.loadFromStorage()
    }

    // Clean up expired items periodically
    setInterval(() => this.cleanup(), 60 * 1000) // Every minute
  }

  set(key: string, data: T, customTtl?: number): void {
    const now = Date.now()
    const expiresAt = now + (customTtl || this.ttl)

    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value as string
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt
    }

    this.cache.set(key, item)

    if (this.persist) {
      this.saveToStorage()
    }
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      if (this.persist) {
        this.saveToStorage()
      }
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted && this.persist) {
      this.saveToStorage()
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
    if (this.persist && typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey)
    }
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  // Get cache statistics
  getStats() {
    let expired = 0
    let valid = 0
    const now = Date.now()

    this.cache.forEach(item => {
      if (now > item.expiresAt) {
        expired++
      } else {
        valid++
      }
    })

    return {
      total: this.cache.size,
      valid,
      expired,
      maxSize: this.maxSize
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    this.cache.forEach((item, key) => {
      if (now > item.expiresAt) {
        expiredKeys.push(key)
      }
    })

    expiredKeys.forEach(key => this.cache.delete(key))

    if (expiredKeys.length > 0 && this.persist) {
      this.saveToStorage()
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const data = Array.from(this.cache.entries())
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error)
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const data = localStorage.getItem(this.storageKey)
      if (data) {
        const entries: [string, CacheItem<T>][] = JSON.parse(data)
        const now = Date.now()

        entries.forEach(([key, item]) => {
          // Only load non-expired items
          if (now <= item.expiresAt) {
            this.cache.set(key, item)
          }
        })
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error)
    }
  }
}

// Create specific caches for different data types
export const photoCache = new Cache('photos', {
  ttl: 15 * 60 * 1000, // 15 minutes
  maxSize: 200,
  persist: true
})

export const userCache = new Cache('users', {
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 50,
  persist: true
})

export const feedCache = new Cache('feed', {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 20,
  persist: false // Feed data shouldn't persist
})

// Cache utilities
export function createCacheKey(...parts: (string | number)[]): string {
  return parts.join(':')
}

export function getCacheKeyForPhoto(photoId: string): string {
  return createCacheKey('photo', photoId)
}

export function getCacheKeyForUser(userId: string): string {
  return createCacheKey('user', userId)
}

export function getCacheKeyForFeed(userId: string, page: number): string {
  return createCacheKey('feed', userId, page)
}

export function getCacheKeyForUserPhotos(userId: string, page: number): string {
  return createCacheKey('user_photos', userId, page)
}

// Clear all caches
export function clearAllCaches(): void {
  photoCache.clear()
  userCache.clear()
  feedCache.clear()
}

// Get overall cache statistics
export function getCacheStats() {
  return {
    photos: photoCache.getStats(),
    users: userCache.getStats(),
    feed: feedCache.getStats()
  }
}