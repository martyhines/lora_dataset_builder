// Utility functions for data transformation and sanitization

// Note: We define the types inline here to avoid circular imports
// These should match the interfaces in index.ts

interface CaptionCandidate {
  modelId: string;
  caption: string;
  createdAt: number;
  latencyMs?: number;
  tokensUsed?: number;
  error?: string;
}

interface ImageDoc {
  id: string;
  filename: string;
  storagePath: string;
  downloadURL: string;
  base64?: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  error?: string;
  candidates: CaptionCandidate[];
  selectedIndex: number | null;
  selectedTextOverride?: string;
  createdAt: number;
  updatedAt: number;
}

interface UserSettings {
  showDlButton: boolean;
  preferences?: {
    defaultProviders: string[];
    autoRegenerate: boolean;
  };
}

interface DatasetEntry {
  url: string;
  filename: string;
  caption: string;
}

interface UploadProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
}

/**
 * Creates a new ImageDoc with default values
 */
export function createImageDoc(
  id: string,
  filename: string,
  storagePath: string,
  downloadURL: string
): ImageDoc {
  const now = Date.now();
  
  return {
    id: sanitizeId(id),
    filename: sanitizeFilename(filename),
    storagePath: sanitizePath(storagePath),
    downloadURL: sanitizeUrl(downloadURL),
    status: 'pending',
    candidates: [],
    selectedIndex: null,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Creates a new CaptionCandidate
 */
export function createCaptionCandidate(
  modelId: string,
  caption: string,
  latencyMs?: number,
  tokensUsed?: number,
  error?: string
): CaptionCandidate {
  return {
    modelId: sanitizeModelId(modelId),
    caption: sanitizeCaption(caption),
    createdAt: Date.now(),
    ...(latencyMs !== undefined && { latencyMs }),
    ...(tokensUsed !== undefined && { tokensUsed }),
    ...(error && { error: sanitizeErrorMessage(error) })
  };
}

/**
 * Creates default UserSettings
 */
export function createDefaultUserSettings(): UserSettings {
  return {
    showDlButton: false,
    preferences: {
      defaultProviders: [],
      autoRegenerate: true
    }
  };
}

/**
 * Updates an ImageDoc with new data, preserving existing fields
 */
export function updateImageDoc(
  existing: ImageDoc, 
  updates: Partial<ImageDoc>
): ImageDoc {
  return {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
    // Ensure critical fields are properly sanitized if updated
    ...(updates.filename && { filename: sanitizeFilename(updates.filename) }),
    ...(updates.downloadURL && { downloadURL: sanitizeUrl(updates.downloadURL) }),
    ...(updates.selectedTextOverride && { 
      selectedTextOverride: sanitizeCaption(updates.selectedTextOverride) 
    })
  };
}

/**
 * Converts ImageDoc array to DatasetEntry array for export
 */
export function imagesToDatasetEntries(images: ImageDoc[]): DatasetEntry[] {
  return images
    .filter(image => image.status === 'complete' && hasSelectedCaption(image))
    .map(image => ({
      url: image.downloadURL,
      filename: image.filename,
      caption: getSelectedCaption(image)
    }));
}

/**
 * Gets the selected caption for an image (override or selected candidate)
 */
export function getSelectedCaption(image: ImageDoc): string {
  if (image.selectedTextOverride) {
    return image.selectedTextOverride;
  }
  
  if (image.selectedIndex !== null && image.candidates[image.selectedIndex]) {
    return image.candidates[image.selectedIndex].caption;
  }
  
  return '';
}

/**
 * Checks if an image has a selected caption
 */
export function hasSelectedCaption(image: ImageDoc): boolean {
  return getSelectedCaption(image).length > 0;
}

/**
 * Calculates upload progress from image array
 */
export function calculateUploadProgress(images: ImageDoc[]): UploadProgress {
  const total = images.length;
  const completed = images.filter(img => img.status === 'complete').length;
  const failed = images.filter(img => img.status === 'error').length;
  const inProgress = images.filter(img => 
    img.status === 'pending' || img.status === 'processing'
  ).length;
  
  return { total, completed, failed, inProgress };
}

/**
 * Sanitizes an ID string
 */
export function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 128);
}

/**
 * Sanitizes a filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and limit length
  return filename
    .replace(/[/\\]/g, '')
    .replace(/[<>:"|?*]/g, '_')
    .substring(0, 255);
}

/**
 * Sanitizes a storage path
 */
export function sanitizePath(path: string): string {
  // Basic path sanitization - remove dangerous characters
  return path.replace(/[<>:"|?*]/g, '_');
}

/**
 * Sanitizes a URL string
 */
export function sanitizeUrl(url: string): string {
  try {
    // Validate and normalize URL
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    // If invalid URL, return empty string
    return '';
  }
}

/**
 * Sanitizes a model ID
 */
export function sanitizeModelId(modelId: string): string {
  return modelId.replace(/[^a-zA-Z0-9:._-]/g, '').substring(0, 64);
}

/**
 * Sanitizes caption text
 */
export function sanitizeCaption(caption: string): string {
  // Remove control characters and limit length
  return caption
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .substring(0, 2000);
}

/**
 * Sanitizes error messages
 */
export function sanitizeErrorMessage(error: string): string {
  return error
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .substring(0, 500);
}

/**
 * Generates a unique filename with timestamp
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const extension = originalFilename.split('.').pop() || '';
  const baseName = originalFilename.replace(/\.[^/.]+$/, '');
  
  return `${sanitizeFilename(baseName)}_${timestamp}.${extension}`;
}

/**
 * Extracts file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

/**
 * Checks if a file extension is supported for images
 */
export function isSupportedImageExtension(extension: string): boolean {
  const supportedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  return supportedExtensions.includes(extension.toLowerCase());
}

/**
 * Formats file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats timestamp to human readable date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Deep clones an object (for immutable updates)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}