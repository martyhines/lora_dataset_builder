import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ImageService } from '../imageService';
import { ImageDoc } from '../../types';

// Mock Firebase modules
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: () => ({ seconds: Date.now() / 1000 })
}));

vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn()
}));

vi.mock('../firebase', () => ({
  db: {},
  storage: {}
}));

// Import mocked functions after mocking
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

const mockCollection = vi.mocked(collection);
const mockDoc = vi.mocked(doc);
const mockAddDoc = vi.mocked(addDoc);
const mockUpdateDoc = vi.mocked(updateDoc);
const mockDeleteDoc = vi.mocked(deleteDoc);
const mockGetDocs = vi.mocked(getDocs);
const mockQuery = vi.mocked(query);
const mockOrderBy = vi.mocked(orderBy);
const mockOnSnapshot = vi.mocked(onSnapshot);
const mockRef = vi.mocked(ref);
const mockUploadBytes = vi.mocked(uploadBytes);
const mockGetDownloadURL = vi.mocked(getDownloadURL);
const mockDeleteObject = vi.mocked(deleteObject);

describe('ImageService', () => {
  const mockUserId = 'test-user-123';
  const mockImageId = 'test-image-456';
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockCollection.mockReturnValue('mock-collection');
    mockDoc.mockReturnValue('mock-doc');
    mockQuery.mockReturnValue('mock-query');
    mockOrderBy.mockReturnValue('mock-order');
    mockRef.mockReturnValue({ fullPath: 'test/path' });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload image and create Firestore document', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockDownloadURL = 'https://example.com/image.jpg';
      const mockDocRef = { id: 'new-doc-id' };

      mockUploadBytes.mockResolvedValue({ ref: { fullPath: 'uploads/test-user-123/123456/test.jpg' } });
      mockGetDownloadURL.mockResolvedValue(mockDownloadURL);
      mockAddDoc.mockResolvedValue(mockDocRef);

      const result = await ImageService.uploadImage(mockFile, mockUserId);

      expect(mockUploadBytes).toHaveBeenCalled();
      expect(mockGetDownloadURL).toHaveBeenCalled();
      expect(mockAddDoc).toHaveBeenCalled();
      expect(result).toMatchObject({
        id: 'new-doc-id',
        filename: expect.stringContaining('test.jpg'),
        downloadURL: mockDownloadURL,
        status: 'pending',
        candidates: [],
        selectedIndex: null
      });
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockUploadBytes.mockRejectedValue(new Error('Upload failed'));

      await expect(ImageService.uploadImage(mockFile, mockUserId))
        .rejects.toThrow('Failed to upload image: Upload failed');
    });
  });

  describe('updateImage', () => {
    it('should update image document', async () => {
      const updates = { status: 'complete' as const, selectedIndex: 0 };
      
      await ImageService.updateImage(mockImageId, mockUserId, updates);

      expect(mockDoc).toHaveBeenCalledWith(
        {},
        'users',
        mockUserId,
        'images',
        mockImageId
      );
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc',
        expect.objectContaining({
          ...updates,
          updatedAt: expect.any(Number)
        })
      );
    });

    it('should handle update errors', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Update failed'));

      await expect(ImageService.updateImage(mockImageId, mockUserId, {}))
        .rejects.toThrow('Failed to update image: Update failed');
    });
  });

  describe('deleteImage', () => {
    it('should delete image from storage and Firestore', async () => {
      const mockImages: ImageDoc[] = [{
        id: mockImageId,
        filename: 'test.jpg',
        storagePath: 'uploads/test-user-123/123456/test.jpg',
        downloadURL: 'https://example.com/image.jpg',
        status: 'complete',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }];

      // Mock getImages to return the image
      const mockQuerySnapshot = {
        docs: mockImages.map(img => ({
          id: img.id,
          data: () => {
            const { id, ...data } = img;
            return data;
          }
        }))
      };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      await ImageService.deleteImage(mockImageId, mockUserId);

      expect(mockDeleteObject).toHaveBeenCalled();
      expect(mockDeleteDoc).toHaveBeenCalled();
    });

    it('should handle delete errors when image not found', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });

      await expect(ImageService.deleteImage(mockImageId, mockUserId))
        .rejects.toThrow('Failed to delete image: Image document not found');
    });

    it('should handle storage file not found gracefully', async () => {
      const mockImages: ImageDoc[] = [{
        id: mockImageId,
        filename: 'test.jpg',
        storagePath: 'uploads/test-user-123/123456/test.jpg',
        downloadURL: 'https://example.com/image.jpg',
        status: 'complete',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }];

      const mockQuerySnapshot = {
        docs: mockImages.map(img => ({
          id: img.id,
          data: () => {
            const { id, ...data } = img;
            return data;
          }
        }))
      };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      // Mock storage file not found error
      const storageError = new Error('object-not-found');
      mockDeleteObject.mockRejectedValue(storageError);

      // Should still succeed and delete from Firestore
      await ImageService.deleteImage(mockImageId, mockUserId);

      expect(mockDeleteObject).toHaveBeenCalled();
      expect(mockDeleteDoc).toHaveBeenCalled();
    });

    it('should handle Firestore deletion failure after storage deletion', async () => {
      const mockImages: ImageDoc[] = [{
        id: mockImageId,
        filename: 'test.jpg',
        storagePath: 'uploads/test-user-123/123456/test.jpg',
        downloadURL: 'https://example.com/image.jpg',
        status: 'complete',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }];

      const mockQuerySnapshot = {
        docs: mockImages.map(img => ({
          id: img.id,
          data: () => {
            const { id, ...data } = img;
            return data;
          }
        }))
      };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      // Storage deletion succeeds, Firestore fails
      mockDeleteObject.mockResolvedValue(undefined);
      mockDeleteDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(ImageService.deleteImage(mockImageId, mockUserId))
        .rejects.toThrow('Failed to delete image: Failed to delete Firestore document: Firestore error');

      expect(mockDeleteObject).toHaveBeenCalled();
      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });

  describe('batchDeleteImages', () => {
    it('should delete multiple images successfully', async () => {
      const imageIds = ['image-1', 'image-2', 'image-3'];
      const mockImages: ImageDoc[] = imageIds.map(id => ({
        id,
        filename: `${id}.jpg`,
        storagePath: `uploads/${id}.jpg`,
        downloadURL: `https://example.com/${id}.jpg`,
        status: 'complete',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));

      // Mock getImages for each deletion
      const mockQuerySnapshot = {
        docs: mockImages.map(img => ({
          id: img.id,
          data: () => {
            const { id, ...data } = img;
            return data;
          }
        }))
      };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      const result = await ImageService.batchDeleteImages(imageIds, mockUserId);

      expect(result.successful).toEqual(imageIds);
      expect(result.failed).toEqual([]);
      expect(mockDeleteObject).toHaveBeenCalledTimes(3);
      expect(mockDeleteDoc).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures in batch deletion', async () => {
      const imageIds = ['image-1', 'image-2', 'image-3'];
      const mockImages: ImageDoc[] = imageIds.map(id => ({
        id,
        filename: `${id}.jpg`,
        storagePath: `uploads/${id}.jpg`,
        downloadURL: `https://example.com/${id}.jpg`,
        status: 'complete',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));

      const mockQuerySnapshot = {
        docs: mockImages.map(img => ({
          id: img.id,
          data: () => {
            const { id, ...data } = img;
            return data;
          }
        }))
      };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      // Make second deletion fail
      mockDeleteObject
        .mockResolvedValueOnce(undefined) // First succeeds
        .mockRejectedValueOnce(new Error('Storage error')) // Second fails
        .mockResolvedValueOnce(undefined); // Third succeeds

      const result = await ImageService.batchDeleteImages(imageIds, mockUserId);

      expect(result.successful).toEqual(['image-1', 'image-3']);
      expect(result.failed).toEqual([
        { imageId: 'image-2', error: 'Failed to delete image: Failed to delete storage file: Storage error' }
      ]);
    });

    it('should call progress callback during batch deletion', async () => {
      const imageIds = ['image-1', 'image-2'];
      const mockImages: ImageDoc[] = imageIds.map(id => ({
        id,
        filename: `${id}.jpg`,
        storagePath: `uploads/${id}.jpg`,
        downloadURL: `https://example.com/${id}.jpg`,
        status: 'complete',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));

      const mockQuerySnapshot = {
        docs: mockImages.map(img => ({
          id: img.id,
          data: () => {
            const { id, ...data } = img;
            return data;
          }
        }))
      };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      const mockProgressCallback = vi.fn();

      await ImageService.batchDeleteImages(imageIds, mockUserId, mockProgressCallback);

      expect(mockProgressCallback).toHaveBeenCalledWith(0, 2, 'image-1');
      expect(mockProgressCallback).toHaveBeenCalledWith(1, 2, 'image-2');
      expect(mockProgressCallback).toHaveBeenCalledWith(2, 2, '');
    });
  });

  describe('getImages', () => {
    it('should retrieve all images for user', async () => {
      const mockImages = [
        { id: '1', filename: 'image1.jpg', status: 'complete' },
        { id: '2', filename: 'image2.jpg', status: 'pending' }
      ];

      const mockQuerySnapshot = {
        docs: mockImages.map(img => ({
          id: img.id,
          data: () => {
            const { id, ...data } = img;
            return data;
          }
        }))
      };

      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      const result = await ImageService.getImages(mockUserId);

      expect(mockQuery).toHaveBeenCalled();
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ id: '1', filename: 'image1.jpg' });
    });

    it('should handle get images errors', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      await expect(ImageService.getImages(mockUserId))
        .rejects.toThrow('Failed to get images: Firestore error');
    });
  });

  describe('subscribeToImages', () => {
    it('should set up real-time subscription', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const unsubscribe = ImageService.subscribeToImages(mockUserId, mockCallback);

      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle subscription errors', () => {
      const mockCallback = vi.fn();
      const mockErrorCallback = vi.fn();
      
      // Simulate onSnapshot calling the error callback
      mockOnSnapshot.mockImplementation((query, successCallback, errorCallback) => {
        errorCallback(new Error('Subscription error'));
        return vi.fn();
      });

      ImageService.subscribeToImages(mockUserId, mockCallback, mockErrorCallback);

      expect(mockErrorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Subscription error')
        })
      );
    });
  });

  describe('withRetry', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const mockOperation = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      const result = await ImageService.withRetry(mockOperation, 3, 10);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Persistent failure'));

      await expect(ImageService.withRetry(mockOperation, 2, 10))
        .rejects.toThrow('Persistent failure');
      
      expect(mockOperation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
});