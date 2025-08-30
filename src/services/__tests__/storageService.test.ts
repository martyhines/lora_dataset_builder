import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StorageService } from '../storageService';

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn()
}));

vi.mock('../firebase', () => ({
  storage: {}
}));

// Import mocked functions after mocking
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

const mockRef = vi.mocked(ref);
const mockUploadBytesResumable = vi.mocked(uploadBytesResumable);
const mockGetDownloadURL = vi.mocked(getDownloadURL);
const mockDeleteObject = vi.mocked(deleteObject);

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRef.mockReturnValue({ fullPath: 'test/path', name: 'test.jpg' });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload file with progress tracking', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockPath = 'uploads/test/test.jpg';
      const mockDownloadURL = 'https://example.com/test.jpg';
      const mockProgressCallback = vi.fn();

      // Mock upload task
      const mockUploadTask = {
        on: vi.fn(),
        snapshot: {
          ref: { fullPath: 'test/path', name: 'test.jpg' },
          totalBytes: 1000
        }
      };

      mockUploadBytesResumable.mockReturnValue(mockUploadTask);
      mockGetDownloadURL.mockResolvedValue(mockDownloadURL);

      // Simulate successful upload
      mockUploadTask.on.mockImplementation((event, progressCallback, errorCallback, completeCallback) => {
        // Simulate progress
        progressCallback({
          bytesTransferred: 500,
          totalBytes: 1000,
          state: 'running'
        });
        
        // Simulate completion
        setTimeout(completeCallback, 0);
      });

      const resultPromise = StorageService.uploadFile(mockFile, mockPath, mockProgressCallback);
      
      // Wait for completion
      const result = await resultPromise;

      expect(mockUploadBytesResumable).toHaveBeenCalledWith(expect.anything(), mockFile);
      expect(mockProgressCallback).toHaveBeenCalledWith({
        bytesTransferred: 500,
        totalBytes: 1000,
        progress: 50,
        state: 'running'
      });
      expect(result).toEqual({
        downloadURL: mockDownloadURL,
        fullPath: 'test/path',
        name: 'test.jpg',
        size: 1000
      });
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockPath = 'uploads/test/test.jpg';

      const mockUploadTask = {
        on: vi.fn(),
        snapshot: { ref: { fullPath: 'test/path', name: 'test.jpg' } }
      };

      mockUploadBytesResumable.mockReturnValue(mockUploadTask);

      // Simulate upload error
      mockUploadTask.on.mockImplementation((event, progressCallback, errorCallback) => {
        errorCallback(new Error('Upload failed'));
      });

      await expect(StorageService.uploadFile(mockFile, mockPath))
        .rejects.toThrow('Upload failed: Upload failed');
    });
  });

  describe('uploadFiles', () => {
    it('should upload multiple files with progress tracking', async () => {
      const mockFiles = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      ];
      
      const mockGetPath = vi.fn().mockImplementation((file, index) => `uploads/${index}/${file.name}`);
      const mockOnProgress = vi.fn();
      const mockOnComplete = vi.fn();
      const mockDownloadURL = 'https://example.com/test.jpg';

      // Mock successful uploads
      const mockUploadTask = {
        on: vi.fn(),
        snapshot: {
          ref: { fullPath: 'test/path', name: 'test.jpg' },
          totalBytes: 1000
        }
      };

      mockUploadBytesResumable.mockReturnValue(mockUploadTask);
      mockGetDownloadURL.mockResolvedValue(mockDownloadURL);

      mockUploadTask.on.mockImplementation((event, progressCallback, errorCallback, completeCallback) => {
        setTimeout(completeCallback, 0);
      });

      const results = await StorageService.uploadFiles(
        mockFiles,
        mockGetPath,
        mockOnProgress,
        mockOnComplete
      );

      expect(results).toHaveLength(2);
      expect(mockOnComplete).toHaveBeenCalledTimes(2);
      expect(mockGetPath).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures in batch upload', async () => {
      const mockFiles = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      ];
      
      const mockGetPath = vi.fn().mockImplementation((file, index) => `uploads/${index}/${file.name}`);
      const mockOnError = vi.fn();

      let callCount = 0;
      const mockUploadTask = {
        on: vi.fn(),
        snapshot: { ref: { fullPath: 'test/path', name: 'test.jpg' } }
      };

      mockUploadBytesResumable.mockReturnValue(mockUploadTask);

      // First upload succeeds, second fails
      mockUploadTask.on.mockImplementation((event, progressCallback, errorCallback, completeCallback) => {
        callCount++;
        if (callCount === 1) {
          setTimeout(completeCallback, 0);
        } else {
          errorCallback(new Error('Upload failed'));
        }
      });

      await expect(StorageService.uploadFiles(mockFiles, mockGetPath, undefined, undefined, mockOnError))
        .rejects.toThrow('1 of 2 uploads failed');
      
      expect(mockOnError).toHaveBeenCalledWith(1, expect.any(Error));
    });
  });

  describe('deleteFile', () => {
    it('should delete file from storage', async () => {
      const mockPath = 'uploads/test/test.jpg';

      await StorageService.deleteFile(mockPath);

      expect(mockRef).toHaveBeenCalledWith({}, mockPath);
      expect(mockDeleteObject).toHaveBeenCalled();
    });

    it('should handle delete errors', async () => {
      const mockPath = 'uploads/test/test.jpg';
      mockDeleteObject.mockRejectedValue(new Error('Delete failed'));

      await expect(StorageService.deleteFile(mockPath))
        .rejects.toThrow('Failed to delete file: Delete failed');
    });
  });

  describe('validateFile', () => {
    it('should validate file size and type', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB

      const result = await StorageService.validateFile(mockFile, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png']
      });

      expect(result).toBe(true);
    });

    it('should reject files that are too large', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 15 * 1024 * 1024 }); // 15MB

      await expect(StorageService.validateFile(mockFile, {
        maxSize: 10 * 1024 * 1024 // 10MB
      })).rejects.toThrow('File size 15.00MB exceeds maximum 10.00MB');
    });

    it('should reject files with invalid types', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      await expect(StorageService.validateFile(mockFile, {
        allowedTypes: ['image/jpeg', 'image/png']
      })).rejects.toThrow('File type text/plain not allowed');
    });

    it('should validate image dimensions when specified', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock Image constructor
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        width: 800,
        height: 600,
        src: ''
      };
      
      global.Image = vi.fn().mockImplementation(() => mockImage);

      const validationPromise = StorageService.validateFile(mockFile, {
        maxDimensions: { width: 1000, height: 800 }
      });

      // Simulate image load
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 0);

      const result = await validationPromise;
      expect(result).toBe(true);
    });

    it('should reject images with dimensions too large', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        width: 2000,
        height: 1500,
        src: ''
      };
      
      global.Image = vi.fn().mockImplementation(() => mockImage);

      const validationPromise = StorageService.validateFile(mockFile, {
        maxDimensions: { width: 1000, height: 800 }
      });

      // Simulate image load
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 0);

      await expect(validationPromise)
        .rejects.toThrow('Image dimensions 2000x1500 exceed maximum 1000x800');
    });
  });
});