import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExportService } from '../exportService';
import { ImageDoc, DatasetEntry } from '../../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
Object.defineProperty(window.URL, 'createObjectURL', {
  value: mockCreateObjectURL,
});
Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
});

// Mock document methods
const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockCreateElement = vi.fn(() => ({
  click: mockClick,
  href: '',
  download: '',
}));

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
});
Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
});
Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
});

describe('ExportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateDataset', () => {
    const createMockImage = (
      id: string,
      filename: string,
      selectedIndex: number | null = null,
      selectedTextOverride?: string,
      candidates: any[] = []
    ): ImageDoc => ({
      id,
      filename,
      storagePath: `uploads/${id}/${filename}`,
      downloadURL: `https://example.com/${filename}`,
      status: 'complete',
      candidates,
      selectedIndex,
      selectedTextOverride,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    it('should generate dataset from images with selected captions', () => {
      const images: ImageDoc[] = [
        createMockImage('1', 'image1.jpg', 0, undefined, [
          { modelId: 'openai:gpt-4o-mini', caption: 'A beautiful landscape', createdAt: Date.now() }
        ]),
        createMockImage('2', 'image2.jpg', 0, undefined, [
          { modelId: 'openai:gpt-4o-mini', caption: 'A city skyline', createdAt: Date.now() }
        ]),
      ];

      const dataset = ExportService.generateDataset(images);

      expect(dataset).toHaveLength(2);
      expect(dataset[0]).toEqual({
        url: 'https://example.com/image1.jpg',
        filename: 'image1.jpg',
        caption: 'A beautiful landscape'
      });
      expect(dataset[1]).toEqual({
        url: 'https://example.com/image2.jpg',
        filename: 'image2.jpg',
        caption: 'A city skyline'
      });
    });

    it('should use selectedTextOverride when available', () => {
      const images: ImageDoc[] = [
        createMockImage('1', 'image1.jpg', 0, 'Custom caption override', [
          { modelId: 'openai:gpt-4o-mini', caption: 'Original caption', createdAt: Date.now() }
        ]),
      ];

      const dataset = ExportService.generateDataset(images);

      expect(dataset).toHaveLength(1);
      expect(dataset[0].caption).toBe('Custom caption override');
    });

    it('should skip images without selected captions', () => {
      const images: ImageDoc[] = [
        createMockImage('1', 'image1.jpg', null, undefined, []),
        createMockImage('2', 'image2.jpg', 0, undefined, [
          { modelId: 'openai:gpt-4o-mini', caption: 'A city skyline', createdAt: Date.now() }
        ]),
      ];

      const dataset = ExportService.generateDataset(images);

      expect(dataset).toHaveLength(1);
      expect(dataset[0].filename).toBe('image2.jpg');
    });

    it('should call progress callback during generation', () => {
      const images: ImageDoc[] = [
        createMockImage('1', 'image1.jpg', 0, undefined, [
          { modelId: 'openai:gpt-4o-mini', caption: 'Caption 1', createdAt: Date.now() }
        ]),
        createMockImage('2', 'image2.jpg', 0, undefined, [
          { modelId: 'openai:gpt-4o-mini', caption: 'Caption 2', createdAt: Date.now() }
        ]),
      ];

      const progressCallback = vi.fn();
      ExportService.generateDataset(images, progressCallback);

      expect(progressCallback).toHaveBeenCalledTimes(3); // 2 images + final call
      expect(progressCallback).toHaveBeenCalledWith({
        processed: 0,
        total: 2,
        currentImage: 'image1.jpg'
      });
      expect(progressCallback).toHaveBeenCalledWith({
        processed: 1,
        total: 2,
        currentImage: 'image2.jpg'
      });
      expect(progressCallback).toHaveBeenCalledWith({
        processed: 2,
        total: 2,
        currentImage: undefined
      });
    });

    it('should handle empty selectedTextOverride', () => {
      const images: ImageDoc[] = [
        createMockImage('1', 'image1.jpg', 0, '   ', [ // whitespace only
          { modelId: 'openai:gpt-4o-mini', caption: 'Original caption', createdAt: Date.now() }
        ]),
      ];

      const dataset = ExportService.generateDataset(images);

      expect(dataset).toHaveLength(1);
      expect(dataset[0].caption).toBe('Original caption');
    });
  });

  describe('downloadDataset', () => {
    it('should create and trigger download with default filename', () => {
      const dataset: DatasetEntry[] = [
        { url: 'https://example.com/image1.jpg', filename: 'image1.jpg', caption: 'Caption 1' }
      ];

      const mockBlob = new Blob(['test']);
      const mockUrl = 'blob:mock-url';
      mockCreateObjectURL.mockReturnValue(mockUrl);

      const mockLink = {
        href: '',
        download: '',
        click: mockClick
      };
      mockCreateElement.mockReturnValue(mockLink);

      ExportService.downloadDataset(dataset);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe(mockUrl);
      expect(mockLink.download).toMatch(/^lora-dataset-\d{4}-\d{2}-\d{2}-\d+\.json$/);
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });

    it('should use custom filename when provided', () => {
      const dataset: DatasetEntry[] = [
        { url: 'https://example.com/image1.jpg', filename: 'image1.jpg', caption: 'Caption 1' }
      ];

      const mockLink = {
        href: '',
        download: '',
        click: mockClick
      };
      mockCreateElement.mockReturnValue(mockLink);

      ExportService.downloadDataset(dataset, 'custom-dataset.json');

      expect(mockLink.download).toBe('custom-dataset.json');
    });
  });

  describe('localStorage methods', () => {
    it('should check download button visibility from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('true');

      const result = ExportService.shouldShowDownloadButton();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('show_dl_button');
      expect(result).toBe(true);
    });

    it('should return false when localStorage returns false', () => {
      localStorageMock.getItem.mockReturnValue('false');

      const result = ExportService.shouldShowDownloadButton();

      expect(result).toBe(false);
    });

    it('should return false when localStorage throws error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const result = ExportService.shouldShowDownloadButton();

      expect(result).toBe(false);
    });

    it('should set download button visibility in localStorage', () => {
      ExportService.setDownloadButtonVisibility(true);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('show_dl_button', 'true');
    });

    it('should handle localStorage errors when setting visibility', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Should not throw
      expect(() => ExportService.setDownloadButtonVisibility(true)).not.toThrow();
    });
  });

  describe('getDatasetStats', () => {
    it('should calculate correct statistics', () => {
      const images: ImageDoc[] = [
        // Image with selected caption
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
        // Image with override
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
        // Image without caption
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
        },
      ];

      const stats = ExportService.getDatasetStats(images);

      expect(stats).toEqual({
        totalImages: 3,
        imagesWithCaptions: 2,
        imagesWithOverrides: 1,
        readyForExport: 2
      });
    });

    it('should handle empty image array', () => {
      const stats = ExportService.getDatasetStats([]);

      expect(stats).toEqual({
        totalImages: 0,
        imagesWithCaptions: 0,
        imagesWithOverrides: 0,
        readyForExport: 0
      });
    });
  });
});