"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyError = void 0;
class ProxyError extends Error {
    constructor(message, statusCode = 500, provider) {
        super(message);
        this.name = 'ProxyError';
        this.statusCode = statusCode;
        this.provider = provider;
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ProxyError);
        }
    }
}
exports.ProxyError = ProxyError;
//# sourceMappingURL=types.js.map