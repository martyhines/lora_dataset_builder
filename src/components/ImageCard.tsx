import React, { useState, useCallback, memo, useMemo, useRef, useEffect } from 'react';
import type { ImageDoc } from '../types';
import { CaptionSelector } from './CaptionSelector';
import { LazyImage } from './LazyImage';
import { generateId, announceToScreenReader, FocusManager, handleKeyboardActivation, KeyboardKeys, getAriaLabel } from '../utils/accessibility';

export interface ImageCardProps {
  image: ImageDoc;
  onUpdate: (updates: Partial<ImageDoc>) => void;
  onDelete: () => void;
  onRegenerate?: (providers?: string[]) => void;
  onRegenerateProvider?: (modelId: string) => void;
  // Selection props
  selected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  selectionMode?: boolean;
}

/**
 * Individual image card component with preview, status display, and caption management
 * Requirements: 4.1, 4.2, 8.1, 8.4, 10.4
 */
const ImageCardComponent = function ImageCard({
  image,
  onUpdate,
  onDelete,
  onRegenerate,
  onRegenerateProvider,
  selected = false,
  onSelectionChange,
  selectionMode = false
}: ImageCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Accessibility refs and IDs
  const cardId = useRef(generateId('image-card'));
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const checkboxId = useRef(generateId('image-checkbox'));
  const statusId = useRef(generateId('image-status'));
  const captionId = useRef(generateId('image-caption'));

  // Handle image load error
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Handle delete with confirmation and error recovery
  const handleDelete = useCallback(async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setDeleteError(null);
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      await onDelete();
      announceToScreenReader(`Image ${image.filename} deleted successfully`);
      // Success - component will be unmounted by parent, no need to reset state
    } catch (error) {
      console.error('Delete failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete image';
      setDeleteError(errorMessage);
      setIsDeleting(false);
      announceToScreenReader(`Failed to delete image: ${errorMessage}`, 'assertive');
      // Keep confirmation dialog open to allow retry
    }
  }, [showDeleteConfirm, onDelete, image.filename]);

  // Cancel delete confirmation
  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteError(null);
  }, []);

  // Handle caption selection
  const handleCaptionSelection = useCallback((selectedIndex: number) => {
    onUpdate({ selectedIndex });
    announceToScreenReader(`Caption ${selectedIndex + 1} selected for ${image.filename}`);
  }, [onUpdate, image.filename]);

  // Handle caption text override
  const handleCaptionTextChange = useCallback((selectedTextOverride: string) => {
    onUpdate({ selectedTextOverride });
  }, [onUpdate]);

  // Handle provider-specific regeneration
  const handleRegenerateProvider = useCallback((modelId: string) => {
    if (onRegenerateProvider) {
      onRegenerateProvider(modelId);
    }
  }, [onRegenerateProvider]);

  // Handle bulk regeneration
  const handleRegenerateAll = useCallback(() => {
    if (onRegenerate) {
      onRegenerate();
    }
  }, [onRegenerate]);

  // Handle selection change
  const handleSelectionChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      onSelectionChange(event.target.checked);
      announceToScreenReader(
        `Image ${image.filename} ${event.target.checked ? 'selected' : 'deselected'}`
      );
    }
  }, [onSelectionChange, image.filename]);

  // Focus management for delete modal
  useEffect(() => {
    if (showDeleteConfirm && deleteModalRef.current) {
      const cleanup = FocusManager.trapFocus(deleteModalRef.current);
      return cleanup;
    }
  }, [showDeleteConfirm]);

  // Memoize status display info to prevent recalculation
  const statusInfo = useMemo(() => {
    switch (image.status) {
      case 'pending':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          icon: '⏳',
          text: 'Pending'
        };
      case 'processing':
        return {
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/10',
          icon: '🔄',
          text: 'Processing'
        };
      case 'complete':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          icon: '✅',
          text: 'Complete'
        };
      case 'error':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          icon: '❌',
          text: 'Error'
        };
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          icon: '❓',
          text: 'Unknown'
        };
    }
  }, [image.status]);

  // Memoize formatted date to prevent recalculation
  const formattedDate = useMemo(() => {
    return new Date(image.createdAt).toLocaleDateString();
  }, [image.createdAt]);

  return (
    <article 
      id={cardId.current}
      className={`bg-gray-800/60 backdrop-blur-sm rounded-2xl border overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group ${
        selected ? 'border-blue-500 ring-4 ring-blue-500/30 scale-105' : 'border-gray-700/50 hover:border-gray-600/50 hover:scale-[1.02]'
      }`}
      aria-labelledby={`${cardId.current}-title`}
      aria-describedby={`${statusId.current} ${captionId.current}`}
    >
      {/* Image Preview Section */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-900 to-gray-800">
        {!imageError ? (
          <LazyImage
            src={image.downloadURL}
            alt={image.filename}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm font-medium">Failed to load</p>
            </div>
          </div>
        )}

        {/* Selection Checkbox */}
        {selectionMode && onSelectionChange && (
          <div className="absolute top-3 left-3 z-10">
            <label htmlFor={checkboxId.current} className="sr-only">
              {selected ? 'Deselect' : 'Select'} image {image.filename}
            </label>
            <input
              id={checkboxId.current}
              type="checkbox"
              checked={selected}
              onChange={handleSelectionChange}
              className="w-6 h-6 text-blue-600 bg-gray-800/80 border-gray-600 rounded-lg focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg"
              aria-describedby={`${cardId.current}-title`}
            />
          </div>
        )}

        {/* Status Badge */}
        <div 
          id={statusId.current}
          className={`absolute ${selectionMode ? 'top-3 left-12' : 'top-3 left-3'} px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.color} ${statusInfo.bgColor} backdrop-blur-sm border border-current/20 shadow-lg`}
          role="status"
          aria-label={`Image status: ${statusInfo.text}`}
        >
          <span className="mr-1.5" aria-hidden="true">{statusInfo.icon}</span>
          {statusInfo.text}
        </div>

        {/* Processing Animation Overlay */}
        {image.status === 'processing' && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-gray-800/80 rounded-2xl p-4 border border-gray-600/50">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent"></div>
              <p className="text-white text-sm mt-2 font-medium">Processing...</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {onRegenerate && (
            <button
              onClick={() => onRegenerate()}
              className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Regenerate captions for ${image.filename}`}
              disabled={image.status === 'processing'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg hover:shadow-xl ${
              showDeleteConfirm 
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-red-600 hover:to-red-700'
            } text-white`}
            aria-label={showDeleteConfirm ? `Confirm delete ${image.filename}` : `Delete ${image.filename}`}
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" aria-hidden="true"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div 
            className="absolute inset-0 bg-black/90 flex items-center justify-center backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${cardId.current}-delete-title`}
            aria-describedby={`${cardId.current}-delete-desc`}
          >
            <div ref={deleteModalRef} className="text-center text-white p-6 max-w-sm bg-gray-800/90 rounded-2xl border border-gray-700/50 shadow-2xl">
              <h3 id={`${cardId.current}-delete-title`} className="text-lg font-semibold mb-4">Delete this image?</h3>
              
              {/* Error Message */}
              {deleteError && (
                <div 
                  id={`${cardId.current}-delete-desc`}
                  className="mb-4 p-3 bg-red-900/50 border border-red-700/50 rounded-xl text-red-300 text-sm"
                  role="alert"
                >
                  {deleteError}
                </div>
              )}
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 shadow-lg"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : deleteError ? (
                    'Retry'
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Filename */}
        <h3 id={`${cardId.current}-title`} className="text-base font-semibold text-white mb-3 truncate" title={image.filename}>
          {image.filename}
        </h3>

        {/* Error Message */}
        {image.status === 'error' && image.error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded-xl text-red-300 text-sm">
            {image.error}
          </div>
        )}

        {/* Caption Selection */}
        {image.candidates.length > 0 && (
          <div id={captionId.current}>
            <CaptionSelector
              candidates={image.candidates}
              selectedIndex={image.selectedIndex}
              onSelectionChange={handleCaptionSelection}
              selectedTextOverride={image.selectedTextOverride}
              onTextChange={handleCaptionTextChange}
              onRegenerateProvider={onRegenerateProvider ? handleRegenerateProvider : undefined}
              onRegenerateAll={onRegenerate ? handleRegenerateAll : undefined}
              allowManualEntry={true}
            />
          </div>
        )}

        {/* No Captions State */}
        {image.candidates.length === 0 && image.status !== 'processing' && image.status !== 'pending' && (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm font-medium">No captions available</p>
            {onRegenerate && (
              <button
                onClick={() => onRegenerate()}
                className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium underline hover:no-underline transition-all duration-200"
              >
                Generate captions
              </button>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="mt-4 pt-4 border-t border-gray-700/50 text-xs text-gray-400">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              {image.candidates.length} caption{image.candidates.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ImageCard = memo(ImageCardComponent, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.image.id === nextProps.image.id &&
    prevProps.image.status === nextProps.image.status &&
    prevProps.image.selectedIndex === nextProps.image.selectedIndex &&
    prevProps.image.selectedTextOverride === nextProps.image.selectedTextOverride &&
    prevProps.image.candidates.length === nextProps.image.candidates.length &&
    prevProps.selected === nextProps.selected &&
    prevProps.selectionMode === nextProps.selectionMode
  );
});