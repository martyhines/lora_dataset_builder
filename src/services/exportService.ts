import type { ImageDoc, DatasetEntry } from '../types';

/**
 * Progress callback for export operations
 */
export interface ExportProgress {
  processed: number;
  total: number;
  currentImage?: string;
}

/**
 * Service for exporting dataset in JSON format
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export class ExportService {
  /**
   * Generate dataset entries from images with selected captions
   * Requirements: 5.2, 5.3, 5.5
   */
  static generateDataset(
    images: ImageDoc[], 
    onProgress?: (progress: ExportProgress) => void
  ): DatasetEntry[] {
    const dataset: DatasetEntry[] = [];
    let processed = 0;
    const total = images.length;

    for (const image of images) {
      // Update progress
      if (onProgress) {
        onProgress({
          processed,
          total,
          currentImage: image.filename
        });
      }

      // Get all available captions for this image
      const captions = this.getAllCaptions(image);
      
      // Create dataset entries for each caption
      for (const caption of captions) {
        const entry: DatasetEntry = {
          url: image.downloadURL,
          filename: image.filename,
          caption: caption
        };
        dataset.push(entry);
      }
      processed++;
    }

    // Final progress update
    if (onProgress) {
      onProgress({
        processed: total,
        total,
        currentImage: undefined
      });
    }

    return dataset;
  }

  /**
   * Get all available captions for an image
   * Includes AI-generated captions and manual overrides
   * Requirements: 5.3
   */
  private static getAllCaptions(image: ImageDoc): string[] {
    const captions: string[] = [];

    // Add manual override caption if available
    if (image.selectedTextOverride?.trim()) {
      captions.push(image.selectedTextOverride.trim());
    }

    // Add all AI-generated captions
    if (image.candidates && image.candidates.length > 0) {
      for (const candidate of image.candidates) {
        if (candidate.caption && candidate.caption.trim()) {
          captions.push(candidate.caption.trim());
        }
      }
    }

    // If no captions found, return empty array
    return captions;
  }

  /**
   * Download dataset as JSON file
   * Requirements: 5.4, 5.6
   */
  static downloadDataset(dataset: DatasetEntry[], filename?: string): void {
    // Generate filename with timestamp if not provided
    const defaultFilename = `lora-dataset-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
    const finalFilename = filename || defaultFilename;

    // Create JSON blob
    const jsonContent = JSON.stringify(dataset, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });

    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL
    URL.revokeObjectURL(url);
  }

  /**
   * Check if download button should be visible based on localStorage
   * Requirements: 5.1
   */
  static shouldShowDownloadButton(): boolean {
    try {
      return localStorage.getItem('show_dl_button') === 'true';
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
      return false;
    }
  }

  /**
   * Set download button visibility in localStorage
   * Requirements: 5.1
   */
  static setDownloadButtonVisibility(visible: boolean): void {
    try {
      localStorage.setItem('show_dl_button', visible.toString());
    } catch (error) {
      console.warn('Failed to set localStorage:', error);
    }
  }

  /**
   * Get statistics about the dataset
   */
  static getDatasetStats(images: ImageDoc[]): {
    totalImages: number;
    imagesWithCaptions: number;
    imagesWithOverrides: number;
    readyForExport: number;
  } {
    let imagesWithCaptions = 0;
    let imagesWithOverrides = 0;
    let readyForExport = 0;

    for (const image of images) {
      // Check if image has any captions (AI-generated or manual)
      const hasCaption = (image.candidates && image.candidates.length > 0) || Boolean(image.selectedTextOverride?.trim());
      const hasOverride = Boolean(image.selectedTextOverride?.trim());

      if (hasCaption) {
        imagesWithCaptions++;
        readyForExport++;
      }
      if (hasOverride) {
        imagesWithOverrides++;
      }
    }

    return {
      totalImages: images.length,
      imagesWithCaptions,
      imagesWithOverrides,
      readyForExport
    };
  }
}