import express from 'express';
import cors from 'cors';
import captionRoutes from './routes/caption';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalRateLimit } from './middleware/rateLimit';

const app = express();

// Trust proxy for accurate IP addresses in Cloud Functions
app.set('trust proxy', true);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://lora-dataset-builder.github.io',
        'https://your-custom-domain.com', // Replace with actual custom domain
        /^https:\/\/.*\.github\.io$/,
        /^https:\/\/.*\.web\.app$/,
        /^https:\/\/.*\.firebaseapp\.com$/
      ]
    : [
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-Request-ID'],
  maxAge: 86400 // Cache preflight for 24 hours in production
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
  res.set('X-Request-ID', requestId as string);
  next();
});

// Apply general rate limiting
app.use(generalRateLimit);

// API routes
app.use('/api/caption', captionRoutes);

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
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;