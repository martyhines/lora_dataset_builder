/**
 * Cross-Tab Synchronization Hook
 * Manages state synchronization across browser tabs
 * Requirements: 4.2, 4.4
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ImageDoc } from '../types';

export interface CrossTabMessage {
  type: 'image-updated' | 'image-deleted' | 'image-created' | 'sync-request' | 'sync-response' | 'heartbeat' | 'leader-election';
  data: any;
  timestamp: number;
  tabId: string;
}

export interface UseCrossTabSyncReturn {
  // State
  connectedTabs: number;
  isLeaderTab: boolean;
  
  // Actions
  broadcastImageUpdate: (image: ImageDoc) => void;
  broadcastImageDelete: (imageId: string) => void;
  broadcastImageCreate: (image: ImageDoc) => void;
  requestSync: () => void;
  
  // Event handlers
  onImageUpdate: (handler: (image: ImageDoc) => void) => () => void;
  onImageDelete: (handler: (imageId: string) => void) => () => void;
  onImageCreate: (handler: (image: ImageDoc) => void) => () => void;
  onSyncRequest: (handler: () => void) => () => void;
}

/**
 * Hook for managing cross-tab synchronization
 */
export function useCrossTabSync(): UseCrossTabSyncReturn {
  const [connectedTabs, setConnectedTabs] = useState(1);
  const [isLeaderTab, setIsLeaderTab] = useState(true);
  
  const broadcastChannel = useRef<BroadcastChannel | null>(null);
  const tabId = useRef<string>(`tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const leaderElectionTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Event handlers
  const imageUpdateHandlers = useRef<Set<(image: ImageDoc) => void>>(new Set());
  const imageDeleteHandlers = useRef<Set<(imageId: string) => void>>(new Set());
  const imageCreateHandlers = useRef<Set<(image: ImageDoc) => void>>(new Set());
  const syncRequestHandlers = useRef<Set<() => void>>(new Set());
  
  // Active tabs tracking
  const activeTabs = useRef<Set<string>>(new Set([tabId.current]));
  const lastHeartbeat = useRef<Record<string, number>>({});

  // Initialize broadcast channel
  useEffect(() => {
    broadcastChannel.current = new BroadcastChannel('lora-dataset-cross-tab');
    
    // Handle incoming messages
    broadcastChannel.current.addEventListener('message', handleMessage);
    
    // Start heartbeat to announce presence
    startHeartbeat();
    
    // Start leader election
    electLeader();
    
    // Cleanup on unmount
    return () => {
      if (broadcastChannel.current) {
        broadcastChannel.current.close();
      }
      
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      
      if (leaderElectionTimeout.current) {
        clearTimeout(leaderElectionTimeout.current);
      }
    };
  }, []);

  // Handle incoming broadcast messages
  const handleMessage = useCallback((event: MessageEvent<CrossTabMessage>) => {
    const message = event.data;
    
    // Ignore messages from this tab
    if (message.tabId === tabId.current) {
      return;
    }

    switch (message.type) {
      case 'image-updated':
        imageUpdateHandlers.current.forEach(handler => {
          try {
            handler(message.data);
          } catch (error) {
            console.error('Error in image update handler:', error);
          }
        });
        break;

      case 'image-deleted':
        imageDeleteHandlers.current.forEach(handler => {
          try {
            handler(message.data);
          } catch (error) {
            console.error('Error in image delete handler:', error);
          }
        });
        break;

      case 'image-created':
        imageCreateHandlers.current.forEach(handler => {
          try {
            handler(message.data);
          } catch (error) {
            console.error('Error in image create handler:', error);
          }
        });
        break;

      case 'sync-request':
        syncRequestHandlers.current.forEach(handler => {
          try {
            handler();
          } catch (error) {
            console.error('Error in sync request handler:', error);
          }
        });
        break;

      case 'heartbeat':
        handleHeartbeat(message.tabId, message.timestamp);
        break;

      case 'leader-election':
        handleLeaderElection(message.tabId, message.timestamp);
        break;
    }
  }, []);

  // Handle heartbeat from other tabs
  const handleHeartbeat = useCallback((fromTabId: string, timestamp: number) => {
    activeTabs.current.add(fromTabId);
    lastHeartbeat.current[fromTabId] = timestamp;
    
    // Update connected tabs count
    setConnectedTabs(activeTabs.current.size);
    
    // Clean up stale tabs (no heartbeat for 30 seconds)
    const now = Date.now();
    const staleThreshold = 30000;
    
    for (const [tabId, lastSeen] of Object.entries(lastHeartbeat.current)) {
      if (now - lastSeen > staleThreshold) {
        activeTabs.current.delete(tabId);
        delete lastHeartbeat.current[tabId];
      }
    }
    
    setConnectedTabs(activeTabs.current.size);
  }, []);

  // Handle leader election
  const handleLeaderElection = useCallback((fromTabId: string, timestamp: number) => {
    // Simple leader election: oldest tab (by timestamp) becomes leader
    const myTimestamp = parseInt(tabId.current.split('-')[1]);
    const otherTimestamp = timestamp;
    
    if (otherTimestamp < myTimestamp) {
      setIsLeaderTab(false);
    }
  }, []);

  // Start heartbeat to announce presence
  const startHeartbeat = useCallback(() => {
    const sendHeartbeat = () => {
      if (broadcastChannel.current) {
        const message: CrossTabMessage = {
          type: 'heartbeat' as any,
          data: null,
          timestamp: Date.now(),
          tabId: tabId.current
        };
        
        broadcastChannel.current.postMessage(message);
      }
    };

    // Send initial heartbeat
    sendHeartbeat();
    
    // Send heartbeat every 10 seconds
    heartbeatInterval.current = setInterval(sendHeartbeat, 10000);
  }, []);

  // Elect leader tab
  const electLeader = useCallback(() => {
    // Announce candidacy for leadership
    if (broadcastChannel.current) {
      const message: CrossTabMessage = {
        type: 'leader-election' as any,
        data: null,
        timestamp: parseInt(tabId.current.split('-')[1]),
        tabId: tabId.current
      };
      
      broadcastChannel.current.postMessage(message);
    }

    // Wait a bit and then assume leadership if no older tabs respond
    leaderElectionTimeout.current = setTimeout(() => {
      setIsLeaderTab(true);
    }, 1000);
  }, []);

  // Broadcast image update
  const broadcastImageUpdate = useCallback((image: ImageDoc) => {
    if (broadcastChannel.current) {
      const message: CrossTabMessage = {
        type: 'image-updated',
        data: image,
        timestamp: Date.now(),
        tabId: tabId.current
      };
      
      broadcastChannel.current.postMessage(message);
    }
  }, []);

  // Broadcast image deletion
  const broadcastImageDelete = useCallback((imageId: string) => {
    if (broadcastChannel.current) {
      const message: CrossTabMessage = {
        type: 'image-deleted',
        data: imageId,
        timestamp: Date.now(),
        tabId: tabId.current
      };
      
      broadcastChannel.current.postMessage(message);
    }
  }, []);

  // Broadcast image creation
  const broadcastImageCreate = useCallback((image: ImageDoc) => {
    if (broadcastChannel.current) {
      const message: CrossTabMessage = {
        type: 'image-created',
        data: image,
        timestamp: Date.now(),
        tabId: tabId.current
      };
      
      broadcastChannel.current.postMessage(message);
    }
  }, []);

  // Request sync from other tabs
  const requestSync = useCallback(() => {
    if (broadcastChannel.current) {
      const message: CrossTabMessage = {
        type: 'sync-request',
        data: null,
        timestamp: Date.now(),
        tabId: tabId.current
      };
      
      broadcastChannel.current.postMessage(message);
    }
  }, []);

  // Event handler registration
  const onImageUpdate = useCallback((handler: (image: ImageDoc) => void) => {
    imageUpdateHandlers.current.add(handler);
    return () => imageUpdateHandlers.current.delete(handler);
  }, []);

  const onImageDelete = useCallback((handler: (imageId: string) => void) => {
    imageDeleteHandlers.current.add(handler);
    return () => imageDeleteHandlers.current.delete(handler);
  }, []);

  const onImageCreate = useCallback((handler: (image: ImageDoc) => void) => {
    imageCreateHandlers.current.add(handler);
    return () => imageCreateHandlers.current.delete(handler);
  }, []);

  const onSyncRequest = useCallback((handler: () => void) => {
    syncRequestHandlers.current.add(handler);
    return () => syncRequestHandlers.current.delete(handler);
  }, []);

  return {
    // State
    connectedTabs,
    isLeaderTab,
    
    // Actions
    broadcastImageUpdate,
    broadcastImageDelete,
    broadcastImageCreate,
    requestSync,
    
    // Event handlers
    onImageUpdate,
    onImageDelete,
    onImageCreate,
    onSyncRequest
  };
}