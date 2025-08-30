import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Gallery } from '../Gallery';
import { useImages } from '../../hooks/useImages';
import { ImageDoc } from '../../types';

// Mock the useImages hook
vi.mock('../../hooks/useImages');
const mockUseImages = vi.mocked(useImages);

// Mock child components
vi.mock('../GalleryGrid', () => ({
  GalleryGrid: ({ images, loading, error }: any) => (
    <div data-testid="gallery-grid">
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      <div>Images: {images.length}</div>
    </div>
  )
}));

vi.mock('../VirtualizedGallery', () => ({
  VirtualizedGallery: ({ images }: any) => (
    <div data-testid="virtualized-gallery">
      Virtualized Images: {images.length}
    </div>
  )
}));

const mockImages: ImageDoc[] = [
  {
    id: '1',
    filename: 'test1.jpg',
    storagePath: 'uploads/user1/1/test1.jpg',
    downloadURL: 'https://example.com/test1.jpg',
    status: 'complete',
    candidates: [],
    selectedIndex: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '2',
    filename: 'test2.jpg',
    storagePath: 'uploads/user1/2/test2.jpg',
    downloadURL: 'https://example.com/test2.jpg',
    status: 'processing',
    candidates: [],
    selectedIndex: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

describe('Gallery', () => {
  beforeEach(() => {
    mockUseImages.mockReturnValue({
      images: [],
      loading: false,
      error: null,
      uploadImage: vi.fn(),
      updateImage: vi.fn(),
      deleteImage: vi.fn(),
      clearError: vi.fn()
    });
  });

  it('renders loading state', () => {
    mockUseImages.mockReturnValue({
      images: [],
      loading: true,
      error: null,
      uploadImage: vi.fn(),
      updateImage: vi.fn(),
      deleteImage: vi.fn(),
      clearError: vi.fn()
    });

    render(<Gallery />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state with dismiss button', () => {
    const mockClearError = vi.fn();
    mockUseImages.mockReturnValue({
      images: [],
      loading: false,
      error: 'Test error message',
      uploadImage: vi.fn(),
      updateImage: vi.fn(),
      deleteImage: vi.fn(),
      clearError: mockClearError
    });

    render(<Gallery />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('renders regular gallery grid for small image sets', () => {
    mockUseImages.mockReturnValue({
      images: mockImages,
      loading: false,
      error: null,
      uploadImage: vi.fn(),
      updateImage: vi.fn(),
      deleteImage: vi.fn(),
      clearError: vi.fn()
    });

    render(<Gallery virtualizationThreshold={50} />);
    expect(screen.getByTestId('gallery-grid')).toBeInTheDocument();
    expect(screen.getByText('Images: 2')).toBeInTheDocument();
  });

  it('renders virtualized gallery for large image sets', () => {
    const manyImages = Array.from({ length: 60 }, (_, i) => ({
      ...mockImages[0],
      id: `image-${i}`,
      filename: `test${i}.jpg`
    }));

    mockUseImages.mockReturnValue({
      images: manyImages,
      loading: false,
      error: null,
      uploadImage: vi.fn(),
      updateImage: vi.fn(),
      deleteImage: vi.fn(),
      clearError: vi.fn()
    });

    render(<Gallery virtualizationThreshold={50} enableVirtualization={true} />);
    expect(screen.getByTestId('virtualized-gallery')).toBeInTheDocument();
    expect(screen.getByText('Virtualized Images: 60')).toBeInTheDocument();
  });

  it('disables virtualization when enableVirtualization is false', () => {
    const manyImages = Array.from({ length: 60 }, (_, i) => ({
      ...mockImages[0],
      id: `image-${i}`,
      filename: `test${i}.jpg`
    }));

    mockUseImages.mockReturnValue({
      images: manyImages,
      loading: false,
      error: null,
      uploadImage: vi.fn(),
      updateImage: vi.fn(),
      deleteImage: vi.fn(),
      clearError: vi.fn()
    });

    render(<Gallery virtualizationThreshold={50} enableVirtualization={false} />);
    expect(screen.getByTestId('gallery-grid')).toBeInTheDocument();
    expect(screen.getByText('Images: 60')).toBeInTheDocument();
  });

  it('displays performance info', () => {
    mockUseImages.mockReturnValue({
      images: mockImages,
      loading: false,
      error: null,
      uploadImage: vi.fn(),
      updateImage: vi.fn(),
      deleteImage: vi.fn(),
      clearError: vi.fn()
    });

    render(<Gallery />);
    expect(screen.getByText('Displaying 2 images')).toBeInTheDocument();
  });
});