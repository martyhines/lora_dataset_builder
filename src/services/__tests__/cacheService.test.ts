import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CacheService, imageCache, captionCache, withCache, memoize } from '../cacheService';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new CacheService({ ttl: 1000, maxSize: 3 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return undefined for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('should check if key exists', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('nonexistent')).toBe(false);
  });

  it('should delete values', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    
    cache.delete('key1');
    expect(cache.has('key1')).toBe(false);
  });

  it('should clear all values', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    expect(cache.size()).toBe(2);
    
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  it('should respect TTL expiration', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
    
    // Advance time beyond TTL
    vi.advanceTimersByTime(1001);
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should evict oldest entries when max size is reached', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    expect(cache.size()).toBe(3);
    
    // Adding fourth item should evict the first
    cache.set('key4', 'value4');
    expect(cache.size()).toBe(3);
    expect(cache.has('key1')).toBe(false);
    expect(cache.has('key4')).toBe(true);
  });

  it('should update access time on get', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    
    // Access key1 to make it most recently used
    cache.get('key1');
    
    // Add new item, should evict key2 (least recently used)
    cache.set('key4', 'value4');
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('should return all keys', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    const keys = cache.keys();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
    expect(keys).toHaveLength(2);
  });

  it('should return all values', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    const values = cache.values();
    expect(values).toContain('value1');
    expect(values).toContain('value2');
    expect(values).toHaveLength(2);
  });

  it('should cleanup expired entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    // Advance time to expire first entry
    vi.advanceTimersByTime(500);
    cache.set('key3', 'value3');
    
    vi.advanceTimersByTime(600); // Total 1100ms, first two should be expired
    
    // Trigger cleanup by accessing cache
    cache.get('key3');
    
    expect(cache.size()).toBe(1);
    expect(cache.has('key3')).toBe(true);
  });
});

describe('Predefined cache instances', () => {
  it('should create imageCache with correct configuration', () => {
    expect(imageCache).toBeInstanceOf(CacheService);
  });

  it('should create captionCache with correct configuration', () => {
    expect(captionCache).toBeInstanceOf(CacheService);
  });
});

describe('withCache', () => {
  let mockFn: vi.Mock;
  let cache: CacheService;

  beforeEach(() => {
    mockFn = vi.fn();
    cache = new CacheService({ ttl: 1000, maxSize: 10 });
  });

  it('should cache function results', async () => {
    mockFn.mockResolvedValue('result');
    const cachedFn = withCache(mockFn, cache, (...args) => args.join('-'));

    const result1 = await cachedFn('arg1', 'arg2');
    const result2 = await cachedFn('arg1', 'arg2');

    expect(result1).toBe('result');
    expect(result2).toBe('result');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should call function again for different arguments', async () => {
    mockFn.mockResolvedValue('result');
    const cachedFn = withCache(mockFn, cache, (...args) => args.join('-'));

    await cachedFn('arg1', 'arg2');
    await cachedFn('arg3', 'arg4');

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should handle function errors', async () => {
    const error = new Error('Function failed');
    mockFn.mockRejectedValue(error);
    const cachedFn = withCache(mockFn, cache, (...args) => args.join('-'));

    await expect(cachedFn('arg1')).rejects.toThrow('Function failed');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe('memoize', () => {
  let mockFn: vi.Mock;

  beforeEach(() => {
    mockFn = vi.fn();
  });

  it('should memoize function results', () => {
    mockFn.mockReturnValue('result');
    const memoizedFn = memoize(mockFn);

    const result1 = memoizedFn('arg1', 'arg2');
    const result2 = memoizedFn('arg1', 'arg2');

    expect(result1).toBe('result');
    expect(result2).toBe('result');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should use custom key generator', () => {
    mockFn.mockReturnValue('result');
    const memoizedFn = memoize(mockFn, (a, b) => `${a}-${b}`);

    memoizedFn('arg1', 'arg2');
    memoizedFn('arg1', 'arg2');

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should handle different arguments', () => {
    mockFn.mockReturnValue('result');
    const memoizedFn = memoize(mockFn);

    memoizedFn('arg1');
    memoizedFn('arg2');

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should respect cache size limit', () => {
    mockFn.mockReturnValue('result');
    const memoizedFn = memoize(mockFn, undefined, { maxSize: 2 });

    memoizedFn('arg1');
    memoizedFn('arg2');
    memoizedFn('arg3'); // Should evict arg1
    memoizedFn('arg1'); // Should call function again

    expect(mockFn).toHaveBeenCalledTimes(4);
  });
});