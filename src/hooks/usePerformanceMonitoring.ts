import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  imageCount: number;
  timestamp: number;
}

interface UsePerformanceMonitoringOptions {
  enabled?: boolean;
  sampleRate?: number; // 0-1, percentage of measurements to record
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

/**
 * Hook for monitoring key performance metrics
 * Requirements: 10.1, 10.2, 10.3 - Performance monitoring for key metrics
 */
export function usePerformanceMonitoring({
  enabled = true,
  sampleRate = 0.1, // Sample 10% of renders by default
  onMetrics
}: UsePerformanceMonitoringOptions = {}) {
  const renderStartTime = useRef<number>(0);
  const lastImageCount = useRef<number>(0);
  const metricsBuffer = useRef<PerformanceMetrics[]>([]);

  // Start performance measurement
  const startMeasurement = useCallback(() => {
    if (!enabled || Math.random() > sampleRate) return;
    renderStartTime.current = performance.now();
  }, [enabled, sampleRate]);

  // End performance measurement and record metrics
  const endMeasurement = useCallback((imageCount: number = 0) => {
    if (!enabled || renderStartTime.current === 0) return;

    const renderTime = performance.now() - renderStartTime.current;
    renderStartTime.current = 0;

    // Get memory usage if available
    let memoryUsage: number | undefined;
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = memory.usedJSHeapSize;
    }

    const metrics: PerformanceMetrics = {
      renderTime,
      memoryUsage,
      imageCount,
      timestamp: Date.now()
    };

    // Buffer metrics to avoid excessive callbacks
    metricsBuffer.current.push(metrics);
    
    // Flush buffer every 10 measurements or when image count changes significantly
    if (
      metricsBuffer.current.length >= 10 || 
      Math.abs(imageCount - lastImageCount.current) > 5
    ) {
      flushMetrics();
    }

    lastImageCount.current = imageCount;
  }, [enabled]);

  // Flush buffered metrics
  const flushMetrics = useCallback(() => {
    if (metricsBuffer.current.length === 0) return;

    const metrics = [...metricsBuffer.current];
    metricsBuffer.current = [];

    // Calculate aggregated metrics
    const avgRenderTime = metrics.reduce((sum, m) => sum + m.renderTime, 0) / metrics.length;
    const maxRenderTime = Math.max(...metrics.map(m => m.renderTime));
    const lastMemoryUsage = metrics[metrics.length - 1].memoryUsage;
    const lastImageCount = metrics[metrics.length - 1].imageCount;

    const aggregatedMetrics: PerformanceMetrics = {
      renderTime: avgRenderTime,
      memoryUsage: lastMemoryUsage,
      imageCount: lastImageCount,
      timestamp: Date.now()
    };

    onMetrics?.(aggregatedMetrics);

    // Log performance warnings
    if (maxRenderTime > 100) {
      console.warn(`Slow render detected: ${maxRenderTime.toFixed(2)}ms`);
    }

    if (lastMemoryUsage && lastMemoryUsage > 100 * 1024 * 1024) { // 100MB
      console.warn(`High memory usage detected: ${(lastMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
  }, [onMetrics]);

  // Flush metrics on unmount
  useEffect(() => {
    return () => {
      flushMetrics();
    };
  }, [flushMetrics]);

  return {
    startMeasurement,
    endMeasurement,
    flushMetrics
  };
}

/**
 * Hook for monitoring caption generation performance
 */
export function useCaptionPerformanceMonitoring() {
  const activeRequests = useRef<Map<string, number>>(new Map());

  const startCaptionGeneration = useCallback((imageId: string) => {
    activeRequests.current.set(imageId, performance.now());
  }, []);

  const endCaptionGeneration = useCallback((imageId: string, success: boolean = true) => {
    const startTime = activeRequests.current.get(imageId);
    if (!startTime) return;

    const duration = performance.now() - startTime;
    activeRequests.current.delete(imageId);

    // Log performance metrics
    console.log(`Caption generation for ${imageId}: ${duration.toFixed(2)}ms (${success ? 'success' : 'failed'})`);

    // Warn on slow caption generation
    if (duration > 10000) { // 10 seconds
      console.warn(`Slow caption generation: ${duration.toFixed(2)}ms for image ${imageId}`);
    }

    return duration;
  }, []);

  const getActiveRequestCount = useCallback(() => {
    return activeRequests.current.size;
  }, []);

  return {
    startCaptionGeneration,
    endCaptionGeneration,
    getActiveRequestCount
  };
}

/**
 * Hook for monitoring upload performance
 */
export function useUploadPerformanceMonitoring() {
  const uploadMetrics = useRef<Map<string, { startTime: number; fileSize: number }>>(new Map());

  const startUpload = useCallback((fileId: string, fileSize: number) => {
    uploadMetrics.current.set(fileId, {
      startTime: performance.now(),
      fileSize
    });
  }, []);

  const endUpload = useCallback((fileId: string, success: boolean = true) => {
    const metrics = uploadMetrics.current.get(fileId);
    if (!metrics) return;

    const duration = performance.now() - metrics.startTime;
    const throughput = metrics.fileSize / (duration / 1000); // bytes per second
    
    uploadMetrics.current.delete(fileId);

    console.log(`Upload ${fileId}: ${duration.toFixed(2)}ms, ${(throughput / 1024).toFixed(2)} KB/s (${success ? 'success' : 'failed'})`);

    // Warn on slow uploads
    if (throughput < 50 * 1024) { // Less than 50 KB/s
      console.warn(`Slow upload detected: ${(throughput / 1024).toFixed(2)} KB/s for file ${fileId}`);
    }

    return { duration, throughput };
  }, []);

  return {
    startUpload,
    endUpload
  };
}