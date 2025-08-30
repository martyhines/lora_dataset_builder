import { Request, Response, NextFunction } from 'express';
import { ProxyError } from '../types';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class InMemoryRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }

  private getKey(req: Request): string {
    // Use user ID from Firebase Auth if available, otherwise fall back to IP
    const userId = req.headers['x-user-id'] as string;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return userId || ip;
  }

  check(req: Request): { allowed: boolean; resetTime?: number; remaining?: number } {
    const key = this.getKey(req);
    const now = Date.now();
    
    let entry = this.store.get(key);
    
    if (!entry || entry.resetTime <= now) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime: now + this.windowMs
      };
      this.store.set(key, entry);
      
      return {
        allowed: true,
        resetTime: entry.resetTime,
        remaining: this.maxRequests - 1
      };
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        resetTime: entry.resetTime,
        remaining: 0
      };
    }

    entry.count++;
    return {
      allowed: true,
      resetTime: entry.resetTime,
      remaining: this.maxRequests - entry.count
    };
  }
}

// Create rate limiter instances for different endpoints
const generalLimiter = new InMemoryRateLimiter(60000, 100); // 100 requests per minute
const captionLimiter = new InMemoryRateLimiter(60000, 50);  // 50 caption requests per minute

export function createRateLimitMiddleware(limiter: InMemoryRateLimiter) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = limiter.check(req);
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': limiter['maxRequests'].toString(),
      'X-RateLimit-Remaining': result.remaining?.toString() || '0',
      'X-RateLimit-Reset': result.resetTime ? Math.ceil(result.resetTime / 1000).toString() : '0'
    });

    if (!result.allowed) {
      const error = new Error('Rate limit exceeded') as ProxyError;
      error.statusCode = 429;
      return next(error);
    }

    next();
  };
}

export const generalRateLimit = createRateLimitMiddleware(generalLimiter);
export const captionRateLimit = createRateLimitMiddleware(captionLimiter);