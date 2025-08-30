/**
 * Sync Status Component
 * Displays real-time synchronization status and connection information
 * Requirements: 4.4, 4.5
 */

import React from 'react';
import { useSync } from '../hooks/useSync';
import { useCrossTabSync } from '../hooks/useCrossTabSync';

interface SyncStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function SyncStatus({ className = '', showDetails = false }: SyncStatusProps) {
  const {
    isOnline,
    isConnected,
    isSyncing,
    hasConflicts,
    pendingOperationsCount,
    connectionStatus,
    forceSync,
    checkConnection
  } = useSync();

  const { connectedTabs, isLeaderTab } = useCrossTabSync();

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (!isConnected) return 'text-yellow-500';
    if (isSyncing) return 'text-blue-500';
    if (hasConflicts) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (!isConnected) return 'Connecting...';
    if (isSyncing) return 'Syncing...';
    if (hasConflicts) return 'Conflicts detected';
    return 'Connected';
  };

  const getStatusIcon = () => {
    if (!isOnline) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L5.636 18.364M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
        </svg>
      );
    }
    
    if (!isConnected) {
      return (
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }
    
    if (isSyncing) {
      return (
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }
    
    if (hasConflicts) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  const handleRetryConnection = async () => {
    try {
      await checkConnection();
    } catch (error) {
      console.error('Failed to check connection:', error);
    }
  };

  const handleForceSync = async () => {
    try {
      await forceSync();
    } catch (error) {
      console.error('Failed to force sync:', error);
    }
  };

  // In development mode, make the status more prominent
  const isDev = import.meta.env.DEV;
  const statusBgColor = isDev ? 'bg-gray-800/90' : 'bg-gray-800/50';
  const statusBorderColor = isDev ? 'border-gray-600' : 'border-gray-700';

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusBgColor} ${statusBorderColor} ${className}`}>
      {/* Status Icon */}
      <div className={`flex-shrink-0 ${getStatusColor()}`}>
        {getStatusIcon()}
      </div>

      {/* Status Text */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">
          {getStatusText()}
        </div>
        
        {/* Show additional details in development mode */}
        {isDev && (
          <div className="text-xs text-gray-400 space-y-1">
            <div>Network: {isOnline ? 'Online' : 'Offline'}</div>
            <div>Firebase: {isConnected ? 'Connected' : 'Disconnected'}</div>
            <div>Cross-tab: {connectedTabs} tabs</div>
            {pendingOperationsCount > 0 && (
              <div>Pending: {pendingOperationsCount} operations</div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {!isConnected && (
          <button
            onClick={handleRetryConnection}
            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            title="Retry connection"
          >
            Retry
          </button>
        )}
        
        {isConnected && pendingOperationsCount > 0 && (
          <button
            onClick={handleForceSync}
            className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            title="Force sync"
          >
            Sync
          </button>
        )}
      </div>
    </div>
  );
}

export default SyncStatus;