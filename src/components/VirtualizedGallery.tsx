import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import type { ImageDoc } from '../types';
import { ImageCard } from './ImageCard';
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';

interface VirtualizedGalleryProps {
  images: ImageDoc[];
  onImageUpdate: (imageId: string, updates: Partial<ImageDoc>) => void;
  onImageDelete: (imageId: string) => void;
  onImageRegenerate?: (imageId: string, providers?: string[]) => void;
  onRegenerateProvider?: (imageId: string, modelId: string) => void;
  loading?: boolean;
  error?: string | null;
  selectedImageIds?: string[];
  onImageSelectionChange?: (imageId: string, selected: boolean) => void;
  selectionMode?: boolean;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

/**
 * Virtualized gallery component for handling large image sets efficiently
 * Requirements: 10.4 - Optimize image handling to prevent browser crashes with 100+ images
 */
export function VirtualizedGallery({
  images,
  onImageUpdate,
  onImageDelete,
  onImageRegenerate,
  onRegenerateProvider,
  loading = false,
  error = null,
  selectedImageIds = [],
  onImageSelectionChange,
  selectionMode = false,
  itemHeight = 400, // Estimated height per row
  containerHeight = 600, // Viewport height
  overscan = 5 // Number of items to render outside viewport
}: VirtualizedGalleryProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  const { startMeasurement, endMeasurement } = usePerformanceMonitoring({
    enabled: true,
    sampleRate: 0.2,
    onMetrics: (metrics) => {
      if (metrics.renderTime > 50) {
        console.log(`Virtualized gallery render: ${metrics.renderTime.toFixed(2)}ms for ${metrics.imageCount} visible items`);
      }
    }
  });

  // Calculate grid dimensions based on container width
  const [columnsPerRow, setColumnsPerRow] = useState(4);
  
  useEffect(() => {
    if (!containerRef) return;

    const updateColumns = () => {
      const containerWidth = containerRef.offsetWidth;
      const minItemWidth = 280; // Minimum width per image card
      const gap = 16; // Gap between items
      const columns = Math.max(1, Math.floor((containerWidth + gap) / (minItemWidth + gap)));
      setColumnsPerRow(columns);
    };

    updateColumns();
    
    const resizeObserver = new ResizeObserver(updateColumns);
    resizeObserver.observe(containerRef);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  // Memoize sorted images
  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => b.createdAt - a.createdAt);
  }, [images]);

  // Calculate rows and visible range
  const { totalRows, visibleRange, totalHeight } = useMemo(() => {
    startMeasurement();
    
    const rows = Math.ceil(sortedImages.length / columnsPerRow);
    const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endRow = Math.min(rows - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
    
    const result = {
      totalRows: rows,
      visibleRange: { start: startRow, end: endRow },
      totalHeight: rows * itemHeight
    };
    
    endMeasurement(Math.max(0, endRow - startRow + 1) * columnsPerRow);
    return result;
  }, [sortedImages.length, columnsPerRow, scrollTop, itemHeight, containerHeight, overscan, startMeasurement, endMeasurement]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const items: Array<{ image: ImageDoc; rowIndex: number; colIndex: number }> = [];
    
    for (let rowIndex = visibleRange.start; rowIndex <= visibleRange.end; rowIndex++) {
      for (let colIndex = 0; colIndex < columnsPerRow; colIndex++) {
        const imageIndex = rowIndex * columnsPerRow + colIndex;
        if (imageIndex < sortedImages.length) {
          items.push({
            image: sortedImages[imageIndex],
            rowIndex,
            colIndex
          });
        }
      }
    }
    
    return items;
  }, [sortedImages, visibleRange, columnsPerRow]);

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium mb-2">No images uploaded yet</p>
          <p className="text-gray-500 text-sm">Upload some images to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Performance info for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-gray-800 rounded text-xs text-gray-400">
          Total: {images.length} images, Visible: {visibleItems.length} items, 
          Rows: {totalRows}, Columns: {columnsPerRow}
        </div>
      )}

      {/* Virtualized container */}
      <div
        ref={(ref) => {
          setContainerRef(ref);
          scrollElementRef.current = ref;
        }}
        className="overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {/* Total height spacer */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Visible items */}
          <div
            style={{
              position: 'absolute',
              top: visibleRange.start * itemHeight,
              left: 0,
              right: 0
            }}
          >
            <div 
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${columnsPerRow}, 1fr)`
              }}
            >
              {visibleItems.map(({ image, rowIndex, colIndex }) => (
                <div
                  key={image.id}
                  style={{
                    gridRow: rowIndex - visibleRange.start + 1,
                    gridColumn: colIndex + 1
                  }}
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
          </div>
        </div>
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
}