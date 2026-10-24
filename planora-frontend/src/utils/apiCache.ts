/**
 * In-memory client-side cache for fast page transitions and reducing redundant network calls.
 * Supports Time-To-Live (TTL) and Stale-While-Revalidate patterns.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Retrieves valid cached data if within TTL.
 * @param key Unique cache key
 * @param ttlMs Time-to-live in milliseconds (default: 60,000ms = 1 min)
 */
export function getCachedData<T>(key: string, ttlMs: number = 60_000): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  const isExpired = Date.now() - entry.timestamp > ttlMs;
  if (isExpired) {
    return null;
  }
  return entry.data as T;
}

/**
 * Retrieves stale cached data even if expired (for optimistic display while fetching).
 */
export function getStaleData<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  return entry ? (entry.data as T) : null;
}

/**
 * Stores data in the client cache.
 */
export function setCachedData<T>(key: string, data: T): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Invalidates cache by prefix or clears all if omitted.
 */
export function invalidateCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      memoryCache.delete(key);
    }
  }
}

