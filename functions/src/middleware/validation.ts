import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ProxyError } from '../types';

const captionRequestSchema = Joi.object({
  imageUrl: Joi.string().uri().required().messages({
    'string.uri': 'imageUrl must be a valid URL',
    'any.required': 'imageUrl is required'
  }),
  options: Joi.object({
    maxTokens: Joi.number().integer().min(1).max(1000).optional(),
    temperature: Joi.number().min(0).max(2).optional(),
    systemPrompt: Joi.string().max(2000).optional()
  }).optional()
});

export function validateCaptionRequest(req: Request, res: Response, next: NextFunction): void {
  const { error, value } = captionRequestSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const validationError = new Error(`Validation error: ${error.details.map(d => d.message).join(', ')}`) as ProxyError;
    validationError.statusCode = 400;
    return next(validationError);
  }

  // Replace request body with validated and sanitized data
  req.body = value;
  next();
}

export function validateProvider(req: Request, res: Response, next: NextFunction): void {
  const { provider } = req.params;
  
  if (!provider || typeof provider !== 'string') {
    const error = new Error('Provider parameter is required') as ProxyError;
    error.statusCode = 400;
    return next(error);
  }

  // Validate provider format (should be like "openai" or "gemini")
  if (!/^[a-z]+$/.test(provider)) {
    const error = new Error('Invalid provider format') as ProxyError;
    error.statusCode = 400;
    return next(error);
  }

  next();
}