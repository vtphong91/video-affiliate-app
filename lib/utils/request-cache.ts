/**
 * Request Cache Utility
 *
 * Lightweight caching layer for API requests to reduce:
 * - Duplicate network calls
 * - Server load
 * - Loading times
 *
 * Features:
 * - TTL-based cache expiration
 * - Automatic cache invalidation
 * - Deduplication of in-flight requests
 * - Memory management
 *
 * Usage:
 * ```tsx
 * const data = await cachedFetch('/api/reviews?page=1', { ttl: 60000 });
 * ```
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 60000 = 1 minute)
  force?: boolean; // Force fetch, bypass cache
  dedupe?: boolean; // Deduplicate in-flight requests (default: true)
}

class RequestCache {
  private cache = new Map<string, CacheEntry>();
  private inFlightRequests = new Map<string, Promise<any>>();
  private maxCacheSize = 100; // Maximum cache entries
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup interval
    this.startCleanup();

    // Clear cache on visibility change (user switches tabs)
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.clearExpired();
        }
      });
    }
  }

  /**
   * Cached fetch with automatic deduplication
   */
  async fetch<T = any>(
    url: string,
    options: RequestInit & CacheOptions = {}
  ): Promise<T> {
    const { ttl = 60000, force = false, dedupe = true, ...fetchOptions } = options;
    const cacheKey = this.getCacheKey(url, fetchOptions);

    // Force bypass cache
    if (force) {
      this.invalidate(cacheKey);
      return this.fetchAndCache<T>(url, fetchOptions, ttl);
    }

    // Check cache
    const cached = this.get<T>(cacheKey);
    if (cached !== null) {
      console.log('✅ Cache HIT:', url);
      return cached;
    }

    // Deduplicate in-flight requests
    if (dedupe && this.inFlightRequests.has(cacheKey)) {
      console.log('🔄 Deduplicating request:', url);
      return this.inFlightRequests.get(cacheKey)!;
    }

    // Fetch and cache
    console.log('📡 Cache MISS, fetching:', url);
    return this.fetchAndCache<T>(url, fetchOptions, ttl);
  }

  /**
   * Fetch data and store in cache
   */
  private async fetchAndCache<T>(
    url: string,
    options: RequestInit,
    ttl: number
  ): Promise<T> {
    const cacheKey = this.getCacheKey(url, options);

    const fetchPromise = fetch(url, options)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        // Store in cache
        this.set(cacheKey, data, ttl);
        return data;
      })
      .catch((error) => {
        console.error('❌ Fetch error:', url, error);
        throw error;
      })
      .finally(() => {
        // Remove from in-flight requests
        this.inFlightRequests.delete(cacheKey);
      });

    // Track in-flight request
    this.inFlightRequests.set(cacheKey, fetchPromise);

    return fetchPromise;
  }

  /**
   * Get from cache
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry
   */
  set<T = any>(key: string, data: T, ttl: number): void {
    // Enforce max cache size
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.inFlightRequests.delete(key);
  }

  /**
   * Invalidate by pattern (e.g., all /api/reviews/* endpoints)
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }

    for (const key of this.inFlightRequests.keys()) {
      if (regex.test(key)) {
        this.inFlightRequests.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.inFlightRequests.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Evict oldest cache entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Generate cache key
   * ⚠️ CRITICAL: Include user-specific headers to prevent cache sharing between users
   */
  private getCacheKey(url: string, options: RequestInit): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';

    // ✅ FIX: Include user-specific headers in cache key
    const headers = options.headers as Record<string, string> || {};
    const userId = headers['x-user-id'] || '';

    // Format: GET:/api/reviews?page=1:body:userId
    return `${method}:${url}:${body}:${userId}`;
  }

  /**
   * Start cleanup interval
   */
  private startCleanup(): void {
    if (typeof window === 'undefined') return;

    this.cleanupInterval = setInterval(() => {
      this.clearExpired();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  /**
   * Get cache stats
   */
  stats() {
    return {
      size: this.cache.size,
      inFlight: this.inFlightRequests.size,
      maxSize: this.maxCacheSize,
    };
  }
}

// Singleton instance
export const requestCache = new RequestCache();

/**
 * Cached fetch helper
 */
export async function cachedFetch<T = any>(
  url: string,
  options?: RequestInit & CacheOptions
): Promise<T> {
  return requestCache.fetch<T>(url, options);
}

/**
 * Invalidate cache by pattern
 */
export function invalidateCache(pattern: string | RegExp): void {
  requestCache.invalidatePattern(pattern);
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  requestCache.clear();
}
