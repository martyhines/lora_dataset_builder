import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast, useErrorToast } from '../useToast';

// Test component that uses toast hooks
function ToastTester() {
  const { showSuccess, showError, showWarning, showInfo, clearAllToasts } = useToast();
  const { showNetworkError, showUploadError, showPartialFailure } = useErrorToast();

  return (
    <div>
      <button onClick={() => showSuccess('Success!', 'Operation completed')}>
        Show Success
      </button>
      <button onClick={() => showError('Error!', 'Something went wrong')}>
        Show Error
      </button>
      <button onClick={() => showWarning('Warning!', 'Be careful')}>
        Show Warning
      </button>
      <button onClick={() => showInfo('Info!', 'Just so you know')}>
        Show Info
      </button>
      <button onClick={() => showNetworkError(new Error('Network failed'))}>
        Show Network Error
      </button>
      <button onClick={() => showUploadError('test.jpg', new Error('Upload failed'))}>
        Show Upload Error
      </button>
      <button onClick={() => showPartialFailure(5, 2)}>
        Show Partial Failure
      </button>
      <button onClick={clearAllToasts}>
        Clear All
      </button>
    </div>
  );
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show success toast', () => {
    render(
      <TestWrapper>
        <ToastTester />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Success'));

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('should show error toast that persists', () => {
    render(
      <TestWrapper>
        <ToastTester />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Error'));

    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Error toasts should persist (not auto-dismiss)
    vi.advanceTimersByTime(10000);
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  it('should show warning toast', () => {
    render(
      <TestWrapper>
        <ToastTester />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Warning'));

    expect(screen.getByText('Warning!')).toBeInTheDocument();
    expect(screen.getByText('Be careful')).toBeInTheDocument();
  });

  it('should show info toast', () => {
    render(
      <TestWrapper>
        <ToastTester />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Info'));

    expect(screen.getByText('Info!')).toBeInTheDocument();
    expect(screen.getByText('Just so you know')).toBeInTheDocument();
  });

  it('should auto-dismiss non-error toasts after timeout', async () => {
    render(
      <TestWrapper>
        <ToastTester />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success!')).toBeInTheDocument();

    // Fast-forward time to trigger auto-dismiss
    vi.advanceTimersByTime(5000);
    
    // Run all pending timers
    vi.runAllTimers();

    await waitFor(() => {
      expect(screen.queryByText('Success!')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should allow manual dismissal of toasts', async () => {
    render(
      <TestWrapper>
        <ToastTester />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByText('Error!')).toBeInTheDocument();

    const dismissButton = screen.getByLabelText('Dismiss notification');
    fireEvent.click(dismissButton);

    // Fast-forward through the exit animation
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.queryByText('Error!')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should clear all toasts', async () => {
    render(
      <TestWrapper>
        <ToastTester />
      </TestWrapper>
    );

    // Show multiple toasts
    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));
    fireEvent.click(screen.getByText('Show Warning'));

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByText('Warning!')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Clear All'));

    // Fast-forward through any exit animations
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.queryByText('Success!')).not.toBeInTheDocument();
      expect(screen.queryByText('Error!')).not.toBeInTheDocument();
      expect(screen.queryByText('Warning!')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should stack multiple toasts', () => {
    render(
      <TestWrapper>
        <ToastTester />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Warning'));
    fireEvent.click(screen.getByText('Show Info'));

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Warning!')).toBeInTheDocument();
    expect(screen.getByText('Info!')).toBeInTheDocument();
  });
});

describe('useErrorToast', () => {
  it('should show network error with retry action', () => {
    const retryFn = vi.fn();
    
    function NetworkErrorTest() {
      const { showNetworkError } = useErrorToast();
      
      return (
        <button onClick={() => showNetworkError(new Error('Connection failed'), retryFn)}>
          Show Network Error
        </button>
      );
    }

    render(
      <TestWrapper>
        <NetworkErrorTest />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Network Error'));

    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText(/Connection failed/)).toBeInTheDocument();
    
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);
    
    expect(retryFn).toHaveBeenCalled();
  });

  it('should show upload error with filename', () => {
    render(
      <TestWrapper>
        <ToastTester />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Upload Error'));

    expect(screen.getByText('Upload Failed')).toBeInTheDocument();
    expect(screen.getByText(/Failed to upload "test.jpg"/)).toBeInTheDocument();
  });

  it('should show partial failure warning', () => {
    render(
      <TestWrapper>
        <ToastTester />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Show Partial Failure'));

    expect(screen.getByText('Partial Success')).toBeInTheDocument();
    expect(screen.getByText(/5 items completed successfully, 2 failed/)).toBeInTheDocument();
  });

  it('should throw error when used outside ToastProvider', () => {
    function InvalidUsage() {
      useToast();
      return null;
    }

    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => render(<InvalidUsage />)).toThrow('useToast must be used within a ToastProvider');

    console.error = originalError;
  });
});