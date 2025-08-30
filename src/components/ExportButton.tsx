import React, { useState, useRef, useEffect } from 'react';
import type { ImageDoc } from '../types';
import { useExport } from '../hooks/useExport';
import { generateId, FocusManager, announceToScreenReader } from '../utils/accessibility';

export interface ExportButtonProps {
  images: ImageDoc[];
  className?: string;
  disabled?: boolean;
}

/**
 * Export button component with progress indication and localStorage gating
 * Requirements: 5.1, 5.4, 5.5, 5.6
 */
export function ExportButton({ images, className = '', disabled = false }: ExportButtonProps) {
  const [showPreview, setShowPreview] = useState(false);
  const { 
    isExporting, 
    exportProgress, 
    showDownloadButton, 
    stats, 
    exportDataset, 
    generateDatasetPreview,
    canExport,
    exportButtonText
  } = useExport(images);
  
  // Accessibility refs
  const progressModalRef = useRef<HTMLDivElement>(null);
  const previewModalRef = useRef<HTMLDivElement>(null);
  const progressModalId = useRef(generateId('export-progress'));
  const previewModalId = useRef(generateId('export-preview'));

  // Don't render if localStorage gate is not enabled
  if (!showDownloadButton) {
    return null;
  }

  const handleExport = async () => {
    try {
      announceToScreenReader('Starting dataset export');
      await exportDataset();
      announceToScreenReader('Dataset export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      announceToScreenReader('Dataset export failed', 'assertive');
      // Error handling could be enhanced with toast notifications
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const previewData = showPreview ? generateDatasetPreview() : [];

  // Focus management for modals
  useEffect(() => {
    if (isExporting && progressModalRef.current) {
      const cleanup = FocusManager.trapFocus(progressModalRef.current);
      return cleanup;
    }
  }, [isExporting]);

  useEffect(() => {
    if (showPreview && previewModalRef.current) {
      const cleanup = FocusManager.trapFocus(previewModalRef.current);
      return cleanup;
    }
  }, [showPreview]);

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={disabled || isExporting || !canExport}
          className={`
            px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed 
            text-white rounded transition-colors flex items-center gap-2 text-sm font-medium
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
            ${className}
          `}
          aria-label={!canExport ? 'Export disabled: No images with captions available' : 'Export dataset as JSON file'}
          aria-describedby="export-button-description"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" aria-hidden="true"></div>
              <span>{exportButtonText}</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{exportButtonText}</span>
            </>
          )}
        </button>
        <div id="export-button-description" className="sr-only">
          {canExport 
            ? `Export ${stats.readyForExport} images with captions as a JSON dataset file`
            : 'No images with captions are available for export'
          }
        </div>

        {/* Preview Button */}
        {canExport && (
          <button
            onClick={handlePreview}
            disabled={disabled || isExporting}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Preview dataset contents before export"
          >
            Preview
          </button>
        )}
      </div>

      {/* Export Progress Modal */}
      {isExporting && exportProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div 
            ref={progressModalRef}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4"
            role="document"
            aria-labelledby={`${progressModalId.current}-title`}
            aria-describedby={`${progressModalId.current}-description`}
          >
            <h3 id={`${progressModalId.current}-title`} className="text-lg font-medium text-white mb-4">
              Exporting Dataset
            </h3>
            <div id={`${progressModalId.current}-description`} className="sr-only">
              Dataset export is in progress. Please wait while your images are processed.
            </div>

            <div className="space-y-4" role="status" aria-live="polite">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Processing images...</span>
                  <span>{exportProgress.processed} / {exportProgress.total}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(exportProgress.processed / exportProgress.total) * 100}%` }}
                    role="progressbar"
                    aria-valuenow={exportProgress.processed}
                    aria-valuemin={0}
                    aria-valuemax={exportProgress.total}
                    aria-label={`Export progress: ${exportProgress.processed} of ${exportProgress.total} images processed`}
                  />
                </div>
              </div>

              {/* Current Image */}
              {exportProgress.currentImage && (
                <div className="text-sm text-gray-400" aria-live="polite">
                  <span className="text-gray-500">Processing:</span> {exportProgress.currentImage}
                </div>
              )}

              {/* Statistics */}
              <div className="text-xs text-gray-500 space-y-1">
                <div>Total images: {stats.totalImages}</div>
                <div>Ready for export: {stats.readyForExport}</div>
                <div>With custom captions: {stats.imagesWithOverrides}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dataset Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div 
            ref={previewModalRef}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col"
            role="document"
            aria-labelledby={`${previewModalId.current}-title`}
            aria-describedby={`${previewModalId.current}-description`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 id={`${previewModalId.current}-title`} className="text-lg font-medium text-white">
                Dataset Preview ({previewData.length} entries)
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 rounded p-1"
                aria-label="Close preview"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div id={`${previewModalId.current}-description`} className="sr-only">
              Preview of the dataset JSON structure showing {previewData.length} entries with image URLs, filenames, and captions.
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto">
              <pre 
                className="text-xs text-gray-300 bg-gray-900 p-4 rounded border border-gray-600 overflow-auto"
                role="textbox"
                aria-readonly="true"
                aria-label="Dataset JSON preview"
                tabIndex={0}
              >
                {JSON.stringify(previewData, null, 2)}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  handleExport();
                }}
                disabled={!canExport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Export this dataset as JSON file"
              >
                Export This Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}