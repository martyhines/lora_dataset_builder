import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

/**
 * Global Error Boundary for the entire application
 * Requirements 9.1, 9.2, 9.3: Comprehensive error handling with fallback UI
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global Error Boundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to monitoring service (if configured)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to an error monitoring service
    // like Sentry, LogRocket, or Bugsnag
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId
    };

    console.error('Error Report:', errorReport);
    
    // Example: Send to monitoring service
    // errorMonitoringService.captureException(error, { extra: errorReport });
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        errorId: ''
      });
    } else {
      // Max retries reached, suggest page reload
      this.handleReload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReportBug = () => {
    const subject = encodeURIComponent(`Bug Report: ${this.state.error?.message || 'Application Error'}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Error Message: ${this.state.error?.message || 'Unknown error'}
Stack Trace: ${this.state.error?.stack || 'Not available'}
Component Stack: ${this.state.errorInfo?.componentStack || 'Not available'}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}

Please describe what you were doing when this error occurred:
[Your description here]
    `);
    
    // Open email client or redirect to bug report form
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  private getErrorType = (error: Error): string => {
    if (error.name === 'ChunkLoadError' || error.message.includes('ChunkLoadError')) return 'chunk-load';
    if (error.message.includes('Network') || error.message.includes('network')) return 'network';
    if (error.message.includes('Firebase') || error.message.includes('firebase')) return 'firebase';
    if (error.message.includes('Auth') || error.message.includes('auth')) return 'auth';
    return 'unknown';
  };

  private getErrorMessage = (error: Error): { title: string; description: string } => {
    const errorType = this.getErrorType(error);

    switch (errorType) {
      case 'chunk-load':
        return {
          title: 'Application Update Required',
          description: 'A new version of the application is available. Please refresh the page to continue.'
        };
      case 'network':
        return {
          title: 'Network Connection Error',
          description: 'Unable to connect to our servers. Please check your internet connection and try again.'
        };
      case 'firebase':
        return {
          title: 'Service Unavailable',
          description: 'Our backend services are temporarily unavailable. Please try again in a few moments.'
        };
      case 'auth':
        return {
          title: 'Authentication Error',
          description: 'There was a problem with authentication. Please refresh the page to sign in again.'
        };
      default:
        return {
          title: 'Unexpected Error',
          description: 'Something went wrong. Our team has been notified and is working on a fix.'
        };
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { title, description } = this.getErrorMessage(this.state.error);
      const canRetry = this.retryCount < this.maxRetries;
      const errorType = this.getErrorType(this.state.error);

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg border border-red-600 p-8 max-w-lg w-full text-center">
            {/* Error Icon */}
            <div className="text-red-500 mb-6">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
            
            {/* Error Description */}
            <p className="text-gray-300 mb-6">{description}</p>

            {/* Error ID for support */}
            <div className="bg-gray-700 rounded p-3 mb-6 text-sm">
              <div className="text-gray-400 mb-1">Error ID:</div>
              <div className="text-gray-200 font-mono">{this.state.errorId}</div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {canRetry ? (
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Try Again ({this.maxRetries - this.retryCount} attempts left)
                </button>
              ) : (
                <button
                  onClick={this.handleReload}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {errorType === 'chunk-load' ? 'Refresh Page' : 'Reload Application'}
                </button>
              )}

              <div className="flex gap-3">
                <button
                  onClick={this.handleReportBug}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Report Bug
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>

            {/* Technical Details (collapsible) */}
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-gray-400 hover:text-gray-300 text-sm">
                Technical Details
              </summary>
              <div className="mt-3 p-3 bg-gray-700 rounded text-xs font-mono text-gray-300 overflow-auto max-h-32">
                <div className="mb-2">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                {this.state.error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">{this.state.error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to manually trigger error boundary for testing
 * Should only be used in development
 */
export function useErrorBoundary() {
  const [, setState] = React.useState();
  
  return React.useCallback((error: Error) => {
    setState(() => {
      throw error;
    });
  }, []);
}