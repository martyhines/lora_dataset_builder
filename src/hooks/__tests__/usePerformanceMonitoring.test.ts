import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  usePerformanceMonitoring, 
  useCaptionPerformanceMonitoring, 
  useUploadPerformanceMonitoring 
} from '../usePerformanceMonitoring';

// Mock performance.now
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024 // 50MB
    }
  },
  writable: true
});

describe('usePerformanceMonitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(1000);
  });

  it('should start and end measurements', () => {
    const onMetrics = vi.fn();
    const { result } = renderHook(() => 
      usePerformanceMonitoring({ 
        enabled: true, 
        sampleRate: 1.0, // Always sample for testing
        onMetrics 
      })
    );

    act(() => {
      result.current.startMeasurement();
    });

    mockPerformanceNow.mockReturnValue(1100); // 100ms later

    act(() => {
      result.current.endMeasurement(5);
      // Manually flush metrics for testing
      result.current.flushMetrics();
    });

    expect(onMetrics).toHaveBeenCalledWith(
      expect.objectContaining({
        renderTime: 100,
        imageCount: 5,
        memoryUsage: 50 * 1024 * 1024
      })
    );
  });

  it('should not measure when disabled', () => {
    const onMetrics = vi.fn();
    const { result } = renderHook(() => 
      usePerformanceMonitoring({ 
        enabled: false, 
        onMetrics 
      })
    );

    act(() => {
      result.current.startMeasurement();
      result.current.endMeasurement(5);
    });

    expect(onMetrics).not.toHaveBeenCalled();
  });

  it('should respect sample rate', () => {
    const onMetrics = vi.fn();
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // Above 0.1 sample rate
    
    const { result } = renderHook(() => 
      usePerformanceMonitoring({ 
        enabled: true, 
        sampleRate: 0.1,
        onMetrics 
      })
    );

    act(() => {
      result.current.startMeasurement();
      result.current.endMeasurement(5);
    });

    expect(onMetrics).not.toHaveBeenCalled();
  });
});

describe('useCaptionPerformanceMonitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(1000);
  });

  it('should track caption generation performance', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { result } = renderHook(() => useCaptionPerformanceMonitoring());

    act(() => {
      result.current.startCaptionGeneration('image-1');
    });

    mockPerformanceNow.mockReturnValue(2000); // 1000ms later

    act(() => {
      result.current.endCaptionGeneration('image-1', true);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Caption generation for image-1: 1000.00ms (success)')
    );

    consoleSpy.mockRestore();
  });

  it('should warn on slow caption generation', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useCaptionPerformanceMonitoring());

    act(() => {
      result.current.startCaptionGeneration('image-1');
    });

    mockPerformanceNow.mockReturnValue(12000); // 11000ms later (> 10s)

    act(() => {
      result.current.endCaptionGeneration('image-1', true);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Slow caption generation: 11000.00ms for image image-1')
    );

    consoleSpy.mockRestore();
  });

  it('should track active request count', () => {
    const { result } = renderHook(() => useCaptionPerformanceMonitoring());

    expect(result.current.getActiveRequestCount()).toBe(0);

    act(() => {
      result.current.startCaptionGeneration('image-1');
      result.current.startCaptionGeneration('image-2');
    });

    expect(result.current.getActiveRequestCount()).toBe(2);

    act(() => {
      result.current.endCaptionGeneration('image-1', true);
    });

    expect(result.current.getActiveRequestCount()).toBe(1);
  });
});

describe('useUploadPerformanceMonitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(1000);
  });

  it('should track upload performance', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { result } = renderHook(() => useUploadPerformanceMonitoring());

    const fileSize = 1024 * 1024; // 1MB

    act(() => {
      result.current.startUpload('file-1', fileSize);
    });

    mockPerformanceNow.mockReturnValue(2000); // 1000ms later

    act(() => {
      result.current.endUpload('file-1', true);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Upload file-1: 1000.00ms, 1024.00 KB/s (success)')
    );

    consoleSpy.mockRestore();
  });

  it('should warn on slow uploads', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useUploadPerformanceMonitoring());

    const fileSize = 1024; // 1KB
    
    act(() => {
      result.current.startUpload('file-1', fileSize);
    });

    mockPerformanceNow.mockReturnValue(2000); // 1000ms later (very slow for 1KB)

    act(() => {
      result.current.endUpload('file-1', true);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Slow upload detected: 1.00 KB/s for file file-1')
    );

    consoleSpy.mockRestore();
  });
});