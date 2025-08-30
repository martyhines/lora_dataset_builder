/**
 * Client-side caching service for frequently accessed data
 * Requirements: 10.5 - Add client-side caching for frequently accessed data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of entries
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL: number;
  private maxSize: number;

  constructor({ ttl = 5 * 60 * 1000, maxSize = 100 }: CacheOptions = {}) {
    this.defaultTTL = ttl; // 5 minutes default
    this.maxSize = maxSize;
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Evict expired entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictExpired();
      
      // If still full, evict oldest entries
      if (this.cache.size >= this.maxSize) {
        this.evictOldest();
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL
    };

    this.cache.set(key, entry);
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalSize = 0;

    for (const [, entry] of this.cache) {
      totalSize++;
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++;
      }
    }

    return {
      totalEntries: totalSize,
      expiredEntries: expiredCount,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private hitCount = 0;
  private missCount = 0;

  /**
   * Evict expired entries
   */
  private evictExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Estimate memory usage (rough approximation)
   */
  private estimateMemoryUsage(): number {
    let size = 0;
    for (const [key, entry] of this.cache) {
      size += key.length * 2; // Rough estimate for string size
      size += JSON.stringify(entry.data).length * 2; // Rough estimate for data size
      size += 24; // Overhead for entry object
    }
    return size;
  }
}

// Create singleton instances for different types of data
export const imageCache = new CacheService({ 
  ttl: 10 * 60 * 1000, // 10 minutes for image metadata
  maxSize: 200 
});

export const captionCache = new CacheService({ 
  ttl: 30 * 60 * 1000, // 30 minutes for captions
  maxSize: 500 
});

export const userSettingsCache = new CacheService({ 
  ttl: 60 * 60 * 1000, // 1 hour for user settings
  maxSize: 10 
});

/**
 * Cache wrapper for async functions
 */
export function withCache<T extends any[], R>(
  cache: CacheService,
  keyGenerator: (...args: T) => string,
  ttl?: number
) {
  return function cacheWrapper(fn: (...args: T) => Promise<R>) {
    return async (...args: T): Promise<R> => {
      const key = keyGenerator(...args);
      
      // Try to get from cache first
      const cached = cache.get<R>(key);
      if (cached !== null) {
        return cached;
      }

      // Execute function and cache result
      try {
        const result = await fn(...args);
        cache.set(key, result, ttl);
        return result;
      } catch (error) {
        // Don't cache errors
        throw error;
      }
    };
  };
}

/**
 * Memoization decorator for expensive computations
 */
export function memoize<T extends any[], R>(
  fn: (...args: T) => R,
  keyGenerator?: (...args: T) => string,
  ttl?: number
): (...args: T) => R {
  const cache = new CacheService({ ttl: ttl ?? 5 * 60 * 1000, maxSize: 50 });
  
  const defaultKeyGenerator = (...args: T) => JSON.stringify(args);
  const getKey = keyGenerator ?? defaultKeyGenerator;

  return (...args: T): R => {
    const key = getKey(...args);
    
    const cached = cache.get<R>(key);
    if (cached !== null) {
      return cached;
    }

    const result = fn(...args);
    cache.set(key, result, ttl);
    return result;
  };
}