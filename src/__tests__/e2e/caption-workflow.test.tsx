import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import type { ImageDoc, CaptionCandidate } from '../../types';

// Mock Firebase services
vi.mock('../../services/firebase', () => ({
  auth: {
    onAuthStateChanged: vi.fn((callback) => {
      callback({ uid: 'test-user', isAnonymous: true });
      return () => {};
    }),
    signInAnonymously: vi.fn(),
    currentUser: { uid: 'test-user', isAnonymous: true }
  },
  db: {},
  storage: {}
}));

const mockImageWithCaptions: ImageDoc = {
  id: 'test-image-1',
  filename: 'test.jpg',
  storagePath: 'uploads/test-user/test.jpg',
  downloadURL: 'https://example.com/test.jpg',
  status: 'complete',
  candidates: [
    {
      modelId: 'openai:gpt-4o-mini',
      caption: 'A beautiful landscape with mountains and trees',
      createdAt: Date.now(),
      latencyMs: 1200,
      tokensUsed: 45
    },
    {
      modelId: 'google:gemini-pro-vision',
      caption: 'Scenic mountain view with forest in the foreground',
      createdAt: Date.now(),
      latencyMs: 800,
      tokensUsed: 38
    },
    {
      modelId: 'anthropic:claude-3-vision',
      caption: 'Majestic mountain range surrounded by lush green forest',
      createdAt: Date.now(),
      latencyMs: 1500,
      tokensUsed: 52
    }
  ],
  selectedIndex: null,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

// Mock services
vi.mock('../../services/imageService', () => ({
  ImageService: vi.fn().mockImplementation(() => ({
    subscribeToImages: vi.fn((userId, callback) => {
      callback([mockImageWithCaptions]);
      return () => {};
    }),
    updateImage: vi.fn().mockResolvedValue(undefined),
    deleteImage: vi.fn().mockResolvedValue(undefined)
  }))
}));

vi.mock('../../services/captionOrchestrator', () => ({
  CaptionOrchestrator: vi.fn().mockImplementation(() => ({
    generateCaptions: vi.fn().mockResolvedValue(undefined),
    regenerateCaptions: vi.fn().mockResolvedValue(undefined)
  }))
}));

describe('Caption Workflow E2E', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display multiple caption options', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/LoRa Dataset Builder/i)).toBeInTheDocument();
    });

    // Should show the image
    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    // Should show all caption candidates
    expect(screen.getByText(/A beautiful landscape with mountains and trees/)).toBeInTheDocument();
    expect(screen.getByText(/Scenic mountain view with forest/)).toBeInTheDocument();
    expect(screen.getByText(/Majestic mountain range surrounded/)).toBeInTheDocument();

    // Should show provider names
    expect(screen.getByText(/openai:gpt-4o-mini/)).toBeInTheDocument();
    expect(screen.getByText(/google:gemini-pro-vision/)).toBeInTheDocument();
    expect(screen.getByText(/anthropic:claude-3-vision/)).toBeInTheDocument();
  });

  it('should allow selecting a caption', async () => {
    const user = userEvent.setup();
    const mockUpdateImage = vi.fn();
    
    // Mock the update function
    const mockImageService = require('../../services/imageService').ImageService;
    mockImageService.mockImplementation(() => ({
      subscribeToImages: vi.fn((userId, callback) => {
        callback([mockImageWithCaptions]);
        return () => {};
      }),
      updateImage: mockUpdateImage
    }));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    // Find and click the first caption radio button
    const firstCaptionRadio = screen.getByLabelText(/A beautiful landscape with mountains and trees/);
    await user.click(firstCaptionRadio);

    // Should call updateImage with selectedIndex
    expect(mockUpdateImage).toHaveBeenCalledWith('test-image-1', {
      selectedIndex: 0,
      updatedAt: expect.any(Number)
    });
  });

  it('should allow editing selected caption', async () => {
    const user = userEvent.setup();
    const mockUpdateImage = vi.fn();

    // Mock image with selected caption
    const imageWithSelection = {
      ...mockImageWithCaptions,
      selectedIndex: 0
    };

    const mockImageService = require('../../services/imageService').ImageService;
    mockImageService.mockImplementation(() => ({
      subscribeToImages: vi.fn((userId, callback) => {
        callback([imageWithSelection]);
        return () => {};
      }),
      updateImage: mockUpdateImage
    }));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    // Find the editable textarea
    const textarea = screen.getByDisplayValue(/A beautiful landscape with mountains and trees/);
    expect(textarea).toBeInTheDocument();

    // Edit the caption
    await user.clear(textarea);
    await user.type(textarea, 'Custom edited caption for this beautiful landscape');

    // Should call updateImage with selectedTextOverride
    await waitFor(() => {
      expect(mockUpdateImage).toHaveBeenCalledWith('test-image-1', {
        selectedTextOverride: 'Custom edited caption for this beautiful landscape',
        updatedAt: expect.any(Number)
      });
    });
  });

  it('should show caption metadata', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    // Should show latency information
    expect(screen.getByText(/1200ms/)).toBeInTheDocument();
    expect(screen.getByText(/800ms/)).toBeInTheDocument();
    expect(screen.getByText(/1500ms/)).toBeInTheDocument();

    // Should show token usage
    expect(screen.getByText(/45.*tokens/)).toBeInTheDocument();
    expect(screen.getByText(/38.*tokens/)).toBeInTheDocument();
    expect(screen.getByText(/52.*tokens/)).toBeInTheDocument();
  });

  it('should handle caption regeneration', async () => {
    const user = userEvent.setup();
    const mockRegenerateCaptions = vi.fn();

    const mockCaptionOrchestrator = require('../../services/captionOrchestrator').CaptionOrchestrator;
    mockCaptionOrchestrator.mockImplementation(() => ({
      regenerateCaptions: mockRegenerateCaptions
    }));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    // Find and click regenerate button
    const regenerateButton = screen.getByText(/regenerate/i);
    await user.click(regenerateButton);

    // Should call regenerateCaptions
    expect(mockRegenerateCaptions).toHaveBeenCalledWith('test-image-1');
  });

  it('should handle individual provider regeneration', async () => {
    const user = userEvent.setup();
    const mockRegenerateCaptions = vi.fn();

    const mockCaptionOrchestrator = require('../../services/captionOrchestrator').CaptionOrchestrator;
    mockCaptionOrchestrator.mockImplementation(() => ({
      regenerateCaptions: mockRegenerateCaptions
    }));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    // Find and click regenerate button for specific provider
    const providerRegenerateButton = screen.getByLabelText(/regenerate.*openai/i);
    await user.click(providerRegenerateButton);

    // Should call regenerateCaptions with specific provider
    expect(mockRegenerateCaptions).toHaveBeenCalledWith('test-image-1', ['openai:gpt-4o-mini']);
  });

  it('should show processing state during caption generation', async () => {
    // Mock image in processing state
    const processingImage = {
      ...mockImageWithCaptions,
      status: 'processing' as const,
      candidates: [
        {
          modelId: 'openai:gpt-4o-mini',
          caption: 'A beautiful landscape with mountains and trees',
          createdAt: Date.now(),
          latencyMs: 1200
        }
        // Only one caption so far
      ]
    };

    const mockImageService = require('../../services/imageService').ImageService;
    mockImageService.mockImplementation(() => ({
      subscribeToImages: vi.fn((userId, callback) => {
        callback([processingImage]);
        return () => {};
      }),
      updateImage: vi.fn()
    }));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    // Should show processing status
    expect(screen.getByText(/processing/i)).toBeInTheDocument();

    // Should show partial results
    expect(screen.getByText(/A beautiful landscape with mountains and trees/)).toBeInTheDocument();

    // Should show loading indicators for pending providers
    expect(screen.getByText(/generating/i)).toBeInTheDocument();
  });

  it('should handle caption generation errors', async () => {
    // Mock image with error in one provider
    const imageWithError = {
      ...mockImageWithCaptions,
      candidates: [
        {
          modelId: 'openai:gpt-4o-mini',
          caption: 'A beautiful landscape with mountains and trees',
          createdAt: Date.now(),
          latencyMs: 1200
        },
        {
          modelId: 'google:gemini-pro-vision',
          caption: '',
          error: 'API rate limit exceeded',
          createdAt: Date.now(),
          latencyMs: 0
        }
      ]
    };

    const mockImageService = require('../../services/imageService').ImageService;
    mockImageService.mockImplementation(() => ({
      subscribeToImages: vi.fn((userId, callback) => {
        callback([imageWithError]);
        return () => {};
      }),
      updateImage: vi.fn()
    }));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    // Should show error message
    expect(screen.getByText(/API rate limit exceeded/)).toBeInTheDocument();

    // Should show retry option for failed provider
    expect(screen.getByText(/retry/i)).toBeInTheDocument();
  });

  it('should expand/collapse long captions', async () => {
    const user = userEvent.setup();

    // Mock image with very long caption
    const longCaptionImage = {
      ...mockImageWithCaptions,
      candidates: [
        {
          modelId: 'openai:gpt-4o-mini',
          caption: 'This is a very long caption that should be truncated initially and then expandable when the user clicks the expand button. It contains a lot of detailed information about the image that might not fit in the initial view. The caption continues with even more details about various aspects of the image, including colors, composition, lighting, and other visual elements that make this image unique and interesting.',
          createdAt: Date.now(),
          latencyMs: 1200
        }
      ]
    };

    const mockImageService = require('../../services/imageService').ImageService;
    mockImageService.mockImplementation(() => ({
      subscribeToImages: vi.fn((userId, callback) => {
        callback([longCaptionImage]);
        return () => {};
      }),
      updateImage: vi.fn()
    }));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    // Should show truncated caption initially
    expect(screen.getByText(/This is a very long caption/)).toBeInTheDocument();
    expect(screen.getByText(/show more/i)).toBeInTheDocument();

    // Click expand
    const expandButton = screen.getByText(/show more/i);
    await user.click(expandButton);

    // Should show full caption
    expect(screen.getByText(/visual elements that make this image unique/)).toBeInTheDocument();
    expect(screen.getByText(/show less/i)).toBeInTheDocument();
  });

  it('should preserve caption selection across page reloads', async () => {
    // Mock image with selected caption and override
    const selectedImage = {
      ...mockImageWithCaptions,
      selectedIndex: 1,
      selectedTextOverride: 'My custom caption override'
    };

    const mockImageService = require('../../services/imageService').ImageService;
    mockImageService.mockImplementation(() => ({
      subscribeToImages: vi.fn((userId, callback) => {
        callback([selectedImage]);
        return () => {};
      }),
      updateImage: vi.fn()
    }));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    // Should show the selected caption radio button as checked
    const selectedRadio = screen.getByLabelText(/Scenic mountain view with forest/);
    expect(selectedRadio).toBeChecked();

    // Should show the custom override text in the textarea
    const textarea = screen.getByDisplayValue('My custom caption override');
    expect(textarea).toBeInTheDocument();
  });
});