import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorRecoveryService, executeWithRecovery, executeBatchWithRecovery } from '../errorRecoveryService';

describe('ErrorRecoveryService', () => {
  let service: ErrorRecoveryService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = new ErrorRecoveryService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('executeWithRecovery', () => {
    it('should execute function successfully on first try', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      const result = await service.executeWithRecovery('test-op', mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure with exponential backoff', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');

      const resultPromise = service.executeWithRecovery('test-op', mockFn, {
        maxRetries: 3,
        baseDelay: 100
      });

      // Fast-forward through retries
      await vi.runAllTimersAsync();

      const result = await resultPromise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const error = new Error('Persistent error');
      const mockFn = vi.fn().mockRejectedValue(error);

      const resultPromise = service.executeWithRecovery('test-op', mockFn, {
        maxRetries: 2,
        baseDelay: 100
      });

      await vi.runAllTimersAsync();

      await expect(resultPromise).rejects.toThrow('Persistent error');
      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should use custom retry condition', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('Retryable error'))
        .mockRejectedValueOnce(new Error('Non-retryable error'));

      const shouldRetry = (error: Error) => error.message === 'Retryable error';

      const resultPromise = service.executeWithRecovery('test-op', mockFn, {
        maxRetries: 3,
        baseDelay: 100,
        shouldRetry
      });

      await vi.runAllTimersAsync();

      await expect(resultPromise).rejects.toThrow('Non-retryable error');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should apply jitter to delay', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValue('success');

      // Mock Math.random to return consistent value
      const originalRandom = Math.random;
      Math.random = vi.fn(() => 0.5);

      const resultPromise = service.executeWithRecovery('test-op', mockFn, {
        maxRetries: 1,
        baseDelay: 100,
        jitter: true
      });

      await vi.runAllTimersAsync();
      await resultPromise;

      Math.random = originalRandom;
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('executeBatchWithRecovery', () => {
    it('should execute all operations successfully', async () => {
      const operations = [
        { id: 'op1', fn: vi.fn().mockResolvedValue('result1') },
        { id: 'op2', fn: vi.fn().mockResolvedValue('result2') },
        { id: 'op3', fn: vi.fn().mockResolvedValue('result3') }
      ];

      const results = await service.executeBatchWithRecovery(operations);

      expect(results).toEqual([
        { id: 'op1', success: true, result: 'result1' },
        { id: 'op2', success: true, result: 'result2' },
        { id: 'op3', success: true, result: 'result3' }
      ]);
    });

    it('should handle partial failures', async () => {
      const operations = [
        { id: 'op1', fn: vi.fn().mockResolvedValue('result1') },
        { id: 'op2', fn: vi.fn().mockRejectedValue(new Error('Failed')) },
        { id: 'op3', fn: vi.fn().mockResolvedValue('result3') }
      ];

      const results = await service.executeBatchWithRecovery(operations);

      expect(results).toEqual([
        { id: 'op1', success: true, result: 'result1' },
        { id: 'op2', success: false, error: expect.any(Error) },
        { id: 'op3', success: true, result: 'result3' }
      ]);
    });

    it('should respect concurrency limit', async () => {
      let concurrentCalls = 0;
      let maxConcurrentCalls = 0;

      const createOperation = (id: string) => ({
        id,
        fn: vi.fn().mockImplementation(async () => {
          concurrentCalls++;
          maxConcurrentCalls = Math.max(maxConcurrentCalls, concurrentCalls);
          await new Promise(resolve => setTimeout(resolve, 100));
          concurrentCalls--;
          return `result${id}`;
        })
      });

      const operations = Array.from({ length: 10 }, (_, i) => 
        createOperation(i.toString())
      );

      const resultPromise = service.executeBatchWithRecovery(operations, {
        concurrency: 3
      });

      await vi.runAllTimersAsync();
      await resultPromise;

      expect(maxConcurrentCalls).toBeLessThanOrEqual(3);
    });

    it('should fail fast when enabled', async () => {
      const operations = [
        { id: 'op1', fn: vi.fn().mockResolvedValue('result1') },
        { id: 'op2', fn: vi.fn().mockRejectedValue(new Error('Failed')) },
        { id: 'op3', fn: vi.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve('result3'), 1000))
        )}
      ];

      const resultPromise = service.executeBatchWithRecovery(operations, {
        failFast: true
      });

      await vi.runAllTimersAsync();

      await expect(resultPromise).rejects.toThrow('Failed');
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit after failure threshold', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Service error'));

      // Trigger failures to open circuit
      for (let i = 0; i < 5; i++) {
        try {
          await service.executeWithRecovery('circuit-test', mockFn, {
            maxRetries: 0,
            circuitBreaker: {
              failureThreshold: 3,
              resetTimeout: 1000
            }
          });
        } catch (e) {
          // Expected failures
        }
      }

      // Circuit should be open now
      await expect(
        service.executeWithRecovery('circuit-test', mockFn, {
          maxRetries: 0,
          circuitBreaker: {
            failureThreshold: 3,
            resetTimeout: 1000
          }
        })
      ).rejects.toThrow('Circuit breaker is open');
    });

    it('should reset circuit after timeout', async () => {
      const mockFn = vi.fn()
        .mockRejectedValue(new Error('Service error'))
        .mockRejectedValue(new Error('Service error'))
        .mockRejectedValue(new Error('Service error'))
        .mockResolvedValue('success');

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await service.executeWithRecovery('circuit-reset-test', mockFn, {
            maxRetries: 0,
            circuitBreaker: {
              failureThreshold: 3,
              resetTimeout: 100
            }
          });
        } catch (e) {
          // Expected failures
        }
      }

      // Wait for circuit to reset
      vi.advanceTimersByTime(150);

      // Should work now
      const result = await service.executeWithRecovery('circuit-reset-test', mockFn, {
        maxRetries: 0,
        circuitBreaker: {
          failureThreshold: 3,
          resetTimeout: 100
        }
      });

      expect(result).toBe('success');
    });
  });

  describe('Recovery Strategies', () => {
    it('should register and use custom recovery strategy', async () => {
      const customStrategy = vi.fn().mockResolvedValue('recovered');
      service.registerStrategy('custom', customStrategy);

      const mockFn = vi.fn().mockRejectedValue(new Error('Test error'));

      const result = await service.executeWithRecovery('test-op', mockFn, {
        maxRetries: 0,
        recoveryStrategy: 'custom'
      });

      expect(result).toBe('recovered');
      expect(customStrategy).toHaveBeenCalledWith(expect.any(Error), 'test-op');
    });

    it('should fall back to original error if strategy fails', async () => {
      const failingStrategy = vi.fn().mockRejectedValue(new Error('Strategy failed'));
      service.registerStrategy('failing', failingStrategy);

      const mockFn = vi.fn().mockRejectedValue(new Error('Original error'));

      await expect(
        service.executeWithRecovery('test-op', mockFn, {
          maxRetries: 0,
          recoveryStrategy: 'failing'
        })
      ).rejects.toThrow('Original error');
    });
  });
});

describe('Convenience functions', () => {
  it('should export executeWithRecovery function', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');

    const result = await executeWithRecovery('test', mockFn);

    expect(result).toBe('success');
  });

  it('should export executeBatchWithRecovery function', async () => {
    const operations = [
      { id: 'op1', fn: vi.fn().mockResolvedValue('result1') }
    ];

    const results = await executeBatchWithRecovery(operations);

    expect(results).toEqual([
      { id: 'op1', success: true, result: 'result1' }
    ]);
  });
});