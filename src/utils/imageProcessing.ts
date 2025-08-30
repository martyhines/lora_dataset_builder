/**
 * Image preprocessing utilities for client-side optimization
 */

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 for JPEG compression
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}

export interface ProcessedImageResult {
  file: File;
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
  dimensions: {
    width: number;
    height: number;
  };
}

/**
 * Resizes and compresses an image file on the client side
 */
export function processImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 2048,
      maxHeight = 2048,
      quality = 0.85,
      format = 'jpeg',
      maintainAspectRatio = true
    } = options;

    // Create image element
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight,
          maintainAspectRatio
        );

        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and resize image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to process image'));
              return;
            }

            // Create new file
            const processedFile = new File(
              [blob],
              generateProcessedFilename(file.name, format),
              { type: `image/${format}` }
            );

            resolve({
              file: processedFile,
              originalSize: file.size,
              processedSize: processedFile.size,
              compressionRatio: file.size / processedFile.size,
              dimensions: {
                width: newWidth,
                height: newHeight
              }
            });
          },
          `image/${format}`,
          format === 'jpeg' ? quality : undefined
        );

        // Clean up
        URL.revokeObjectURL(img.src);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Processes multiple images with progress tracking
 */
export async function processImages(
  files: File[],
  options: ImageProcessingOptions = {},
  onProgress?: (completed: number, total: number, currentFile: string) => void
): Promise<ProcessedImageResult[]> {
  const results: ProcessedImageResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      onProgress?.(i, files.length, file.name);
      
      // Check if image needs processing
      if (shouldProcessImage(file, options)) {
        const result = await processImage(file, options);
        results.push(result);
      } else {
        // Return original file if no processing needed
        const img = await getImageDimensions(file);
        results.push({
          file,
          originalSize: file.size,
          processedSize: file.size,
          compressionRatio: 1,
          dimensions: img
        });
      }
    } catch (error) {
      console.warn(`Failed to process image ${file.name}:`, error);
      // Return original file on processing error
      try {
        const img = await getImageDimensions(file);
        results.push({
          file,
          originalSize: file.size,
          processedSize: file.size,
          compressionRatio: 1,
          dimensions: img
        });
      } catch {
        // Skip file if we can't even get dimensions
        console.error(`Skipping invalid image file: ${file.name}`);
      }
    }
  }
  
  onProgress?.(files.length, files.length, '');
  return results;
}

/**
 * Determines if an image needs processing based on size and options
 */
function shouldProcessImage(file: File, options: ImageProcessingOptions): boolean {
  const { maxWidth = 2048, maxHeight = 2048 } = options;
  
  // Always process if file is larger than 5MB
  if (file.size > 5 * 1024 * 1024) {
    return true;
  }
  
  // We'll need to check dimensions, but for now assume processing is needed
  // for large files or if specific format conversion is requested
  return file.size > 1024 * 1024 || options.format !== undefined;
}

/**
 * Gets image dimensions without processing
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for dimension check'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculates new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  maintainAspectRatio: boolean
): { width: number; height: number } {
  if (!maintainAspectRatio) {
    return {
      width: Math.min(originalWidth, maxWidth),
      height: Math.min(originalHeight, maxHeight)
    };
  }

  // If image is already smaller than max dimensions, return original
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return {
      width: originalWidth,
      height: originalHeight
    };
  }

  // Calculate scaling factor
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const scalingFactor = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(originalWidth * scalingFactor),
    height: Math.round(originalHeight * scalingFactor)
  };
}

/**
 * Generates a filename for processed images
 */
function generateProcessedFilename(originalFilename: string, format: string): string {
  const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExt}_processed.${format}`;
}

/**
 * Estimates the potential file size reduction from processing
 */
export function estimateCompressionSavings(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<{ estimatedSize: number; estimatedSavings: number }> {
  return new Promise((resolve) => {
    const { quality = 0.85, maxWidth = 2048, maxHeight = 2048 } = options;
    
    // Simple estimation based on file size and quality
    // This is a rough estimate - actual results may vary
    let estimatedReduction = 1;
    
    // Factor in quality compression
    if (file.type === 'image/png' && options.format === 'jpeg') {
      estimatedReduction *= 0.3; // PNG to JPEG typically saves 70%
    }
    
    estimatedReduction *= quality;
    
    // Factor in dimension reduction (rough estimate)
    if (file.size > 2 * 1024 * 1024) { // Files larger than 2MB likely need resizing
      estimatedReduction *= 0.5; // Assume 50% size reduction from resizing
    }
    
    const estimatedSize = Math.round(file.size * estimatedReduction);
    const estimatedSavings = file.size - estimatedSize;
    
    resolve({
      estimatedSize,
      estimatedSavings
    });
  });
}