import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth, useUserId, useRequireAuth } from '../useAuth';
import { authService } from '../../services/auth';
import type { ReactNode } from 'react';

// Mock the auth service
vi.mock('../../services/auth', () => ({
  authService: {
    signInAnonymously: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    getCurrentUser: vi.fn(),
    getUserId: vi.fn(),
  }
}));

const mockAuthService = authService as any;

// Test wrapper component
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthService.getCurrentUser.mockReturnValue(null);
    mockAuthService.getUserId.mockReturnValue(null);
    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      callback(null);
      return () => {};
    });
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should handle successful authentication', async () => {
    const mockUser = { uid: 'test-uid', isAnonymous: true };
    mockAuthService.getCurrentUser.mockReturnValue(mockUser);
    mockAuthService.getUserId.mockReturnValue('test-uid');
    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      callback(mockUser);
      return () => {};
    });

    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle sign in anonymously', async () => {
    mockAuthService.signInAnonymously.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

    await act(async () => {
      await result.current.signInAnonymously();
    });

    expect(mockAuthService.signInAnonymously).toHaveBeenCalled();
  });

  it('should handle sign out', async () => {
    mockAuthService.signOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockAuthService.signOut).toHaveBeenCalled();
  });

  it('should handle authentication errors', async () => {
    const error = new Error('Auth failed');
    mockAuthService.signInAnonymously.mockRejectedValue(error);

    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

    await act(async () => {
      try {
        await result.current.signInAnonymously();
      } catch (e) {
        // Expected to throw
      }
    });

    expect(result.current.error).toEqual(error);
  });
});

describe('useUserId', () => {
  it('should return user ID when authenticated', () => {
    const mockUser = { uid: 'test-uid', isAnonymous: true };
    mockAuthService.getCurrentUser.mockReturnValue(mockUser);
    mockAuthService.getUserId.mockReturnValue('test-uid');
    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      callback(mockUser);
      return () => {};
    });

    const { result } = renderHook(() => useUserId(), { wrapper: TestWrapper });

    expect(result.current).toBe('test-uid');
  });

  it('should return null when not authenticated', () => {
    const { result } = renderHook(() => useUserId(), { wrapper: TestWrapper });

    expect(result.current).toBe(null);
  });
});

describe('useRequireAuth', () => {
  it('should return user when authenticated', () => {
    const mockUser = { uid: 'test-uid', isAnonymous: true };
    mockAuthService.getCurrentUser.mockReturnValue(mockUser);
    mockAuthService.getUserId.mockReturnValue('test-uid');
    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      callback(mockUser);
      return () => {};
    });

    const { result } = renderHook(() => useRequireAuth(), { wrapper: TestWrapper });

    expect(result.current).toEqual(mockUser);
  });

  it('should throw error when not authenticated', () => {
    const { result } = renderHook(() => useRequireAuth(), { wrapper: TestWrapper });

    expect(() => result.current).toThrow('Authentication required');
  });
});