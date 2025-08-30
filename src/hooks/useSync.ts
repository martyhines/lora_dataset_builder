/**
 * Synchronization Hook
 * Provides React integration for real-time sync and offline capabilities
 * Simplified version without authentication
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { syncService, type SyncState, type SyncEvent } from '../services/syncService';
import { connectionService, type ConnectionStatus, type ConnectionEvent } from '../services/connectionService';
import { offlineStorageService } from '../services/offlineStorageService';

export interface UseSyncReturn {
  // Sync state
  syncState: SyncState;
  connectionStatus: ConnectionStatus;
  
  // Status flags
  isOnline: boolean;
  isConnected: boolean;
  isSyncing: boolean;
  hasConflicts: boolean;
  pendingOperationsCount: number;
  
  // Actions
  forceSync: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  clearPendingOperations: () => void;
  resolveConflict: (conflictId: string) => any;
  setConflictResolutionStrategy: (strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual') => void;
  
  // Offline storage
  exportOfflineData: () => Promise<any>;
  importOfflineData: (data: any) => Promise<void>;
  clearOfflineData: () => Promise<void>;
}

/**
 * Hook for managing synchronization state and offline capabilities
 */
export function useSync(): UseSyncReturn {
  const [syncState, setSyncState] = useState<SyncState>(syncService.getState());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(connectionService.getStatus());
  const [isSyncing, setIsSyncing] = useState(false);
  const initializationRef = useRef(false);

  // Initialize services
  useEffect(() => {
    if (!initializationRef.current) {
      initializationRef.current = true;
      
      // Initialize connection monitoring
      connectionService.initialize();
      
      // Initialize offline storage
      offlineStorageService.initialize().catch(error => {
        console.warn('Failed to initialize offline storage:', error);
      });
    }
  }, []);

  // Subscribe to sync events
  useEffect(() => {
    const unsubscribeSync = syncService.addEventListener((event: SyncEvent) => {
      setSyncState(syncService.getState());
      
      if (event.type === 'operation-queued' || event.type === 'operation-synced') {
        setIsSyncing(event.type === 'operation-queued');
      }
    });

    return unsubscribeSync;
  }, []);

  // Force synchronization
  const forceSync = useCallback(async () => {
    if (!syncState.isOnline || !syncState.isConnected) {
      return;
    }

    setIsSyncing(true);
    
    try {
      // This would trigger processing of pending operations
      // The actual implementation would depend on how operations are processed
      console.log('Force sync triggered');
      
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Force sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [syncState.isOnline, syncState.isConnected]);

  // Subscribe to connection events
  useEffect(() => {
    const unsubscribeConnection = connectionService.addEventListener((event: ConnectionEvent) => {
      setConnectionStatus(connectionService.getStatus());
      
      // Update sync service with connection status
      syncService.setConnectionStatus(event.status.isOnline && event.status.isFirebaseConnected);
      
      if (event.type === 'connected') {
        // Trigger sync when connection is restored
        forceSync();
      }
    });

    return unsubscribeConnection;
  }, [forceSync]);

  // Check connection status
  const checkConnection = useCallback(async () => {
    return await connectionService.checkConnection();
  }, []);

  // Clear pending operations
  const clearPendingOperations = useCallback(() => {
    syncService.clearPendingOperations();
  }, []);

  // Resolve conflict
  const resolveConflict = useCallback((conflictId: string) => {
    return syncService.resolveConflict(conflictId);
  }, []);

  // Set conflict resolution strategy
  const setConflictResolutionStrategy = useCallback((strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual') => {
    syncService.setConflictResolutionStrategy(strategy);
  }, []);

  // Export offline data
  const exportOfflineData = useCallback(async () => {
    return await offlineStorageService.exportData();
  }, []);

  // Import offline data
  const importOfflineData = useCallback(async (data: any) => {
    await offlineStorageService.importData(data);
  }, []);

  // Clear offline data
  const clearOfflineData = useCallback(async () => {
    await offlineStorageService.clearUserData();
  }, []);

  return {
    // State
    syncState,
    connectionStatus,
    
    // Status flags
    isOnline: syncState.isOnline,
    isConnected: syncState.isConnected,
    isSyncing,
    hasConflicts: syncState.conflictResolution.conflicts.length > 0,
    pendingOperationsCount: syncState.pendingOperations.length,
    
    // Actions
    forceSync,
    checkConnection,
    clearPendingOperations,
    resolveConflict,
    setConflictResolutionStrategy,
    
    // Offline storage
    exportOfflineData,
    importOfflineData,
    clearOfflineData
  };
}