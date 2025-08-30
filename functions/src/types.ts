export interface CaptionRequest {
  imageUrl: string;
  options?: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  };
}

export interface CaptionResult {
  modelId: string;
  caption: string;
  latency: number;
  tokensUsed?: number;
  error?: string;
}

export interface ProviderConfig {
  id: string;
  enabled: boolean;
  timeout: number;
  maxRetries: number;
}

export interface VisionProvider {
  id: string;
  callProvider(imageUrl: string, options?: any): Promise<CaptionResult>;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export class ProxyError extends Error {
  statusCode: number;
  provider?: string;

  constructor(message: string, statusCode: number = 500, provider?: string) {
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