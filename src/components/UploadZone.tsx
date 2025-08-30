import React, { useCallback, useState, useRef } from 'react';
import { validateImageFile } from '../types/validation';
import { formatFileSize } from '../types/utils';
import { generateId, announceToScreenReader, handleKeyboardActivation, KeyboardKeys } from '../utils/accessibility';

export interface UploadZoneProps {
  onFilesSelected: (files: FileList) => void;
  isUploading: boolean;
  progress?: {
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
  };
  disabled?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  className?: string;
}

export function UploadZone({
  onFilesSelected,
  isUploading,
  progress,
  disabled = false,
  maxFiles = 100,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  className = ''
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneId = useRef(generateId('upload-zone'));
  const progressId = useRef(generateId('upload-progress'));
  const errorsId = useRef(generateId('upload-errors'));

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Validate files before processing
  const validateFiles = useCallback((files: FileList): { valid: File[]; errors: string[] } => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Check total number of files
    if (files.length > maxFiles) {
      errors.push(`Too many files selected. Maximum ${maxFiles} files allowed.`);
      return { valid: [], errors };
    }

    Array.from(files).forEach((file, index) => {
      // Check if it's an image file
      if (!validateImageFile(file)) {
        if (file.size > maxFileSize) {
          errors.push(`${file.name}: File size ${formatFileSize(file.size)} exceeds maximum ${formatFileSize(maxFileSize)}`);
        } else if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          errors.push(`${file.name}: Unsupported file type. Please use JPEG, PNG, WebP, or GIF.`);
        } else {
          errors.push(`${file.name}: Invalid image file`);
        }
      } else {
        validFiles.push(file);
      }
    });

    return { valid: validFiles, errors };
  }, [maxFiles, maxFileSize]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const { valid, errors } = validateFiles(files);
    setValidationErrors(errors);

    if (valid.length > 0) {
      // Create a new FileList with only valid files
      // Use DataTransfer if available, otherwise pass the array directly
      if (typeof DataTransfer !== 'undefined') {
        const dt = new DataTransfer();
        valid.forEach(file => dt.items.add(file));
        onFilesSelected(dt.files);
      } else {
        // Fallback for test environments - cast array to FileList
        onFilesSelected(valid as unknown as FileList);
      }
      
      // Announce successful upload to screen readers
      announceToScreenReader(`${valid.length} image${valid.length !== 1 ? 's' : ''} selected for upload`);
    }
    
    // Announce validation errors
    if (errors.length > 0) {
      announceToScreenReader(`${errors.length} file${errors.length !== 1 ? 's' : ''} could not be uploaded due to validation errors`, 'assertive');
    }
  }, [disabled, isUploading, validateFiles, onFilesSelected]);

  // Handle click to select files
  const handleClick = useCallback(() => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  }, [disabled, isUploading]);

  // Handle keyboard activation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    handleKeyboardActivation(e, handleClick);
  }, [handleClick]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const { valid, errors } = validateFiles(files);
    setValidationErrors(errors);

    if (valid.length > 0) {
      // Create a new FileList with only valid files
      // Use DataTransfer if available, otherwise pass the array directly
      if (typeof DataTransfer !== 'undefined') {
        const dt = new DataTransfer();
        valid.forEach(file => dt.items.add(file));
        onFilesSelected(dt.files);
      } else {
        // Fallback for test environments - cast array to FileList
        onFilesSelected(valid as unknown as FileList);
      }
      
      // Announce successful selection to screen readers
      announceToScreenReader(`${valid.length} image${valid.length !== 1 ? 's' : ''} selected for upload`);
    }
    
    // Announce validation errors
    if (errors.length > 0) {
      announceToScreenReader(`${errors.length} file${errors.length !== 1 ? 's' : ''} could not be uploaded due to validation errors`, 'assertive');
    }

    // Reset the input value so the same files can be selected again
    e.target.value = '';
  }, [validateFiles, onFilesSelected]);

  // Calculate progress percentage
  const progressPercentage = progress && progress.total > 0 
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  // Clear validation errors when not dragging
  React.useEffect(() => {
    if (!isDragOver && validationErrors.length > 0) {
      const timer = setTimeout(() => setValidationErrors([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [isDragOver, validationErrors.length]);

  return (
    <div className={`upload-zone ${className} flex justify-center`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="sr-only"
        disabled={disabled || isUploading}
        aria-describedby={`${dropZoneId.current}-description`}
      />

      {/* Main drop zone */}
      <div
        id={dropZoneId.current}
        role="button"
        tabIndex={disabled || isUploading ? -1 : 0}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={isUploading ? 'Upload in progress' : 'Upload images by clicking or dragging files here'}
        aria-describedby={`${dropZoneId.current}-description ${validationErrors.length > 0 ? errorsId.current : ''} ${progress ? progressId.current : ''}`}
        aria-disabled={disabled || isUploading}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer w-full max-w-lg
          transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-900
          backdrop-blur-sm shadow-lg hover:shadow-xl
          ${isDragOver 
            ? 'border-blue-400 bg-gradient-to-br from-blue-500/10 to-blue-600/20 shadow-blue-500/25' 
            : 'border-gray-400/50 hover:border-blue-400/70 bg-gradient-to-br from-gray-800/50 to-gray-700/50 hover:from-gray-700/50 hover:to-gray-600/50'
          }
          ${disabled || isUploading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:scale-[1.01] hover:shadow-xl'
          }
          ${validationErrors.length > 0 ? 'border-red-400 bg-gradient-to-br from-red-500/10 to-red-600/20 shadow-red-500/25' : ''}
        `}
      >
        {/* Upload icon and text */}
        <div className="space-y-4">
          {/* Icon */}
          <div className="mx-auto w-12 h-12 text-gray-300">
            {isUploading ? (
              <svg className="animate-spin w-full h-full" fill="none" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                />
              </svg>
            )}
          </div>

          {/* Text content */}
          <div>
            {isUploading ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-100">
                  Uploading images...
                </p>
                {progress && (
                  <div className="space-y-1">
                    <div className="flex justify-center space-x-4 text-sm text-gray-300">
                      <span className="font-medium">{progress.completed} completed</span>
                      <span className="font-medium">{progress.inProgress} in progress</span>
                      {progress.failed > 0 && (
                        <span className="text-red-400 font-semibold">
                          {progress.failed} failed
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-3 backdrop-blur-sm">
                      <div 
                        id={progressId.current}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                        style={{ width: `${progressPercentage}%` }}
                        role="progressbar"
                        aria-valuenow={progressPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Upload progress: ${progressPercentage}%`}
                        aria-describedby={`${dropZoneId.current}-progress-text`}
                      />
                    </div>
                    <p id={`${dropZoneId.current}-progress-text`} className="text-sm text-gray-300 font-medium">
                      {progressPercentage}% complete
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-100">
                  {isDragOver ? 'Drop images here' : 'Upload images'}
                </p>
                <p id={`${dropZoneId.current}-description`} className="text-sm text-gray-300">
                  Drag and drop images here, or click to select files
                </p>
                <p className="text-xs text-gray-400">
                  Supports JPEG, PNG, WebP, GIF • Max {formatFileSize(maxFileSize)} per file • Up to {maxFiles} files
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div 
            id={errorsId.current}
            role="alert"
            aria-live="assertive"
            className="mt-6 p-4 bg-gradient-to-r from-red-500/10 to-red-600/20 border border-red-400/50 rounded-xl backdrop-blur-sm shadow-lg"
          >
            <div className="text-sm text-red-200">
              <p className="font-semibold mb-2 text-red-100">Some files could not be uploaded:</p>
              <ul className="list-disc list-inside space-y-1.5 text-red-300">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}