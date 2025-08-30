"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captionRateLimit = exports.generalRateLimit = void 0;
exports.createRateLimitMiddleware = createRateLimitMiddleware;
class InMemoryRateLimiter {
    constructor(windowMs = 60000, maxRequests = 100) {
        this.store = new Map();
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
        // Clean up expired entries every minute
        setInterval(() => this.cleanup(), 60000);
    }
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (entry.resetTime <= now) {
                this.store.delete(key);
            }
        }
    }
    getKey(req) {
        // Use user ID from Firebase Auth if available, otherwise fall back to IP
        const userId = req.headers['x-user-id'];
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        return userId || ip;
    }
    check(req) {
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
const captionLimiter = new InMemoryRateLimiter(60000, 50); // 50 caption requests per minute
function createRateLimitMiddleware(limiter) {
    return (req, res, next) => {
        var _a;
        const result = limiter.check(req);
        // Add rate limit headers
        res.set({
            'X-RateLimit-Limit': limiter['maxRequests'].toString(),
            'X-RateLimit-Remaining': ((_a = result.remaining) === null || _a === void 0 ? void 0 : _a.toString()) || '0',
            'X-RateLimit-Reset': result.resetTime ? Math.ceil(result.resetTime / 1000).toString() : '0'
        });
        if (!result.allowed) {
            const error = new Error('Rate limit exceeded');
            error.statusCode = 429;
            return next(error);
        }
        next();
    };
}
exports.generalRateLimit = createRateLimitMiddleware(generalLimiter);
exports.captionRateLimit = createRateLimitMiddleware(captionLimiter);
//# sourceMappingURL=rateLimit.js.map