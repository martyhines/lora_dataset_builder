/**
 * Synchronization Service
 * Handles real-time synchronization, offline support, and cross-tab communication
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

// Import removed - ImageDoc type not used in this file

export interface SyncState {
  isOnline: boolean;
  isConnected: boolean;
  lastSync: number;
  pendingOperations: PendingOperation[];
  conflictResolution: ConflictResolution;
}

export interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  documentId: string;
  data?: any;
  timestamp: number;
  retryCount: number;
  userId: string;
}

export interface ConflictResolution {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  conflicts: ConflictItem[];
}

export interface ConflictItem {
  id: string;
  documentId: string;
  clientVersion: any;
  serverVersion: any;
  timestamp: number;
  resolved: boolean;
}

export interface SyncEvent {
  type: 'state-change' | 'operation-queued' | 'operation-synced' | 'conflict-detected';
  data: any;
  timestamp: number;
}

export type SyncEventListener = (event: SyncEvent) => void;

/**
 * Core synchronization service for managing offline state and cross-tab sync
 */
export class SyncService {
  private static instance: SyncService;
  private state: SyncState;
  private listeners: Set<SyncEventListener> = new Set();
  private storageKey = 'lora-dataset-sync-state';
  private operationsKey = 'lora-dataset-pending-operations';
  private broadcastChannel: BroadcastChannel;
  private onlineListener?: () => void;
  private offlineListener?: () => void;

  private constructor() {
    this.state = this.loadState();
    this.broadcastChannel = new BroadcastChannel('lora-dataset-sync');
    this.setupEventListeners();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Get current synchronization state
   */
  getState(): SyncState {
    return { ...this.state };
  }

  /**
   * Add event listener for sync events
   */
  addEventListener(listener: SyncEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Update connection status
   */
  setConnectionStatus(isConnected: boolean): void {
    if (this.state.isConnected !== isConnected) {
      this.state.isConnected = isConnected;
      this.state.lastSync = isConnected ? Date.now() : this.state.lastSync;
      this.saveState();
      this.emitEvent({
        type: 'state-change',
        data: { isConnected, lastSync: this.state.lastSync },
        timestamp: Date.now()
      });

      // Trigger sync when connection is restored
      if (isConnected && this.state.pendingOperations.length > 0) {
        this.processPendingOperations();
      }
    }
  }

  /**
   * Queue an operation for later synchronization
   */
  queueOperation(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const pendingOperation: PendingOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.state.pendingOperations.push(pendingOperation);
    this.saveState();
    this.savePendingOperations();

    this.emitEvent({
      type: 'operation-queued',
      data: pendingOperation,
      timestamp: Date.now()
    });

    // Try to process immediately if online
    if (this.state.isOnline && this.state.isConnected) {
      this.processPendingOperations();
    }

    return id;
  }

  /**
   * Mark an operation as completed
   */
  completeOperation(operationId: string): void {
    const index = this.state.pendingOperations.findIndex(op => op.id === operationId);
    if (index !== -1) {
      const operation = this.state.pendingOperations[index];
      this.state.pendingOperations.splice(index, 1);
      this.saveState();
      this.savePendingOperations();

      this.emitEvent({
        type: 'operation-synced',
        data: operation,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle conflict detection and resolution
   */
  detectConflict(documentId: string, clientVersion: any, serverVersion: any): void {
    const conflict: ConflictItem = {
      id: `${documentId}-${Date.now()}`,
      documentId,
      clientVersion,
      serverVersion,
      timestamp: Date.now(),
      resolved: false
    };

    this.state.conflictResolution.conflicts.push(conflict);
    this.saveState();

    this.emitEvent({
      type: 'conflict-detected',
      data: conflict,
      timestamp: Date.now()
    });

    // Don't auto-resolve - let the caller decide when to resolve
  }

  /**
   * Resolve a conflict based on the current strategy
   */
  resolveConflict(conflictId: string): any {
    const conflict = this.state.conflictResolution.conflicts.find(c => c.id === conflictId);
    if (!conflict || conflict.resolved) {
      return null;
    }

    let resolvedData: any;

    switch (this.state.conflictResolution.strategy) {
      case 'client-wins':
        resolvedData = conflict.clientVersion;
        break;
      case 'server-wins':
        resolvedData = conflict.serverVersion;
        break;
      case 'merge':
        resolvedData = this.mergeVersions(conflict.clientVersion, conflict.serverVersion);
        break;
      case 'manual':
        // Return both versions for manual resolution
        return {
          client: conflict.clientVersion,
          server: conflict.serverVersion,
          requiresManualResolution: true
        };
    }

    conflict.resolved = true;
    this.saveState();

    return resolvedData;
  }

  /**
   * Set conflict resolution strategy
   */
  setConflictResolutionStrategy(strategy: ConflictResolution['strategy']): void {
    this.state.conflictResolution.strategy = strategy;
    this.saveState();
  }

  /**
   * Get pending operations count
   */
  getPendingOperationsCount(): number {
    return this.state.pendingOperations.length;
  }

  /**
   * Clear all pending operations (use with caution)
   */
  clearPendingOperations(): void {
    this.state.pendingOperations = [];
    this.saveState();
    this.savePendingOperations();
  }

  /**
   * Process all pending operations
   */
  private async processPendingOperations(): Promise<void> {
    if (!this.state.isOnline || !this.state.isConnected) {
      return;
    }

    const operations = [...this.state.pendingOperations];
    
    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        this.completeOperation(operation.id);
      } catch (error) {
        console.warn(`Failed to sync operation ${operation.id}:`, error);
        
        // Increment retry count
        const opIndex = this.state.pendingOperations.findIndex(op => op.id === operation.id);
        if (opIndex !== -1) {
          this.state.pendingOperations[opIndex].retryCount++;
          
          // Remove operation if it has failed too many times
          if (this.state.pendingOperations[opIndex].retryCount >= 5) {
            console.error(`Removing operation ${operation.id} after 5 failed attempts`);
            this.state.pendingOperations.splice(opIndex, 1);
          }
        }
        
        this.saveState();
        this.savePendingOperations();
      }
    }
  }

  /**
   * Execute a pending operation (to be implemented by specific services)
   */
  private async executeOperation(operation: PendingOperation): Promise<void> {
    // This is a placeholder - actual implementation would delegate to appropriate services
    // For example, ImageService for image operations, etc.
    throw new Error(`Operation execution not implemented for type: ${operation.type}`);
  }

  /**
   * Merge two versions of data (simple merge strategy)
   */
  private mergeVersions(clientVersion: any, serverVersion: any): any {
    if (!clientVersion || !serverVersion) {
      return serverVersion || clientVersion;
    }

    // For ImageDoc objects, prefer server data but keep client selections
    if (clientVersion.id && serverVersion.id) {
      return {
        ...serverVersion,
        selectedIndex: clientVersion.selectedIndex ?? serverVersion.selectedIndex,
        selectedTextOverride: clientVersion.selectedTextOverride ?? serverVersion.selectedTextOverride,
        updatedAt: Math.max(clientVersion.updatedAt || 0, serverVersion.updatedAt || 0)
      };
    }

    // Generic object merge
    return { ...serverVersion, ...clientVersion };
  }

  /**
   * Setup event listeners for online/offline and cross-tab communication
   */
  private setupEventListeners(): void {
    // Online/offline detection
    this.onlineListener = () => {
      this.state.isOnline = true;
      this.saveState();
      this.emitEvent({
        type: 'state-change',
        data: { isOnline: true },
        timestamp: Date.now()
      });
    };

    this.offlineListener = () => {
      this.state.isOnline = false;
      this.state.isConnected = false;
      this.saveState();
      this.emitEvent({
        type: 'state-change',
        data: { isOnline: false, isConnected: false },
        timestamp: Date.now()
      });
    };

    window.addEventListener('online', this.onlineListener);
    window.addEventListener('offline', this.offlineListener);

    // Cross-tab communication
    this.broadcastChannel.addEventListener('message', (event) => {
      if (event.data.type === 'sync-state-update') {
        // Merge state from other tabs
        this.mergeStateFromOtherTab(event.data.state);
      }
    });

    // Broadcast state changes to other tabs
    this.addEventListener((event) => {
      this.broadcastChannel.postMessage({
        type: 'sync-state-update',
        state: this.state,
        event
      });
    });

    // Initial online state
    this.state.isOnline = navigator.onLine;
  }

  /**
   * Merge state received from another tab
   */
  private mergeStateFromOtherTab(otherState: SyncState): void {
    // Merge pending operations (avoid duplicates)
    const existingIds = new Set(this.state.pendingOperations.map(op => op.id));
    const newOperations = otherState.pendingOperations.filter(op => !existingIds.has(op.id));
    
    if (newOperations.length > 0) {
      this.state.pendingOperations.push(...newOperations);
      this.saveState();
      this.savePendingOperations();
    }

    // Update connection status if other tab has more recent info
    if (otherState.lastSync > this.state.lastSync) {
      this.state.isConnected = otherState.isConnected;
      this.state.lastSync = otherState.lastSync;
      this.saveState();
    }
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: SyncEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in sync event listener:', error);
      }
    });
  }

  /**
   * Load state from localStorage
   */
  private loadState(): SyncState {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          isOnline: navigator.onLine,
          pendingOperations: this.loadPendingOperations()
        };
      }
    } catch (error) {
      console.warn('Failed to load sync state:', error);
    }

    return {
      isOnline: navigator.onLine,
      isConnected: false,
      lastSync: 0,
      pendingOperations: [],
      conflictResolution: {
        strategy: 'merge',
        conflicts: []
      }
    };
  }

  /**
   * Save state to localStorage
   */
  private saveState(): void {
    try {
      const stateToSave = {
        ...this.state,
        pendingOperations: [] // Save operations separately
      };
      localStorage.setItem(this.storageKey, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save sync state:', error);
    }
  }

  /**
   * Load pending operations from localStorage
   */
  private loadPendingOperations(): PendingOperation[] {
    try {
      const stored = localStorage.getItem(this.operationsKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load pending operations:', error);
      return [];
    }
  }

  /**
   * Save pending operations to localStorage
   */
  private savePendingOperations(): void {
    try {
      localStorage.setItem(this.operationsKey, JSON.stringify(this.state.pendingOperations));
    } catch (error) {
      console.warn('Failed to save pending operations:', error);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.onlineListener) {
      window.removeEventListener('online', this.onlineListener);
    }
    if (this.offlineListener) {
      window.removeEventListener('offline', this.offlineListener);
    }
    this.broadcastChannel.close();
    this.listeners.clear();
  }
}

export const syncService = SyncService.getInstance();