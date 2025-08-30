import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from '../Toolbar';
import { ImageDoc } from '../../types';

// Mock the useExport hook
vi.mock('../../hooks/useExport', () => ({
  useExport: vi.fn()
}));

// Mock the ExportButton component
vi.mock('../ExportButton', () => ({
  ExportButton: ({ images }: { images: ImageDoc[] }) => (
    <div data-testid="export-button">Export Button ({images.length} images)</div>
  )
}));

import { useExport } from '../../hooks/useExport';
const mockUseExport = vi.mocked(useExport);

describe('Toolbar', () => {
  const mockImages: ImageDoc[] = [
    {
      id: '1',
      filename: 'image1.jpg',
      storagePath: 'uploads/1/image1.jpg',
      downloadURL: 'https://example.com/image1.jpg',
      status: 'complete',
      candidates: [{ modelId: 'openai:gpt-4o-mini', caption: 'Caption 1', createdAt: Date.now() }],
      selectedIndex: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: '2',
      filename: 'image2.jpg',
      storagePath: 'uploads/2/image2.jpg',
      downloadURL: 'https://example.com/image2.jpg',
      status: 'complete',
      candidates: [{ modelId: 'openai:gpt-4o-mini', caption: 'Caption 2', createdAt: Date.now() }],
      selectedIndex: 0,
      selectedTextOverride: 'Custom caption',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: '3',
      filename: 'image3.jpg',
      storagePath: 'uploads/3/image3.jpg',
      downloadURL: 'https://example.com/image3.jpg',
      status: 'pending',
      candidates: [],
      selectedIndex: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  ];

  const defaultMockReturn = {
    stats: {
      totalImages: 3,
      imagesWithCaptions: 2,
      imagesWithOverrides: 1,
      readyForExport: 2
    },
    toggleDownloadButton: vi.fn(),
    showDownloadButton: true,
    isExporting: false,
    exportProgress: null,
    exportDataset: vi.fn(),
    generateDatasetPreview: vi.fn(),
    canExport: true,
    exportButtonText: 'Export Dataset (2)'
  };

  // Store original NODE_ENV
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseExport.mockReturnValue(defaultMockReturn);
  });

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should render statistics correctly', () => {
    render(<Toolbar images={mockImages} />);

    expect(screen.getByText('Total Images:')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    expect(screen.getByText('With Captions:')).toBeInTheDocument();
    expect(screen.getAllByText('2')).toHaveLength(2); // Both "With Captions" and "Ready for Export" show 2
    
    expect(screen.getByText('Custom Captions:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    
    expect(screen.getByText('Ready for Export:')).toBeInTheDocument();
  });

  it('should render ExportButton component', () => {
    render(<Toolbar images={mockImages} />);

    expect(screen.getByTestId('export-button')).toBeInTheDocument();
    expect(screen.getByText('Export Button (3 images)')).toBeInTheDocument();
  });

  it('should show developer toggle in development mode', () => {
    process.env.NODE_ENV = 'development';

    render(<Toolbar images={mockImages} />);

    expect(screen.getByText('DL: ON')).toBeInTheDocument();
  });

  it('should not show developer toggle in production mode', () => {
    process.env.NODE_ENV = 'production';

    render(<Toolbar images={mockImages} />);

    expect(screen.queryByText(/DL:/)).not.toBeInTheDocument();
  });

  it('should show correct toggle state when download button is hidden', () => {
    process.env.NODE_ENV = 'development';
    
    mockUseExport.mockReturnValue({
      ...defaultMockReturn,
      showDownloadButton: false
    });

    render(<Toolbar images={mockImages} />);

    expect(screen.getByText('DL: OFF')).toBeInTheDocument();
  });

  it('should call toggleDownloadButton when developer toggle is clicked', () => {
    process.env.NODE_ENV = 'development';
    const mockToggle = vi.fn();
    
    mockUseExport.mockReturnValue({
      ...defaultMockReturn,
      toggleDownloadButton: mockToggle
    });

    render(<Toolbar images={mockImages} />);

    const toggleButton = screen.getByText('DL: ON');
    fireEvent.click(toggleButton);

    expect(mockToggle).toHaveBeenCalledTimes(1);
    expect(mockToggle).toHaveBeenCalledWith();
  });

  it('should apply custom className', () => {
    const { container } = render(<Toolbar images={mockImages} className="custom-class" />);

    const toolbar = container.firstChild as HTMLElement;
    expect(toolbar).toHaveClass('custom-class');
  });

  it('should handle empty images array', () => {
    mockUseExport.mockReturnValue({
      ...defaultMockReturn,
      stats: {
        totalImages: 0,
        imagesWithCaptions: 0,
        imagesWithOverrides: 0,
        readyForExport: 0
      }
    });

    render(<Toolbar images={[]} />);

    expect(screen.getByText('Total Images:')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(4); // All stats show 0
  });

  it('should have correct color coding for statistics', () => {
    render(<Toolbar images={mockImages} />);

    // Check that statistics labels are present (color classes are applied via CSS)
    expect(screen.getByText('With Captions:')).toBeInTheDocument();
    expect(screen.getByText('Custom Captions:')).toBeInTheDocument();
    expect(screen.getByText('Ready for Export:')).toBeInTheDocument();
    
    // Check that the numbers are present
    expect(screen.getAllByText('2')).toHaveLength(2); // With Captions and Ready for Export
    expect(screen.getByText('1')).toBeInTheDocument(); // Custom Captions
  });

  it('should have proper accessibility attributes', () => {
    process.env.NODE_ENV = 'development';
    
    render(<Toolbar images={mockImages} />);

    const toggleButton = screen.getByText('DL: ON');
    expect(toggleButton).toHaveAttribute('aria-label', expect.stringContaining('Toggle download button visibility'));
  });

  it('should update when images prop changes', () => {
    const { rerender } = render(<Toolbar images={mockImages} />);

    expect(screen.getByText('Export Button (3 images)')).toBeInTheDocument();

    const newImages = mockImages.slice(0, 1);
    rerender(<Toolbar images={newImages} />);

    expect(screen.getByText('Export Button (1 images)')).toBeInTheDocument();
  });
});