/**
 * Error Recovery Service
 * Requirements 9.4, 9.5: Error recovery flows for network and API failures
 */

import { withRetry, withBatchRetry, CircuitBreaker } from '../utils/errorHandling';
import type { RetryOptions } from '../utils/errorHandling';

export interface RecoveryStrategy {
  id: string;
  name: string;
  description: string;
  execute: () => Promise<void>;
  canRecover: (error: Error) => boolean;
}

export interface ErrorContext {
  operation: string;
  timestamp: number;
  error: Error;
  metadata?: Record<string, any>;
}

export class ErrorRecoveryService {
  private strategies: Map<string, RecoveryStrategy> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private errorHistory: ErrorContext[] = [];
  private maxHistorySize = 100;

  constructor() {
    this.initializeDefaultStrategies();
  }

  /**
   * Register a recovery strategy
   */
  registerStrategy(strategy: RecoveryStrategy) {
    this.strategies.set(strategy.id, strategy);
  }

  /**
   * Execute an operation with automatic error recovery
   */
  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    operationName: string,
    options: {
      retryOptions?: RetryOptions;
      useCircuitBreaker?: boolean;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<T> {
    const { retryOptions, useCircuitBreaker = false, metadata } = options;

    try {
      if (useCircuitBreaker) {
        const breaker = this.getCircuitBreaker(operationName);
        return await breaker.execute(operation);
      } else {
        return await withRetry(operation, {
          ...retryOptions,
          onRetry: (error, attempt) => {
            this.recordError(operationName, error, metadata);
            retryOptions?.onRetry?.(error, attempt);
          }
        });
      }
    } catch (error) {
      const errorContext = this.recordError(operationName, error as Error, metadata);
      
      // Try to recover from the error
      const recovered = await this.attemptRecovery(errorContext);
      if (recovered) {
        // Retry the operation after recovery
        return await operation();
      }
      
      throw error;
    }
  }

  /**
   * Execute batch operations with recovery
   */
  async executeBatchWithRecovery<TInput, TOutput>(
    items: TInput[],
    operation: (item: TInput) => Promise<TOutput>,
    operationName: string,
    options: {
      retryOptions?: RetryOptions;
      concurrency?: number;
      metadata?: Record<string, any>;
    } = {}
  ) {
    const { retryOptions, concurrency, metadata } = options;

    return await withBatchRetry(
      items,
      async (item) => {
        return await this.executeWithRecovery(
          () => operation(item),
          operationName,
          { retryOptions, metadata: { ...metadata, item } }
        );
      },
      { ...retryOptions, concurrency }
    );
  }

  /**
   * Get error statistics and patterns
   */
  getErrorStats(timeWindowMs = 3600000) { // Default: 1 hour
    const cutoff = Date.now() - timeWindowMs;
    const recentErrors = this.errorHistory.filter(e => e.timestamp > cutoff);
    
    const errorsByOperation = new Map<string, number>();
    const errorsByType = new Map<string, number>();
    
    recentErrors.forEach(error => {
      errorsByOperation.set(
        error.operation,
        (errorsByOperation.get(error.operation) || 0) + 1
      );
      
      errorsByType.set(
        error.error.name,
        (errorsByType.get(error.error.name) || 0) + 1
      );
    });

    return {
      totalErrors: recentErrors.length,
      errorsByOperation: Object.fromEntries(errorsByOperation),
      errorsByType: Object.fromEntries(errorsByType),
      timeWindow: timeWindowMs,
      oldestError: recentErrors[0]?.timestamp,
      newestError: recentErrors[recentErrors.length - 1]?.timestamp
    };
  }

  /**
   * Check if the system is experiencing widespread issues
   */
  isSystemDegraded(thresholds = { errorRate: 0.1, timeWindowMs: 300000 }): boolean {
    const stats = this.getErrorStats(thresholds.timeWindowMs);
    const errorRate = stats.totalErrors / (thresholds.timeWindowMs / 1000); // errors per second
    return errorRate > thresholds.errorRate;
  }

  /**
   * Get circuit breaker status for all operations
   */
  getCircuitBreakerStatus() {
    const status: Record<string, any> = {};
    this.circuitBreakers.forEach((breaker, operation) => {
      status[operation] = breaker.getState();
    });
    return status;
  }

  private initializeDefaultStrategies() {
    // Network connectivity recovery
    this.registerStrategy({
      id: 'network-recovery',
      name: 'Network Recovery',
      description: 'Attempt to restore network connectivity',
      canRecover: (error) => error.message.includes('Network') || error.message.includes('fetch'),
      execute: async () => {
        // Wait for network to potentially recover
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test connectivity with a simple request
        try {
          await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' });
        } catch {
          throw new Error('Network connectivity not restored');
        }
      }
    });

    // Firebase service recovery
    this.registerStrategy({
      id: 'firebase-recovery',
      name: 'Firebase Service Recovery',
      description: 'Attempt to restore Firebase connection',
      canRecover: (error) => error.message.includes('Firebase') || error.message.includes('firestore'),
      execute: async () => {
        // Clear any cached Firebase state and reinitialize
        // This would depend on your Firebase setup
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });

    // Authentication recovery
    this.registerStrategy({
      id: 'auth-recovery',
      name: 'Authentication Recovery',
      description: 'Attempt to restore authentication',
      canRecover: (error) => error.message.includes('auth') || error.message.includes('401'),
      execute: async () => {
        // Trigger re-authentication
        // This would integrate with your auth system
        throw new Error('Authentication recovery requires user intervention');
      }
    });

    // Memory cleanup recovery
    this.registerStrategy({
      id: 'memory-recovery',
      name: 'Memory Cleanup',
      description: 'Free up memory resources',
      canRecover: (error) => error.message.includes('memory') || error.message.includes('heap'),
      execute: async () => {
        // Trigger garbage collection if available
        if (window.gc) {
          window.gc();
        }
        
        // Clear caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(name => caches.delete(name))
          );
        }
      }
    });
  }

  private recordError(operation: string, error: Error, metadata?: Record<string, any>): ErrorContext {
    const errorContext: ErrorContext = {
      operation,
      timestamp: Date.now(),
      error,
      metadata
    };

    this.errorHistory.push(errorContext);
    
    // Trim history if it gets too large
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }

    return errorContext;
  }

  private async attemptRecovery(errorContext: ErrorContext): Promise<boolean> {
    const applicableStrategies = Array.from(this.strategies.values())
      .filter(strategy => strategy.canRecover(errorContext.error));

    for (const strategy of applicableStrategies) {
      try {
        console.log(`Attempting recovery with strategy: ${strategy.name}`);
        await strategy.execute();
        console.log(`Recovery successful with strategy: ${strategy.name}`);
        return true;
      } catch (recoveryError) {
        console.warn(`Recovery failed with strategy ${strategy.name}:`, recoveryError);
      }
    }

    return false;
  }

  private getCircuitBreaker(operation: string): CircuitBreaker {
    if (!this.circuitBreakers.has(operation)) {
      this.circuitBreakers.set(operation, new CircuitBreaker());
    }
    return this.circuitBreakers.get(operation)!;
  }
}

// Global instance
export const errorRecoveryService = new ErrorRecoveryService();

// Convenience functions for common operations
export const executeWithRecovery = errorRecoveryService.executeWithRecovery.bind(errorRecoveryService);
export const executeBatchWithRecovery = errorRecoveryService.executeBatchWithRecovery.bind(errorRecoveryService);