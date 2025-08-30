import { CaptionProxyService, type CaptionRequest, type CaptionResult } from './captionProxyService';
import { ImageService } from './imageService';
import type { ImageDoc, CaptionCandidate } from '../types';
import { executeWithRecovery } from './errorRecoveryService';
import { withTimeout, CircuitBreaker } from '../utils/errorHandling';

/**
 * Configuration for caption generation
 */
export interface CaptionGenerationConfig {
  providers?: string[];
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  concurrency?: number;
}

/**
 * Status of caption generation for an image
 */
export interface CaptionGenerationStatus {
  imageId: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  totalProviders: number;
  completedProviders: number;
  failedProviders: number;
  errors: string[];
  startTime: number;
  endTime?: number;
}

/**
 * Result of a provider call attempt
 */
interface ProviderAttempt {
  provider: string;
  attempt: number;
  success: boolean;
  result?: CaptionResult;
  error?: string;
  timestamp: number;
}

/**
 * Service for orchestrating caption generation across multiple providers
 */
export class CaptionOrchestrator {
  private proxyService: CaptionProxyService;
  private defaultConfig: Required<CaptionGenerationConfig>;
  private activeGenerations = new Map<string, CaptionGenerationStatus>();
  private circuitBreakers = new Map<string, CircuitBreaker>();

  constructor(config?: Partial<CaptionGenerationConfig>) {
    this.proxyService = new CaptionProxyService();
    this.defaultConfig = {
      providers: [],
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000,
      concurrency: 3,
      ...config
    };
  }

  /**
   * Get or create a circuit breaker for a provider
   */
  private getCircuitBreaker(provider: string): CircuitBreaker {
    if (!this.circuitBreakers.has(provider)) {
      this.circuitBreakers.set(provider, new CircuitBreaker(5, 60000)); // 5 failures, 1 minute recovery
    }
    return this.circuitBreakers.get(provider)!;
  }

  /**
   * Generate captions for an image using multiple providers in parallel
   */
  async generateCaptions(
    image: ImageDoc,
    userId: string,
    config?: CaptionGenerationConfig
  ): Promise<CaptionGenerationStatus> {
    return await executeWithRecovery(
      async () => {
        const finalConfig = { ...this.defaultConfig, ...config };
        const imageId = image.id;

        // Initialize generation status
        const status: CaptionGenerationStatus = {
          imageId,
          status: 'processing',
          totalProviders: 0,
          completedProviders: 0,
          failedProviders: 0,
          errors: [],
          startTime: Date.now()
        };

        this.activeGenerations.set(imageId, status);

        try {
          // Update image status to processing
          await ImageService.updateImage(imageId, userId, {
            status: 'processing',
            error: undefined
          });

          // Get available providers if not specified
          let providers = finalConfig.providers;
          if (!providers || providers.length === 0) {
            providers = await this.proxyService.getAvailableProviders();
          }

          status.totalProviders = providers.length;

          if (providers.length === 0) {
            throw new Error('No providers available for caption generation');
          }

          // Create caption request
          const request: CaptionRequest = {
            imageUrl: image.downloadURL,
            options: {
              maxTokens: 100,
              temperature: 0.7,
              systemPrompt: 'Describe this image for a machine learning dataset. Be concise and accurate.'
            }
          };

          // Generate captions from all providers in parallel with concurrency control
          const results = await this.generateWithConcurrencyControl(
            providers,
            request,
            finalConfig,
            status
          );

          // Process results and update image document
          const candidates: CaptionCandidate[] = [];
          const errors: string[] = [];

          for (const result of results) {
            if (result.success && result.result) {
              candidates.push(this.proxyService.resultToCandidate(result.result));
            } else if (result.error) {
              errors.push(`${result.provider}: ${result.error}`);
            }
          }

          // Update status
          status.completedProviders = results.filter(r => r.success).length;
          status.failedProviders = results.filter(r => !r.success).length;
          status.errors = errors;
          status.endTime = Date.now();

          // Determine final status
          if (candidates.length > 0) {
            status.status = 'complete';
            await ImageService.updateImage(imageId, userId, {
              status: 'complete',
              candidates,
              error: errors.length > 0 ? errors.join('; ') : undefined
            });
          } else {
            status.status = 'error';
            await ImageService.updateImage(imageId, userId, {
              status: 'error',
              error: errors.length > 0 ? errors.join('; ') : 'All providers failed'
            });
          }

        } catch (error) {
      status.status = 'error';
      status.endTime = Date.now();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      status.errors.push(errorMessage);

      await ImageService.updateImage(imageId, userId, {
        status: 'error',
        error: errorMessage
      });
        } finally {
          this.activeGenerations.set(imageId, status);
        }

        return status;
      },
      'caption-generation',
      {
        retryOptions: {
          maxRetries: 2,
          baseDelay: 1000
        },
        metadata: { imageId: image.id, userId }
      }
    );
  }

  /**
   * Regenerate captions for specific providers
   */
  async regenerateCaptions(
    imageId: string,
    userId: string,
    providers?: string[],
    config?: CaptionGenerationConfig
  ): Promise<CaptionGenerationStatus> {
    // Get current image document
    const images = await ImageService.getImages(userId);
    const image = images.find(img => img.id === imageId);

    if (!image) {
      throw new Error(`Image with ID ${imageId} not found`);
    }

    // If no providers specified, use all available providers
    if (!providers || providers.length === 0) {
      providers = await this.proxyService.getAvailableProviders();
    }

    // Generate captions for specified providers
    return this.generateCaptions(image, userId, { ...config, providers });
  }

  /**
   * Regenerate caption for a single provider
   */
  async regenerateProvider(
    imageId: string,
    userId: string,
    modelId: string,
    config?: CaptionGenerationConfig
  ): Promise<CaptionGenerationStatus> {
    // Get current image document
    const images = await ImageService.getImages(userId);
    const image = images.find(img => img.id === imageId);

    if (!image) {
      throw new Error(`Image with ID ${imageId} not found`);
    }

    const finalConfig = { ...this.defaultConfig, ...config };

    // Initialize generation status
    const status: CaptionGenerationStatus = {
      imageId,
      status: 'processing',
      totalProviders: 1,
      completedProviders: 0,
      failedProviders: 0,
      errors: [],
      startTime: Date.now()
    };

    this.activeGenerations.set(imageId, status);

    try {
      // Update image status to processing
      await ImageService.updateImage(imageId, userId, {
        status: 'processing'
      });

      // Create caption request
      const request: CaptionRequest = {
        imageUrl: image.downloadURL,
        options: {
          maxTokens: 100,
          temperature: 0.7,
          systemPrompt: 'Describe this image for a machine learning dataset. Be concise and accurate.'
        }
      };

      // Call the specific provider
      const result = await this.callProviderWithRetry(modelId, request, finalConfig);

      // Get current candidates and update/add the new one
      const currentCandidates = [...image.candidates];
      const existingIndex = currentCandidates.findIndex(c => c.modelId === modelId);

      if (result.success && result.result) {
        const newCandidate = this.proxyService.resultToCandidate(result.result);
        
        if (existingIndex >= 0) {
          // Replace existing candidate
          currentCandidates[existingIndex] = newCandidate;
        } else {
          // Add new candidate
          currentCandidates.push(newCandidate);
        }

        status.status = 'complete';
        status.completedProviders = 1;
        
        await ImageService.updateImage(imageId, userId, {
          status: 'complete',
          candidates: currentCandidates
        });
      } else {
        // Update existing candidate with error or add error candidate
        const errorCandidate: CaptionCandidate = {
          modelId,
          caption: '',
          createdAt: Date.now(),
          error: result.error || 'Unknown error'
        };

        if (existingIndex >= 0) {
          currentCandidates[existingIndex] = errorCandidate;
        } else {
          currentCandidates.push(errorCandidate);
        }

        status.status = 'error';
        status.failedProviders = 1;
        status.errors.push(result.error || 'Unknown error');

        await ImageService.updateImage(imageId, userId, {
          status: currentCandidates.some(c => !c.error) ? 'complete' : 'error',
          candidates: currentCandidates,
          error: result.error
        });
      }

      status.endTime = Date.now();

    } catch (error) {
      status.status = 'error';
      status.endTime = Date.now();
      status.failedProviders = 1;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      status.errors.push(errorMessage);

      await ImageService.updateImage(imageId, userId, {
        status: 'error',
        error: errorMessage
      });
    } finally {
      this.activeGenerations.set(imageId, status);
    }

    return status;
  }

  /**
   * Generate captions with concurrency control and retry logic
   */
  private async generateWithConcurrencyControl(
    providers: string[],
    request: CaptionRequest,
    config: Required<CaptionGenerationConfig>,
    status: CaptionGenerationStatus
  ): Promise<ProviderAttempt[]> {
    const results: ProviderAttempt[] = [];
    const semaphore = new Semaphore(config.concurrency);

    // Create promises for all provider calls
    const promises = providers.map(async (provider) => {
      return semaphore.acquire(async () => {
        return this.callProviderWithRetry(provider, request, config);
      });
    });

    // Wait for all promises to complete
    const providerResults = await Promise.allSettled(promises);

    // Process results
    for (let i = 0; i < providerResults.length; i++) {
      const result = providerResults[i];
      const provider = providers[i];

      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          provider,
          attempt: 1,
          success: false,
          error: result.reason?.message || 'Unknown error',
          timestamp: Date.now()
        });
      }
    }

    // Update final status counts
    status.completedProviders = results.filter(r => r.success).length;
    status.failedProviders = results.filter(r => !r.success).length;

    return results;
  }

  /**
   * Call a provider with retry logic and circuit breaker
   */
  private async callProviderWithRetry(
    provider: string,
    request: CaptionRequest,
    config: Required<CaptionGenerationConfig>
  ): Promise<ProviderAttempt> {
    const circuitBreaker = this.getCircuitBreaker(provider);
    let lastError: string = '';

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        // Check circuit breaker state
        const breakerState = circuitBreaker.getState();
        if (breakerState.state === 'open') {
          throw new Error(`Circuit breaker is open for provider ${provider}. Last failure: ${new Date(breakerState.lastFailureTime).toISOString()}`);
        }

        // Execute with circuit breaker and timeout
        const result = await circuitBreaker.execute(async () => {
          return await withTimeout(
            this.proxyService.generateCaption(provider, request),
            config.timeout,
            `Provider ${provider} request timeout after ${config.timeout}ms`
          );
        });

        return {
          provider,
          attempt,
          success: true,
          result,
          timestamp: Date.now()
        };

      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        
        // Log the error for monitoring
        console.warn(`Caption generation attempt ${attempt} failed for provider ${provider}:`, lastError);
        
        // Don't retry on the last attempt
        if (attempt < config.maxRetries) {
          // Check if we should retry this type of error
          if (this.shouldRetryError(error instanceof Error ? error : new Error(lastError))) {
            // Exponential backoff with jitter
            const delay = config.retryDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            // Don't retry certain types of errors
            break;
          }
        }
      }
    }

    return {
      provider,
      attempt: config.maxRetries,
      success: false,
      error: lastError,
      timestamp: Date.now()
    };
  }

  /**
   * Determine if an error should be retried
   */
  private shouldRetryError(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // Don't retry authentication errors
    if (message.includes('auth') || message.includes('401') || message.includes('403')) {
      return false;
    }
    
    // Don't retry validation errors
    if (message.includes('400') || message.includes('bad request') || message.includes('invalid')) {
      return false;
    }
    
    // Don't retry rate limit errors immediately
    if (message.includes('429') || message.includes('rate limit')) {
      return false;
    }
    
    // Retry network errors, timeouts, and server errors
    return message.includes('network') || 
           message.includes('timeout') || 
           message.includes('500') || 
           message.includes('502') || 
           message.includes('503') || 
           message.includes('504') ||
           message.includes('circuit breaker');
  }

  /**
   * Get the current status of caption generation for an image
   */
  getGenerationStatus(imageId: string): CaptionGenerationStatus | null {
    return this.activeGenerations.get(imageId) || null;
  }

  /**
   * Get all active generation statuses
   */
  getAllGenerationStatuses(): CaptionGenerationStatus[] {
    return Array.from(this.activeGenerations.values());
  }

  /**
   * Clear completed generation status
   */
  clearGenerationStatus(imageId: string): void {
    this.activeGenerations.delete(imageId);
  }

  /**
   * Clear all generation statuses
   */
  clearAllGenerationStatuses(): void {
    this.activeGenerations.clear();
  }
}

/**
 * Simple semaphore implementation for concurrency control
 */
class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.permits > 0) {
        this.permits--;
        this.executeTask(task, resolve, reject);
      } else {
        this.waiting.push(() => {
          this.permits--;
          this.executeTask(task, resolve, reject);
        });
      }
    });
  }

  private async executeTask<T>(
    task: () => Promise<T>,
    resolve: (value: T) => void,
    reject: (reason: any) => void
  ): Promise<void> {
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.permits++;
      if (this.waiting.length > 0) {
        const next = this.waiting.shift();
        if (next) next();
      }
    }
  }
}