import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExport } from '../useExport';
import { ImageDoc } from '../../types';
import { ExportService } from '../../services/exportService';

// Mock ExportService
vi.mock('../../services/exportService', () => ({
  ExportService: {
    shouldShowDownloadButton: vi.fn(),
    setDownloadButtonVisibility: vi.fn(),
    getDatasetStats: vi.fn(),
    generateDataset: vi.fn(),
    downloadDataset: vi.fn(),
  }
}));

const mockExportService = vi.mocked(ExportService);

describe('useExport', () => {
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
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  const mockStats = {
    totalImages: 2,
    imagesWithCaptions: 2,
    imagesWithOverrides: 0,
    readyForExport: 2
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockExportService.shouldShowDownloadButton.mockReturnValue(true);
    mockExportService.getDatasetStats.mockReturnValue(mockStats);
    mockExportService.generateDataset.mockReturnValue([
      { url: 'https://example.com/image1.jpg', filename: 'image1.jpg', caption: 'Caption 1' },
      { url: 'https://example.com/image2.jpg', filename: 'image2.jpg', caption: 'Caption 2' }
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useExport(mockImages));

    expect(result.current.isExporting).toBe(false);
    expect(result.current.exportProgress).toBe(null);
    expect(result.current.showDownloadButton).toBe(true);
    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.canExport).toBe(true);
    expect(result.current.exportButtonText).toBe('Export Dataset (2)');
  });

  it('should initialize download button visibility from localStorage', () => {
    mockExportService.shouldShowDownloadButton.mockReturnValue(false);

    const { result } = renderHook(() => useExport(mockImages));

    expect(result.current.showDownloadButton).toBe(false);
    expect(mockExportService.shouldShowDownloadButton).toHaveBeenCalled();
  });

  it('should export dataset with progress tracking', async () => {
    const { result } = renderHook(() => useExport(mockImages));

    // Mock progress callback
    mockExportService.generateDataset.mockImplementation((images, onProgress) => {
      if (onProgress) {
        onProgress({ processed: 0, total: 2, currentImage: 'image1.jpg' });
        onProgress({ processed: 1, total: 2, currentImage: 'image2.jpg' });
        onProgress({ processed: 2, total: 2 });
      }
      return [
        { url: 'https://example.com/image1.jpg', filename: 'image1.jpg', caption: 'Caption 1' },
        { url: 'https://example.com/image2.jpg', filename: 'image2.jpg', caption: 'Caption 2' }
      ];
    });

    await act(async () => {
      await result.current.exportDataset();
    });

    expect(mockExportService.generateDataset).toHaveBeenCalledWith(
      mockImages,
      expect.any(Function)
    );
    expect(mockExportService.downloadDataset).toHaveBeenCalledWith(
      [
        { url: 'https://example.com/image1.jpg', filename: 'image1.jpg', caption: 'Caption 1' },
        { url: 'https://example.com/image2.jpg', filename: 'image2.jpg', caption: 'Caption 2' }
      ],
      undefined
    );
  });

  it('should export dataset with custom filename', async () => {
    const { result } = renderHook(() => useExport(mockImages));

    await act(async () => {
      await result.current.exportDataset('custom-dataset.json');
    });

    expect(mockExportService.downloadDataset).toHaveBeenCalledWith(
      expect.any(Array),
      'custom-dataset.json'
    );
  });

  it('should handle export errors', async () => {
    const { result } = renderHook(() => useExport(mockImages));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockExportService.generateDataset.mockImplementation(() => {
      throw new Error('Export failed');
    });

    await act(async () => {
      await expect(result.current.exportDataset()).rejects.toThrow('Export failed');
    });

    expect(consoleError).toHaveBeenCalledWith('Export failed:', expect.any(Error));
    expect(result.current.isExporting).toBe(false);

    consoleError.mockRestore();
  });

  it('should prevent concurrent exports', async () => {
    const { result } = renderHook(() => useExport(mockImages));

    // Mock a slow export
    mockExportService.generateDataset.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve([]), 100);
      });
    });

    // Start first export
    act(() => {
      result.current.exportDataset();
    });

    // Verify export is in progress
    expect(result.current.isExporting).toBe(true);

    // Try to start second export while first is running
    act(() => {
      result.current.exportDataset(); // This should be ignored
    });

    // Wait for first export to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // Should only call generateDataset once
    expect(mockExportService.generateDataset).toHaveBeenCalledTimes(1);
  });

  it('should toggle download button visibility', () => {
    const { result } = renderHook(() => useExport(mockImages));

    act(() => {
      result.current.toggleDownloadButton(false);
    });

    expect(result.current.showDownloadButton).toBe(false);
    expect(mockExportService.setDownloadButtonVisibility).toHaveBeenCalledWith(false);

    act(() => {
      result.current.toggleDownloadButton(true);
    });

    expect(result.current.showDownloadButton).toBe(true);
    expect(mockExportService.setDownloadButtonVisibility).toHaveBeenCalledWith(true);
  });

  it('should toggle download button visibility without parameter', () => {
    const { result } = renderHook(() => useExport(mockImages));

    // Initial state is true
    expect(result.current.showDownloadButton).toBe(true);

    act(() => {
      result.current.toggleDownloadButton();
    });

    expect(result.current.showDownloadButton).toBe(false);
    expect(mockExportService.setDownloadButtonVisibility).toHaveBeenCalledWith(false);
  });

  it('should generate dataset preview', () => {
    const { result } = renderHook(() => useExport(mockImages));

    const preview = result.current.generateDatasetPreview();

    expect(preview).toEqual([
      { url: 'https://example.com/image1.jpg', filename: 'image1.jpg', caption: 'Caption 1' },
      { url: 'https://example.com/image2.jpg', filename: 'image2.jpg', caption: 'Caption 2' }
    ]);
    expect(mockExportService.generateDataset).toHaveBeenCalledWith(mockImages);
  });

  it('should update export button text during export', async () => {
    const { result } = renderHook(() => useExport(mockImages));

    // Mock progress callback to simulate export progress
    mockExportService.generateDataset.mockImplementation((images, onProgress) => {
      if (onProgress) {
        onProgress({ processed: 1, total: 2, currentImage: 'image1.jpg' });
      }
      return [];
    });

    // Start export and check state immediately
    act(() => {
      result.current.exportDataset();
    });

    // Check button text during export
    expect(result.current.isExporting).toBe(true);
    expect(result.current.exportButtonText).toMatch(/Exporting\.\.\./);

    // Wait for export to complete
    await act(async () => {
      // Wait for the export to finish
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Should return to normal text after export
    expect(result.current.exportButtonText).toBe('Export Dataset (2)');
  });

  it('should handle images with no captions', () => {
    const imagesWithoutCaptions: ImageDoc[] = [
      {
        id: '1',
        filename: 'image1.jpg',
        storagePath: 'uploads/1/image1.jpg',
        downloadURL: 'https://example.com/image1.jpg',
        status: 'pending',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    ];

    const statsWithoutCaptions = {
      totalImages: 1,
      imagesWithCaptions: 0,
      imagesWithOverrides: 0,
      readyForExport: 0
    };

    // Update the mock to return stats for no captions
    mockExportService.getDatasetStats.mockReturnValue(statsWithoutCaptions);

    const { result } = renderHook(() => useExport(imagesWithoutCaptions));

    expect(result.current.canExport).toBe(false);
    expect(result.current.exportButtonText).toBe('Export Dataset (0)');
  });
});