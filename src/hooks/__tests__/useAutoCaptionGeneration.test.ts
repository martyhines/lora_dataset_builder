import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoCaptionGeneration } from '../useAutoCaptionGeneration';
import { useCaptionGeneration } from '../useCaptionGeneration';
import { ImageDoc } from '../../types';

// Mock dependencies
vi.mock('../useCaptionGeneration');

const mockUseCaptionGeneration = vi.mocked(useCaptionGeneration);

describe('useAutoCaptionGeneration', () => {
  let mockCaptionGeneration: any;
  let mockImages: ImageDoc[];

  beforeEach(() => {
    vi.clearAllMocks();

    mockCaptionGeneration = {
      generateCaptions: vi.fn(),
      generateCaptionsBatch: vi.fn(),
      isGenerating: false,
      getGenerationStatus: vi.fn(),
      error: null
    };

    mockUseCaptionGeneration.mockReturnValue(mockCaptionGeneration);

    mockImages = [
      {
        id: 'image-1',
        filename: 'test1.jpg',
        storagePath: 'uploads/user1/test1.jpg',
        downloadURL: 'https://example.com/test1.jpg',
        status: 'pending',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'image-2',
        filename: 'test2.jpg',
        storagePath: 'uploads/user1/test2.jpg',
        downloadURL: 'https://example.com/test2.jpg',
        status: 'pending',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('basic functionality', () => {
    it('should return hook functions and state', () => {
      const { result } = renderHook(() => 
        useAutoCaptionGeneration(mockImages, { enabled: true })
      );

      expect(result.current).toHaveProperty('isAutoGenerating');
      expect(result.current).toHaveProperty('autoGenerationError');
      expect(result.current).toHaveProperty('triggerManualGeneration');
      expect(result.current).toHaveProperty('resetProcessedImages');
      expect(result.current).toHaveProperty('getAutoGenerationStats');
      expect(result.current).toHaveProperty('getGenerationStatus');
    });

    it('should not trigger generation when disabled', () => {
      renderHook(() => 
        useAutoCaptionGeneration(mockImages, { enabled: false })
      );

      expect(mockCaptionGeneration.generateCaptionsBatch).not.toHaveBeenCalled();
      expect(mockCaptionGeneration.generateCaptions).not.toHaveBeenCalled();
    });

    it('should filter out images that do not need captions', () => {
      const imagesWithMixedStatus: ImageDoc[] = [
        { ...mockImages[0], status: 'pending' }, // Should be processed
        { ...mockImages[1], status: 'complete', candidates: [{ modelId: 'test', caption: 'test', createdAt: Date.now() }] }, // Should be skipped
        { 
          id: 'image-3',
          filename: 'test3.jpg',
          storagePath: 'uploads/user1/test3.jpg',
          downloadURL: 'https://example.com/test3.jpg',
          status: 'error',
          candidates: [],
          selectedIndex: null,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }, // Should be skipped (error status)
        {
          id: 'image-4',
          filename: 'test4.jpg',
          storagePath: 'uploads/user1/test4.jpg',
          downloadURL: 'https://example.com/test4.jpg',
          status: 'processing',
          candidates: [],
          selectedIndex: null,
          createdAt: Date.now(),
          updatedAt: Date.now()
        } // Should be skipped (processing)
      ];

      const { result } = renderHook(() => 
        useAutoCaptionGeneration(imagesWithMixedStatus, { enabled: true })
      );

      const stats = result.current.getAutoGenerationStats();
      expect(stats.totalImages).toBe(4);
      expect(stats.pendingGeneration).toBe(1); // Only the pending image should need processing
    });
  });

  describe('manual generation', () => {
    it('should trigger manual generation for specific images', async () => {
      mockCaptionGeneration.generateCaptions.mockResolvedValue({});

      const { result } = renderHook(() => 
        useAutoCaptionGeneration(mockImages, { enabled: true })
      );

      await act(async () => {
        await result.current.triggerManualGeneration(['image-1']);
      });

      // Should call generateCaptions for single image
      expect(mockCaptionGeneration.generateCaptions).toHaveBeenCalledWith(
        mockImages[0],
        expect.any(Object)
      );
    });

    it('should handle manual generation for non-existent images', async () => {
      const { result } = renderHook(() => 
        useAutoCaptionGeneration(mockImages, { enabled: true })
      );

      await act(async () => {
        await result.current.triggerManualGeneration(['non-existent']);
      });

      expect(mockCaptionGeneration.generateCaptionsBatch).not.toHaveBeenCalled();
    });
  });

  describe('statistics and status', () => {
    it('should provide accurate auto-generation statistics', () => {
      const imagesWithMixedStatus: ImageDoc[] = [
        { ...mockImages[0], status: 'pending' },
        { ...mockImages[1], status: 'complete', candidates: [{ modelId: 'test', caption: 'test', createdAt: Date.now() }] }
      ];

      const { result } = renderHook(() => 
        useAutoCaptionGeneration(imagesWithMixedStatus, { enabled: true })
      );

      const stats = result.current.getAutoGenerationStats();

      expect(stats.totalImages).toBe(2);
      expect(stats.pendingGeneration).toBe(1);
      expect(stats.isProcessing).toBe(false);
      expect(stats.hasError).toBe(false);
    });

    it('should reflect processing state from caption generation hook', () => {
      mockCaptionGeneration.isGenerating = true;

      const { result } = renderHook(() => 
        useAutoCaptionGeneration(mockImages, { enabled: true })
      );

      expect(result.current.isAutoGenerating).toBe(true);

      const stats = result.current.getAutoGenerationStats();
      expect(stats.isProcessing).toBe(true);
    });

    it('should reflect error state from caption generation hook', () => {
      mockCaptionGeneration.error = 'Test error';

      const { result } = renderHook(() => 
        useAutoCaptionGeneration(mockImages, { enabled: true })
      );

      expect(result.current.autoGenerationError).toBe('Test error');

      const stats = result.current.getAutoGenerationStats();
      expect(stats.hasError).toBe(true);
    });
  });

  describe('utility functions', () => {
    it('should provide reset functionality', () => {
      const { result } = renderHook(() => 
        useAutoCaptionGeneration(mockImages, { enabled: true })
      );

      // Should not throw when calling reset
      act(() => {
        result.current.resetProcessedImages();
      });

      expect(result.current.resetProcessedImages).toBeDefined();
    });

    it('should provide generation status access', () => {
      const { result } = renderHook(() => 
        useAutoCaptionGeneration(mockImages, { enabled: true })
      );

      const status = result.current.getGenerationStatus('image-1');
      expect(mockCaptionGeneration.getGenerationStatus).toHaveBeenCalledWith('image-1');
    });
  });


});