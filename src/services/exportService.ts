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

      // Skip images without selected captions
      const caption = this.getSelectedCaption(image);
      if (!caption) {
        processed++;
        continue;
      }

      // Create dataset entry
      const entry: DatasetEntry = {
        url: image.downloadURL,
        filename: image.filename,
        caption: caption
      };

      dataset.push(entry);
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
   * Get the selected caption for an image
   * Uses selectedTextOverride if available, otherwise the selected caption
   * Requirements: 5.3
   */
  private static getSelectedCaption(image: ImageDoc): string | null {
    // Use override text if available
    if (image.selectedTextOverride?.trim()) {
      return image.selectedTextOverride.trim();
    }

    // Use selected caption if available
    if (image.selectedIndex !== null && image.candidates[image.selectedIndex]) {
      return image.candidates[image.selectedIndex].caption;
    }

    return null;
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
      const hasCaption = this.getSelectedCaption(image) !== null;
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