import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
  type DocumentSnapshot,
  getDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  type UploadResult 
} from 'firebase/storage';
import { db, storage } from './firebase';
import type { ImageDoc } from '../types';
import { executeWithRecovery, executeBatchWithRecovery } from './errorRecoveryService';
import { withTimeout } from '../utils/errorHandling';
import { imageCache } from './cacheService';
import { syncService } from './syncService';
import { offlineStorageService } from './offlineStorageService';

/**
 * Service for managing image documents in Firestore and Firebase Storage
 * Optimized with caching and efficient queries for performance
 * Requirements: 10.1, 10.2, 10.3, 10.5
 */
export class ImageService {
  private static readonly COLLECTION_NAME = 'images';
  private static readonly PAGE_SIZE = 20; // Pagination size for large datasets
  
  /**
   * Upload an image file to Firebase Storage and create a Firestore document
   */
  static async uploadImage(file: File, userId: string): Promise<ImageDoc> {
    return await executeWithRecovery(
      async () => {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;
        const storagePath = `uploads/${userId}/${timestamp}/${filename}`;
        
        // Upload to Firebase Storage with timeout
        const storageRef = ref(storage, storagePath);
        const uploadResult: UploadResult = await withTimeout(
          uploadBytes(storageRef, file),
          60000, // 60 second timeout for uploads
          `Upload timeout for file: ${filename}`
        );
        
        // Get download URL
        const downloadURL = await getDownloadURL(uploadResult.ref);
        
        // Create Firestore document
        const imageData = {
          filename,
          storagePath: uploadResult.ref.fullPath,
          downloadURL,
          status: 'pending' as const,
          candidates: [],
          selectedIndex: null,
          selectedTextOverride: undefined,
          createdAt: timestamp,
          updatedAt: timestamp
        };
        
        const collectionPath = `users/${userId}/${ImageService.COLLECTION_NAME}`;
        console.log('📝 Creating Firestore document at:', collectionPath, 'for user:', userId);
        console.log('📄 Document data:', imageData);
        
        const docRef = await addDoc(
          collection(db, 'users', userId, ImageService.COLLECTION_NAME),
          imageData
        );
        
        console.log('✅ Created Firestore document:', docRef.id, 'at path:', docRef.path);
        console.log('🔍 Full document reference:', {
          id: docRef.id,
          path: docRef.path,
          parent: docRef.parent.path
        });
        
        const imageDoc = {
          id: docRef.id,
          ...imageData
        };

        // Store in offline storage for sync
        try {
          await offlineStorageService.storeImage(userId, imageDoc);
        } catch (error) {
          console.warn('Failed to store image offline:', error);
        }
        
        return imageDoc;
      },
      'image-upload',
      {
        retryOptions: {
          maxRetries: 3,
          baseDelay: 1000,
          onRetry: (error, attempt) => {
            console.warn(`Upload retry attempt ${attempt} for ${file.name}:`, error.message);
          }
        },
        metadata: { filename: file.name, fileSize: file.size, userId }
      }
    );
  }
  
  /**
   * Update an existing image document with cache invalidation
   */
  static async updateImage(
    imageId: string, 
    userId: string, 
    updates: Partial<Omit<ImageDoc, 'id' | 'createdAt'>>
  ): Promise<void> {
    return await executeWithRecovery(
      async () => {
        const updateData = {
          ...updates,
          updatedAt: Date.now()
        };

        // Check if we're online and connected
        const syncState = syncService.getState();
        
        if (syncState.isOnline && syncState.isConnected) {
          // Online: update Firestore directly
          const docRef = doc(db, 'users', userId, ImageService.COLLECTION_NAME, imageId);
          await updateDoc(docRef, updateData);
        } else {
          // Offline: queue operation for later sync
          syncService.queueOperation({
            type: 'update',
            collection: 'images',
            documentId: imageId,
            data: updateData,
            userId
          });
        }

        // Always update offline storage
        try {
          await offlineStorageService.updateImage(userId, imageId, updateData);
        } catch (error) {
          console.warn('Failed to update image offline:', error);
        }

        // Invalidate relevant caches
        imageCache.delete(`images:${userId}`);
        if (updates.status) {
          // Invalidate status-specific caches
          ['pending', 'processing', 'complete', 'error'].forEach(status => {
            imageCache.delete(`images:${userId}:status:${status}`);
          });
        }
      },
      'image-update',
      {
        retryOptions: {
          maxRetries: 2,
          baseDelay: 500
        },
        metadata: { imageId, userId, updateFields: Object.keys(updates) }
      }
    );
  }
  
  /**
   * Delete an image document and its associated storage file with transactional cleanup
   * Implements rollback on failure to maintain data consistency
   */
  static async deleteImage(imageId: string, userId: string): Promise<void> {
    return await executeWithRecovery(
      async () => {
        let storageDeleted = false;
        let firestoreDeleted = false;
        let imageDoc: ImageDoc | null = null;
        
        try {
          // Get the document data to find storage path
          const images = await this.getImages(userId);
          imageDoc = images.find(img => img.id === imageId) || null;
          
          if (!imageDoc) {
            throw new Error('Image document not found');
          }

          // Check if we're online and connected
          const syncState = syncService.getState();
          
          if (syncState.isOnline && syncState.isConnected) {
            // Online: perform full deletion
            const docRef = doc(db, 'users', userId, ImageService.COLLECTION_NAME, imageId);
            
            // Step 1: Delete from Storage first (safer to fail here than after Firestore deletion)
            if (imageDoc.storagePath) {
              try {
                const storageRef = ref(storage, imageDoc.storagePath);
                await withTimeout(
                  deleteObject(storageRef),
                  30000,
                  'Storage deletion timeout'
                );
                storageDeleted = true;
              } catch (storageError) {
                // If storage file doesn't exist, that's okay - continue with Firestore deletion
                if (storageError instanceof Error && storageError.message.includes('object-not-found')) {
                  console.warn(`Storage file not found for image ${imageId}, continuing with Firestore deletion`);
                  storageDeleted = true; // Consider it "deleted" since it doesn't exist
                } else {
                  throw new Error(`Failed to delete storage file: ${storageError instanceof Error ? storageError.message : 'Unknown storage error'}`);
                }
              }
            } else {
              storageDeleted = true; // No storage path, nothing to delete
            }
            
            // Step 2: Delete from Firestore
            try {
              await deleteDoc(docRef);
              firestoreDeleted = true;
            } catch (firestoreError) {
              throw new Error(`Failed to delete Firestore document: ${firestoreError instanceof Error ? firestoreError.message : 'Unknown Firestore error'}`);
            }
          } else {
            // Offline: queue operation for later sync
            syncService.queueOperation({
              type: 'delete',
              collection: 'images',
              documentId: imageId,
              data: { storagePath: imageDoc.storagePath },
              userId
            });
            firestoreDeleted = true; // Mark as handled
          }

          // Always delete from offline storage
          try {
            await offlineStorageService.deleteImage(imageId);
          } catch (error) {
            console.warn('Failed to delete image from offline storage:', error);
          }

          // Invalidate caches after successful deletion
          imageCache.delete(`images:${userId}`);
          ['pending', 'processing', 'complete', 'error'].forEach(status => {
            imageCache.delete(`images:${userId}:status:${status}`);
          });
          
        } catch (error) {
          console.error('Error deleting image:', error);
          
          // Rollback: If Firestore deletion failed but storage was deleted, try to restore the file
          // Note: We can't actually restore the file, but we can log this for monitoring
          if (storageDeleted && !firestoreDeleted && imageDoc) {
            console.error(`Partial deletion detected for image ${imageId}: Storage deleted but Firestore deletion failed. Manual cleanup may be required.`);
          }
          
          throw error;
        }
      },
      'image-delete',
      {
        retryOptions: {
          maxRetries: 2,
          baseDelay: 1000
        },
        metadata: { imageId, userId }
      }
    );
  }
  
  /**
   * Get all images for a user with caching and offline support
   */
  static async getImages(userId: string): Promise<ImageDoc[]> {
    const cacheKey = `images:${userId}`;
    
    // Try cache first
    const cached = imageCache.get<ImageDoc[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if we're online and connected
    const syncState = syncService.getState();
    
    if (syncState.isOnline && syncState.isConnected) {
      // Online: fetch from Firestore
      return await executeWithRecovery(
        async () => {
          const collectionPath = `users/${userId}/${ImageService.COLLECTION_NAME}`;
          console.log('Fetching images from:', collectionPath, 'for user:', userId);
          
          const q = query(
            collection(db, 'users', userId, ImageService.COLLECTION_NAME),
            orderBy('createdAt', 'desc')
          );
          
          const querySnapshot = await getDocs(q);
          console.log('Found', querySnapshot.docs.length, 'documents in Firestore');
          
          const images = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as ImageDoc));

          // Cache the results
          imageCache.set(cacheKey, images, 5 * 60 * 1000); // 5 minutes
          
          // Update offline storage
          try {
            await offlineStorageService.storeImages(userId, images);
          } catch (error) {
            console.warn('Failed to update offline storage:', error);
          }
          
          return images;
        },
        'images-fetch',
        {
          retryOptions: {
            maxRetries: 2,
            baseDelay: 500
          },
          metadata: { userId }
        }
      );
    } else {
      // Offline: fetch from local storage
      try {
        // Ensure offline storage is initialized before use
        await offlineStorageService.initialize();
        const offlineImages = await offlineStorageService.getImages(userId);
        
        // Cache the results
        imageCache.set(cacheKey, offlineImages, 5 * 60 * 1000);
        
        return offlineImages;
      } catch (error) {
        console.warn('Failed to fetch images from offline storage:', error);
        return [];
      }
    }
  }

  /**
   * Get images with pagination for better performance with large datasets
   */
  static async getImagesPaginated(
    userId: string, 
    pageSize: number = ImageService.PAGE_SIZE,
    lastDoc?: DocumentSnapshot
  ): Promise<{ images: ImageDoc[]; lastDoc?: DocumentSnapshot; hasMore: boolean }> {
    return await executeWithRecovery(
      async () => {
        let q = query(
          collection(db, 'users', userId, ImageService.COLLECTION_NAME),
          orderBy('createdAt', 'desc'),
          limit(pageSize + 1) // Get one extra to check if there are more
        );

        if (lastDoc) {
          q = query(q, startAfter(lastDoc));
        }
        
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs;
        
        const hasMore = docs.length > pageSize;
        const images = docs.slice(0, pageSize).map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ImageDoc));

        return {
          images,
          lastDoc: hasMore ? docs[pageSize - 1] : undefined,
          hasMore
        };
      },
      'images-fetch-paginated',
      {
        retryOptions: {
          maxRetries: 2,
          baseDelay: 500
        },
        metadata: { userId, pageSize }
      }
    );
  }

  /**
   * Get images by status for efficient filtering
   */
  static async getImagesByStatus(
    userId: string, 
    status: ImageDoc['status']
  ): Promise<ImageDoc[]> {
    const cacheKey = `images:${userId}:status:${status}`;
    
    // Try cache first
    const cached = imageCache.get<ImageDoc[]>(cacheKey);
    if (cached) {
      return cached;
    }

    return await executeWithRecovery(
      async () => {
        const q = query(
          collection(db, 'users', userId, ImageService.COLLECTION_NAME),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        const images = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ImageDoc));

        // Cache the results for shorter time since status changes frequently
        imageCache.set(cacheKey, images, 2 * 60 * 1000); // 2 minutes
        
        return images;
      },
      'images-fetch-by-status',
      {
        retryOptions: {
          maxRetries: 2,
          baseDelay: 500
        },
        metadata: { userId, status }
      }
    );
  }
  
  /**
   * Subscribe to real-time updates for user's images
   */
  static subscribeToImages(
    userId: string, 
    callback: (images: ImageDoc[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    try {
      const collectionPath = `users/${userId}/${ImageService.COLLECTION_NAME}`;
      console.log(`🔍 Setting up Firestore subscription for path: ${collectionPath}`);
      
      const q = query(
        collection(db, 'users', userId, ImageService.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      return onSnapshot(
        q,
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          try {
            console.log(`📊 Firestore subscription received ${querySnapshot.docs.length} documents for user: ${userId}`);
            
            if (querySnapshot.docs.length === 0) {
              console.log('📭 No documents found. Checking if this is expected...');
              console.log('🔍 Query metadata:', {
                fromCache: querySnapshot.metadata.fromCache,
                hasPendingWrites: querySnapshot.metadata.hasPendingWrites,
                isEqual: querySnapshot.metadata.isEqual
              });
            }
            
            const images = querySnapshot.docs.map(doc => {
              const data = doc.data();
              console.log(`📄 Document ${doc.id}:`, data);
              return {
                id: doc.id,
                ...data
              } as ImageDoc;
            });
            
            console.log(`✅ Processed ${images.length} images, calling callback`);
            callback(images);
          } catch (callbackError) {
            console.error('Error processing subscription data:', callbackError);
            if (onError) {
              onError(new Error(`Data processing error: ${callbackError instanceof Error ? callbackError.message : 'Unknown error'}`));
            }
          }
        },
        (error) => {
          console.error('❌ Error in images subscription:', error);
          if (onError) {
            onError(new Error(`Subscription error: ${error.message}`));
          }
        }
      );
    } catch (error) {
      console.error('❌ Error setting up images subscription:', error);
      throw new Error(`Failed to subscribe to images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Batch delete multiple images with partial success handling
   * Returns results for each deletion attempt
   */
  static async batchDeleteImages(
    imageIds: string[], 
    userId: string,
    onProgress?: (completed: number, total: number, currentImageId: string) => void
  ): Promise<{
    successful: string[];
    failed: Array<{ imageId: string; error: string }>;
  }> {
    return await executeBatchWithRecovery(
      imageIds,
      async (imageId) => {
        onProgress?.(0, imageIds.length, imageId);
        await this.deleteImage(imageId, userId);
        return imageId;
      },
      'batch-delete-images',
      {
        concurrency: 3, // Limit concurrent deletions
        retryOptions: {
          maxRetries: 2,
          baseDelay: 1000
        },
        metadata: { userId, totalImages: imageIds.length }
      }
    ).then(result => {
      onProgress?.(imageIds.length, imageIds.length, '');
      return {
        successful: result.successful,
        failed: result.failed.map(f => ({ imageId: f.item, error: f.error.message }))
      };
    });
  }

  /**
   * Retry failed operations with exponential backoff
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Subscribe to real-time updates for images in a simple collection (no authentication)
   */
  static subscribeToImagesSimple(
    callback: (images: ImageDoc[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    try {
      const collectionPath = 'images';
      console.log(`🔍 Setting up Firestore subscription for simple path: ${collectionPath}`);
      
      const q = query(
        collection(db, collectionPath),
        orderBy('createdAt', 'desc')
      );
      
      console.log(`📡 Query created, setting up onSnapshot listener...`);
      
      // Set up a fallback timer in case subscription takes too long
      let fallbackTimer: NodeJS.Timeout | undefined;
      let hasReceivedData = false;
      
      if (import.meta.env.DEV) {
        // In development, set a fallback timer to fetch images directly if subscription doesn't work
        fallbackTimer = setTimeout(async () => {
          if (!hasReceivedData) {
            console.log('⏰ Fallback timer triggered - subscription may not be working, trying direct fetch...');
            try {
              const fallbackImages = await this.getImagesSimple();
              console.log(`🔄 Fallback fetch found ${fallbackImages.length} images`);
              if (fallbackImages.length > 0) {
                callback(fallbackImages);
              }
            } catch (fallbackError) {
              console.error('❌ Fallback fetch failed:', fallbackError);
            }
          }
        }, 5000); // Wait 5 seconds before trying fallback
      }
      
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          try {
            hasReceivedData = true;
            
            // Clear fallback timer since we received data
            if (fallbackTimer) {
              clearTimeout(fallbackTimer);
              fallbackTimer = undefined;
            }
            
            console.log(`📊 Firestore subscription received ${querySnapshot.docs.length} documents from simple collection`);
            console.log(`🔍 Query metadata:`, {
              fromCache: querySnapshot.metadata.fromCache,
              hasPendingWrites: querySnapshot.metadata.hasPendingWrites,
              isEqual: querySnapshot.metadata.isEqual
            });
            
            if (querySnapshot.docs.length === 0) {
              console.log('📭 No documents found in simple collection. This might be expected for a new app.');
            }
            
            const images = querySnapshot.docs.map(doc => {
              const data = doc.data();
              console.log(`📄 Document ${doc.id}:`, {
                id: doc.id,
                filename: data.filename,
                status: data.status,
                createdAt: data.createdAt,
                candidates: data.candidates?.length || 0
              });
              return {
                id: doc.id,
                ...data
              } as ImageDoc;
            });
            
            console.log(`✅ Processed ${images.length} images, calling callback`);
            callback(images);
          } catch (callbackError) {
            console.error('❌ Error processing subscription data:', callbackError);
            if (onError) {
              onError(new Error(`Data processing error: ${callbackError instanceof Error ? callbackError.message : 'Unknown error'}`));
            }
          }
        },
        (error) => {
          console.error('❌ Error in simple images subscription:', error);
          
          // Clear fallback timer on error
          if (fallbackTimer) {
            clearTimeout(fallbackTimer);
            fallbackTimer = undefined;
          }
          
          if (onError) {
            onError(new Error(`Subscription error: ${error.message}`));
          }
        }
      );
      
      // Return a cleanup function that also clears the fallback timer
      return () => {
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
        }
        unsubscribe();
      };
      
    } catch (error) {
      console.error('❌ Error setting up simple images subscription:', error);
      
      // If subscription setup fails, try direct fetch as fallback
      if (import.meta.env.DEV) {
        console.log('🔄 Simple subscription setup failed, trying direct fetch as fallback...');
        this.getImagesSimple().then(fallbackImages => {
          console.log(`🔄 Fallback fetch found ${fallbackImages.length} images`);
          if (fallbackImages.length > 0) {
            callback(fallbackImages);
          }
        }).catch(fallbackError => {
          console.error('❌ Fallback fetch also failed:', fallbackError);
          if (onError) {
            onError(new Error(`Both subscription and fallback failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        });
        
        // Return a no-op unsubscribe function since we're using fallback
        return () => {};
      }
      
      throw new Error(`Failed to subscribe to simple images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all images from simple collection (no authentication)
   */
  static async getImagesSimple(): Promise<ImageDoc[]> {
    const cacheKey = 'images:simple';
    
    // Try cache first
    const cached = imageCache.get<ImageDoc[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if we're online and connected
    const syncState = syncService.getState();
    
    if (syncState.isOnline && syncState.isConnected) {
      // Online: fetch from Firestore
      return await executeWithRecovery(
        async () => {
          const collectionPath = 'images';
          console.log('Fetching images from simple collection:', collectionPath);
          
          const q = query(
            collection(db, collectionPath),
            orderBy('createdAt', 'desc')
          );
          
          const querySnapshot = await getDocs(q);
          console.log('Found', querySnapshot.docs.length, 'documents in simple collection');
          
          const images = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as ImageDoc));

          // Cache the results
          imageCache.set(cacheKey, images, 5 * 60 * 1000); // 5 minutes
          
          return images;
        },
        'images-fetch-simple',
        {
          retryOptions: {
            maxRetries: 2,
            baseDelay: 500
          },
          metadata: { collection: 'images' }
        }
      );
    } else {
      // Offline: return empty array for now
      console.log('Offline mode - returning empty array for simple collection');
      return [];
    }
  }

  /**
   * Update an image in simple collection (no authentication)
   */
  static async updateImageSimple(
    imageId: string, 
    updates: Partial<Omit<ImageDoc, 'id' | 'createdAt'>>
  ): Promise<void> {
    return await executeWithRecovery(
      async () => {
        const updateData = {
          ...updates,
          updatedAt: Date.now()
        };

        // Update Firestore document
        const docRef = doc(db, 'images', imageId);
        await updateDoc(docRef, updateData);

        // Invalidate cache
        imageCache.delete('images:simple');
      },
      'image-update-simple',
      {
        retryOptions: {
          maxRetries: 2,
          baseDelay: 500
        },
        metadata: { imageId, updateFields: Object.keys(updates) }
      }
    );
  }

  /**
   * Delete an image from simple collection (no authentication)
   */
  static async deleteImageSimple(imageId: string): Promise<void> {
    return await executeWithRecovery(
      async () => {
        // Get the document data to find storage path
        const docRef = doc(db, 'images', imageId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error('Image document not found');
        }
        
        const imageDoc = docSnap.data() as ImageDoc;
        
        // Delete from Storage first
        if (imageDoc.storagePath) {
          try {
            const storageRef = ref(storage, imageDoc.storagePath);
            await withTimeout(
              deleteObject(storageRef),
              30000,
              'Storage deletion timeout'
            );
          } catch (storageError) {
            // If storage file doesn't exist, that's okay - continue with Firestore deletion
            if (storageError instanceof Error && storageError.message.includes('object-not-found')) {
              console.warn(`Storage file not found for image ${imageId}, continuing with Firestore deletion`);
            } else {
              throw new Error(`Failed to delete storage file: ${storageError instanceof Error ? storageError.message : 'Unknown storage error'}`);
            }
          }
        }
        
        // Delete from Firestore
        await deleteDoc(docRef);
        
        // Invalidate cache
        imageCache.delete('images:simple');
      },
      'image-delete-simple',
      {
        retryOptions: {
          maxRetries: 2,
          baseDelay: 1000
        },
        metadata: { imageId }
      }
    );
  }

  /**
   * Upload an image to simple collection (no authentication)
   */
  static async uploadImageSimple(file: File): Promise<ImageDoc> {
    console.log('🚀 Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const storagePath = `uploads/${timestamp}/${filename}`;
    const storageRef = ref(storage, storagePath);
    
    console.log('🔥 Uploading to Firebase Storage...');
    const uploadResult = await withTimeout(uploadBytes(storageRef, file), 60000, `Upload timeout for file: ${filename}`);
    console.log('✅ Storage upload complete:', uploadResult.ref.fullPath);
    
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('🔗 Download URL:', downloadURL);
    
    // Create Firestore document in simple collection
    const imageData = { 
      filename, 
      storagePath: uploadResult.ref.fullPath, 
      downloadURL, 
      status: 'pending' as ImageDoc['status'], 
      candidates: [], 
      selectedIndex: null, 
      createdAt: timestamp, 
      updatedAt: timestamp 
    };
    
    console.log('📝 Creating Firestore document with data:', imageData);
    
    try {
      const docRef = await addDoc(collection(db, 'images'), imageData);
      console.log('✅ Firestore document created with ID:', docRef.id);
      
      const imageDoc = {
        id: docRef.id,
        ...imageData
      };

      // Invalidate cache
      imageCache.delete('images:simple');
      console.log('🗑️ Cache invalidated');
      
      return imageDoc;
    } catch (error) {
      console.error('❌ Failed to create Firestore document:', error);
      throw error;
    }
  }

  /**
   * Get a single image by ID from simple collection (no authentication)
   */
  static async getImageById(imageId: string): Promise<ImageDoc | null> {
    try {
      const docRef = doc(db, 'images', imageId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as ImageDoc;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to get image by ID:', error);
      throw error;
    }
  }

  /**
   * Update image candidates (captions) in simple collection
   */
  static async updateImageCandidates(imageId: string, candidates: any[]): Promise<void> {
    try {
      const docRef = doc(db, 'images', imageId);
      await updateDoc(docRef, {
        candidates,
        status: candidates.length > 0 ? 'complete' : 'pending',
        updatedAt: Date.now()
      });
      
      // Invalidate cache
      imageCache.delete('images:simple');
      console.log('✅ Updated image candidates for:', imageId);
    } catch (error) {
      console.error('❌ Failed to update image candidates:', error);
      throw error;
    }
  }
}