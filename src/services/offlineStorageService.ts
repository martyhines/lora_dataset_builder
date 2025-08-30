/**
 * Offline Storage Service
 * Provides local persistence for offline support and data caching
 * Requirements: 4.3, 4.4
 */

import type { ImageDoc } from '../types';

export interface OfflineData {
  images: Record<string, ImageDoc>;
  userSettings: Record<string, any>;
  lastSync: number;
  version: number;
}

export interface StorageQuota {
  used: number;
  available: number;
  total: number;
}

/**
 * Service for managing offline data storage using IndexedDB
 */
export class OfflineStorageService {
  private static instance: OfflineStorageService;
  private db: IDBDatabase | null = null;
  private readonly dbName = 'LoraDatasetBuilder';
  private readonly dbVersion = 1;
  private readonly stores = {
    images: 'images',
    userSettings: 'userSettings',
    metadata: 'metadata'
  };

  private constructor() {}

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  /**
   * Initialize the IndexedDB database
   */
  async initialize(): Promise<void> {
    // If already initialized, return immediately
    if (this.db) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create images store
        if (!db.objectStoreNames.contains(this.stores.images)) {
          const imagesStore = db.createObjectStore(this.stores.images, { keyPath: 'id' });
          imagesStore.createIndex('userId', 'userId', { unique: false });
          imagesStore.createIndex('status', 'status', { unique: false });
          imagesStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create user settings store
        if (!db.objectStoreNames.contains(this.stores.userSettings)) {
          db.createObjectStore(this.stores.userSettings, { keyPath: 'userId' });
        }

        // Create metadata store
        if (!db.objectStoreNames.contains(this.stores.metadata)) {
          db.createObjectStore(this.stores.metadata, { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Store images for a user
   */
  async storeImages(userId: string, images: ImageDoc[]): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.stores.images], 'readwrite');
    const store = transaction.objectStore(this.stores.images);

    // Add userId to each image for indexing
    const imagesWithUserId = images.map(image => ({ ...image, userId }));

    for (const image of imagesWithUserId) {
      await this.promisifyRequest(store.put(image));
    }

    await this.promisifyTransaction(transaction);
    await this.updateLastSync();
  }

  /**
   * Get images for a user
   */
  async getImages(userId: string): Promise<ImageDoc[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.stores.images], 'readonly');
    const store = transaction.objectStore(this.stores.images);
    const index = store.index('userId');

    const request = index.getAll(userId);
    const images = await this.promisifyRequest(request);

    // Remove userId field before returning
    return images.map(({ userId: _, ...image }) => image as ImageDoc);
  }

  /**
   * Store a single image
   */
  async storeImage(userId: string, image: ImageDoc): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.stores.images], 'readwrite');
    const store = transaction.objectStore(this.stores.images);

    await this.promisifyRequest(store.put({ ...image, userId }));
    await this.promisifyTransaction(transaction);
  }

  /**
   * Get a single image
   */
  async getImage(imageId: string): Promise<ImageDoc | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.stores.images], 'readonly');
    const store = transaction.objectStore(this.stores.images);

    const image = await this.promisifyRequest(store.get(imageId));
    
    if (image) {
      const { userId: _, ...imageData } = image;
      return imageData as ImageDoc;
    }

    return null;
  }

  /**
   * Update an image
   */
  async updateImage(_userId: string, imageId: string, updates: Partial<ImageDoc>): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.stores.images], 'readwrite');
    const store = transaction.objectStore(this.stores.images);

    const existing = await this.promisifyRequest(store.get(imageId));
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: Date.now() };
      await this.promisifyRequest(store.put(updated));
    }

    await this.promisifyTransaction(transaction);
  }

  /**
   * Delete an image
   */
  async deleteImage(imageId: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.stores.images], 'readwrite');
    const store = transaction.objectStore(this.stores.images);

    await this.promisifyRequest(store.delete(imageId));
    await this.promisifyTransaction(transaction);
  }

  /**
   * Get images by status
   */
  async getImagesByStatus(userId: string, status: ImageDoc['status']): Promise<ImageDoc[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.stores.images], 'readonly');
    const store = transaction.objectStore(this.stores.images);

    // Get all images for user first, then filter by status
    // This is a limitation of IndexedDB compound indexes
    const userImages = await this.getImages(userId);
    return userImages.filter(image => image.status === status);
  }

  /**
   * Store user settings
   */
  async storeUserSettings(settings: any): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.stores.userSettings], 'readwrite');
    const store = transaction.objectStore(this.stores.userSettings);

    await this.promisifyRequest(store.put({ userId: 'default', ...settings, updatedAt: Date.now() }));
    await this.promisifyTransaction(transaction);
  }

  /**
   * Get user settings
   */
  async getUserSettings(): Promise<any | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.stores.userSettings], 'readonly');
    const store = transaction.objectStore(this.stores.userSettings);

    const settings = await this.promisifyRequest(store.get('default'));
    
    if (settings) {
      const { userId: _, ...settingsData } = settings;
      return settingsData;
    }

    return null;
  }

  /**
   * Get last sync timestamp
   */
  async getLastSync(): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.stores.metadata], 'readonly');
    const store = transaction.objectStore(this.stores.metadata);

    const metadata = await this.promisifyRequest(store.get('lastSync:default'));
    return metadata?.timestamp || 0;
  }

  /**
   * Update last sync timestamp
   */
  async updateLastSync(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.stores.metadata], 'readwrite');
    const store = transaction.objectStore(this.stores.metadata);

    await this.promisifyRequest(store.put({
      key: 'lastSync:default',
      timestamp: Date.now()
    }));

    await this.promisifyTransaction(transaction);
  }

  /**
   * Clear all data
   */
  async clearUserData(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.stores.images, this.stores.userSettings], 'readwrite');

    // Clear images
    const imagesStore = transaction.objectStore(this.stores.images);
    await this.promisifyRequest(imagesStore.clear());

    // Clear user settings
    const settingsStore = transaction.objectStore(this.stores.userSettings);
    await this.promisifyRequest(settingsStore.clear());

    await this.promisifyTransaction(transaction);
  }

  /**
   * Get storage quota information
   */
  async getStorageQuota(): Promise<StorageQuota> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
          total: estimate.quota || 0
        };
      } catch (error) {
        console.warn('Failed to get storage estimate:', error);
      }
    }

    // Fallback values
    return {
      used: 0,
      available: 50 * 1024 * 1024, // 50MB fallback
      total: 50 * 1024 * 1024
    };
  }

  /**
   * Check if storage is available
   */
  async isStorageAvailable(): Promise<boolean> {
    try {
      const quota = await this.getStorageQuota();
      return quota.available > 1024 * 1024; // At least 1MB available
    } catch (error) {
      return false;
    }
  }

  /**
   * Cleanup old data to free space
   */
  async cleanup(userId: string, maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const cutoffTime = Date.now() - maxAge;
    let deletedCount = 0;

    const transaction = this.db.transaction([this.stores.images], 'readwrite');
    const store = transaction.objectStore(this.stores.images);
    const index = store.index('userId');

    const request = index.openCursor(userId);
    let cursor = await this.promisifyRequest(request);

    while (cursor) {
      const image = cursor.value;
      if (image.createdAt < cutoffTime && image.status === 'complete') {
        await this.promisifyRequest(cursor.delete());
        deletedCount++;
      }
      const continueRequest = cursor.continue();
      cursor = continueRequest ? await this.promisifyRequest(continueRequest) : null;
    }

    await this.promisifyTransaction(transaction);
    return deletedCount;
  }

  /**
   * Export all data for backup
   */
  async exportData(userId: string): Promise<OfflineData> {
    const images = await this.getImages(userId);
    const userSettings = await this.getUserSettings();
    const lastSync = await this.getLastSync();

    const imagesRecord: Record<string, ImageDoc> = {};
    images.forEach(image => {
      imagesRecord[image.id] = image;
    });

    return {
      images: imagesRecord,
      userSettings: { 'default': userSettings },
      lastSync,
      version: this.dbVersion
    };
  }

  /**
   * Import data from backup
   */
  async importData(userId: string, data: OfflineData): Promise<void> {
    const images = Object.values(data.images);
    await this.storeImages(userId, images);

    if (data.userSettings['default']) {
      await this.storeUserSettings(data.userSettings['default']);
    }
  }

  /**
   * Helper to promisify IDB requests
   */
  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Helper to promisify IDB transactions
   */
  private promisifyTransaction(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const offlineStorageService = OfflineStorageService.getInstance();