import { useState, useEffect, useCallback } from 'react';
import type { ImageDoc } from '../types';
import { ImageService } from '../services/imageService';
import { usePerformanceMonitoring } from './usePerformanceMonitoring';
import { useSync } from './useSync';
import { useCrossTabSync } from './useCrossTabSync';
import { useAuth } from './useAuth';

/**
 * Hook for managing images with real-time updates, synchronization, and performance monitoring
 * Simplified version without authentication - works directly with 'images' collection
 */
export function useImages() {
  const { user } = useAuth();
  const [images, setImages] = useState<ImageDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasHadImages, setHasHadImages] = useState(false); // Track if we've ever had images

  // Synchronization hooks
  const { isOnline, isConnected, hasConflicts, resolveConflict } = useSync();
  const { 
    broadcastImageUpdate, 
    broadcastImageDelete, 
    broadcastImageCreate,
    onImageUpdate,
    onImageDelete,
    onImageCreate
  } = useCrossTabSync();

  // Performance monitoring
  const { startMeasurement, endMeasurement } = usePerformanceMonitoring({
    enabled: true,
    sampleRate: 0.2, // Monitor 20% of operations
    onMetrics: (metrics) => {
      // Log performance metrics for monitoring
      if (metrics.renderTime > 50) {
        console.log(`Images hook performance: ${metrics.renderTime.toFixed(2)}ms for ${metrics.imageCount} images`);
      }
    }
  });

  // Subscribe to real-time updates and cross-tab sync
  useEffect(() => {
    console.log('🔍 useImages: Setting up for simple collection');
    console.log('🔍 useImages: Connection status - isOnline:', isOnline, 'isConnected:', isConnected);
    
    setLoading(true);
    setError(null);

    let unsubscribeFirestore: (() => void) | undefined;
    let retryTimeout: NodeJS.Timeout | undefined;
    let retryCount = 0;
    const maxRetries = 3;

    // In development mode, always try to subscribe to Firestore regardless of connection status
    // This bypasses the overly strict connection detection
    const shouldSubscribe = import.meta.env.DEV ? true : (isOnline && isConnected);
    
    console.log('🔍 useImages setup - isOnline:', isOnline, 'isConnected:', isConnected, 'shouldSubscribe:', shouldSubscribe);
    console.log('🔍 useImages: Using user-specific collection path for user:', user?.uid);
    
    if (shouldSubscribe && user?.uid) {
      console.log('📡 Setting up Firestore subscription for user:', user.uid);
      console.log('📡 Connection status:', { isOnline, isConnected, shouldSubscribe });
      
      const setupSubscription = () => {
        console.log('🔄 setupSubscription called, retry count:', retryCount);
        console.log('🔄 Calling ImageService.subscribeToImages for user:', user.uid);
        
        unsubscribeFirestore = ImageService.subscribeToImages(
          user.uid,
          (updatedImages) => {
            startMeasurement();
            console.log('📊 Firestore subscription received', updatedImages.length, 'images from user collection');
            console.log('📊 Image details:', updatedImages.map(img => ({ id: img.id, filename: img.id, status: img.status })));
            console.log('📊 Full updatedImages array:', updatedImages);
            
            // Track if we've ever had images
            if (updatedImages.length > 0) {
              setHasHadImages(true);
              retryCount = 0; // Reset retry count on success
            }
            
            // In development, be more aggressive about preventing empty results from overwriting data
            if (import.meta.env.DEV && updatedImages.length === 0 && retryCount < maxRetries) {
              console.log(`🚫 Firestore returned empty array in dev mode (attempt ${retryCount + 1}/${maxRetries}). This might be a timing issue with emulators.`);
              
              // Exponential backoff retry: 1s, 2s, 4s
              const retryDelay = Math.pow(2, retryCount) * 1000;
              retryCount++;
              
              console.log(`⏰ Retrying Firestore query after ${retryDelay}ms...`);
              retryTimeout = setTimeout(() => {
                console.log('🔍 Retrying Firestore subscription...');
                setupSubscription();
              }, retryDelay);
              return;
            }
            
            // If we've exhausted retries and still have no images, try manual fetch as last resort
            if (import.meta.env.DEV && updatedImages.length === 0 && retryCount >= maxRetries) {
              console.log('🔄 Max retries reached, attempting manual fetch as last resort...');
              ImageService.getImages(user.uid).then(manualImages => {
                console.log('🔍 Manual fetch found', manualImages.length, 'images');
                if (manualImages.length > 0) {
                  setImages(manualImages);
                  setHasHadImages(true);
                }
                setLoading(false);
                endMeasurement(manualImages.length);
              }).catch(err => {
                console.error('❌ Manual fetch failed:', err);
                setLoading(false);
                endMeasurement(0);
              });
              return;
            }
            
            console.log('✅ Setting images to:', updatedImages.length, 'images');
            setImages(updatedImages);
            setLoading(false);
            endMeasurement(updatedImages.length);
          },
          (subscriptionError) => {
            console.error('❌ Firestore subscription error:', subscriptionError);
            console.error('❌ Subscription error details:', {
              error: subscriptionError.message,
              retryCount
            });
            
            // In development, retry subscription on error
            if (import.meta.env.DEV && retryCount < maxRetries) {
              console.log(`🔄 Subscription error, retrying (${retryCount + 1}/${maxRetries})...`);
              retryCount++;
              const retryDelay = Math.pow(2, retryCount) * 1000;
              
              retryTimeout = setTimeout(() => {
                console.log('🔍 Retrying subscription after error...');
                setupSubscription();
              }, retryDelay);
              return;
            }
            
            setError(subscriptionError.message);
            setLoading(false);
          }
        );
      };
      
      setupSubscription();
    } else {
      console.log('📱 App appears offline, loading from local storage');
      // Offline: load from local storage
      ImageService.getImagesSimple()
        .then((offlineImages) => {
          startMeasurement();
          console.log('📦 Loaded', offlineImages.length, 'images from offline storage');
          // Only replace if we don't have images or if offline storage has more recent data
          if (images.length === 0 || offlineImages.length > images.length) {
            setImages(offlineImages);
          }
          setLoading(false);
          endMeasurement(offlineImages.length || images.length);
        })
        .catch((offlineError) => {
          console.error('❌ Offline storage error:', offlineError);
          setError(offlineError.message);
          setLoading(false);
        });
    }

    // Subscribe to cross-tab updates
    const unsubscribeImageUpdate = onImageUpdate((updatedImage) => {
      console.log('🔄 Cross-tab image update received:', updatedImage.id);
      setImages(prev => {
        const index = prev.findIndex(img => img.id === updatedImage.id);
        if (index !== -1) {
          const newImages = [...prev];
          newImages[index] = updatedImage;
          return newImages;
        } else {
          return [updatedImage, ...prev];
        }
      });
    });

    const unsubscribeImageDelete = onImageDelete((imageId) => {
      console.log('🗑️ Cross-tab image delete received:', imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
    });

    const unsubscribeImageCreate = onImageCreate((newImage) => {
      console.log('➕ Cross-tab image create received:', newImage.id);
      setImages(prev => {
        // Avoid duplicates
        if (prev.some(img => img.id === newImage.id)) {
          return prev;
        }
        return [newImage, ...prev];
      });
    });

    return () => {
      console.log('🧹 useImages cleanup - unsubscribing from all listeners');
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      unsubscribeImageUpdate();
      unsubscribeImageDelete();
      unsubscribeImageCreate();
    };
  }, [isOnline, isConnected]);

  // Upload image with error handling and cross-tab sync
  const uploadImage = useCallback(async (file: File): Promise<ImageDoc | null> => {
    console.log('🔍 uploadImage called with file:', file.name, 'size:', file.size);
    console.log('🔍 Current user state:', user);
    
    if (!user?.uid) {
      const errorMsg = 'You must be signed in to upload images';
      console.error('❌ Upload blocked:', errorMsg);
      setError(errorMsg);
      return null;
    }

    try {
      console.log('🚀 Starting authenticated upload for user:', user.uid);
      console.log('🚀 File details:', { name: file.name, size: file.size, type: file.type });
      
      const imageDoc = await ImageService.withRetry(() => 
        ImageService.uploadImage(file, user.uid)
      );
      
      console.log('✅ Upload completed, imageDoc:', imageDoc);
      
      // Broadcast to other tabs
      if (imageDoc) {
        console.log('📡 Broadcasting image creation to other tabs');
        broadcastImageCreate(imageDoc);
      } else {
        console.warn('⚠️ No imageDoc returned from upload');
      }
      
      return imageDoc;
    } catch (error) {
      console.error('❌ Failed to upload image:', error);
      console.error('❌ Error details:', { 
        name: error.name, 
        message: error.message, 
        stack: error.stack 
      });
      setError(error instanceof Error ? error.message : 'Upload failed');
      return null;
    }
  }, [user?.uid, broadcastImageCreate]);

  // Update image with error handling and cross-tab sync
  const updateImage = useCallback(async (imageId: string, updates: Partial<ImageDoc>): Promise<boolean> => {
    if (!user?.uid) {
      setError('You must be signed in to update images');
      return false;
    }

    try {
      await ImageService.updateImageSimple(imageId, updates, user.uid);
      
      // Broadcast to other tabs
      const updatedImage = images.find(img => img.id === imageId);
      if (updatedImage) {
        broadcastImageUpdate({ ...updatedImage, ...updates });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to update image:', error);
      setError(error instanceof Error ? error.message : 'Update failed');
      return false;
    }
  }, [user?.uid, images, broadcastImageUpdate]);

  // Delete image with error handling and cross-tab sync
  const deleteImage = useCallback(async (imageId: string): Promise<boolean> => {
    if (!user?.uid) {
      setError('You must be signed in to delete images');
      return false;
    }

    try {
      await ImageService.deleteImageSimple(imageId, user.uid);
      
      // Broadcast to other tabs
      broadcastImageDelete(imageId);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to delete image:', error);
      setError(error instanceof Error ? error.message : 'Delete failed');
      return false;
    }
  }, [user?.uid, broadcastImageDelete]);

  // Batch delete images
  const batchDeleteImages = useCallback(async (imageIds: string[]): Promise<{
    successful: string[];
    failed: Array<{ imageId: string; error: string }>;
  }> => {
    const results = { successful: [] as string[], failed: [] as Array<{ imageId: string; error: string }> };
    
    for (const imageId of imageIds) {
      try {
        await deleteImage(imageId);
        results.successful.push(imageId);
      } catch (error) {
        results.failed.push({
          imageId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }, [deleteImage]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    images,
    loading,
    error,
    hasConflicts,
    uploadImage,
    updateImage,
    deleteImage,
    batchDeleteImages,
    clearError
  };
}