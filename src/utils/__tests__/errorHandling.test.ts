import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  withRetry,
  withRetryResult,
  withBatchRetry,
  CircuitBreaker,
  withTimeout,
  sleep,
  defaultRetryCondition,
  isNetworkError,
  isTimeoutError,
  isServerError,
  isAuthError,
  isValidationError,
  isRateLimitError
} from '../errorHandling';

describe('withRetry', () => {
  // Don't use fake timers for retry tests as they interfere with async operations

  it('should succeed on first attempt', async () => {
    const operation = vi.fn().mockResolvedValue('success');
    
    const result = await withRetry(operation);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Network request failed'))
      .mockRejectedValueOnce(new Error('500 Internal Server Error'))
      .mockResolvedValue('success');
    
    const result = await withRetry(operation, { maxRetries: 3, baseDelay: 10 });
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should fail after max retries', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Network connection failed'));
    
    await expect(withRetry(operation, { maxRetries: 2, baseDelay: 10 })).rejects.toThrow('Network connection failed');
    expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('should call onRetry callback', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValue('success');
    
    const onRetry = vi.fn();
    
    await withRetry(operation, { maxRetries: 2, baseDelay: 10, onRetry });
    
    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1);
  });

  it('should respect custom retry condition', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Auth error'));
    const retryCondition = vi.fn().mockReturnValue(false);
    
    const promise = withRetry(operation, { maxRetries: 2, retryCondition });
    
    await expect(promise).rejects.toThrow('Auth error');
    expect(operation).toHaveBeenCalledTimes(1); // No retries
    expect(retryCondition).toHaveBeenCalledWith(expect.any(Error), 1);
  });

  it('should apply exponential backoff with jitter', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('502 Bad Gateway'))
      .mockRejectedValueOnce(new Error('503 Service Unavailable'))
      .mockResolvedValue('success');
    
    const startTime = Date.now();
    
    const result = await withRetry(operation, { 
      maxRetries: 2, 
      baseDelay: 10, // Use small delay for testing
      backoffFactor: 2,
      jitter: false // Disable jitter for predictable testing
    });
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
    
    // Verify some time has passed (indicating delays occurred)
    expect(Date.now() - startTime).toBeGreaterThan(10);
  });
});

describe('withRetryResult', () => {
  it('should return success result with metadata', async () => {
    const operation = vi.fn().mockResolvedValue('success');
    
    const result = await withRetryResult(operation);
    
    expect(result).toEqual({
      success: true,
      result: 'success',
      attempts: 1,
      totalTime: expect.any(Number)
    });
  });

  it('should return failure result with metadata', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Network connection failed'));
    
    const result = await withRetryResult(operation, { maxRetries: 1, baseDelay: 10 });
    
    expect(result).toEqual({
      success: false,
      error: expect.any(Error),
      attempts: 2, // Initial + 1 retry
      totalTime: expect.any(Number)
    });
  });
});

describe('withBatchRetry', () => {
  it('should process all items successfully', async () => {
    const items = ['item1', 'item2', 'item3'];
    const operation = vi.fn().mockImplementation((item) => Promise.resolve(`processed-${item}`));
    
    const result = await withBatchRetry(items, operation);
    
    expect(result.successful).toEqual(['processed-item1', 'processed-item2', 'processed-item3']);
    expect(result.failed).toEqual([]);
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should handle partial failures', async () => {
    const items = ['item1', 'item2', 'item3'];
    const operation = vi.fn()
      .mockResolvedValueOnce('processed-item1')
      .mockRejectedValueOnce(new Error('Failed item2'))
      .mockResolvedValueOnce('processed-item3');
    
    const result = await withBatchRetry(items, operation);
    
    expect(result.successful).toEqual(['processed-item1', 'processed-item3']);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].item).toBe('item2');
    expect(result.failed[0].error.message).toBe('Failed item2');
  });

  it('should respect concurrency limits', async () => {
    const items = ['item1', 'item2', 'item3', 'item4', 'item5'];
    let concurrentCalls = 0;
    let maxConcurrentCalls = 0;
    
    const operation = vi.fn().mockImplementation(async (item) => {
      concurrentCalls++;
      maxConcurrentCalls = Math.max(maxConcurrentCalls, concurrentCalls);
      await new Promise(resolve => setTimeout(resolve, 100));
      concurrentCalls--;
      return `processed-${item}`;
    });
    
    await withBatchRetry(items, operation, { concurrency: 2 });
    
    expect(maxConcurrentCalls).toBeLessThanOrEqual(2);
  });
});

describe('CircuitBreaker', () => {
  it('should allow operations when closed', async () => {
    const breaker = new CircuitBreaker(3, 1000);
    const operation = vi.fn().mockResolvedValue('success');
    
    const result = await breaker.execute(operation);
    
    expect(result).toBe('success');
    expect(breaker.getState().state).toBe('closed');
  });

  it('should open after failure threshold', async () => {
    const breaker = new CircuitBreaker(2, 1000);
    const operation = vi.fn().mockRejectedValue(new Error('Failure'));
    
    // First two failures
    await expect(breaker.execute(operation)).rejects.toThrow();
    await expect(breaker.execute(operation)).rejects.toThrow();
    
    expect(breaker.getState().state).toBe('open');
    
    // Third call should be rejected by circuit breaker
    await expect(breaker.execute(operation)).rejects.toThrow('Circuit breaker is open');
  });

  it('should transition to half-open after recovery timeout', async () => {
    vi.useFakeTimers();
    
    const breaker = new CircuitBreaker(1, 1000);
    const operation = vi.fn().mockRejectedValue(new Error('Failure'));
    
    // Trigger circuit breaker
    await expect(breaker.execute(operation)).rejects.toThrow();
    expect(breaker.getState().state).toBe('open');
    
    // Fast-forward past recovery timeout
    vi.advanceTimersByTime(1001);
    
    // Next call should be allowed (half-open state)
    operation.mockResolvedValueOnce('success');
    const result = await breaker.execute(operation);
    
    expect(result).toBe('success');
    expect(breaker.getState().state).toBe('closed');
    
    vi.useRealTimers();
  });
});

describe('withTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve if promise completes before timeout', async () => {
    const promise = new Promise(resolve => setTimeout(() => resolve('success'), 500));
    
    const timeoutPromise = withTimeout(promise, 1000);
    vi.advanceTimersByTime(500);
    
    const result = await timeoutPromise;
    expect(result).toBe('success');
  });

  it('should reject if promise times out', async () => {
    const promise = new Promise(resolve => setTimeout(() => resolve('success'), 2000));
    
    const timeoutPromise = withTimeout(promise, 1000, 'Custom timeout message');
    vi.advanceTimersByTime(1000);
    
    await expect(timeoutPromise).rejects.toThrow('Custom timeout message');
  });
});

describe('error type detection', () => {
  it('should detect network errors', () => {
    expect(isNetworkError(new Error('Network request failed'))).toBe(true);
    expect(isNetworkError(new Error('fetch error'))).toBe(true);
    expect(isNetworkError(new Error('connection refused'))).toBe(true);
    expect(isNetworkError(new Error('Something else'))).toBe(false);
  });

  it('should detect timeout errors', () => {
    expect(isTimeoutError(new Error('Request timeout'))).toBe(true);
    expect(isTimeoutError(new Error('Operation timed out'))).toBe(true);
    expect(isTimeoutError(new Error('Something else'))).toBe(false);
  });

  it('should detect server errors', () => {
    expect(isServerError(new Error('500 Internal Server Error'))).toBe(true);
    expect(isServerError(new Error('502 Bad Gateway'))).toBe(true);
    expect(isServerError(new Error('503 Service Unavailable'))).toBe(true);
    expect(isServerError(new Error('400 Bad Request'))).toBe(false);
  });

  it('should detect auth errors', () => {
    expect(isAuthError(new Error('401 Unauthorized'))).toBe(true);
    expect(isAuthError(new Error('403 Forbidden'))).toBe(true);
    expect(isAuthError(new Error('Authentication failed'))).toBe(true);
    expect(isAuthError(new Error('Network error'))).toBe(false);
  });

  it('should detect validation errors', () => {
    expect(isValidationError(new Error('400 Bad Request'))).toBe(true);
    expect(isValidationError(new Error('Validation failed'))).toBe(true);
    expect(isValidationError(new Error('Invalid input'))).toBe(true);
    expect(isValidationError(new Error('Network error'))).toBe(false);
  });

  it('should detect rate limit errors', () => {
    expect(isRateLimitError(new Error('429 Too Many Requests'))).toBe(true);
    expect(isRateLimitError(new Error('Rate limit exceeded'))).toBe(true);
    expect(isRateLimitError(new Error('Network error'))).toBe(false);
  });
});

describe('defaultRetryCondition', () => {
  it('should not retry auth errors', () => {
    expect(defaultRetryCondition(new Error('401 Unauthorized'), 1)).toBe(false);
    expect(defaultRetryCondition(new Error('Authentication failed'), 1)).toBe(false);
  });

  it('should not retry validation errors', () => {
    expect(defaultRetryCondition(new Error('400 Bad Request'), 1)).toBe(false);
    expect(defaultRetryCondition(new Error('Invalid input'), 1)).toBe(false);
  });

  it('should not retry rate limit errors after first attempt', () => {
    expect(defaultRetryCondition(new Error('429 Too Many Requests'), 1)).toBe(true);
    expect(defaultRetryCondition(new Error('429 Too Many Requests'), 2)).toBe(false);
  });

  it('should retry network and server errors', () => {
    expect(defaultRetryCondition(new Error('Network failed'), 1)).toBe(true);
    expect(defaultRetryCondition(new Error('500 Internal Server Error'), 1)).toBe(true);
    expect(defaultRetryCondition(new Error('Request timeout'), 1)).toBe(true);
  });
});

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve after specified time', async () => {
    const promise = sleep(1000);
    
    vi.advanceTimersByTime(1000);
    
    await expect(promise).resolves.toBeUndefined();
  });
});