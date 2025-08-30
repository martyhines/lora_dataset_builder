import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { GalleryGrid } from '../GalleryGrid';
import { ImageDoc, CaptionCandidate } from '../../types';

// Mock ImageCard component
vi.mock('../ImageCard', () => ({
  ImageCard: ({ image, onUpdate, onDelete }: any) => (
    <div data-testid={`image-card-${image.id}`}>
      <div>{image.filename}</div>
      <div>Status: {image.status}</div>
      <button onClick={() => onUpdate({ status: 'complete' })}>Update</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  )
}));

const mockCandidates: CaptionCandidate[] = [
  {
    modelId: 'openai:gpt-4o-mini',
    caption: 'A beautiful landscape',
    createdAt: Date.now(),
    latencyMs: 1200
  }
];

const mockImages: ImageDoc[] = [
  {
    id: '1',
    filename: 'image1.jpg',
    storagePath: 'uploads/user1/1/image1.jpg',
    downloadURL: 'https://example.com/image1.jpg',
    status: 'complete',
    candidates: mockCandidates,
    selectedIndex: 0,
    createdAt: Date.now() - 1000,
    updatedAt: Date.now()
  },
  {
    id: '2',
    filename: 'image2.jpg',
    storagePath: 'uploads/user1/2/image2.jpg',
    downloadURL: 'https://example.com/image2.jpg',
    status: 'processing',
    candidates: [],
    selectedIndex: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

describe('Gallery Integration', () => {
  const mockOnImageUpdate = vi.fn();
  const mockOnImageDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all images in the gallery grid', () => {
    render(
      <GalleryGrid
        images={mockImages}
        onImageUpdate={mockOnImageUpdate}
        onImageDelete={mockOnImageDelete}
      />
    );

    expect(screen.getByTestId('image-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('image-card-2')).toBeInTheDocument();
    expect(screen.getByText('image1.jpg')).toBeInTheDocument();
    expect(screen.getByText('image2.jpg')).toBeInTheDocument();
  });

  it('handles image updates correctly', async () => {
    render(
      <GalleryGrid
        images={mockImages}
        onImageUpdate={mockOnImageUpdate}
        onImageDelete={mockOnImageDelete}
      />
    );

    // Click the update button for the first image (which is image 2 due to sorting)
    const updateButton = screen.getAllByText('Update')[0];
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockOnImageUpdate).toHaveBeenCalledWith('2', { status: 'complete' });
    });
  });

  it('handles image deletion correctly', async () => {
    render(
      <GalleryGrid
        images={mockImages}
        onImageUpdate={mockOnImageUpdate}
        onImageDelete={mockOnImageDelete}
      />
    );

    // Click the delete button for the first image (which is image 2 due to sorting)
    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnImageDelete).toHaveBeenCalledWith('2');
    });
  });

  it('displays empty state when no images', () => {
    render(
      <GalleryGrid
        images={[]}
        onImageUpdate={mockOnImageUpdate}
        onImageDelete={mockOnImageDelete}
      />
    );

    expect(screen.getByText('No images uploaded yet')).toBeInTheDocument();
    expect(screen.getByText('Upload some images to get started')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(
      <GalleryGrid
        images={[]}
        onImageUpdate={mockOnImageUpdate}
        onImageDelete={mockOnImageDelete}
        loading={true}
      />
    );

    expect(screen.getByText('Loading images...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    render(
      <GalleryGrid
        images={[]}
        onImageUpdate={mockOnImageUpdate}
        onImageDelete={mockOnImageDelete}
        error="Failed to load images"
      />
    );

    expect(screen.getByText('Error loading images')).toBeInTheDocument();
    expect(screen.getByText('Failed to load images')).toBeInTheDocument();
  });

  it('sorts images by creation date (newest first)', () => {
    const unsortedImages = [
      { ...mockImages[0], createdAt: 1000 },
      { ...mockImages[1], createdAt: 2000 }
    ];

    render(
      <GalleryGrid
        images={unsortedImages}
        onImageUpdate={mockOnImageUpdate}
        onImageDelete={mockOnImageDelete}
      />
    );

    const imageCards = screen.getAllByTestId(/image-card-/);
    // The newer image (id: 2) should appear first
    expect(imageCards[0]).toHaveAttribute('data-testid', 'image-card-2');
    expect(imageCards[1]).toHaveAttribute('data-testid', 'image-card-1');
  });
});