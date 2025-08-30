/**
 * useSync Hook Tests
 * Tests for synchronization hook functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSync } from '../useSync';

// Mock the services
vi.mock('../useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123' }
  })
}));

vi.mock('../../services/syncService', () => ({
  syncService: {
    getState: vi.fn(() => ({
      isOnline: true,
      isConnected: true,
      lastSync: Date.now(),
      pendingOperations: [],
      conflictResolution: {
        strategy: 'merge',
        conflicts: []
      }
    })),
    addEventListener: vi.fn(() => vi.fn()),
    clearPendingOperations: vi.fn(),
    resolveConflict: vi.fn(),
    setConflictResolutionStrategy: vi.fn()
  }
}));

vi.mock('../../services/connectionService', () => ({
  connectionService: {
    getStatus: vi.fn(() => ({
      isOnline: true,
      isFirebaseConnected: true,
      lastHeartbeat: Date.now(),
      reconnectAttempts: 0,
      latency: 50
    })),
    addEventListener: vi.fn(() => vi.fn()),
    initialize: vi.fn(),
    checkConnection: vi.fn(() => Promise.resolve(true))
  }
}));

vi.mock('../../services/offlineStorageService', () => ({
  offlineStorageService: {
    initialize: vi.fn(() => Promise.resolve()),
    exportData: vi.fn(() => Promise.resolve({})),
    importData: vi.fn(() => Promise.resolve()),
    clearUserData: vi.fn(() => Promise.resolve())
  }
}));

describe('useSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSync());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isSyncing).toBe(false);
    expect(result.current.hasConflicts).toBe(false);
    expect(result.current.pendingOperationsCount).toBe(0);
  });

  it('should provide sync actions', () => {
    const { result } = renderHook(() => useSync());

    expect(typeof result.current.forceSync).toBe('function');
    expect(typeof result.current.checkConnection).toBe('function');
    expect(typeof result.current.clearPendingOperations).toBe('function');
    expect(typeof result.current.resolveConflict).toBe('function');
    expect(typeof result.current.setConflictResolutionStrategy).toBe('function');
  });

  it('should provide offline storage actions', () => {
    const { result } = renderHook(() => useSync());

    expect(typeof result.current.exportOfflineData).toBe('function');
    expect(typeof result.current.importOfflineData).toBe('function');
    expect(typeof result.current.clearOfflineData).toBe('function');
  });

  it('should handle force sync', async () => {
    const { result } = renderHook(() => useSync());

    await act(async () => {
      await result.current.forceSync();
    });

    // Should complete without error
    expect(result.current.isSyncing).toBe(false);
  });

  it('should handle connection check', async () => {
    const { result } = renderHook(() => useSync());

    await act(async () => {
      const connected = await result.current.checkConnection();
      expect(connected).toBe(true);
    });
  });

  it('should handle conflict resolution', () => {
    const { result } = renderHook(() => useSync());

    act(() => {
      result.current.resolveConflict('test-conflict-id');
    });

    // Should complete without error
  });

  it('should handle conflict resolution strategy change', () => {
    const { result } = renderHook(() => useSync());

    act(() => {
      result.current.setConflictResolutionStrategy('client-wins');
    });

    // Should complete without error
  });

  it('should handle offline data export', async () => {
    const { result } = renderHook(() => useSync());

    await act(async () => {
      const data = await result.current.exportOfflineData();
      expect(data).toBeDefined();
    });
  });

  it('should handle offline data import', async () => {
    const { result } = renderHook(() => useSync());
    const testData = { images: {}, userSettings: {}, lastSync: 0, version: 1 };

    await act(async () => {
      await result.current.importOfflineData(testData);
    });

    // Should complete without error
  });

  it('should handle offline data clearing', async () => {
    const { result } = renderHook(() => useSync());

    await act(async () => {
      await result.current.clearOfflineData();
    });

    // Should complete without error
  });

  it('should handle missing user gracefully', async () => {
    // Mock no user by re-mocking the useAuth hook
    vi.doMock('../useAuth', () => ({
      useAuth: () => ({ user: null })
    }));

    const { result } = renderHook(() => useSync());

    await expect(result.current.exportOfflineData()).rejects.toThrow('User not authenticated');
    await expect(result.current.importOfflineData({})).rejects.toThrow('User not authenticated');
    await expect(result.current.clearOfflineData()).rejects.toThrow('User not authenticated');
  });
});