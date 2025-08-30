import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCaptionGeneration } from '../useCaptionGeneration';
import { CaptionOrchestrator } from '../../services/captionOrchestrator';
import { useAuth } from '../useAuth';
import { ImageDoc } from '../../types';

// Mock dependencies
vi.mock('../useAuth');
vi.mock('../../services/captionOrchestrator');

const mockUseAuth = vi.mocked(useAuth);
const MockedCaptionOrchestrator = vi.mocked(CaptionOrchestrator);

describe('useCaptionGeneration', () => {
  let mockUser: any;
  let mockOrchestrator: any;
  let mockImage: ImageDoc;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUser = { uid: 'test-user-1' };
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signInAnonymously: vi.fn(),
      signOut: vi.fn()
    });

    mockOrchestrator = {
      generateCaptions: vi.fn(),
      regenerateCaptions: vi.fn(),
      clearGenerationStatus: vi.fn(),
      clearAllGenerationStatuses: vi.fn()
    };
    MockedCaptionOrchestrator.mockImplementation(() => mockOrchestrator);

    mockImage = {
      id: 'test-image-1',
      filename: 'test.jpg',
      storagePath: 'uploads/user1/test.jpg',
      downloadURL: 'https://example.com/test.jpg',
      status: 'pending',
      candidates: [],
      selectedIndex: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateCaptions', () => {
    it('should generate captions for a single image', async () => {
      const mockStatus = {
        imageId: 'test-image-1',
        status: 'complete' as const,
        totalProviders: 2,
        completedProviders: 2,
        failedProviders: 0,
        errors: [],
        startTime: Date.now(),
        endTime: Date.now()
      };

      mockOrchestrator.generateCaptions.mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useCaptionGeneration());

      let generationResult: any;
      await act(async () => {
        generationResult = await result.current.generateCaptions(mockImage);
      });

      expect(generationResult).toEqual(mockStatus);
      expect(mockOrchestrator.generateCaptions).toHaveBeenCalledWith(
        mockImage,
        'test-user-1',
        undefined
      );
      expect(result.current.generationStatuses).toContainEqual(mockStatus);
    });

    it('should handle generation errors', async () => {
      mockOrchestrator.generateCaptions.mockRejectedValue(new Error('Generation failed'));

      const { result } = renderHook(() => useCaptionGeneration());

      let generationResult: any;
      await act(async () => {
        generationResult = await result.current.generateCaptions(mockImage);
      });

      expect(generationResult).toBeNull();
      expect(result.current.error).toBe('Generation failed');
    });

    it('should return null when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signInAnonymously: vi.fn(),
        signOut: vi.fn()
      });

      const { result } = renderHook(() => useCaptionGeneration());

      let generationResult: any;
      await act(async () => {
        generationResult = await result.current.generateCaptions(mockImage);
      });

      expect(generationResult).toBeNull();
      expect(result.current.error).toBe('User not authenticated or orchestrator not initialized');
    });
  });

  describe('generateCaptionsBatch', () => {
    it('should generate captions for multiple images', async () => {
      const mockImages = [
        { ...mockImage, id: 'image-1' },
        { ...mockImage, id: 'image-2' }
      ];

      const mockStatuses = [
        {
          imageId: 'image-1',
          status: 'complete' as const,
          totalProviders: 2,
          completedProviders: 2,
          failedProviders: 0,
          errors: [],
          startTime: Date.now(),
          endTime: Date.now()
        },
        {
          imageId: 'image-2',
          status: 'complete' as const,
          totalProviders: 2,
          completedProviders: 2,
          failedProviders: 0,
          errors: [],
          startTime: Date.now(),
          endTime: Date.now()
        }
      ];

      mockOrchestrator.generateCaptions
        .mockResolvedValueOnce(mockStatuses[0])
        .mockResolvedValueOnce(mockStatuses[1]);

      const { result } = renderHook(() => useCaptionGeneration());

      let batchResult: any;
      await act(async () => {
        batchResult = await result.current.generateCaptionsBatch(mockImages);
      });

      expect(batchResult).toHaveLength(2);
      expect(batchResult).toEqual(mockStatuses);
      expect(mockOrchestrator.generateCaptions).toHaveBeenCalledTimes(2);
    });

    it('should handle partial batch failures', async () => {
      const mockImages = [
        { ...mockImage, id: 'image-1' },
        { ...mockImage, id: 'image-2' }
      ];

      const mockStatus = {
        imageId: 'image-1',
        status: 'complete' as const,
        totalProviders: 2,
        completedProviders: 2,
        failedProviders: 0,
        errors: [],
        startTime: Date.now(),
        endTime: Date.now()
      };

      mockOrchestrator.generateCaptions
        .mockResolvedValueOnce(mockStatus)
        .mockRejectedValueOnce(new Error('Generation failed'));

      const { result } = renderHook(() => useCaptionGeneration());

      let batchResult: any;
      await act(async () => {
        batchResult = await result.current.generateCaptionsBatch(mockImages);
      });

      expect(batchResult).toHaveLength(2);
      expect(batchResult[0]).toEqual(mockStatus);
      expect(batchResult[1].status).toBe('error');
      expect(batchResult[1].errors).toContain('Generation failed');
    });
  });

  describe('regenerateCaptions', () => {
    it('should regenerate captions for specific providers', async () => {
      const mockStatus = {
        imageId: 'test-image-1',
        status: 'complete' as const,
        totalProviders: 1,
        completedProviders: 1,
        failedProviders: 0,
        errors: [],
        startTime: Date.now(),
        endTime: Date.now()
      };

      mockOrchestrator.regenerateCaptions.mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useCaptionGeneration());

      let regenerationResult: any;
      await act(async () => {
        regenerationResult = await result.current.regenerateCaptions(
          'test-image-1',
          ['openai']
        );
      });

      expect(regenerationResult).toEqual(mockStatus);
      expect(mockOrchestrator.regenerateCaptions).toHaveBeenCalledWith(
        'test-image-1',
        'test-user-1',
        ['openai'],
        undefined
      );
    });
  });

  describe('status management', () => {
    it('should track generation statuses', async () => {
      const mockStatus = {
        imageId: 'test-image-1',
        status: 'complete' as const,
        totalProviders: 2,
        completedProviders: 2,
        failedProviders: 0,
        errors: [],
        startTime: Date.now(),
        endTime: Date.now()
      };

      mockOrchestrator.generateCaptions.mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useCaptionGeneration());

      await act(async () => {
        await result.current.generateCaptions(mockImage);
      });

      expect(result.current.getGenerationStatus('test-image-1')).toEqual(mockStatus);
      expect(result.current.generationStatuses).toContainEqual(mockStatus);
    });

    it('should detect active generations', async () => {
      const processingStatus = {
        imageId: 'test-image-1',
        status: 'processing' as const,
        totalProviders: 2,
        completedProviders: 0,
        failedProviders: 0,
        errors: [],
        startTime: Date.now()
      };

      // Mock a processing status
      mockOrchestrator.generateCaptions.mockImplementation(async () => {
        // Return a processing status that never completes for this test
        return new Promise(() => {}); // Never resolves
      });

      const { result } = renderHook(() => useCaptionGeneration());

      // Initially no active generations
      expect(result.current.hasActiveGenerations()).toBe(false);

      // Start a generation (but don't await it)
      act(() => {
        result.current.generateCaptions(mockImage);
      });

      // The generation should be marked as active
      expect(result.current.isGenerating).toBe(true);
    });

    it('should provide generation statistics', async () => {
      const { result } = renderHook(() => useCaptionGeneration());

      const mockStatuses = [
        {
          imageId: 'image-1',
          status: 'complete' as const,
          totalProviders: 2,
          completedProviders: 2,
          failedProviders: 0,
          errors: [],
          startTime: Date.now(),
          endTime: Date.now()
        },
        {
          imageId: 'image-2',
          status: 'processing' as const,
          totalProviders: 2,
          completedProviders: 1,
          failedProviders: 0,
          errors: [],
          startTime: Date.now()
        },
        {
          imageId: 'image-3',
          status: 'error' as const,
          totalProviders: 2,
          completedProviders: 0,
          failedProviders: 2,
          errors: ['Provider error'],
          startTime: Date.now(),
          endTime: Date.now()
        }
      ];

      // Simulate multiple statuses
      mockOrchestrator.generateCaptions
        .mockResolvedValueOnce(mockStatuses[0])
        .mockResolvedValueOnce(mockStatuses[1])
        .mockResolvedValueOnce(mockStatuses[2]);

      await act(async () => {
        await result.current.generateCaptions({ ...mockImage, id: 'image-1' });
        await result.current.generateCaptions({ ...mockImage, id: 'image-2' });
        await result.current.generateCaptions({ ...mockImage, id: 'image-3' });
      });

      const stats = result.current.getGenerationStats();
      expect(stats.total).toBe(3);
      expect(stats.complete).toBe(1);
      expect(stats.processing).toBe(1);
      expect(stats.error).toBe(1);
      expect(stats.pending).toBe(0);
    });

    it('should clear generation statuses', async () => {
      const mockStatus = {
        imageId: 'test-image-1',
        status: 'complete' as const,
        totalProviders: 2,
        completedProviders: 2,
        failedProviders: 0,
        errors: [],
        startTime: Date.now(),
        endTime: Date.now()
      };

      mockOrchestrator.generateCaptions.mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useCaptionGeneration());

      // Generate captions to create status
      await act(async () => {
        await result.current.generateCaptions(mockImage);
      });

      expect(result.current.getGenerationStatus('test-image-1')).toBeTruthy();

      // Clear specific status
      act(() => {
        result.current.clearGenerationStatus('test-image-1');
      });

      expect(result.current.getGenerationStatus('test-image-1')).toBeNull();
      expect(mockOrchestrator.clearGenerationStatus).toHaveBeenCalledWith('test-image-1');
    });

    it('should clear all generation statuses', async () => {
      const { result } = renderHook(() => useCaptionGeneration());

      act(() => {
        result.current.clearAllGenerationStatuses();
      });

      expect(result.current.generationStatuses).toHaveLength(0);
      expect(mockOrchestrator.clearAllGenerationStatuses).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should clear errors', async () => {
      mockOrchestrator.generateCaptions.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useCaptionGeneration());

      await act(async () => {
        await result.current.generateCaptions(mockImage);
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});