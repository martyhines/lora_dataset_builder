import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
  type UploadTaskSnapshot
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Progress callback for upload operations
 */
export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0-100
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

/**
 * Result of a successful upload
 */
export interface UploadResult {
  downloadURL: string;
  fullPath: string;
  name: string;
  size: number;
}

/**
 * Service for Firebase Storage operations with progress tracking
 */
export class StorageService {
  /**
   * Upload a file with progress tracking
   */
  static uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          
          if (onProgress) {
            onProgress({
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              progress,
              state: snapshot.state as any
            });
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new Error(`Upload failed: ${error.message}`));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            resolve({
              downloadURL,
              fullPath: uploadTask.snapshot.ref.fullPath,
              name: uploadTask.snapshot.ref.name,
              size: uploadTask.snapshot.totalBytes
            });
          } catch (error) {
            reject(new Error(`Failed to get download URL: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        }
      );
    });
  }

  /**
   * Upload multiple files with batch progress tracking
   */
  static async uploadFiles(
    files: File[],
    getPath: (file: File, index: number) => string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void,
    onComplete?: (fileIndex: number, result: UploadResult) => void,
    onError?: (fileIndex: number, error: Error) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const errors: Error[] = [];

    const uploadPromises = files.map(async (file, index) => {
      try {
        const path = getPath(file, index);
        const result = await this.uploadFile(
          file,
          path,
          (progress) => onProgress?.(index, progress)
        );
        
        results[index] = result;
        onComplete?.(index, result);
        return result;
      } catch (error) {
        const uploadError = error instanceof Error ? error : new Error('Upload failed');
        errors[index] = uploadError;
        onError?.(index, uploadError);
        throw uploadError;
      }
    });

    // Wait for all uploads to complete or fail
    const settledResults = await Promise.allSettled(uploadPromises);
    
    // If any uploads failed, throw an error with details
    const failedUploads = settledResults
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.status === 'rejected');

    if (failedUploads.length > 0) {
      const errorMessage = `${failedUploads.length} of ${files.length} uploads failed`;
      throw new Error(errorMessage);
    }

    return results;
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(path: string): Promise<void> {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get download URL for a file
   */
  static async getDownloadURL(path: string): Promise<string> {
    try {
      const fileRef = ref(storage, path);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Get URL error:', error);
      throw new Error(`Failed to get download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate file before upload with comprehensive checks
   */
  static validateFile(file: File, options: {
    maxSize?: number; // in bytes
    minSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
    maxDimensions?: { width: number; height: number };
    minDimensions?: { width: number; height: number };
    checkImageIntegrity?: boolean;
  } = {}): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const {
        maxSize = 10 * 1024 * 1024, // 10MB default
        minSize = 1024, // 1KB minimum
        allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        checkImageIntegrity = true
      } = options;

      // Check if file exists and has content
      if (!file || file.size === 0) {
        reject(new Error('File is empty or invalid'));
        return;
      }

      // Check file size limits
      if (file.size < minSize) {
        reject(new Error(`File size ${(file.size / 1024).toFixed(2)}KB is below minimum ${(minSize / 1024).toFixed(2)}KB`));
        return;
      }

      if (file.size > maxSize) {
        reject(new Error(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`));
        return;
      }

      // Check MIME type
      if (!allowedTypes.includes(file.type)) {
        reject(new Error(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`));
        return;
      }

      // Check file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !allowedExtensions.includes(extension)) {
        reject(new Error(`File extension .${extension} not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`));
        return;
      }

      // Validate MIME type matches extension
      const mimeExtensionMap: Record<string, string[]> = {
        'image/jpeg': ['jpg', 'jpeg'],
        'image/png': ['png'],
        'image/webp': ['webp'],
        'image/gif': ['gif']
      };

      const expectedExtensions = mimeExtensionMap[file.type];
      if (expectedExtensions && !expectedExtensions.includes(extension)) {
        reject(new Error(`File extension .${extension} does not match MIME type ${file.type}`));
        return;
      }

      // If image integrity check or dimension validation is required
      if (checkImageIntegrity || options.maxDimensions || options.minDimensions) {
        const img = new Image();
        
        // Set a timeout for image loading
        const timeout = setTimeout(() => {
          URL.revokeObjectURL(img.src);
          reject(new Error('Image validation timeout - file may be corrupted'));
        }, 10000); // 10 second timeout

        img.onload = () => {
          clearTimeout(timeout);
          
          try {
            // Check dimensions if specified
            if (options.maxDimensions) {
              if (img.width > options.maxDimensions.width || img.height > options.maxDimensions.height) {
                reject(new Error(`Image dimensions ${img.width}x${img.height} exceed maximum ${options.maxDimensions.width}x${options.maxDimensions.height}`));
                return;
              }
            }

            if (options.minDimensions) {
              if (img.width < options.minDimensions.width || img.height < options.minDimensions.height) {
                reject(new Error(`Image dimensions ${img.width}x${img.height} below minimum ${options.minDimensions.width}x${options.minDimensions.height}`));
                return;
              }
            }

            // Check for reasonable dimensions (not 0 or negative)
            if (img.width <= 0 || img.height <= 0) {
              reject(new Error('Invalid image dimensions'));
              return;
            }

            // Check for extremely large dimensions that might cause memory issues
            const maxPixels = 50 * 1024 * 1024; // 50 megapixels
            if (img.width * img.height > maxPixels) {
              reject(new Error(`Image has too many pixels (${img.width}x${img.height}). Maximum ${maxPixels} pixels allowed.`));
              return;
            }

            resolve(true);
          } finally {
            URL.revokeObjectURL(img.src);
          }
        };

        img.onerror = () => {
          clearTimeout(timeout);
          URL.revokeObjectURL(img.src);
          reject(new Error('Invalid or corrupted image file'));
        };

        img.src = URL.createObjectURL(file);
      } else {
        resolve(true);
      }
    });
  }

  /**
   * Batch validate multiple files
   */
  static async validateFiles(
    files: File[],
    options: Parameters<typeof StorageService.validateFile>[1] = {},
    onProgress?: (completed: number, total: number, currentFile: string) => void
  ): Promise<{ valid: File[]; invalid: Array<{ file: File; error: string }> }> {
    const valid: File[] = [];
    const invalid: Array<{ file: File; error: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      onProgress?.(i, files.length, file.name);

      try {
        await this.validateFile(file, options);
        valid.push(file);
      } catch (error) {
        invalid.push({
          file,
          error: error instanceof Error ? error.message : 'Validation failed'
        });
      }
    }

    onProgress?.(files.length, files.length, '');
    return { valid, invalid };
  }
}