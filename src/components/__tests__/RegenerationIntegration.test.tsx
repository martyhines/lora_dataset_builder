import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageCard } from '../ImageCard';
import type { ImageDoc, CaptionCandidate } from '../../types';

// Mock the CaptionSelector component to focus on integration
vi.mock('../CaptionSelector', () => ({
  CaptionSelector: ({ onRegenerateProvider, onRegenerateAll }: any) => (
    <div data-testid="caption-selector">
      {onRegenerateProvider && (
        <button 
          onClick={() => onRegenerateProvider('openai:gpt-4o-mini')}
          data-testid="regenerate-provider"
        >
          Regenerate Provider
        </button>
      )}
      {onRegenerateAll && (
        <button 
          onClick={() => onRegenerateAll()}
          data-testid="regenerate-all"
        >
          Regenerate All
        </button>
      )}
    </div>
  )
}));

describe('Caption Regeneration Integration', () => {
  const mockImage: ImageDoc = {
    id: 'test-image-1',
    filename: 'test.jpg',
    storagePath: 'uploads/user/test.jpg',
    downloadURL: 'https://example.com/test.jpg',
    status: 'complete',
    candidates: [
      {
        modelId: 'openai:gpt-4o-mini',
        caption: 'A test image',
        createdAt: Date.now(),
        latencyMs: 1000,
        tokensUsed: 50
      },
      {
        modelId: 'google:gemini-pro-vision',
        caption: '',
        createdAt: Date.now(),
        error: 'API timeout'
      }
    ] as CaptionCandidate[],
    selectedIndex: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnRegenerate = vi.fn();
  const mockOnRegenerateProvider = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass regeneration callbacks to CaptionSelector', () => {
    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onRegenerate={mockOnRegenerate}
        onRegenerateProvider={mockOnRegenerateProvider}
      />
    );

    expect(screen.getByTestId('caption-selector')).toBeInTheDocument();
    expect(screen.getByTestId('regenerate-provider')).toBeInTheDocument();
    expect(screen.getByTestId('regenerate-all')).toBeInTheDocument();
  });

  it('should handle provider-specific regeneration', async () => {
    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onRegenerate={mockOnRegenerate}
        onRegenerateProvider={mockOnRegenerateProvider}
      />
    );

    const regenerateProviderButton = screen.getByTestId('regenerate-provider');
    fireEvent.click(regenerateProviderButton);

    await waitFor(() => {
      expect(mockOnRegenerateProvider).toHaveBeenCalledWith('openai:gpt-4o-mini');
    });
  });

  it('should handle bulk regeneration', async () => {
    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onRegenerate={mockOnRegenerate}
        onRegenerateProvider={mockOnRegenerateProvider}
      />
    );

    const regenerateAllButton = screen.getByTestId('regenerate-all');
    fireEvent.click(regenerateAllButton);

    await waitFor(() => {
      expect(mockOnRegenerate).toHaveBeenCalledWith();
    });
  });

  it('should show regenerate button in header when callback is provided', () => {
    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onRegenerate={mockOnRegenerate}
      />
    );

    // The regenerate button should be in the action buttons area
    const regenerateButton = screen.getByLabelText(/Regenerate captions for test\.jpg/);
    expect(regenerateButton).toBeInTheDocument();
  });

  it('should not show regenerate button when callback is not provided', () => {
    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // The regenerate button should not be present
    expect(screen.queryByTitle('Regenerate captions')).not.toBeInTheDocument();
  });

  it('should disable regenerate button when processing', () => {
    const processingImage = { ...mockImage, status: 'processing' as const };
    
    render(
      <ImageCard
        image={processingImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onRegenerate={mockOnRegenerate}
      />
    );

    const regenerateButton = screen.getByLabelText(/Regenerate captions for test\.jpg/);
    expect(regenerateButton).toBeDisabled();
  });
});