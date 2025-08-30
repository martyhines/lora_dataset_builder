import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ImageCard } from '../ImageCard';
import { ImageDoc, CaptionCandidate } from '../../types';

// Mock CaptionSelector component
vi.mock('../CaptionSelector', () => ({
  CaptionSelector: ({ candidates, selectedIndex, onSelectionChange }: any) => (
    <div data-testid="caption-selector">
      <div>Candidates: {candidates.length}</div>
      <div>Selected: {selectedIndex}</div>
      <button onClick={() => onSelectionChange(0)}>Select First</button>
    </div>
  )
}));

const mockCandidates: CaptionCandidate[] = [
  {
    modelId: 'openai:gpt-4o-mini',
    caption: 'A beautiful landscape with mountains',
    createdAt: Date.now(),
    latencyMs: 1200,
    tokensUsed: 25
  },
  {
    modelId: 'google:gemini-pro-vision',
    caption: 'Mountain scenery with blue sky',
    createdAt: Date.now(),
    latencyMs: 800,
    tokensUsed: 18
  }
];

const mockImage: ImageDoc = {
  id: 'test-image-1',
  filename: 'test-landscape.jpg',
  storagePath: 'uploads/user1/123/test-landscape.jpg',
  downloadURL: 'https://example.com/test-landscape.jpg',
  status: 'complete',
  candidates: mockCandidates,
  selectedIndex: 0,
  createdAt: Date.now() - 3600000, // 1 hour ago
  updatedAt: Date.now()
};

describe('ImageCard', () => {
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnRegenerate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders image with basic information', () => {
    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onRegenerate={mockOnRegenerate}
      />
    );

    expect(screen.getByAltText('test-landscape.jpg')).toBeInTheDocument();
    expect(screen.getByText('test-landscape.jpg')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('displays status badge correctly for different statuses', () => {
    const processingImage = { ...mockImage, status: 'processing' as const };
    const { rerender } = render(
      <ImageCard
        image={processingImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Processing')).toBeInTheDocument();

    const errorImage = { ...mockImage, status: 'error' as const, error: 'Failed to process' };
    rerender(
      <ImageCard
        image={errorImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to process')).toBeInTheDocument();
  });

  it('shows processing animation overlay when processing', () => {
    const processingImage = { ...mockImage, status: 'processing' as const };
    render(
      <ImageCard
        image={processingImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    // Check for spinner (animate-spin class)
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('handles delete confirmation flow', async () => {
    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTitle('Delete image');
    fireEvent.click(deleteButton);

    // Should show confirmation
    expect(screen.getByText('Delete this image?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();

    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Delete this image?')).not.toBeInTheDocument();

    // Try delete again and confirm
    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  it('handles delete errors with retry functionality', async () => {
    const mockOnDeleteWithError = vi.fn().mockRejectedValue(new Error('Network error'));

    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDeleteWithError}
      />
    );

    // Start delete process
    const deleteButton = screen.getByLabelText(/Delete test-landscape\.jpg/);
    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByText('Delete'));

    // Should show error and retry option
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    // Should keep confirmation dialog open for retry
    expect(screen.getByText('Delete this image?')).toBeInTheDocument();
  });

  it('shows selection checkbox in selection mode', () => {
    const mockOnSelectionChange = vi.fn();

    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        selected={false}
        onSelectionChange={mockOnSelectionChange}
        selectionMode={true}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(mockOnSelectionChange).toHaveBeenCalledWith(true);
  });

  it('shows selected state styling when selected', () => {
    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        selected={true}
        onSelectionChange={vi.fn()}
        selectionMode={true}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    // Check for selected styling (border-blue-500 class)
    const cardContainer = checkbox.closest('.border-blue-500');
    expect(cardContainer).toBeInTheDocument();
  });

  it('adjusts status badge position in selection mode', () => {
    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        selectionMode={true}
        onSelectionChange={vi.fn()}
      />
    );

    // Status badge should be positioned differently when checkbox is present
    const statusBadge = screen.getByText('Complete').closest('div');
    expect(statusBadge).toHaveClass('left-9'); // Moved right to accommodate checkbox
  });

  it('handles regenerate button click', () => {
    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onRegenerate={mockOnRegenerate}
      />
    );

    const regenerateButton = screen.getByLabelText(/Regenerate captions for test-landscape\.jpg/);
    fireEvent.click(regenerateButton);

    expect(mockOnRegenerate).toHaveBeenCalledWith();
  });

  it('disables regenerate button when processing', () => {
    const processingImage = { ...mockImage, status: 'processing' as const };
    render(
      <ImageCard
        image={processingImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onRegenerate={mockOnRegenerate}
      />
    );

    const regenerateButton = screen.getByLabelText(/Regenerate captions for test-landscape\.jpg/);
    expect(regenerateButton).toBeDisabled();
  });

  it('renders caption selector when candidates exist', () => {
    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('caption-selector')).toBeInTheDocument();
    expect(screen.getByText('Candidates: 2')).toBeInTheDocument();
    expect(screen.getByText('Selected: 0')).toBeInTheDocument();
  });

  it('shows no captions state when no candidates and not processing', () => {
    const imageWithoutCaptions = { 
      ...mockImage, 
      candidates: [], 
      status: 'complete' as const 
    };
    
    render(
      <ImageCard
        image={imageWithoutCaptions}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onRegenerate={mockOnRegenerate}
      />
    );

    expect(screen.getByText('No captions available')).toBeInTheDocument();
    expect(screen.getByText('Generate captions')).toBeInTheDocument();
  });

  it('handles caption selection updates', () => {
    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('Select First'));

    expect(mockOnUpdate).toHaveBeenCalledWith({ selectedIndex: 0 });
  });

  it('displays metadata correctly', () => {
    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('2 captions')).toBeInTheDocument();
    // Check that upload date is displayed (format may vary)
    expect(screen.getByText(/Uploaded:/)).toBeInTheDocument();
  });

  it('handles image load error gracefully', () => {
    render(
      <ImageCard
        image={mockImage}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    const image = screen.getByAltText('test-landscape.jpg');
    fireEvent.error(image);

    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });
});