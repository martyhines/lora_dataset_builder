import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportButton } from '../ExportButton';
import { ImageDoc } from '../../types';

// Mock the useExport hook
vi.mock('../../hooks/useExport', () => ({
  useExport: vi.fn()
}));

import { useExport } from '../../hooks/useExport';
const mockUseExport = vi.mocked(useExport);

describe('ExportButton', () => {
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
    }
  ];

  const defaultMockReturn = {
    isExporting: false,
    exportProgress: null,
    showDownloadButton: true,
    stats: {
      totalImages: 1,
      imagesWithCaptions: 1,
      imagesWithOverrides: 0,
      readyForExport: 1
    },
    exportDataset: vi.fn(),
    generateDatasetPreview: vi.fn(() => [
      { url: 'https://example.com/image1.jpg', filename: 'image1.jpg', caption: 'Caption 1' }
    ]),
    canExport: true,
    exportButtonText: 'Export Dataset (1)'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseExport.mockReturnValue(defaultMockReturn);
  });

  it('should not render when showDownloadButton is false', () => {
    mockUseExport.mockReturnValue({
      ...defaultMockReturn,
      showDownloadButton: false
    });

    const { container } = render(<ExportButton images={mockImages} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render export button when showDownloadButton is true', () => {
    render(<ExportButton images={mockImages} />);

    expect(screen.getByRole('button', { name: /export dataset/i })).toBeInTheDocument();
    expect(screen.getByText('Export Dataset (1)')).toBeInTheDocument();
  });

  it('should render preview button when canExport is true', () => {
    render(<ExportButton images={mockImages} />);

    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
  });

  it('should not render preview button when canExport is false', () => {
    mockUseExport.mockReturnValue({
      ...defaultMockReturn,
      canExport: false,
      stats: {
        ...defaultMockReturn.stats,
        readyForExport: 0
      }
    });

    render(<ExportButton images={mockImages} />);

    expect(screen.queryByRole('button', { name: /preview/i })).not.toBeInTheDocument();
  });

  it('should call exportDataset when export button is clicked', async () => {
    const mockExportDataset = vi.fn();
    mockUseExport.mockReturnValue({
      ...defaultMockReturn,
      exportDataset: mockExportDataset
    });

    render(<ExportButton images={mockImages} />);

    const exportButton = screen.getByRole('button', { name: /export dataset/i });
    fireEvent.click(exportButton);

    expect(mockExportDataset).toHaveBeenCalledTimes(1);
  });

  it('should show export progress modal during export', () => {
    mockUseExport.mockReturnValue({
      ...defaultMockReturn,
      isExporting: true,
      exportProgress: {
        processed: 1,
        total: 2,
        currentImage: 'image1.jpg'
      }
    });

    render(<ExportButton images={mockImages} />);

    expect(screen.getByText('Exporting Dataset')).toBeInTheDocument();
    expect(screen.getByText('Processing images...')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByText('Processing:')).toBeInTheDocument();
    expect(screen.getByText('image1.jpg')).toBeInTheDocument();
  });

  it('should show dataset preview modal when preview button is clicked', async () => {
    render(<ExportButton images={mockImages} />);

    const previewButton = screen.getByRole('button', { name: /preview/i });
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText('Dataset Preview (1 entries)')).toBeInTheDocument();
    });

    expect(screen.getByText(/image1\.jpg/)).toBeInTheDocument();
    expect(screen.getByText(/Caption 1/)).toBeInTheDocument();
  });

  it('should close preview modal when close button is clicked', async () => {
    render(<ExportButton images={mockImages} />);

    // Open preview
    const previewButton = screen.getByRole('button', { name: /preview/i });
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText('Dataset Preview (1 entries)')).toBeInTheDocument();
    });

    // Close preview
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Dataset Preview (1 entries)')).not.toBeInTheDocument();
    });
  });

  it('should export from preview modal', async () => {
    const mockExportDataset = vi.fn();
    mockUseExport.mockReturnValue({
      ...defaultMockReturn,
      exportDataset: mockExportDataset
    });

    render(<ExportButton images={mockImages} />);

    // Open preview
    const previewButton = screen.getByRole('button', { name: /preview/i });
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText('Dataset Preview (1 entries)')).toBeInTheDocument();
    });

    // Export from preview
    const exportFromPreviewButton = screen.getByRole('button', { name: /export this dataset/i });
    fireEvent.click(exportFromPreviewButton);

    expect(mockExportDataset).toHaveBeenCalledTimes(1);
    
    await waitFor(() => {
      expect(screen.queryByText('Dataset Preview (1 entries)')).not.toBeInTheDocument();
    });
  });

  it('should disable buttons when disabled prop is true', () => {
    render(<ExportButton images={mockImages} disabled={true} />);

    const exportButton = screen.getByRole('button', { name: /export dataset/i });
    const previewButton = screen.getByRole('button', { name: /preview/i });

    expect(exportButton).toBeDisabled();
    expect(previewButton).toBeDisabled();
  });

  it('should disable buttons when isExporting is true', () => {
    mockUseExport.mockReturnValue({
      ...defaultMockReturn,
      isExporting: true,
      exportProgress: {
        processed: 0,
        total: 1
      }
    });

    render(<ExportButton images={mockImages} />);

    const exportButton = screen.getByRole('button', { name: /export dataset/i });
    expect(exportButton).toBeDisabled();
  });

  it('should disable export button when canExport is false', () => {
    mockUseExport.mockReturnValue({
      ...defaultMockReturn,
      canExport: false,
      exportButtonText: 'Export Dataset (0)'
    });

    render(<ExportButton images={mockImages} />);

    const exportButton = screen.getByRole('button', { name: /export dataset/i });
    expect(exportButton).toBeDisabled();
    expect(exportButton).toHaveAttribute('title', 'No images with captions available for export');
  });

  it('should show loading spinner during export', () => {
    mockUseExport.mockReturnValue({
      ...defaultMockReturn,
      isExporting: true,
      exportButtonText: 'Exporting... (1/2)'
    });

    render(<ExportButton images={mockImages} />);

    const exportButton = screen.getByRole('button', { name: /exporting/i });
    const spinner = exportButton.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should handle export errors gracefully', async () => {
    const mockExportDataset = vi.fn().mockRejectedValue(new Error('Export failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockUseExport.mockReturnValue({
      ...defaultMockReturn,
      exportDataset: mockExportDataset
    });

    render(<ExportButton images={mockImages} />);

    const exportButton = screen.getByRole('button', { name: /export dataset/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Export failed:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should apply custom className', () => {
    render(<ExportButton images={mockImages} className="custom-class" />);

    const exportButton = screen.getByRole('button', { name: /export dataset/i });
    expect(exportButton).toHaveClass('custom-class');
  });
});