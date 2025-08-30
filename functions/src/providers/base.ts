import { CaptionResult, VisionProvider, ProxyError } from '../types';

export abstract class BaseVisionProvider implements VisionProvider {
  abstract id: string;
  protected timeout: number;
  protected maxRetries: number;

  constructor(timeout: number = 30000, maxRetries: number = 3) {
    this.timeout = timeout;
    this.maxRetries = maxRetries;
  }

  abstract callProvider(imageUrl: string, options?: any): Promise<CaptionResult>;

  protected async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = this.timeout
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new ProxyError(`Request timeout after ${timeoutMs}ms`, 408));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  protected async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (error instanceof ProxyError && error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }

        if (attempt < retries) {
          // Exponential backoff with jitter
          const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  protected createError(message: string, statusCode: number = 500): ProxyError {
    const error = new Error(message) as ProxyError;
    error.statusCode = statusCode;
    error.provider = this.id;
    return error;
  }

  protected validateImageUrl(imageUrl: string): void {
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw this.createError('Invalid image URL provided', 400);
    }

    try {
      new URL(imageUrl);
    } catch {
      throw this.createError('Malformed image URL', 400);
    }

    // Check if URL is accessible (basic validation)
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      throw this.createError('Image URL must use HTTP or HTTPS protocol', 400);
    }
  }
}