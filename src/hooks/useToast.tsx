import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer } from '../components/Toast';
import type { Toast, ToastType } from '../components/Toast';

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  // Convenience methods
  showSuccess: (title: string, message?: string, options?: Partial<Toast>) => string;
  showError: (title: string, message?: string, options?: Partial<Toast>) => string;
  showWarning: (title: string, message?: string, options?: Partial<Toast>) => string;
  showInfo: (title: string, message?: string, options?: Partial<Toast>) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return showToast({ type: 'success', title, message, ...options });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return showToast({ 
      type: 'error', 
      title, 
      message, 
      duration: 0, // Errors persist by default
      persistent: true,
      ...options 
    });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return showToast({ type: 'warning', title, message, ...options });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return showToast({ type: 'info', title, message, ...options });
  }, [showToast]);

  const value: ToastContextType = {
    showToast,
    dismissToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Error-specific toast utilities
export function useErrorToast() {
  const { showError, showWarning } = useToast();

  const showNetworkError = useCallback((error: Error, retryAction?: () => void) => {
    return showError(
      'Network Error',
      error.message || 'Unable to connect to the server. Please check your internet connection.',
      {
        action: retryAction ? {
          label: 'Retry',
          onClick: retryAction
        } : undefined
      }
    );
  }, [showError]);

  const showUploadError = useCallback((filename: string, error: Error, retryAction?: () => void) => {
    return showError(
      'Upload Failed',
      `Failed to upload "${filename}": ${error.message}`,
      {
        action: retryAction ? {
          label: 'Retry Upload',
          onClick: retryAction
        } : undefined
      }
    );
  }, [showError]);

  const showCaptionError = useCallback((error: Error, retryAction?: () => void) => {
    return showError(
      'Caption Generation Failed',
      error.message || 'Unable to generate captions for your images.',
      {
        action: retryAction ? {
          label: 'Retry Generation',
          onClick: retryAction
        } : undefined
      }
    );
  }, [showError]);

  const showDeleteError = useCallback((error: Error, retryAction?: () => void) => {
    return showError(
      'Delete Failed',
      error.message || 'Unable to delete the selected items.',
      {
        action: retryAction ? {
          label: 'Retry Delete',
          onClick: retryAction
        } : undefined
      }
    );
  }, [showError]);

  const showExportError = useCallback((error: Error, retryAction?: () => void) => {
    return showError(
      'Export Failed',
      error.message || 'Unable to export your dataset.',
      {
        action: retryAction ? {
          label: 'Retry Export',
          onClick: retryAction
        } : undefined
      }
    );
  }, [showError]);

  const showAuthError = useCallback((error: Error, retryAction?: () => void) => {
    return showError(
      'Authentication Error',
      error.message || 'Unable to authenticate. Please try again.',
      {
        action: retryAction ? {
          label: 'Retry Authentication',
          onClick: retryAction
        } : undefined
      }
    );
  }, [showError]);

  const showPartialFailure = useCallback((successCount: number, failureCount: number, retryAction?: () => void) => {
    return showWarning(
      'Partial Success',
      `${successCount} items completed successfully, ${failureCount} failed.`,
      {
        action: retryAction ? {
          label: 'Retry Failed Items',
          onClick: retryAction
        } : undefined
      }
    );
  }, [showWarning]);

  return {
    showNetworkError,
    showUploadError,
    showCaptionError,
    showDeleteError,
    showExportError,
    showAuthError,
    showPartialFailure,
  };
}