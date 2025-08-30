import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OfflineStorageService } from '../offlineStorageService';
import type { ImageDoc } from '../../types';

// Mock IndexedDB
const mockObjectStore = {
  add: vi.fn(),
  put: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  getAll: vi.fn(),
  createIndex: vi.fn(),
  index: vi.fn(() => ({
    getAll: vi.fn()
  }))
};

const mockTransaction = {
  objectStore: vi.fn(() => mockObjectStore),
  oncomplete: null,
  onerror: null,
  onabort: null
};

const mockDatabase = {
  createObjectStore: vi.fn(() => mockObjectStore),
  transaction: vi.fn(() => mockTransaction),
  close: vi.fn(),
  version: 1
};

const mockOpenRequest = {
  result: mockDatabase,
  onsuccess: null,
  onerror: null,
  onupgradeneeded: null
};

beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock IndexedDB
  global.indexedDB = {
    open: vi.fn(() => mockOpenRequest),
    deleteDatabase: vi.fn()
  } as any;

  // Reset mock functions
  Object.values(mockObjectStore).forEach(mock => {
    if (typeof mock === 'function') mock.mockReset();
  });
});

describe('OfflineStorageService', () => {
  let service: OfflineStorageService;

  beforeEach(async () => {
    service = OfflineStorageService.getInstance();
    
    // Simulate successful database opening
    setTimeout(() => {
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess({} as any);
      }
    }, 0);
    
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  it('should be a singleton', () => {
    const instance1 = OfflineStorageService.getInstance();
    const instance2 = OfflineStorageService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should initialize database', () => {
    expect(global.indexedDB.open).toHaveBeenCalledWith('LoraDatasetBuilder', 1);
  });

  describe('Image operations', () => {
    const mockImage: ImageDoc = {
      id: 'test-id',
      filename: 'test.jpg',
      storagePath: 'path/test.jpg',
      downloadURL: 'https://example.com/test.jpg',
      status: 'complete',
      candidates: [],
      selectedIndex: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    it('should store image', async () => {
      mockObjectStore.put.mockImplementation((data, callback) => {
        setTimeout(() => callback?.({ target: { result: data } }), 0);
        return { onsuccess: null, onerror: null };
      });

      await service.storeImage('user-id', mockImage);

      expect(mockDatabase.transaction).toHaveBeenCalledWith(['images'], 'readwrite');
      expect(mockObjectStore.put).toHaveBeenCalledWith({
        ...mockImage,
        userId: 'user-id'
      });
    });

    it('should get image', async () => {
      mockObjectStore.get.mockImplementation((key, callback) => {
        setTimeout(() => callback?.({ 
          target: { result: { ...mockImage, userId: 'user-id' } } 
        }), 0);
        return { onsuccess: null, onerror: null };
      });

      const result = await service.getImage('user-id', 'test-id');

      expect(result).toEqual(mockImage);
      expect(mockObjectStore.get).toHaveBeenCalledWith('user-id:test-id');
    });

    it('should return null for non-existent image', async () => {
      mockObjectStore.get.mockImplementation((key, callback) => {
        setTimeout(() => callback?.({ target: { result: undefined } }), 0);
        return { onsuccess: null, onerror: null };
      });

      const result = await service.getImage('user-id', 'non-existent');

      expect(result).toBeNull();
    });

    it('should get all images for user', async () => {
      const mockImages = [
        { ...mockImage, id: 'img1', userId: 'user-id' },
        { ...mockImage, id: 'img2', userId: 'user-id' }
      ];

      const mockIndex = {
        getAll: vi.fn().mockImplementation((range, callback) => {
          setTimeout(() => callback?.({ target: { result: mockImages } }), 0);
          return { onsuccess: null, onerror: null };
        })
      };

      mockObjectStore.index.mockReturnValue(mockIndex);

      const result = await service.getAllImages('user-id');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('img1');
      expect(result[1].id).toBe('img2');
    });

    it('should delete image', async () => {
      mockObjectStore.delete.mockImplementation((key, callback) => {
        setTimeout(() => callback?.({ target: { result: undefined } }), 0);
        return { onsuccess: null, onerror: null };
      });

      await service.deleteImage('user-id', 'test-id');

      expect(mockObjectStore.delete).toHaveBeenCalledWith('user-id:test-id');
    });

    it('should clear all images for user', async () => {
      const mockImages = [
        { ...mockImage, id: 'img1', userId: 'user-id' },
        { ...mockImage, id: 'img2', userId: 'user-id' }
      ];

      const mockIndex = {
        getAll: vi.fn().mockImplementation((range, callback) => {
          setTimeout(() => callback?.({ target: { result: mockImages } }), 0);
          return { onsuccess: null, onerror: null };
        })
      };

      mockObjectStore.index.mockReturnValue(mockIndex);
      mockObjectStore.delete.mockImplementation((key, callback) => {
        setTimeout(() => callback?.({ target: { result: undefined } }), 0);
        return { onsuccess: null, onerror: null };
      });

      await service.clearImages('user-id');

      expect(mockObjectStore.delete).toHaveBeenCalledTimes(2);
      expect(mockObjectStore.delete).toHaveBeenCalledWith('user-id:img1');
      expect(mockObjectStore.delete).toHaveBeenCalledWith('user-id:img2');
    });
  });

  describe('Sync operations', () => {
    it('should store sync operation', async () => {
      const operation = {
        id: 'op-1',
        type: 'create' as const,
        collection: 'images',
        documentId: 'img-1',
        data: { test: 'data' },
        timestamp: Date.now()
      };

      mockObjectStore.add.mockImplementation((data, callback) => {
        setTimeout(() => callback?.({ target: { result: data.id } }), 0);
        return { onsuccess: null, onerror: null };
      });

      await service.storeSyncOperation('user-id', operation);

      expect(mockObjectStore.add).toHaveBeenCalledWith({
        ...operation,
        userId: 'user-id'
      });
    });

    it('should get pending sync operations', async () => {
      const operations = [
        {
          id: 'op-1',
          type: 'create',
          collection: 'images',
          documentId: 'img-1',
          data: {},
          timestamp: Date.now(),
          userId: 'user-id'
        }
      ];

      const mockIndex = {
        getAll: vi.fn().mockImplementation((range, callback) => {
          setTimeout(() => callback?.({ target: { result: operations } }), 0);
          return { onsuccess: null, onerror: null };
        })
      };

      mockObjectStore.index.mockReturnValue(mockIndex);

      const result = await service.getPendingSyncOperations('user-id');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('op-1');
    });

    it('should remove sync operation', async () => {
      mockObjectStore.delete.mockImplementation((key, callback) => {
        setTimeout(() => callback?.({ target: { result: undefined } }), 0);
        return { onsuccess: null, onerror: null };
      });

      await service.removeSyncOperation('user-id', 'op-1');

      expect(mockObjectStore.delete).toHaveBeenCalledWith('user-id:op-1');
    });
  });

  describe('Data export/import', () => {
    it('should export user data', async () => {
      const mockImages = [mockImage];
      const mockOperations = [{
        id: 'op-1',
        type: 'create' as const,
        collection: 'images',
        documentId: 'img-1',
        data: {},
        timestamp: Date.now()
      }];

      // Mock getAllImages
      service.getAllImages = vi.fn().mockResolvedValue(mockImages);
      service.getPendingSyncOperations = vi.fn().mockResolvedValue(mockOperations);

      const result = await service.exportData('user-id');

      expect(result).toEqual({
        images: mockImages,
        syncOperations: mockOperations,
        exportedAt: expect.any(Number)
      });
    });

    it('should import user data', async () => {
      const importData = {
        images: [mockImage],
        syncOperations: [{
          id: 'op-1',
          type: 'create' as const,
          collection: 'images',
          documentId: 'img-1',
          data: {},
          timestamp: Date.now()
        }],
        exportedAt: Date.now()
      };

      service.storeImage = vi.fn().mockResolvedValue(undefined);
      service.storeSyncOperation = vi.fn().mockResolvedValue(undefined);

      await service.importData('user-id', importData);

      expect(service.storeImage).toHaveBeenCalledWith('user-id', mockImage);
      expect(service.storeSyncOperation).toHaveBeenCalledWith('user-id', importData.syncOperations[0]);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors', async () => {
      mockObjectStore.get.mockImplementation((key, callback) => {
        setTimeout(() => {
          const request = { onerror: null };
          if (request.onerror) {
            request.onerror({ target: { error: new Error('DB Error') } } as any);
          }
        }, 0);
        return { onsuccess: null, onerror: null };
      });

      await expect(service.getImage('user-id', 'test-id')).rejects.toThrow('DB Error');
    });

    it('should handle transaction errors', async () => {
      mockDatabase.transaction.mockImplementation(() => {
        const transaction = {
          objectStore: vi.fn(() => mockObjectStore),
          onerror: null
        };
        setTimeout(() => {
          if (transaction.onerror) {
            transaction.onerror({ target: { error: new Error('Transaction Error') } } as any);
          }
        }, 0);
        return transaction;
      });

      await expect(service.storeImage('user-id', mockImage)).rejects.toThrow('Transaction Error');
    });
  });

  describe('Database upgrade', () => {
    it('should handle database upgrade', () => {
      const upgradeEvent = {
        target: { result: mockDatabase },
        oldVersion: 0,
        newVersion: 1
      };

      // Simulate upgrade needed
      if (mockOpenRequest.onupgradeneeded) {
        mockOpenRequest.onupgradeneeded(upgradeEvent as any);
      }

      expect(mockDatabase.createObjectStore).toHaveBeenCalledWith('images', { keyPath: 'id' });
      expect(mockDatabase.createObjectStore).toHaveBeenCalledWith('syncOperations', { keyPath: 'id' });
    });
  });
});