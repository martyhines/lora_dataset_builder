"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const caption_1 = __importDefault(require("./routes/caption"));
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimit_1 = require("./middleware/rateLimit");
const app = (0, express_1.default)();
// Trust proxy for accurate IP addresses in Cloud Functions
app.set('trust proxy', true);
// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://localhost:3000',
        'https://localhost:5173',
        /\.github\.io$/,
        /\.web\.app$/,
        /\.firebaseapp\.com$/
    ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-Request-ID']
};
app.use((0, cors_1.default)(corsOptions));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.headers['x-user-id']
    });
    next();
});
// Add request ID for tracking
app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    req.headers['x-request-id'] = requestId;
    res.set('X-Request-ID', requestId);
    next();
});
// Apply general rate limiting
app.use(rateLimit_1.generalRateLimit);
// API routes
app.use('/api/caption', caption_1.default);
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'LoRa Dataset Builder Caption Proxy',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            providers: 'GET /api/caption/providers',
            caption: 'POST /api/caption/:provider',
            batch: 'POST /api/caption/batch',
            health: 'GET /api/caption/health'
        },
        timestamp: new Date().toISOString()
    });
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        env: process.env.NODE_ENV || 'development'
    });
});
// 404 handler
app.use(errorHandler_1.notFoundHandler);
// Error handler (must be last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map