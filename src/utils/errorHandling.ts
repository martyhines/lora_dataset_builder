/**
 * Error handling utilities with retry mechanisms and exponential backoff
 * Requirements 9.4, 9.5: Retry mechanisms and error recovery flows
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  jitter?: boolean;
  retryCondition?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

/**
 * Execute an operation with exponential backoff retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    jitter = true,
    retryCondition = defaultRetryCondition,
    onRetry
  } = options;

  let lastError: Error;
  const startTime = Date.now();

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on the last attempt
      if (attempt > maxRetries) {
        break;
      }

      // Check if we should retry this error
      if (!retryCondition(lastError, attempt)) {
        throw lastError;
      }

      // Call retry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt);
      }

      // Calculate delay with exponential backoff and optional jitter
      let delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
      
      if (jitter) {
        // Add random jitter (±25% of delay)
        const jitterAmount = delay * 0.25;
        delay += (Math.random() - 0.5) * 2 * jitterAmount;
      }

      await sleep(Math.max(0, delay));
    }
  }

  throw lastError!;
}

/**
 * Execute an operation with detailed retry result information
 */
export async function withRetryResult<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const startTime = Date.now();
  let attempts = 0;

  try {
    const result = await withRetry(
      async () => {
        attempts++;
        return await operation();
      },
      {
        ...options,
        onRetry: (error, attempt) => {
          options.onRetry?.(error, attempt);
        }
      }
    );

    return {
      success: true,
      result,
      attempts,
      totalTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      attempts,
      totalTime: Date.now() - startTime
    };
  }
}

/**
 * Default retry condition - retries on network errors and temporary failures
 */
export function defaultRetryCondition(error: Error, attempt: number): boolean {
  // Don't retry on authentication errors
  if (isAuthError(error)) {
    return false;
  }

  // Don't retry on validation errors
  if (isValidationError(error)) {
    return false;
  }

  // Don't retry on quota/rate limit errors after first attempt
  if (isRateLimitError(error) && attempt > 1) {
    return false;
  }

  // Retry on network errors, timeouts, server errors, and rate limits (first attempt only)
  return isNetworkError(error) || isTimeoutError(error) || isServerError(error) || isRateLimitError(error);
}

/**
 * Error type detection utilities
 */
export function isNetworkError(error: Error): boolean {
  return error.message.includes('Network') ||
         error.message.includes('fetch') ||
         error.message.includes('connection') ||
         error.name === 'NetworkError';
}

export function isTimeoutError(error: Error): boolean {
  return error.message.toLowerCase().includes('timeout') ||
         error.message.toLowerCase().includes('timed out') ||
         error.name === 'TimeoutError';
}

export function isServerError(error: Error): boolean {
  return error.message.includes('500') ||
         error.message.includes('502') ||
         error.message.includes('503') ||
         error.message.includes('504') ||
         error.message.includes('Internal Server Error');
}

export function isAuthError(error: Error): boolean {
  return error.message.includes('auth') ||
         error.message.includes('Auth') ||
         error.message.includes('401') ||
         error.message.includes('403') ||
         error.message.includes('Unauthorized') ||
         error.message.includes('Forbidden');
}

export function isValidationError(error: Error): boolean {
  return error.message.toLowerCase().includes('validation') ||
         error.message.toLowerCase().includes('invalid') ||
         error.message.includes('400') ||
         error.message.includes('Bad Request');
}

export function isRateLimitError(error: Error): boolean {
  return error.message.toLowerCase().includes('rate limit') ||
         error.message.includes('429') ||
         error.message.includes('Too Many Requests');
}

/**
 * Batch operation with partial failure handling
 */
export interface BatchResult<T> {
  successful: T[];
  failed: Array<{ item: any; error: Error }>;
  totalTime: number;
}

export async function withBatchRetry<TInput, TOutput>(
  items: TInput[],
  operation: (item: TInput) => Promise<TOutput>,
  options: RetryOptions & { concurrency?: number } = {}
): Promise<BatchResult<TOutput>> {
  const { concurrency = 3, ...retryOptions } = options;
  const startTime = Date.now();
  const successful: TOutput[] = [];
  const failed: Array<{ item: TInput; error: Error }> = [];

  // Process items in batches with concurrency control
  const semaphore = new Semaphore(concurrency);
  
  const promises = items.map(async (item) => {
    return semaphore.acquire(async () => {
      try {
        const result = await withRetry(() => operation(item), retryOptions);
        successful.push(result);
      } catch (error) {
        failed.push({ 
          item, 
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
    });
  });

  await Promise.all(promises);

  return {
    successful,
    failed,
    totalTime: Date.now() - startTime
  };
}

/**
 * Simple semaphore for concurrency control
 */
class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.permits > 0) {
        this.permits--;
        this.executeTask(task, resolve, reject);
      } else {
        this.waiting.push(() => {
          this.permits--;
          this.executeTask(task, resolve, reject);
        });
      }
    });
  }

  private async executeTask<T>(
    task: () => Promise<T>,
    resolve: (value: T) => void,
    reject: (reason: any) => void
  ) {
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.permits++;
      if (this.waiting.length > 0) {
        const next = this.waiting.shift();
        if (next) next();
      }
    }
  }
}

/**
 * Circuit breaker pattern for preventing cascading failures
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * Utility function for sleeping/delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a timeout wrapper for promises
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    })
  ]);
}