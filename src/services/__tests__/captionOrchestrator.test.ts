import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CaptionOrchestrator } from '../captionOrchestrator';
import { CaptionProxyService } from '../captionProxyService';
import { ImageService } from '../imageService';
import { ImageDoc, CaptionCandidate } from '../../types';

// Mock the services
vi.mock('../captionProxyService');
vi.mock('../imageService');

const MockedCaptionProxyService = vi.mocked(CaptionProxyService);
const MockedImageService = vi.mocked(ImageService);

describe('CaptionOrchestrator', () => {
  let orchestrator: CaptionOrchestrator;
  let mockProxyService: any;
  let mockImage: ImageDoc;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock proxy service
    mockProxyService = {
      getAvailableProviders: vi.fn(),
      generateCaption: vi.fn(),
      resultToCandidate: vi.fn()
    };
    MockedCaptionProxyService.mockImplementation(() => mockProxyService);

    // Setup mock image
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

    orchestrator = new CaptionOrchestrator({
      maxRetries: 1, // Reduce retries to make tests more predictable
      retryDelay: 100,
      timeout: 5000,
      concurrency: 2
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateCaptions', () => {
    it('should generate captions from multiple providers successfully', async () => {
      // Setup mocks
      const providers = ['openai', 'gemini'];
      const mockResults = [
        { modelId: 'openai:gpt-4o-mini', caption: 'OpenAI caption', latency: 1000 },
        { modelId: 'gemini:pro-vision', caption: 'Gemini caption', latency: 1200 }
      ];
      const mockCandidates: CaptionCandidate[] = [
        { modelId: 'openai:gpt-4o-mini', caption: 'OpenAI caption', createdAt: Date.now(), latencyMs: 1000 },
        { modelId: 'gemini:pro-vision', caption: 'Gemini caption', createdAt: Date.now(), latencyMs: 1200 }
      ];

      mockProxyService.getAvailableProviders.mockResolvedValue(providers);
      mockProxyService.generateCaption
        .mockResolvedValueOnce(mockResults[0])
        .mockResolvedValueOnce(mockResults[1]);
      mockProxyService.resultToCandidate
        .mockReturnValueOnce(mockCandidates[0])
        .mockReturnValueOnce(mockCandidates[1]);

      MockedImageService.updateImage.mockResolvedValue(undefined);

      // Execute
      const result = await orchestrator.generateCaptions(mockImage, 'user1');

      // Verify
      expect(result.status).toBe('complete');
      expect(result.totalProviders).toBe(2);
      expect(result.completedProviders).toBe(2);
      expect(result.failedProviders).toBe(0);
      expect(result.errors).toHaveLength(0);

      // Verify service calls
      expect(MockedImageService.updateImage).toHaveBeenCalledWith('test-image-1', 'user1', {
        status: 'processing',
        error: undefined
      });
      expect(MockedImageService.updateImage).toHaveBeenCalledWith('test-image-1', 'user1', {
        status: 'complete',
        candidates: mockCandidates,
        error: undefined
      });
    });

    it('should handle partial failures gracefully', async () => {
      // Setup mocks
      const providers = ['openai', 'gemini'];
      const mockResult = { modelId: 'openai:gpt-4o-mini', caption: 'OpenAI caption', latency: 1000 };
      const mockCandidate: CaptionCandidate = {
        modelId: 'openai:gpt-4o-mini',
        caption: 'OpenAI caption',
        createdAt: Date.now(),
        latencyMs: 1000
      };

      mockProxyService.getAvailableProviders.mockResolvedValue(providers);
      mockProxyService.generateCaption
        .mockResolvedValueOnce(mockResult)
        .mockRejectedValueOnce(new Error('Gemini API error'));
      mockProxyService.resultToCandidate.mockReturnValueOnce(mockCandidate);

      MockedImageService.updateImage.mockResolvedValue(undefined);

      // Execute
      const result = await orchestrator.generateCaptions(mockImage, 'user1');

      // Verify
      expect(result.status).toBe('complete');
      expect(result.totalProviders).toBe(2);
      expect(result.completedProviders).toBe(1);
      expect(result.failedProviders).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('gemini: Gemini API error');

      // Verify final update includes error info
      expect(MockedImageService.updateImage).toHaveBeenLastCalledWith('test-image-1', 'user1', {
        status: 'complete',
        candidates: [mockCandidate],
        error: 'gemini: Gemini API error'
      });
    });

    it('should handle complete failure when all providers fail', async () => {
      // Setup mocks
      const providers = ['openai', 'gemini'];

      mockProxyService.getAvailableProviders.mockResolvedValue(providers);
      mockProxyService.generateCaption
        .mockRejectedValueOnce(new Error('OpenAI API error'))
        .mockRejectedValueOnce(new Error('Gemini API error'));

      MockedImageService.updateImage.mockResolvedValue(undefined);

      // Execute
      const result = await orchestrator.generateCaptions(mockImage, 'user1');

      // Verify
      expect(result.status).toBe('error');
      expect(result.totalProviders).toBe(2);
      expect(result.completedProviders).toBe(0);
      expect(result.failedProviders).toBe(2);
      expect(result.errors).toHaveLength(2);

      // Verify error status update
      expect(MockedImageService.updateImage).toHaveBeenLastCalledWith('test-image-1', 'user1', {
        status: 'error',
        error: 'openai: OpenAI API error; gemini: Gemini API error'
      });
    });

    it('should retry failed requests with exponential backoff', async () => {
      // Create orchestrator with more retries for this test
      const retryOrchestrator = new CaptionOrchestrator({
        maxRetries: 2,
        retryDelay: 10, // Faster for testing
        timeout: 5000,
        concurrency: 2
      });

      // Setup mocks
      const providers = ['openai'];
      const mockResult = { modelId: 'openai:gpt-4o-mini', caption: 'OpenAI caption', latency: 1000 };

      mockProxyService.getAvailableProviders.mockResolvedValue(providers);
      mockProxyService.generateCaption
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce(mockResult);
      mockProxyService.resultToCandidate.mockReturnValue({
        modelId: 'openai:gpt-4o-mini',
        caption: 'OpenAI caption',
        createdAt: Date.now(),
        latencyMs: 1000
      });

      MockedImageService.updateImage.mockResolvedValue(undefined);

      // Execute
      const result = await retryOrchestrator.generateCaptions(mockImage, 'user1');

      // Verify
      expect(result.status).toBe('complete');
      expect(mockProxyService.generateCaption).toHaveBeenCalledTimes(2);
    });

    it('should respect concurrency limits', async () => {
      // Setup mocks with many providers
      const providers = ['openai', 'gemini', 'anthropic', 'cohere', 'replicate'];
      const mockResult = { modelId: 'test', caption: 'test caption', latency: 1000 };

      mockProxyService.getAvailableProviders.mockResolvedValue(providers);
      mockProxyService.generateCaption.mockResolvedValue(mockResult);
      mockProxyService.resultToCandidate.mockReturnValue({
        modelId: 'test',
        caption: 'test caption',
        createdAt: Date.now(),
        latencyMs: 1000
      });

      MockedImageService.updateImage.mockResolvedValue(undefined);

      // Track concurrent calls
      let concurrentCalls = 0;
      let maxConcurrentCalls = 0;
      
      mockProxyService.generateCaption.mockImplementation(async () => {
        concurrentCalls++;
        maxConcurrentCalls = Math.max(maxConcurrentCalls, concurrentCalls);
        
        // Simulate async work
        await new Promise(resolve => setTimeout(resolve, 50));
        
        concurrentCalls--;
        return mockResult;
      });

      // Execute
      await orchestrator.generateCaptions(mockImage, 'user1');

      // Verify concurrency was respected (should be <= 2 based on config)
      expect(maxConcurrentCalls).toBeLessThanOrEqual(2);
    });
  });

  describe('regenerateCaptions', () => {
    it('should regenerate captions for specific providers', async () => {
      // Setup mocks
      const providers = ['openai'];
      const mockResult = { modelId: 'openai:gpt-4o-mini', caption: 'New caption', latency: 1000 };

      MockedImageService.getImages.mockResolvedValue([mockImage]);
      mockProxyService.getAvailableProviders.mockResolvedValue(['openai', 'gemini']);
      mockProxyService.generateCaption.mockResolvedValue(mockResult);
      mockProxyService.resultToCandidate.mockReturnValue({
        modelId: 'openai:gpt-4o-mini',
        caption: 'New caption',
        createdAt: Date.now(),
        latencyMs: 1000
      });
      MockedImageService.updateImage.mockResolvedValue(undefined);

      // Execute
      const result = await orchestrator.regenerateCaptions('test-image-1', 'user1', providers);

      // Verify
      expect(result.status).toBe('complete');
      expect(result.totalProviders).toBe(1);
      expect(MockedImageService.getImages).toHaveBeenCalledWith('user1');
    });

    it('should throw error for non-existent image', async () => {
      MockedImageService.getImages.mockResolvedValue([]);

      await expect(
        orchestrator.regenerateCaptions('non-existent', 'user1')
      ).rejects.toThrow('Image with ID non-existent not found');
    });
  });

  describe('status management', () => {
    it('should track generation status correctly', async () => {
      const providers = ['openai'];
      mockProxyService.getAvailableProviders.mockResolvedValue(providers);
      mockProxyService.generateCaption.mockResolvedValue({
        modelId: 'openai:gpt-4o-mini',
        caption: 'Test caption',
        latency: 1000
      });
      mockProxyService.resultToCandidate.mockReturnValue({
        modelId: 'openai:gpt-4o-mini',
        caption: 'Test caption',
        createdAt: Date.now(),
        latencyMs: 1000
      });
      MockedImageService.updateImage.mockResolvedValue(undefined);

      // Start generation
      const promise = orchestrator.generateCaptions(mockImage, 'user1');
      
      // Check status during generation
      const statusDuringGeneration = orchestrator.getGenerationStatus('test-image-1');
      expect(statusDuringGeneration?.status).toBe('processing');

      // Wait for completion
      await promise;

      // Check final status
      const finalStatus = orchestrator.getGenerationStatus('test-image-1');
      expect(finalStatus?.status).toBe('complete');
    });

    it('should clear generation status', () => {
      // Set up a status
      const status = {
        imageId: 'test-image-1',
        status: 'complete' as const,
        totalProviders: 1,
        completedProviders: 1,
        failedProviders: 0,
        errors: [],
        startTime: Date.now(),
        endTime: Date.now()
      };

      // Manually add status (simulating completed generation)
      orchestrator['activeGenerations'].set('test-image-1', status);

      // Verify status exists
      expect(orchestrator.getGenerationStatus('test-image-1')).toBeTruthy();

      // Clear status
      orchestrator.clearGenerationStatus('test-image-1');

      // Verify status is cleared
      expect(orchestrator.getGenerationStatus('test-image-1')).toBeNull();
    });
  });
});