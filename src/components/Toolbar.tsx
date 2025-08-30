import React, { useRef, useState, useCallback } from 'react';
import type { ImageDoc } from '../types';
import { ExportButton } from './ExportButton';
import { useExport } from '../hooks/useExport';
import { generateId, announceToScreenReader } from '../utils/accessibility';

export interface ToolbarProps {
  images: ImageDoc[];
  className?: string;
  onBatchSelectionChange?: (imageIds: string[]) => void;
  onBatchDelete?: (imageIds: string[]) => Promise<{ successful: string[]; failed: Array<{ imageId: string; error: string }> }>;
  selectedImageIds?: string[];
  selectionMode?: boolean;
  onToggleSelectionMode?: () => void;
}

/**
 * Toolbar component with export functionality, statistics, and batch actions
 * Requirements: 5.1, 5.4
 */
export function Toolbar({ 
  images, 
  className = '',
  onBatchSelectionChange,
  onBatchDelete,
  selectedImageIds = [],
  selectionMode = false,
  onToggleSelectionMode
}: ToolbarProps) {
  const { stats, toggleDownloadButton, showDownloadButton } = useExport(images);
  const toolbarId = useRef(generateId('toolbar'));
  const statsId = useRef(generateId('stats'));
  const selectAllId = useRef(generateId('select-all'));

  // Batch action handlers
  const handleSelectAll = useCallback(() => {
    if (!onBatchSelectionChange) return;
    
    if (selectedImageIds.length === images.length) {
      onBatchSelectionChange([]);
      announceToScreenReader('All images deselected');
    } else {
      onBatchSelectionChange(images.map(img => img.id));
      announceToScreenReader(`All ${images.length} images selected`);
    }
  }, [images, selectedImageIds, onBatchSelectionChange]);

  const handleClearSelection = useCallback(() => {
    if (!onBatchSelectionChange) return;
    onBatchSelectionChange([]);
    announceToScreenReader('Selection cleared');
  }, [onBatchSelectionChange]);

  const hasSelection = selectedImageIds.length > 0;
  const allSelected = selectedImageIds.length === images.length && images.length > 0;

  return (
    <div 
      className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl ${className}`}
      role="toolbar"
      aria-labelledby={`${toolbarId.current}-title`}
      aria-describedby={statsId.current}
    >
      <div className="sr-only" id={`${toolbarId.current}-title`}>
        Dataset Statistics and Export Tools
      </div>
      
      {/* Statistics */}
      <div 
        id={statsId.current}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 text-sm"
        role="status"
        aria-live="polite"
        aria-label="Dataset statistics"
      >
        <div className="flex flex-col items-center lg:items-start p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">Total Images</span>
          <span className="text-2xl font-bold text-white" aria-label={`${stats.totalImages} total images`}>{stats.totalImages}</span>
        </div>
        
        <div className="flex flex-col items-center lg:items-start p-3 bg-green-600/20 rounded-lg border border-green-500/30">
          <span className="text-green-300 text-xs font-medium uppercase tracking-wide">With Captions</span>
          <span className="text-2xl font-bold text-green-100" aria-label={`${stats.imagesWithCaptions} images with captions`}>{stats.imagesWithCaptions}</span>
        </div>
        
        <div className="flex flex-col items-center lg:items-start p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
          <span className="text-blue-300 text-xs font-medium uppercase tracking-wide">Custom Captions</span>
          <span className="text-2xl font-bold text-blue-100" aria-label={`${stats.imagesWithOverrides} images with custom captions`}>{stats.imagesWithOverrides}</span>
        </div>
        
        <div className="flex flex-col items-center lg:items-start p-3 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
          <span className="text-yellow-300 text-xs font-medium uppercase tracking-wide">Ready for Export</span>
          <span className="text-2xl font-bold text-yellow-100" aria-label={`${stats.readyForExport} images ready for export`}>{stats.readyForExport}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
        {/* Batch Actions - only show when images exist */}
        {images.length > 0 && (
          <>
            {/* Selection Mode Toggle */}
            {onToggleSelectionMode && (
              <button
                onClick={onToggleSelectionMode}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  selectionMode 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white focus:ring-blue-500/50 shadow-lg' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-gray-200 focus:ring-gray-500/50 shadow-lg'
                }`}
                aria-label={selectionMode ? 'Exit selection mode' : 'Enter selection mode for batch operations'}
              >
                {selectionMode ? 'Exit Selection' : 'Select Images'}
              </button>
            )}

            {/* Batch Selection Controls - only show in selection mode */}
            {selectionMode && onBatchSelectionChange && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                {/* Select All Checkbox */}
                <label htmlFor={selectAllId.current} className="flex items-center gap-3 cursor-pointer">
                  <input
                    id={selectAllId.current}
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800"
                    aria-describedby={`${selectAllId.current}-description`}
                  />
                  <span className="text-sm font-medium text-gray-200">
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </span>
                </label>
                <div id={`${selectAllId.current}-description`} className="sr-only">
                  {allSelected ? 'Deselect all images in the gallery' : 'Select all images in the gallery for batch operations'}
                </div>

                {/* Selection Count */}
                {hasSelection && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 rounded-full border border-blue-500/30">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-200" role="status" aria-live="polite">
                      {selectedImageIds.length} selected
                    </span>
                  </div>
                )}

                {/* Clear Selection */}
                {hasSelection && (
                  <button
                    onClick={handleClearSelection}
                    className="px-3 py-1 text-sm text-gray-400 hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-md hover:bg-gray-600/50"
                    aria-label="Clear current selection"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Developer Toggle for Download Button */}
        {process.env.NODE_ENV === 'development' && (
          <div className="border-t sm:border-t-0 sm:border-l border-gray-600/50 pt-3 sm:pt-0 sm:pl-4">
            <button
              onClick={() => toggleDownloadButton()}
              className="px-3 py-2 text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 border border-gray-600/50"
              aria-label={`Toggle download button visibility. Currently ${showDownloadButton ? 'enabled' : 'disabled'}`}
              aria-describedby="dev-toggle-help"
            >
              DL: {showDownloadButton ? 'ON' : 'OFF'}
            </button>
            <div id="dev-toggle-help" className="sr-only">
              Development tool to toggle download button visibility using localStorage show_dl_button setting
            </div>
          </div>
        )}

        {/* Export Button */}
        <ExportButton images={images} />
      </div>
    </div>
  );
}