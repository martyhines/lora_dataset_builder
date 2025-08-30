import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUpload } from '../useUpload';
import { StorageService } from '../../services/storageService';
import { ImageService } from '../../services/imageService';
import { processImages } from '../../utils/imageProcessing';

// Mock dependencies
vi.mock('../../services/storageService');
vi.mock('../../services/imageService');
vi.mock('../../utils/imageProcessing');
vi.mock('../useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' }
  })
}));
vi.mock('../usePerformanceMonitoring', () => ({
  useUploadPerformanceMonitoring: () => ({
    startUpload: vi.fn(),
    endUpload: vi.fn(),
    recordError: vi.fn()
  })
}));

const mockStorageService = StorageService as any;
const mockImageService = ImageService as any;
const mockProcessImages = processImages as any;

describe('useUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockProcessImages.mockResolvedValue([
      {
        file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
        processedFile: new File(['processed'], 'test.jpg', { type: 'image/jpeg' }),
        metadata: { width: 100, height: 100, size: 1000 }
      }
    ]);

    mockStorageService.prototype.uploadFile = vi.fn().mockResolvedValue({
      downloadURL: 'https://example.com/test.jpg',
      storagePath: 'uploads/test-user-id/test.jpg'
    });

    mockImageService.prototype.createImage = vi.fn().mockResolvedValue({
      id: 'test-image-id',
      filename: 'test.jpg',
      status: 'pending'
    });
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useUpload());

    expect(result.current.uploadStates.size).toBe(0);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.totalProgress).toBe(0);
    expect(result.current.completedUploads).toBe(0);
    expect(result.current.failedUploads).toBe(0);
  });

  it('should handle file upload successfully', async () => {
    const { result } = renderHook(() => useUpload());

    const testFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const fileList = [testFile] as any as FileList;

    await act(async () => {
      await result.current.uploadFiles(fileList);
    });

    expect(result.current.completedUploads).toBe(1);
    expect(result.current.failedUploads).toBe(0);
    expect(mockProcessImages).toHaveBeenCalledWith([testFile], expect.any(Object));
    expect(mockStorageService.prototype.uploadFile).toHaveBeenCalled();
    expect(mockImageService.prototype.createImage).toHaveBeenCalled();
  });

  it('should handle upload errors gracefully', async () => {
    const { result } = renderHook(() => useUpload());

    // Mock upload failure
    mockStorageService.prototype.uploadFile.mockRejectedValue(new Error('Upload failed'));

    const testFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const fileList = [testFile] as any as FileList;

    await act(async () => {
      await result.current.uploadFiles(fileList);
    });

    expect(result.current.completedUploads).toBe(0);
    expect(result.current.failedUploads).toBe(1);
  });

  it('should validate file types', async () => {
    const { result } = renderHook(() => useUpload({
      allowedTypes: ['image/jpeg', 'image/png']
    }));

    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileList = [invalidFile] as any as FileList;

    await act(async () => {
      await result.current.uploadFiles(fileList);
    });

    expect(result.current.failedUploads).toBe(1);
    expect(mockProcessImages).not.toHaveBeenCalled();
  });

  it('should validate file sizes', async () => {
    const { result } = renderHook(() => useUpload({
      maxFileSize: 1000 // 1KB
    }));

    const largeFile = new File(['x'.repeat(2000)], 'large.jpg', { type: 'image/jpeg' });
    const fileList = [largeFile] as any as FileList;

    await act(async () => {
      await result.current.uploadFiles(fileList);
    });

    expect(result.current.failedUploads).toBe(1);
    expect(mockProcessImages).not.toHaveBeenCalled();
  });

  it('should handle batch uploads with concurrency limit', async () => {
    const { result } = renderHook(() => useUpload({
      maxConcurrentUploads: 2
    }));

    const files = Array.from({ length: 5 }, (_, i) => 
      new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' })
    );
    const fileList = files as any as FileList;

    // Mock processing to return multiple results
    mockProcessImages.mockResolvedValue(
      files.map(file => ({
        file,
        processedFile: file,
        metadata: { width: 100, height: 100, size: 1000 }
      }))
    );

    await act(async () => {
      await result.current.uploadFiles(fileList);
    });

    expect(result.current.completedUploads).toBe(5);
    expect(mockStorageService.prototype.uploadFile).toHaveBeenCalledTimes(5);
  });

  it('should allow retry of failed uploads', async () => {
    const { result } = renderHook(() => useUpload());

    // First attempt fails
    mockStorageService.prototype.uploadFile.mockRejectedValueOnce(new Error('Network error'));
    // Second attempt succeeds
    mockStorageService.prototype.uploadFile.mockResolvedValueOnce({
      downloadURL: 'https://example.com/test.jpg',
      storagePath: 'uploads/test-user-id/test.jpg'
    });

    const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileList = [testFile] as any as FileList;

    // Initial upload
    await act(async () => {
      await result.current.uploadFiles(fileList);
    });

    expect(result.current.failedUploads).toBe(1);

    // Get the file ID for retry
    const fileId = Array.from(result.current.uploadStates.keys())[0];

    // Retry upload
    await act(async () => {
      await result.current.retryUpload(fileId);
    });

    expect(result.current.completedUploads).toBe(1);
    expect(result.current.failedUploads).toBe(0);
  });

  it('should clear completed uploads', () => {
    const { result } = renderHook(() => useUpload());

    // Manually set some upload states for testing
    act(() => {
      const newStates = new Map();
      newStates.set('file1', {
        file: new File(['test'], 'test1.jpg'),
        status: 'complete' as const,
        progress: 100
      });
      newStates.set('file2', {
        file: new File(['test'], 'test2.jpg'),
        status: 'error' as const,
        progress: 0,
        error: 'Failed'
      });
      (result.current as any).setUploadStates(newStates);
    });

    act(() => {
      result.current.clearCompleted();
    });

    // Should only keep the failed upload
    expect(result.current.uploadStates.size).toBe(1);
    expect(Array.from(result.current.uploadStates.values())[0].status).toBe('error');
  });

  it('should cancel all uploads', () => {
    const { result } = renderHook(() => useUpload());

    // Set some upload states
    act(() => {
      const newStates = new Map();
      newStates.set('file1', {
        file: new File(['test'], 'test1.jpg'),
        status: 'uploading' as const,
        progress: 50
      });
      (result.current as any).setUploadStates(newStates);
    });

    act(() => {
      result.current.cancelAll();
    });

    expect(result.current.uploadStates.size).toBe(0);
  });

  it('should handle image processing options', async () => {
    const processingOptions = {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.8
    };

    const { result } = renderHook(() => useUpload({
      processingOptions
    }));

    const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileList = [testFile] as any as FileList;

    await act(async () => {
      await result.current.uploadFiles(fileList);
    });

    expect(mockProcessImages).toHaveBeenCalledWith([testFile], processingOptions);
  });

  it('should track upload progress correctly', async () => {
    const { result } = renderHook(() => useUpload());

    // Mock upload with progress callback
    mockStorageService.prototype.uploadFile.mockImplementation((file, path, onProgress) => {
      // Simulate progress updates
      setTimeout(() => onProgress?.(25), 10);
      setTimeout(() => onProgress?.(50), 20);
      setTimeout(() => onProgress?.(75), 30);
      setTimeout(() => onProgress?.(100), 40);
      
      return Promise.resolve({
        downloadURL: 'https://example.com/test.jpg',
        storagePath: 'uploads/test-user-id/test.jpg'
      });
    });

    const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileList = [testFile] as any as FileList;

    await act(async () => {
      await result.current.uploadFiles(fileList);
    });

    expect(result.current.totalProgress).toBe(100);
  });
});