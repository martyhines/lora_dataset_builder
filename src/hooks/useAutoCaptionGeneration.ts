import { useCallback, useEffect } from 'react';
import { useCaptionGeneration } from './useCaptionGeneration';
import { useImages } from './useImages';
import type { ImageDoc } from '../types';

/**
 * Hook that automatically generates captions for newly uploaded images
 * and provides regeneration functionality
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.6, 9.4, 9.5
 */
export function useAutoCaptionGeneration() {
  const { images } = useImages();
  const {
    generateCaptions,
    regenerateCaptions,
    regenerateProvider,
    isGenerating,
    error,
    clearError
  } = useCaptionGeneration();

  // Auto-generate captions for pending images
  useEffect(() => {
    const pendingImages = images.filter(img => 
      img.status === 'pending' && img.candidates.length === 0
    );

    if (pendingImages.length > 0) {
      // Process pending images one by one to avoid overwhelming the API
      pendingImages.forEach(image => {
        generateCaptions(image);
      });
    }
  }, [images, generateCaptions]);

  /**
   * Handle regeneration for all providers of an image
   */
  const handleImageRegenerate = useCallback(async (
    imageId: string, 
    providers?: string[]
  ) => {
    try {
      await regenerateCaptions(imageId, providers);
    } catch (error) {
      console.error('Failed to regenerate captions:', error);
    }
  }, [regenerateCaptions]);

  /**
   * Handle regeneration for a specific provider
   */
  const handleProviderRegenerate = useCallback(async (
    imageId: string, 
    modelId: string
  ) => {
    try {
      await regenerateProvider(imageId, modelId);
    } catch (error) {
      console.error('Failed to regenerate provider:', error);
    }
  }, [regenerateProvider]);

  /**
   * Get images that need caption generation
   */
  const getPendingImages = useCallback((): ImageDoc[] => {
    return images.filter(img => 
      img.status === 'pending' || 
      (img.status === 'error' && img.candidates.length === 0)
    );
  }, [images]);

  /**
   * Get images with failed captions that can be retried
   */
  const getRetryableImages = useCallback((): ImageDoc[] => {
    return images.filter(img => 
      img.candidates.some(candidate => candidate.error)
    );
  }, [images]);

  /**
   * Get statistics about caption generation
   */
  const getStats = useCallback(() => {
    const total = images.length;
    const pending = images.filter(img => img.status === 'pending').length;
    const processing = images.filter(img => img.status === 'processing').length;
    const complete = images.filter(img => img.status === 'complete').length;
    const error = images.filter(img => img.status === 'error').length;
    const withCaptions = images.filter(img => img.candidates.some(c => !c.error)).length;
    const needsRetry = images.filter(img => 
      img.candidates.some(c => c.error) || img.status === 'error'
    ).length;

    return {
      total,
      pending,
      processing,
      complete,
      error,
      withCaptions,
      needsRetry,
      progress: total > 0 ? Math.round((complete / total) * 100) : 0
    };
  }, [images]);

  return {
    // State
    isGenerating,
    error,
    
    // Actions
    handleImageRegenerate,
    handleProviderRegenerate,
    clearError,
    
    // Queries
    getPendingImages,
    getRetryableImages,
    getStats
  };
}