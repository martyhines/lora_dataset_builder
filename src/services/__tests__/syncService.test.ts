/**
 * Sync Service Tests
 * Tests for real-time synchronization and offline capabilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncService, syncService } from '../syncService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock BroadcastChannel
class MockBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  
  constructor(name: string) {
    this.name = name;
  }
  
  postMessage(data: any) {
    // Simulate message to other tabs
  }
  
  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (type === 'message') {
      this.onmessage = listener;
    }
  }
  
  close() {}
}

Object.defineProperty(window, 'BroadcastChannel', {
  value: MockBroadcastChannel,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('SyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    // Reset singleton instance for clean tests
    (SyncService as any).instance = undefined;
  });

  describe('initialization', () => {
    it('should create singleton instance', () => {
      const instance1 = SyncService.getInstance();
      const instance2 = SyncService.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should initialize with default state', () => {
      const service = SyncService.getInstance();
      const state = service.getState();
      
      expect(state.isOnline).toBe(true);
      expect(state.isConnected).toBe(false);
      expect(state.pendingOperations).toEqual([]);
      expect(state.conflictResolution.strategy).toBe('merge');
    });

    it('should load state from localStorage', () => {
      const savedState = {
        isOnline: false,
        isConnected: true,
        lastSync: 123456789,
        conflictResolution: {
          strategy: 'client-wins',
          conflicts: []
        }
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));
      
      const service = SyncService.getInstance();
      const state = service.getState();
      
      expect(state.conflictResolution.strategy).toBe('client-wins');
      expect(state.lastSync).toBe(123456789);
    });
  });

  describe('connection status', () => {
    it('should update connection status', () => {
      const service = SyncService.getInstance();
      const listener = vi.fn();
      
      service.addEventListener(listener);
      service.setConnectionStatus(true);
      
      const state = service.getState();
      expect(state.isConnected).toBe(true);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'state-change',
          data: expect.objectContaining({ isConnected: true })
        })
      );
    });

    it('should save state when connection status changes', () => {
      const service = SyncService.getInstance();
      
      service.setConnectionStatus(true);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'lora-dataset-sync-state',
        expect.stringContaining('"isConnected":true')
      );
    });
  });

  describe('operation queuing', () => {
    it('should queue operations when offline', () => {
      const service = SyncService.getInstance();
      
      const operationId = service.queueOperation({
        type: 'update',
        collection: 'images',
        documentId: 'test-id',
        data: { status: 'complete' },
        userId: 'user-123'
      });
      
      expect(operationId).toBeTruthy();
      
      const state = service.getState();
      expect(state.pendingOperations).toHaveLength(1);
      expect(state.pendingOperations[0].type).toBe('update');
    });

    it('should complete operations', () => {
      const service = SyncService.getInstance();
      const listener = vi.fn();
      
      service.addEventListener(listener);
      
      const operationId = service.queueOperation({
        type: 'create',
        collection: 'images',
        documentId: 'test-id',
        data: {},
        userId: 'user-123'
      });
      
      service.completeOperation(operationId);
      
      const state = service.getState();
      expect(state.pendingOperations).toHaveLength(0);
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'operation-synced'
        })
      );
    });

    it('should save pending operations to localStorage', () => {
      const service = SyncService.getInstance();
      
      service.queueOperation({
        type: 'delete',
        collection: 'images',
        documentId: 'test-id',
        userId: 'user-123'
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'lora-dataset-pending-operations',
        expect.stringContaining('"type":"delete"')
      );
    });
  });

  describe('conflict resolution', () => {
    it('should detect conflicts', () => {
      const service = SyncService.getInstance();
      const listener = vi.fn();
      
      service.addEventListener(listener);
      
      const clientVersion = { id: '1', name: 'client' };
      const serverVersion = { id: '1', name: 'server' };
      
      service.detectConflict('doc-1', clientVersion, serverVersion);
      
      const state = service.getState();
      expect(state.conflictResolution.conflicts).toHaveLength(1);
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'conflict-detected'
        })
      );
    });

    it('should resolve conflicts with client-wins strategy', () => {
      const service = SyncService.getInstance();
      service.setConflictResolutionStrategy('client-wins');
      
      const clientVersion = { id: '1', name: 'client' };
      const serverVersion = { id: '1', name: 'server' };
      
      service.detectConflict('doc-1', clientVersion, serverVersion);
      
      const state = service.getState();
      const conflictId = state.conflictResolution.conflicts[0].id;
      
      const resolved = service.resolveConflict(conflictId);
      expect(resolved).toEqual(clientVersion);
    });

    it('should resolve conflicts with server-wins strategy', () => {
      const service = SyncService.getInstance();
      service.setConflictResolutionStrategy('server-wins');
      
      const clientVersion = { id: '1', name: 'client' };
      const serverVersion = { id: '1', name: 'server' };
      
      service.detectConflict('doc-1', clientVersion, serverVersion);
      
      const state = service.getState();
      const conflictId = state.conflictResolution.conflicts[0].id;
      
      const resolved = service.resolveConflict(conflictId);
      expect(resolved).toEqual(serverVersion);
    });

    it('should merge conflicts with merge strategy', () => {
      const service = SyncService.getInstance();
      service.setConflictResolutionStrategy('merge');
      
      const clientVersion = { 
        id: '1', 
        name: 'client', 
        selectedIndex: 1,
        updatedAt: 100
      };
      const serverVersion = { 
        id: '1', 
        name: 'server', 
        status: 'complete',
        updatedAt: 200
      };
      
      service.detectConflict('doc-1', clientVersion, serverVersion);
      
      const state = service.getState();
      const conflictId = state.conflictResolution.conflicts[0].id;
      
      const resolved = service.resolveConflict(conflictId);
      expect(resolved).toEqual({
        id: '1',
        name: 'server',
        status: 'complete',
        selectedIndex: 1,
        updatedAt: 200
      });
    });

    it('should require manual resolution for manual strategy', () => {
      const service = SyncService.getInstance();
      service.setConflictResolutionStrategy('manual');
      
      const clientVersion = { id: '1', name: 'client' };
      const serverVersion = { id: '1', name: 'server' };
      
      service.detectConflict('doc-1', clientVersion, serverVersion);
      
      const state = service.getState();
      const conflictId = state.conflictResolution.conflicts[0].id;
      
      const resolved = service.resolveConflict(conflictId);
      expect(resolved).toEqual({
        client: clientVersion,
        server: serverVersion,
        requiresManualResolution: true
      });
    });
  });

  describe('utility methods', () => {
    it('should get pending operations count', () => {
      const service = SyncService.getInstance();
      
      expect(service.getPendingOperationsCount()).toBe(0);
      
      service.queueOperation({
        type: 'create',
        collection: 'images',
        documentId: 'test-1',
        userId: 'user-123'
      });
      
      service.queueOperation({
        type: 'update',
        collection: 'images',
        documentId: 'test-2',
        userId: 'user-123'
      });
      
      expect(service.getPendingOperationsCount()).toBe(2);
    });

    it('should clear pending operations', () => {
      const service = SyncService.getInstance();
      
      service.queueOperation({
        type: 'create',
        collection: 'images',
        documentId: 'test-1',
        userId: 'user-123'
      });
      
      expect(service.getPendingOperationsCount()).toBe(1);
      
      service.clearPendingOperations();
      
      expect(service.getPendingOperationsCount()).toBe(0);
    });
  });

  describe('event handling', () => {
    it('should add and remove event listeners', () => {
      const service = SyncService.getInstance();
      const listener = vi.fn();
      
      const unsubscribe = service.addEventListener(listener);
      
      service.setConnectionStatus(true);
      expect(listener).toHaveBeenCalled();
      
      listener.mockClear();
      unsubscribe();
      
      service.setConnectionStatus(false);
      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const service = SyncService.getInstance();
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const goodListener = vi.fn();
      
      service.addEventListener(errorListener);
      service.addEventListener(goodListener);
      
      // Should not throw despite error in first listener
      expect(() => {
        service.setConnectionStatus(true);
      }).not.toThrow();
      
      expect(goodListener).toHaveBeenCalled();
    });
  });
});