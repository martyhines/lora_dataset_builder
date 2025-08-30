import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useIntersectionObserver } from '../useIntersectionObserver';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  mockIntersectionObserver.mockImplementation((callback) => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    callback
  }));
  
  global.IntersectionObserver = mockIntersectionObserver;
  vi.clearAllMocks();
});

describe('useIntersectionObserver', () => {
  it('should initialize with default options', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.targetRef.current).toBe(null);
    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );
  });

  it('should accept custom options', () => {
    const options = {
      threshold: 0.5,
      rootMargin: '100px',
      triggerOnce: false
    };

    renderHook(() => useIntersectionObserver(options));

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.5,
        rootMargin: '100px'
      }
    );
  });

  it('should observe element when ref is set', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    
    // Simulate setting a ref
    const mockElement = document.createElement('div');
    Object.defineProperty(result.current.targetRef, 'current', {
      value: mockElement,
      writable: true
    });

    // Trigger the effect by re-rendering
    const { rerender } = renderHook(() => useIntersectionObserver());
    rerender();

    expect(mockObserve).toHaveBeenCalledWith(mockElement);
  });

  it('should handle intersection changes', () => {
    let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;
    
    mockIntersectionObserver.mockImplementation((callback) => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect
      };
    });

    const { result } = renderHook(() => useIntersectionObserver());

    // Simulate intersection
    const mockEntry = {
      isIntersecting: true,
      target: document.createElement('div')
    } as IntersectionObserverEntry;

    intersectionCallback!([mockEntry]);

    expect(result.current.isIntersecting).toBe(true);
  });

  it('should trigger only once when triggerOnce is true', () => {
    let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;
    
    mockIntersectionObserver.mockImplementation((callback) => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect
      };
    });

    const { result } = renderHook(() => useIntersectionObserver({ triggerOnce: true }));

    // First intersection
    const mockEntry = {
      isIntersecting: true,
      target: document.createElement('div')
    } as IntersectionObserverEntry;

    intersectionCallback!([mockEntry]);
    expect(result.current.isIntersecting).toBe(true);

    // Second intersection (should be ignored)
    const mockEntry2 = {
      isIntersecting: false,
      target: document.createElement('div')
    } as IntersectionObserverEntry;

    intersectionCallback!([mockEntry2]);
    expect(result.current.isIntersecting).toBe(true); // Should remain true
  });

  it('should allow multiple triggers when triggerOnce is false', () => {
    let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;
    
    mockIntersectionObserver.mockImplementation((callback) => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect
      };
    });

    const { result } = renderHook(() => useIntersectionObserver({ triggerOnce: false }));

    // First intersection
    const mockEntry1 = {
      isIntersecting: true,
      target: document.createElement('div')
    } as IntersectionObserverEntry;

    intersectionCallback!([mockEntry1]);
    expect(result.current.isIntersecting).toBe(true);

    // Second intersection
    const mockEntry2 = {
      isIntersecting: false,
      target: document.createElement('div')
    } as IntersectionObserverEntry;

    intersectionCallback!([mockEntry2]);
    expect(result.current.isIntersecting).toBe(false);
  });

  it('should cleanup observer on unmount', () => {
    const { unmount } = renderHook(() => useIntersectionObserver());

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});