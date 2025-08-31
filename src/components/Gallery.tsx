import React, { useCallback, useState } from 'react';
import type { ImageDoc } from '../types';
import { useImages } from '../hooks/useImages';
import { GalleryGrid } from './GalleryGrid';
import { VirtualizedGallery } from './VirtualizedGallery';
import { ImageErrorBoundary } from './ImageErrorBoundary';
import { BatchActions } from './BatchActions';

export interface GalleryProps {
  onImageRegenerate?: (imageId: string, providers?: string[]) => void;
  onRegenerateProvider?: (imageId: string, modelId: string) => void;
  virtualizationThreshold?: number;
  enableVirtualization?: boolean;
  enableBatchOperations?: boolean;
  selectedImageIds?: string[];
  onBatchSelectionChange?: (imageIds: string[]) => void;
  onBatchDelete?: (imageIds: string[]) => Promise<{ successful: string[]; failed: Array<{ imageId: string; error: string }> }>;
  selectionMode?: boolean;
  onToggleSelectionMode?: () => void;
}

/**
 * Main gallery component that integrates real-time listeners and manages image display
 * Automatically switches between regular grid and virtualized display based on image count
 * Requirements: 4.1, 4.2, 8.1, 8.4, 10.4
 */
export function Gallery({
  onImageRegenerate,
  onRegenerateProvider,
  virtualizationThreshold = 50,
  enableVirtualization = true,
  enableBatchOperations = true,
  selectedImageIds = [],
  onBatchSelectionChange,
  onBatchDelete,
  selectionMode = false,
  onToggleSelectionMode
}: GalleryProps) {
  const {
    images,
    loading,
    error,
    updateImage,
    deleteImage,
    batchDeleteImages,
    clearError
  } = useImages();

  // Manual refresh function for debugging
  const handleManualRefresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    // Force a page reload to reset all state
    window.location.reload();
  }, []);

  // Debug logging


  // Use external batch selection state if provided, otherwise use internal state
  const [internalSelectedImageIds, setInternalSelectedImageIds] = useState<string[]>([]);
  const [internalSelectionMode, setInternalSelectionMode] = useState(false);
  
  const effectiveSelectedImageIds = selectedImageIds || internalSelectedImageIds;
  const effectiveSelectionMode = selectionMode !== undefined ? selectionMode : internalSelectionMode;
  const effectiveOnBatchSelectionChange = onBatchSelectionChange || setInternalSelectedImageIds;
  const effectiveOnToggleSelectionMode = onToggleSelectionMode || (() => {
    setInternalSelectionMode(prev => !prev);
    if (internalSelectionMode) {
      setInternalSelectedImageIds([]);
    }
  });

  // Handle image updates with optimistic UI updates
  const handleImageUpdate = useCallback(async (imageId: string, updates: Partial<ImageDoc>) => {
    const success = await updateImage(imageId, updates);
    if (!success) {
      // Error is already handled by useImages hook
      console.error('Failed to update image:', imageId);
    }
  }, [updateImage]);

  // Handle image deletion with confirmation
  const handleImageDelete = useCallback(async (imageId: string) => {
    const success = await deleteImage(imageId);
    if (!success) {
      // Error is already handled by useImages hook
      console.error('Failed to delete image:', imageId);
    }
    
    // Remove from selection if it was selected
    const currentIds = effectiveSelectedImageIds;
    effectiveOnBatchSelectionChange(currentIds.filter(id => id !== imageId));
  }, [deleteImage]);

  // Handle individual image selection
  const handleImageSelectionChange = useCallback((imageId: string, selected: boolean) => {
    const currentIds = effectiveSelectedImageIds;
    if (selected) {
      effectiveOnBatchSelectionChange([...currentIds, imageId]);
    } else {
      effectiveOnBatchSelectionChange(currentIds.filter(id => id !== imageId));
    }
  }, [effectiveOnBatchSelectionChange, effectiveSelectedImageIds]);

  // Handle batch selection changes
  const handleBatchSelectionChange = useCallback((imageIds: string[]) => {
    effectiveOnBatchSelectionChange(imageIds);
  }, [effectiveOnBatchSelectionChange]);

  // Handle batch delete
  const handleBatchDelete = useCallback(async (imageIds: string[]) => {
    if (onBatchDelete) {
      return await onBatchDelete(imageIds);
    } else {
      return await batchDeleteImages(imageIds);
    }
  }, [onBatchDelete, batchDeleteImages]);

  // Determine which gallery component to use
  const shouldUseVirtualization = enableVirtualization && images.length >= virtualizationThreshold;

  return (
    <ImageErrorBoundary>
      <div className="w-full">
        {/* Error Display with Retry */}
        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-700/50 rounded-2xl shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600/50 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-200 font-semibold text-lg mb-1">Error Loading Images</h3>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
              <button
                onClick={clearError}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Batch Operations */}
        {enableBatchOperations && images.length > 0 && (
          <div className="mb-8 p-6 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl">
            {/* Selection Mode Toggle */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                  <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">
                  Image Gallery ({images.length})
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleManualRefresh}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  title="Refresh page to reload images"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button
                  onClick={effectiveOnToggleSelectionMode}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 ${
                    effectiveSelectionMode 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white' 
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {effectiveSelectionMode ? 'Exit Selection' : 'Select Images'}
                </button>
              </div>
            </div>

            {/* Batch Actions */}
            {effectiveSelectionMode && (
              <BatchActions
                images={images}
                selectedImageIds={effectiveSelectedImageIds}
                onSelectionChange={handleBatchSelectionChange}
                onBatchDelete={handleBatchDelete}
                disabled={loading}
              />
            )}
          </div>
        )}

        {/* Gallery Display */}
        {shouldUseVirtualization ? (
          <div className="h-[700px] bg-gray-800/20 rounded-2xl border border-gray-700/50 p-4"> {/* Enhanced container for virtualization */}
            <VirtualizedGallery
              images={images}
              onImageUpdate={handleImageUpdate}
              onImageDelete={handleImageDelete}
              onImageRegenerate={onImageRegenerate}
              onRegenerateProvider={onRegenerateProvider}
              threshold={virtualizationThreshold}
            />
          </div>
        ) : (
          <div className="bg-gray-800/20 rounded-2xl border border-gray-700/50 p-6">
            <GalleryGrid
              images={images}
              onImageUpdate={handleImageUpdate}
              onImageDelete={handleImageDelete}
              onImageRegenerate={onImageRegenerate}
              onRegenerateProvider={onRegenerateProvider}
              loading={loading}
              error={error}
              selectedImageIds={effectiveSelectedImageIds}
              onImageSelectionChange={handleImageSelectionChange}
              selectionMode={effectiveSelectionMode}
            />
          </div>
        )}

        {/* Performance Info */}
        {images.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-800/40 rounded-full border border-gray-700/50">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <p className="text-sm text-gray-300 font-medium">
                Displaying {images.length} image{images.length !== 1 ? 's' : ''}
                {shouldUseVirtualization && ' (virtualized for performance)'}
              </p>
            </div>
          </div>
        )}
      </div>
    </ImageErrorBoundary>
  );
}