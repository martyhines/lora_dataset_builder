import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GlobalErrorBoundary, useErrorBoundary } from '../GlobalErrorBoundary';

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Test component that throws an error
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
}

// Test component that uses the error boundary hook
function ErrorTrigger() {
  const throwError = useErrorBoundary();
  
  return (
    <button onClick={() => throwError(new Error('Hook triggered error'))}>
      Trigger Error
    </button>
  );
}

describe('GlobalErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <GlobalErrorBoundary>
        <div>Test content</div>
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render error UI when an error occurs', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('Unexpected Error')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    expect(screen.getByText(/Try Again/)).toBeInTheDocument();
  });

  it('should display error ID for support', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('Error ID:')).toBeInTheDocument();
    expect(screen.getByText(/error-\d+-\w+/)).toBeInTheDocument();
  });

  it('should show technical details when expanded', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    const detailsButton = screen.getByText('Technical Details');
    fireEvent.click(detailsButton);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should handle retry functionality', () => {
    let shouldThrow = true;
    
    function DynamicThrowError() {
      if (shouldThrow) {
        throw new Error('Test error message');
      }
      return <div>No error</div>;
    }

    const { rerender } = render(
      <GlobalErrorBoundary>
        <DynamicThrowError />
      </GlobalErrorBoundary>
    );

    const retryButton = screen.getByText(/Try Again/);
    
    // Change the error condition before retry
    shouldThrow = false;
    fireEvent.click(retryButton);

    // After retry, should show no error
    rerender(
      <GlobalErrorBoundary>
        <DynamicThrowError />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should show reload button after max retries', () => {
    const { rerender } = render(
      <GlobalErrorBoundary>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    // Click retry button multiple times to exceed max retries
    for (let i = 0; i < 3; i++) {
      const retryButton = screen.getByText(/Try Again/);
      fireEvent.click(retryButton);
      
      rerender(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );
    }

    expect(screen.getByText('Reload Application')).toBeInTheDocument();
  });

  it('should handle different error types with appropriate messages', () => {
    function ChunkLoadError() {
      const error = new Error('Loading chunk failed');
      error.name = 'ChunkLoadError';
      throw error;
    }

    render(
      <GlobalErrorBoundary>
        <ChunkLoadError />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('Application Update Required')).toBeInTheDocument();
    expect(screen.getByText(/new version of the application/)).toBeInTheDocument();
  });

  it('should call custom error handler when provided', () => {
    const onError = vi.fn();

    render(
      <GlobalErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error UI</div>;

    render(
      <GlobalErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });
});

describe('useErrorBoundary', () => {
  it('should trigger error boundary when called', () => {
    render(
      <GlobalErrorBoundary>
        <ErrorTrigger />
      </GlobalErrorBoundary>
    );

    const triggerButton = screen.getByText('Trigger Error');
    fireEvent.click(triggerButton);

    expect(screen.getByText('Unexpected Error')).toBeInTheDocument();
    // Use getAllByText to handle multiple occurrences
    const errorMessages = screen.getAllByText(/Hook triggered error/);
    expect(errorMessages.length).toBeGreaterThan(0);
  });
});