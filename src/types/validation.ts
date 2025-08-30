// Validation functions for data models

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

interface ProviderConfig {
  id: string;
  endpoint: string;
  enabled: boolean;
  timeout: number;
}

interface CaptionResult {
  modelId: string;
  caption: string;
  latency: number;
  tokensUsed?: number;
  error?: string;
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
 * Validates a CaptionCandidate object
 */
export function validateCaptionCandidate(candidate: unknown): candidate is CaptionCandidate {
  if (typeof candidate !== 'object' || candidate === null) {
    return false;
  }
  
  const c = candidate as Record<string, unknown>;
  
  return (
    typeof c.modelId === 'string' &&
    c.modelId.length > 0 &&
    typeof c.caption === 'string' &&
    typeof c.createdAt === 'number' &&
    c.createdAt > 0 &&
    (c.latencyMs === undefined || typeof c.latencyMs === 'number') &&
    (c.tokensUsed === undefined || typeof c.tokensUsed === 'number') &&
    (c.error === undefined || typeof c.error === 'string')
  );
}

/**
 * Validates an ImageDoc object
 */
export function validateImageDoc(image: unknown): image is ImageDoc {
  const validStatuses = ['pending', 'processing', 'complete', 'error'] as const;
  
  if (typeof image !== 'object' || image === null) return false;
  
  const img = image as Record<string, unknown>;
  
  return (
    typeof img.id === 'string' &&
    img.id.length > 0 &&
    typeof img.filename === 'string' &&
    img.filename.length > 0 &&
    typeof img.storagePath === 'string' &&
    img.storagePath.length > 0 &&
    typeof img.downloadURL === 'string' &&
    img.downloadURL.length > 0 &&
    (img.base64 === undefined || typeof img.base64 === 'string') &&
    typeof img.status === 'string' &&
    validStatuses.includes(img.status as any) &&
    (img.error === undefined || typeof img.error === 'string') &&
    Array.isArray(img.candidates) &&
    img.candidates.every(validateCaptionCandidate) &&
    (img.selectedIndex === null || (typeof img.selectedIndex === 'number' && img.selectedIndex >= 0)) &&
    (img.selectedTextOverride === undefined || typeof img.selectedTextOverride === 'string') &&
    typeof img.createdAt === 'number' &&
    img.createdAt > 0 &&
    typeof img.updatedAt === 'number' &&
    img.updatedAt > 0
  );
}

/**
 * Validates a UserSettings object
 */
export function validateUserSettings(settings: unknown): settings is UserSettings {
  if (typeof settings !== 'object' || settings === null) {
    return false;
  }
  
  const s = settings as Record<string, unknown>;
  
  return (
    typeof s.showDlButton === 'boolean' &&
    (s.preferences === undefined || (
      typeof s.preferences === 'object' &&
      s.preferences !== null &&
      (() => {
        const prefs = s.preferences as Record<string, unknown>;
        return (
          (prefs.defaultProviders === undefined || 
            (Array.isArray(prefs.defaultProviders) && 
             prefs.defaultProviders.every((p: unknown) => typeof p === 'string'))) &&
          (prefs.autoRegenerate === undefined || 
            typeof prefs.autoRegenerate === 'boolean')
        );
      })()
    ))
  );
}

/**
 * Validates a ProviderConfig object
 */
export function validateProviderConfig(config: unknown): config is ProviderConfig {
  if (typeof config !== 'object' || config === null) {
    return false;
  }
  
  const c = config as Record<string, unknown>;
  
  return (
    typeof c.id === 'string' &&
    c.id.length > 0 &&
    typeof c.endpoint === 'string' &&
    c.endpoint.length > 0 &&
    typeof c.enabled === 'boolean' &&
    typeof c.timeout === 'number' &&
    c.timeout > 0
  );
}

/**
 * Validates a CaptionResult object
 */
export function validateCaptionResult(result: unknown): result is CaptionResult {
  if (typeof result !== 'object' || result === null) {
    return false;
  }
  
  const r = result as Record<string, unknown>;
  
  return (
    typeof r.modelId === 'string' &&
    r.modelId.length > 0 &&
    typeof r.caption === 'string' &&
    typeof r.latency === 'number' &&
    r.latency >= 0 &&
    (r.tokensUsed === undefined || typeof r.tokensUsed === 'number') &&
    (r.error === undefined || typeof r.error === 'string')
  );
}

/**
 * Validates a DatasetEntry object
 */
export function validateDatasetEntry(entry: unknown): entry is DatasetEntry {
  if (typeof entry !== 'object' || entry === null) {
    return false;
  }
  
  const e = entry as Record<string, unknown>;
  
  return (
    typeof e.url === 'string' &&
    e.url.length > 0 &&
    typeof e.filename === 'string' &&
    e.filename.length > 0 &&
    typeof e.caption === 'string' &&
    e.caption.length > 0
  );
}

/**
 * Validates an UploadProgress object
 */
export function validateUploadProgress(progress: unknown): progress is UploadProgress {
  if (typeof progress !== 'object' || progress === null) {
    return false;
  }
  
  const p = progress as Record<string, unknown>;
  
  return (
    typeof p.total === 'number' &&
    p.total >= 0 &&
    typeof p.completed === 'number' &&
    p.completed >= 0 &&
    typeof p.failed === 'number' &&
    p.failed >= 0 &&
    typeof p.inProgress === 'number' &&
    p.inProgress >= 0 &&
    p.completed + p.failed + p.inProgress <= p.total
  );
}

/**
 * Validates file types for image uploads
 */
export function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  return (
    allowedTypes.includes(file.type) &&
    file.size <= maxSize &&
    file.size > 0
  );
}

/**
 * Validates image URL format
 */
export function validateImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}