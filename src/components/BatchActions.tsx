import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ImageDoc } from '../types';
import { generateId, announceToScreenReader, FocusManager } from '../utils/accessibility';

export interface BatchActionsProps {
  images: ImageDoc[];
  selectedImageIds: string[];
  onSelectionChange: (imageIds: string[]) => void;
  onBatchDelete: (imageIds: string[]) => Promise<{ successful: string[]; failed: Array<{ imageId: string; error: string }> }>;
  disabled?: boolean;
}

/**
 * Component for batch operations on images including selection and deletion
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export function BatchActions({
  images,
  selectedImageIds,
  onSelectionChange,
  onBatchDelete,
  disabled = false
}: BatchActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState({ completed: 0, total: 0, current: '' });
  const [deleteResults, setDeleteResults] = useState<{ successful: string[]; failed: Array<{ imageId: string; error: string }> } | null>(null);
  
  // Accessibility refs
  const modalRef = useRef<HTMLDivElement>(null);
  const selectAllId = useRef(generateId('select-all'));
  const modalId = useRef(generateId('batch-delete-modal'));

  // Select all images
  const handleSelectAll = useCallback(() => {
    if (selectedImageIds.length === images.length) {
      onSelectionChange([]);
      announceToScreenReader('All images deselected');
    } else {
      onSelectionChange(images.map(img => img.id));
      announceToScreenReader(`All ${images.length} images selected`);
    }
  }, [images, selectedImageIds, onSelectionChange]);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    onSelectionChange([]);
    announceToScreenReader('Selection cleared');
  }, [onSelectionChange]);

  // Handle batch delete with confirmation
  const handleBatchDelete = useCallback(async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setDeleteResults(null);
      return;
    }

    setIsDeleting(true);
    setDeleteProgress({ completed: 0, total: selectedImageIds.length, current: '' });

    try {
      const results = await onBatchDelete(selectedImageIds);
      setDeleteResults(results);
      
      // Clear selection of successfully deleted images
      if (results.successful.length > 0) {
        const remainingSelected = selectedImageIds.filter(id => !results.successful.includes(id));
        onSelectionChange(remainingSelected);
        announceToScreenReader(`Successfully deleted ${results.successful.length} image${results.successful.length !== 1 ? 's' : ''}`);
      }
      
      // Announce failures
      if (results.failed.length > 0) {
        announceToScreenReader(`Failed to delete ${results.failed.length} image${results.failed.length !== 1 ? 's' : ''}`, 'assertive');
      }
      
      // Auto-close confirmation if all deletions were successful
      if (results.failed.length === 0) {
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Batch delete failed:', error);
      setDeleteResults({
        successful: [],
        failed: selectedImageIds.map(id => ({ 
          imageId: id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }))
      });
    } finally {
      setIsDeleting(false);
    }
  }, [showDeleteConfirm, selectedImageIds, onBatchDelete, onSelectionChange]);

  // Cancel batch delete
  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteResults(null);
  }, []);

  // Retry failed deletions
  const handleRetryFailed = useCallback(async () => {
    if (!deleteResults || deleteResults.failed.length === 0) return;

    const failedIds = deleteResults.failed.map(f => f.imageId);
    setIsDeleting(true);
    setDeleteProgress({ completed: 0, total: failedIds.length, current: '' });

    try {
      const retryResults = await onBatchDelete(failedIds);
      
      // Merge results
      const newResults = {
        successful: [...deleteResults.successful, ...retryResults.successful],
        failed: retryResults.failed
      };
      setDeleteResults(newResults);
      
      // Update selection
      if (retryResults.successful.length > 0) {
        const remainingSelected = selectedImageIds.filter(id => !retryResults.successful.includes(id));
        onSelectionChange(remainingSelected);
      }
      
      // Auto-close if all successful
      if (newResults.failed.length === 0) {
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteResults, onBatchDelete, selectedImageIds, onSelectionChange]);

  const hasSelection = selectedImageIds.length > 0;
  const allSelected = selectedImageIds.length === images.length && images.length > 0;

  // Focus management for modal
  useEffect(() => {
    if (showDeleteConfirm && modalRef.current) {
      const cleanup = FocusManager.trapFocus(modalRef.current);
      return cleanup;
    }
  }, [showDeleteConfirm]);

  return (
    <>
      {/* Batch Actions Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg mb-4">
        <div className="flex items-center gap-4">
          {/* Select All Checkbox */}
          <label htmlFor={selectAllId.current} className="flex items-center gap-2 cursor-pointer">
            <input
              id={selectAllId.current}
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              disabled={disabled || images.length === 0}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              aria-describedby={`${selectAllId.current}-description`}
            />
            <span className="text-sm text-gray-300">
              {allSelected ? 'Deselect All' : 'Select All'}
            </span>
          </label>
          <div id={`${selectAllId.current}-description`} className="sr-only">
            {allSelected ? 'Deselect all images in the gallery' : 'Select all images in the gallery for batch operations'}
          </div>

          {/* Selection Count */}
          {hasSelection && (
            <span className="text-sm text-gray-400" role="status" aria-live="polite">
              {selectedImageIds.length} of {images.length} selected
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {hasSelection && (
            <>
              <button
                onClick={handleClearSelection}
                disabled={disabled}
                className="px-3 py-1 text-sm text-gray-400 hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={disabled || isDeleting}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-describedby="batch-delete-description"
              >
                Delete Selected ({selectedImageIds.length})
              </button>
              <div id="batch-delete-description" className="sr-only">
                Delete all {selectedImageIds.length} selected images permanently
              </div>
            </>
          )}
        </div>
      </div>

      {/* Batch Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div 
            ref={modalRef}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4"
            role="document"
            aria-labelledby={`${modalId.current}-title`}
            aria-describedby={`${modalId.current}-description`}
          >
            <h3 id={`${modalId.current}-title`} className="text-lg font-medium text-white mb-4">
              Delete {selectedImageIds.length} Image{selectedImageIds.length !== 1 ? 's' : ''}?
            </h3>
            <div id={`${modalId.current}-description`} className="sr-only">
              This action will permanently delete the selected images and cannot be undone.
            </div>

            {/* Progress Display */}
            {isDeleting && (
              <div className="mb-4" role="status" aria-live="polite">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Deleting images...</span>
                  <span>{deleteProgress.completed} / {deleteProgress.total}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(deleteProgress.completed / deleteProgress.total) * 100}%` }}
                    role="progressbar"
                    aria-valuenow={deleteProgress.completed}
                    aria-valuemin={0}
                    aria-valuemax={deleteProgress.total}
                    aria-label={`Deleting progress: ${deleteProgress.completed} of ${deleteProgress.total} images deleted`}
                  />
                </div>
                {deleteProgress.current && (
                  <p className="text-xs text-gray-500 mt-1" aria-live="polite">
                    Current: {deleteProgress.current}
                  </p>
                )}
              </div>
            )}

            {/* Results Display */}
            {deleteResults && (
              <div className="mb-4 space-y-2" role="status" aria-live="polite">
                {deleteResults.successful.length > 0 && (
                  <div className="p-2 bg-green-900/20 border border-green-800 rounded text-green-400 text-sm" role="alert">
                    <span aria-hidden="true">✅</span> Successfully deleted {deleteResults.successful.length} image{deleteResults.successful.length !== 1 ? 's' : ''}
                  </div>
                )}
                {deleteResults.failed.length > 0 && (
                  <div className="p-2 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm" role="alert">
                    <span aria-hidden="true">❌</span> Failed to delete {deleteResults.failed.length} image{deleteResults.failed.length !== 1 ? 's' : ''}
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-red-500 rounded">
                        Show errors
                      </summary>
                      <div className="mt-1 space-y-1 text-xs">
                        {deleteResults.failed.map(({ imageId, error }) => (
                          <div key={imageId} className="truncate">
                            {imageId}: {error}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {deleteResults && deleteResults.failed.length === 0 ? 'Close' : 'Cancel'}
              </button>
              
              {deleteResults && deleteResults.failed.length > 0 && (
                <button
                  onClick={handleRetryFailed}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label={`Retry deleting ${deleteResults.failed.length} failed images`}
                >
                  Retry Failed ({deleteResults.failed.length})
                </button>
              )}
              
              {!deleteResults && (
                <button
                  onClick={handleBatchDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" aria-hidden="true"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}