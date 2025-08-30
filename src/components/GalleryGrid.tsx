import React, { useMemo, memo, useEffect, useCallback, useRef } from 'react';
import type { ImageDoc } from '../types';
import { ImageCard } from './ImageCard';
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';
import { KeyboardKeys, announceToScreenReader } from '../utils/accessibility';

export interface GalleryGridProps {
  images: ImageDoc[];
  onImageUpdate: (imageId: string, updates: Partial<ImageDoc>) => void;
  onImageDelete: (imageId: string) => void;
  onImageRegenerate?: (imageId: string, providers?: string[]) => void;
  onRegenerateProvider?: (imageId: string, modelId: string) => void;
  loading?: boolean;
  error?: string | null;
  // Batch selection props
  selectedImageIds?: string[];
  onImageSelectionChange?: (imageId: string, selected: boolean) => void;
  selectionMode?: boolean;
}

/**
 * Responsive gallery grid component that displays images in a CSS Grid layout
 * Adapts to different screen sizes: 1 col mobile, 2-3 tablet, 4+ desktop
 * Requirements: 4.1, 4.2, 8.1, 8.4, 10.4
 */
const GalleryGridComponent = function GalleryGrid({
  images,
  onImageUpdate,
  onImageDelete,
  onImageRegenerate,
  onRegenerateProvider,
  loading = false,
  error = null,
  selectedImageIds = [],
  onImageSelectionChange,
  selectionMode = false
}: GalleryGridProps) {
  // Performance monitoring
  const { startMeasurement, endMeasurement } = usePerformanceMonitoring({
    enabled: true,
    sampleRate: 0.3, // Monitor 30% of renders
    onMetrics: (metrics) => {
      if (metrics.renderTime > 100) {
        console.warn(`Slow gallery render: ${metrics.renderTime.toFixed(2)}ms for ${metrics.imageCount} images`);
      }
    }
  });

  // Keyboard navigation state
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);

  // Memoize sorted images to prevent unnecessary re-renders (moved here to fix initialization order)
  const sortedImages = useMemo(() => {
    startMeasurement();
    const sorted = [...images].sort((a, b) => b.createdAt - a.createdAt);
    endMeasurement(sorted.length);
    return sorted;
  }, [images, startMeasurement, endMeasurement]);

  // Handle keyboard navigation within the grid
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (images.length === 0) return;

    const currentIndex = focusedIndex;
    let newIndex = currentIndex;
    const gridCols = getGridColumns();

    switch (event.key) {
      case KeyboardKeys.ARROW_RIGHT:
        event.preventDefault();
        newIndex = Math.min(currentIndex + 1, images.length - 1);
        break;
      case KeyboardKeys.ARROW_LEFT:
        event.preventDefault();
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case KeyboardKeys.ARROW_DOWN:
        event.preventDefault();
        newIndex = Math.min(currentIndex + gridCols, images.length - 1);
        break;
      case KeyboardKeys.ARROW_UP:
        event.preventDefault();
        newIndex = Math.max(currentIndex - gridCols, 0);
        break;
      case KeyboardKeys.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
      case KeyboardKeys.END:
        event.preventDefault();
        newIndex = images.length - 1;
        break;
      case KeyboardKeys.SPACE:
        if (selectionMode && onImageSelectionChange && currentIndex >= 0) {
          event.preventDefault();
          const imageId = sortedImages[currentIndex]?.id;
          if (imageId) {
            const isSelected = selectedImageIds.includes(imageId);
            onImageSelectionChange(imageId, !isSelected);
            announceToScreenReader(
              `Image ${currentIndex + 1} ${!isSelected ? 'selected' : 'deselected'}`
            );
          }
        }
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
      setFocusedIndex(newIndex);
      // Focus the image card
      const imageCard = gridRef.current?.children[newIndex] as HTMLElement;
      if (imageCard) {
        imageCard.focus();
        announceToScreenReader(`Image ${newIndex + 1} of ${images.length}: ${sortedImages[newIndex]?.filename}`);
      }
    }
  }, [focusedIndex, images.length, selectionMode, onImageSelectionChange, selectedImageIds, sortedImages]);

  // Get current grid columns based on screen size
  const getGridColumns = useCallback(() => {
    if (!gridRef.current) return 4;
    const width = gridRef.current.offsetWidth;
    if (width < 640) return 1; // sm
    if (width < 1024) return 2; // lg
    if (width < 1280) return 3; // xl
    if (width < 1536) return 4; // 2xl
    return 5;
  }, []);

  // Reset focus when images change
  useEffect(() => {
    if (images.length === 0) {
      setFocusedIndex(-1);
    } else if (focusedIndex >= images.length) {
      setFocusedIndex(images.length - 1);
    }
  }, [images.length, focusedIndex]);



  // Monitor render performance
  useEffect(() => {
    startMeasurement();
    return () => {
      endMeasurement(images.length);
    };
  }, [images.length, startMeasurement, endMeasurement]);

  // Loading state
  if (loading && images.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading images...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-400 font-medium mb-2">Error loading images</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium mb-2">No images uploaded yet</p>
          <p className="text-gray-500 text-sm mb-4">Upload some images to get started</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            🔄 Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Keyboard navigation instructions */}
      {images.length > 0 && (
        <div className="sr-only" aria-live="polite">
          Use arrow keys to navigate between images. Press Space to select/deselect in selection mode. Press Home/End to jump to first/last image.
        </div>
      )}
      
      {/* Grid container with responsive columns */}
      <div 
        ref={gridRef}
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        role="grid"
        aria-label={`Image gallery with ${images.length} images`}
        onKeyDown={handleKeyDown}
        tabIndex={images.length > 0 ? 0 : -1}
      >
        {sortedImages.map((image, index) => (
          <div
            key={image.id}
            role="gridcell"
            aria-rowindex={Math.floor(index / getGridColumns()) + 1}
            aria-colindex={(index % getGridColumns()) + 1}
            tabIndex={index === focusedIndex ? 0 : -1}
            onFocus={() => setFocusedIndex(index)}
          >
            <ImageCard
              image={image}
              onUpdate={(updates) => onImageUpdate(image.id, updates)}
              onDelete={() => onImageDelete(image.id)}
              onRegenerate={onImageRegenerate ? (providers) => onImageRegenerate(image.id, providers) : undefined}
              onRegenerateProvider={onRegenerateProvider ? (modelId) => onRegenerateProvider(image.id, modelId) : undefined}
              selected={selectedImageIds.includes(image.id)}
              onSelectionChange={onImageSelectionChange ? (selected) => onImageSelectionChange(image.id, selected) : undefined}
              selectionMode={selectionMode}
            />
          </div>
        ))}
      </div>

      {/* Loading indicator for additional images */}
      {loading && images.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
          <span className="text-gray-400">Loading more images...</span>
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const GalleryGrid = memo(GalleryGridComponent, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.images.length === nextProps.images.length &&
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error &&
    prevProps.selectionMode === nextProps.selectionMode &&
    prevProps.selectedImageIds?.length === nextProps.selectedImageIds?.length &&
    // Deep comparison for images array (only check IDs and status for performance)
    prevProps.images.every((img, index) => {
      const nextImg = nextProps.images[index];
      return nextImg && img.id === nextImg.id && img.status === nextImg.status;
    })
  );
});