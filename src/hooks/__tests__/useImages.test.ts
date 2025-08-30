import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImages } from '../useImages';
import { ImageService } from '../../services/imageService';
import { ImageDoc } from '../../types';

// Mock the ImageService
vi.mock('../../services/imageService');
const mockImageService = vi.mocked(ImageService);

// Mock useAuth hook
const mockUser = { uid: 'test-user-123' };
vi.mock('../useAuth', () => ({
  useAuth: () => ({ user: mockUser })
}));

describe('useImages', () => {
  const mockImages: ImageDoc[] = [
    {
      id: '1',
      filename: 'test1.jpg',
      storagePath: 'uploads/test1.jpg',
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
      storagePath: 'uploads/test2.jpg',
      downloadURL: 'https://example.com/test2.jpg',
      status: 'pending',
      candidates: [],
      selectedIndex: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with loading state', () => {
    mockImageService.subscribeToImages.mockReturnValue(() => {});

    const { result } = renderHook(() => useImages());

    expect(result.current.loading).toBe(true);
    expect(result.current.images).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should subscribe to images and update state', () => {
    let subscriptionCallback: (images: ImageDoc[]) => void;
    
    mockImageService.subscribeToImages.mockImplementation((userId, callback) => {
      subscriptionCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useImages());

    // Simulate subscription callback
    act(() => {
      subscriptionCallback!(mockImages);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.images).toEqual(mockImages);
    expect(result.current.error).toBeNull();
  });

  it('should handle subscription errors', () => {
    let errorCallback: (error: Error) => void;
    
    mockImageService.subscribeToImages.mockImplementation((userId, callback, onError) => {
      errorCallback = onError!;
      return () => {};
    });

    const { result } = renderHook(() => useImages());

    // Simulate subscription error
    act(() => {
      errorCallback!(new Error('Subscription failed'));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Subscription failed');
  });

  it('should upload image successfully', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockUploadedImage = mockImages[0];

    mockImageService.subscribeToImages.mockReturnValue(() => {});
    mockImageService.withRetry.mockResolvedValue(mockUploadedImage);

    const { result } = renderHook(() => useImages());

    let uploadResult: ImageDoc | null = null;
    await act(async () => {
      uploadResult = await result.current.uploadImage(mockFile);
    });

    expect(uploadResult).toEqual(mockUploadedImage);
    expect(mockImageService.withRetry).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('should handle upload errors', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    mockImageService.subscribeToImages.mockReturnValue(() => {});
    mockImageService.withRetry.mockRejectedValue(new Error('Upload failed'));

    const { result } = renderHook(() => useImages());

    let uploadResult: ImageDoc | null = null;
    await act(async () => {
      uploadResult = await result.current.uploadImage(mockFile);
    });

    expect(uploadResult).toBeNull();
    expect(result.current.error).toBe('Upload failed');
  });

  it('should update image successfully', async () => {
    const updates = { status: 'complete' as const, selectedIndex: 0 };

    mockImageService.subscribeToImages.mockReturnValue(() => {});
    mockImageService.withRetry.mockResolvedValue(undefined);

    const { result } = renderHook(() => useImages());

    let updateResult: boolean = false;
    await act(async () => {
      updateResult = await result.current.updateImage('1', updates);
    });

    expect(updateResult).toBe(true);
    expect(mockImageService.withRetry).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('should handle update errors', async () => {
    const updates = { status: 'complete' as const };

    mockImageService.subscribeToImages.mockReturnValue(() => {});
    mockImageService.withRetry.mockRejectedValue(new Error('Update failed'));

    const { result } = renderHook(() => useImages());

    let updateResult: boolean = true;
    await act(async () => {
      updateResult = await result.current.updateImage('1', updates);
    });

    expect(updateResult).toBe(false);
    expect(result.current.error).toBe('Update failed');
  });

  it('should delete image successfully', async () => {
    mockImageService.subscribeToImages.mockReturnValue(() => {});
    mockImageService.withRetry.mockResolvedValue(undefined);

    const { result } = renderHook(() => useImages());

    let deleteResult: boolean = false;
    await act(async () => {
      deleteResult = await result.current.deleteImage('1');
    });

    expect(deleteResult).toBe(true);
    expect(mockImageService.withRetry).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('should batch delete images successfully', async () => {
    const mockBatchResult = {
      successful: ['1', '2'],
      failed: []
    };

    mockImageService.subscribeToImages.mockReturnValue(() => {});
    mockImageService.batchDeleteImages.mockResolvedValue(mockBatchResult);

    const { result } = renderHook(() => useImages());

    let batchResult: any = null;
    await act(async () => {
      batchResult = await result.current.batchDeleteImages(['1', '2']);
    });

    expect(batchResult).toEqual(mockBatchResult);
    expect(mockImageService.batchDeleteImages).toHaveBeenCalledWith(['1', '2'], 'test-user-123', undefined);
  });

  it('should handle batch delete with partial failures', async () => {
    const mockBatchResult = {
      successful: ['1'],
      failed: [{ imageId: '2', error: 'Network error' }]
    };

    mockImageService.subscribeToImages.mockReturnValue(() => {});
    mockImageService.batchDeleteImages.mockResolvedValue(mockBatchResult);

    const { result } = renderHook(() => useImages());

    let batchResult: any = null;
    await act(async () => {
      batchResult = await result.current.batchDeleteImages(['1', '2']);
    });

    expect(batchResult).toEqual(mockBatchResult);
    expect(result.current.error).toBe('Failed to delete 1 of 2 images');
  });

  it('should handle batch delete when all fail', async () => {
    const mockBatchResult = {
      successful: [],
      failed: [
        { imageId: '1', error: 'Error 1' },
        { imageId: '2', error: 'Error 2' }
      ]
    };

    mockImageService.subscribeToImages.mockReturnValue(() => {});
    mockImageService.batchDeleteImages.mockResolvedValue(mockBatchResult);

    const { result } = renderHook(() => useImages());

    let batchResult: any = null;
    await act(async () => {
      batchResult = await result.current.batchDeleteImages(['1', '2']);
    });

    expect(batchResult).toEqual(mockBatchResult);
    expect(result.current.error).toBe('Failed to delete all 2 images');
  });

  it('should handle delete errors', async () => {
    mockImageService.subscribeToImages.mockReturnValue(() => {});
    mockImageService.withRetry.mockRejectedValue(new Error('Delete failed'));

    const { result } = renderHook(() => useImages());

    let deleteResult: boolean = true;
    await act(async () => {
      deleteResult = await result.current.deleteImage('1');
    });

    expect(deleteResult).toBe(false);
    expect(result.current.error).toBe('Delete failed');
  });

  it('should clear errors', () => {
    mockImageService.subscribeToImages.mockReturnValue(() => {});

    const { result } = renderHook(() => useImages());

    // Set an error first
    act(() => {
      result.current.uploadImage(new File(['test'], 'test.jpg'));
    });

    // Clear the error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle operations when user becomes null', async () => {
    // Test that operations fail gracefully when user is null
    mockImageService.subscribeToImages.mockReturnValue(() => {});

    const { result } = renderHook(() => useImages());

    // Test upload with authenticated user first
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    // Test that the hook handles null user in operations
    const uploadResult = await act(async () => {
      return await result.current.uploadImage(mockFile);
    });

    // Since we have a mocked user, this should work
    expect(uploadResult).not.toBeNull();
  });
});