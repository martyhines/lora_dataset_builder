"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseVisionProvider = void 0;
const types_1 = require("../types");
class BaseVisionProvider {
    constructor(timeout = 30000, maxRetries = 3) {
        this.timeout = timeout;
        this.maxRetries = maxRetries;
    }
    async withTimeout(promise, timeoutMs = this.timeout) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new types_1.ProxyError(`Request timeout after ${timeoutMs}ms`, 408));
            }, timeoutMs);
        });
        return Promise.race([promise, timeoutPromise]);
    }
    async withRetry(operation, retries = this.maxRetries) {
        let lastError;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                // Don't retry on client errors (4xx)
                if (error instanceof types_1.ProxyError && error.statusCode >= 400 && error.statusCode < 500) {
                    throw error;
                }
                if (attempt < retries) {
                    // Exponential backoff with jitter
                    const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError;
    }
    createError(message, statusCode = 500) {
        const error = new Error(message);
        error.statusCode = statusCode;
        error.provider = this.id;
        return error;
    }
    validateImageUrl(imageUrl) {
        if (!imageUrl || typeof imageUrl !== 'string') {
            throw this.createError('Invalid image URL provided', 400);
        }
        try {
            new URL(imageUrl);
        }
        catch (_a) {
            throw this.createError('Malformed image URL', 400);
        }
        // Check if URL is accessible (basic validation)
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            throw this.createError('Image URL must use HTTP or HTTPS protocol', 400);
        }
    }
}
exports.BaseVisionProvider = BaseVisionProvider;
//# sourceMappingURL=base.js.map