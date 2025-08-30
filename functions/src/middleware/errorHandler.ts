import { Request, Response, NextFunction } from 'express';
import { ProxyError } from '../types';

export function errorHandler(
  error: Error | ProxyError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error for monitoring
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    provider: 'provider' in error ? error.provider : undefined,
    timestamp: new Date().toISOString()
  });

  // Determine status code
  let statusCode = 500;
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    statusCode = error.statusCode;
  }

  // Create error response
  const errorResponse: any = {
    error: true,
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString()
  };

  // Add provider info if available
  if ('provider' in error && error.provider) {
    errorResponse.provider = error.provider;
  }

  // Add request ID for tracking
  if (req.headers['x-request-id']) {
    errorResponse.requestId = req.headers['x-request-id'];
  }

  // Don't expose internal errors in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    errorResponse.message = 'Internal server error';
  }

  res.status(statusCode).json(errorResponse);
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: true,
    message: `Endpoint ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
}