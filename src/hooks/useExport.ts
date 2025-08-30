import { useState, useCallback, useEffect } from 'react';
import type { ImageDoc, DatasetEntry } from '../types';
import { ExportService } from '../services/exportService';
import type { ExportProgress } from '../services/exportService';

/**
 * Hook for managing dataset export functionality
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export function useExport(images: ImageDoc[]) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [showDownloadButton, setShowDownloadButton] = useState(false);

  // Initialize download button visibility from localStorage
  useEffect(() => {
    setShowDownloadButton(ExportService.shouldShowDownloadButton());
  }, []);

  // Get dataset statistics - with safety check for images array
  const stats = images && Array.isArray(images) 
    ? ExportService.getDatasetStats(images)
    : {
        totalImages: 0,
        imagesWithCaptions: 0,
        imagesWithOverrides: 0,
        readyForExport: 0
      };

  /**
   * Export dataset with progress tracking
   * Requirements: 5.2, 5.3, 5.4, 5.5, 5.6
   */
  const exportDataset = useCallback(async (filename?: string) => {
    if (isExporting || !images || !Array.isArray(images)) return;

    setIsExporting(true);
    setExportProgress({ processed: 0, total: images.length });

    try {
      // Generate dataset with progress tracking
      const dataset = ExportService.generateDataset(images, (progress) => {
        setExportProgress(progress);
      });

      // Small delay to show final progress
      await new Promise(resolve => setTimeout(resolve, 100));

      // Download the dataset
      ExportService.downloadDataset(dataset, filename);

      // Reset progress after successful export
      setTimeout(() => {
        setExportProgress(null);
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, [images, isExporting]);

  /**
   * Toggle download button visibility
   * Requirements: 5.1
   */
  const toggleDownloadButton = useCallback((visible?: boolean) => {
    const newVisibility = visible !== undefined ? visible : !showDownloadButton;
    setShowDownloadButton(newVisibility);
    ExportService.setDownloadButtonVisibility(newVisibility);
  }, [showDownloadButton]);

  /**
   * Generate dataset without downloading (for preview)
   */
  const generateDatasetPreview = useCallback((): DatasetEntry[] => {
    if (!images || !Array.isArray(images)) return [];
    return ExportService.generateDataset(images);
  }, [images]);

  return {
    // State
    isExporting,
    exportProgress,
    showDownloadButton,
    stats,

    // Actions
    exportDataset,
    toggleDownloadButton,
    generateDatasetPreview,

    // Computed values
    canExport: stats.readyForExport > 0,
    exportButtonText: isExporting 
      ? `Exporting... (${exportProgress?.processed || 0}/${exportProgress?.total || 0})`
      : `Export Dataset (${stats.readyForExport})`
  };
}