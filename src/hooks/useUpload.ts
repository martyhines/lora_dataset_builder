import { useState, useCallback } from 'react';
import type { ImageDoc, UploadProgress } from '../types';
import { StorageService } from '../services/storageService';

import { ImageService } from '../services/imageService';
import { processImages } from '../utils/imageProcessing';
import type { ImageProcessingOptions, ProcessedImageResult } from '../utils/imageProcessing';
import { useUploadPerformanceMonitoring } from './usePerformanceMonitoring';
import { useCaptionGeneration } from './useCaptionGeneration';
import { useAuth } from './useAuth';

/**
 * Upload state for individual files
 */
interface FileUploadState {
  file: File;
  originalFile?: File; // Store original before processing
  status: 'pending' | 'validating' | 'processing' | 'uploading' | 'complete' | 'error';
  progress: number;
  error?: string;
  result?: ImageDoc;
  processingResult?: ProcessedImageResult;
}

/**
 * Upload configuration options
 */
export interface UploadOptions {
  enableImageProcessing?: boolean;
  imageProcessingOptions?: ImageProcessingOptions;
  concurrencyLimit?: number;
  validateFiles?: boolean;
  validationOptions?: Parameters<typeof StorageService.validateFile>[1];
}

/**
 * Hook for managing batch file uploads with preprocessing
 */
export function useUpload(options: UploadOptions = {}) {
  const { user } = useAuth();
  const [uploadStates, setUploadStates] = useState<Map<string, FileUploadState>>(new Map());
  const [isUploading, setIsUploading] = useState(false);

  // Performance monitoring
  const { startUpload, endUpload } = useUploadPerformanceMonitoring();
  
  // Caption generation
  const { generateCaption } = useCaptionGeneration();

  const {
    enableImageProcessing = true,
    imageProcessingOptions = {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 0.85,
      format: 'jpeg'
    },
    concurrencyLimit = 3,
    validateFiles = true,
    validationOptions = {}
  } = options;

  // Get overall upload progress
  const getOverallProgress = useCallback((): UploadProgress => {
    const states = Array.from(uploadStates.values());
    const total = states.length;
    const completed = states.filter(s => s.status === 'complete').length;
    const failed = states.filter(s => s.status === 'error').length;
    const inProgress = states.filter(s => 
      s.status === 'validating' || 
      s.status === 'processing' || 
      s.status === 'uploading'
    ).length;

    return {
      total,
      completed,
      failed,
      inProgress
    };
  }, [uploadStates]);

  // Upload multiple files with validation and preprocessing
  const uploadFiles = useCallback(async (files: FileList | File[]): Promise<ImageDoc[]> => {

    const fileArray = Array.from(files);
    const results: ImageDoc[] = [];
    
    setIsUploading(true);

    // Initialize upload states
    const newStates = new Map<string, FileUploadState>();
    fileArray.forEach((file, index) => {
      const key = `${file.name}_${index}_${Date.now()}`;
      newStates.set(key, {
        file,
        originalFile: file,
        status: 'pending',
        progress: 0
      });
    });
    setUploadStates(newStates);

    try {
      // Step 1: Validate all files if enabled
      if (validateFiles) {
        for (const [key, state] of newStates.entries()) {
          try {
            setUploadStates(prev => new Map(prev.set(key, { ...state, status: 'validating' })));
            await StorageService.validateFile(state.file, validationOptions);
          } catch (error) {
            newStates.set(key, {
              ...state,
              status: 'error',
              error: error instanceof Error ? error.message : 'Validation failed'
            });
            setUploadStates(prev => new Map(prev));
          }
        }
      }

      // Step 2: Process images if enabled
      if (enableImageProcessing) {
        const validFiles = Array.from(newStates.entries())
          .filter(([, state]) => state.status !== 'error');

        if (validFiles.length > 0) {
          const filesToProcess = validFiles.map(([, state]) => state.file);
          
          try {
            const processedResults = await processImages(
              filesToProcess,
              imageProcessingOptions,
              (completed, total, currentFile) => {
                // Update processing progress for current file
                const currentEntry = validFiles.find(([, state]) => state.file.name === currentFile);
                if (currentEntry) {
                  const [key, state] = currentEntry;
                  setUploadStates(prev => new Map(prev.set(key, {
                    ...state,
                    status: 'processing',
                    progress: Math.round((completed / total) * 50) // Processing is 50% of total progress
                  })));
                }
              }
            );

            // Update states with processed files
            processedResults.forEach((result, index) => {
              const [key, state] = validFiles[index];
              newStates.set(key, {
                ...state,
                file: result.file,
                processingResult: result,
                status: 'pending' // Ready for upload
              });
            });
            setUploadStates(new Map(newStates));
          } catch (error) {
            console.warn('Image processing failed, using original files:', error);
            // Continue with original files if processing fails
          }
        }
      }

      // Step 3: Upload files with concurrency limit
      const uploadQueue = Array.from(newStates.entries())
        .filter(([, state]) => state.status === 'pending');
      
      for (let i = 0; i < uploadQueue.length; i += concurrencyLimit) {
        const batch = uploadQueue.slice(i, i + concurrencyLimit);
        
        await Promise.allSettled(
          batch.map(async ([key, state]) => {
            try {
              // Update status to uploading
              setUploadStates(prev => new Map(prev.set(key, { ...state, status: 'uploading' })));

              // Start performance monitoring
              const fileId = `${state.file.name}_${Date.now()}`;
              startUpload(fileId, state.file.size);



              // Upload file and create Firestore document
              const createdDoc = await ImageService.uploadImage(state.file, user!.uid);
              
              // Automatically trigger caption generation for the uploaded image
              console.log('🎯 Starting automatic caption generation for:', createdDoc.id);
              try {
                // Don't await this - let it run in background
                generateCaption(createdDoc.id).then((result) => {
                  if (result.success) {
                    console.log('✅ Caption generation completed for:', createdDoc.id);
                  } else {
                    console.warn('⚠️ Caption generation failed for:', createdDoc.id);
                  }
                }).catch((error) => {
                  console.error('❌ Caption generation error for:', createdDoc.id, error);
                });
              } catch (error) {
                console.error('❌ Failed to start caption generation:', error);
              }
              
              // Force a manual fetch to verify the document was created
              console.log('🔍 Upload complete, forcing manual fetch to verify...');
              try {
                const allImages = await ImageService.getImagesSimple();
                console.log('📊 Manual fetch found', allImages.length, 'images after upload');
                
                // Trigger a page refresh if the manual fetch shows images but the UI doesn't
                if (allImages.length > 0) {
                  console.log('✅ Upload verified, images exist in Firestore');
                  // Give the subscription a moment to update, then check if UI is still empty
                  setTimeout(() => {
                    const galleryElement = document.querySelector('[data-testid="gallery"]') || 
                                         document.querySelector('.gallery') ||
                                         document.body;
                    if (galleryElement && galleryElement.textContent?.includes('No images uploaded yet')) {
                      console.log('🔄 UI still shows empty, forcing page refresh...');
                      window.location.reload();
                    }
                  }, 2000);
                }
              } catch (fetchError) {
                console.error('❌ Manual fetch failed:', fetchError);
              }

              // Update progress to 90% while finalizing
              setUploadStates(prev => new Map(prev.set(key, {
                ...prev.get(key)!,
                progress: 90
              })));

              // Update final state
              setUploadStates(prev => new Map(prev.set(key, {
                ...prev.get(key)!,
                status: 'complete',
                progress: 100,
                result: createdDoc
              })));

              results.push(createdDoc);

              // End performance monitoring with success
              endUpload(fileId, true);

            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Upload failed';
              setUploadStates(prev => new Map(prev.set(key, {
                ...prev.get(key)!,
                status: 'error',
                error: errorMessage
              })));

              // End performance monitoring with failure
              const fileId = `${state.file.name}_${Date.now()}`;
              endUpload(fileId, false);
            }
          })
        );
      }

      return results;

    } finally {
      setIsUploading(false);
    }
  }, [enableImageProcessing, imageProcessingOptions, concurrencyLimit, validateFiles, validationOptions]);

  // Retry failed uploads
  const retryFailedUploads = useCallback(async (): Promise<void> => {
    const failedStates = Array.from(uploadStates.entries())
      .filter(([, state]) => state.status === 'error');

    if (failedStates.length === 0) return;

    const filesToRetry = failedStates.map(([, state]) => state.file);
    await uploadFiles(filesToRetry);
  }, [uploadStates, uploadFiles]);

  // Clear upload history
  const clearUploadHistory = useCallback(() => {
    setUploadStates(new Map());
  }, []);

  // Remove specific upload from history
  const removeUpload = useCallback((key: string) => {
    setUploadStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  return {
    uploadStates: Array.from(uploadStates.entries()),
    isUploading,
    overallProgress: getOverallProgress(),
    uploadFiles,
    retryFailedUploads,
    clearUploadHistory,
    removeUpload
  };
}