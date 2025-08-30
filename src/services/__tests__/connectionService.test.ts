import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectionService } from '../connectionService';

// Mock Firebase
const mockOnDisconnect = vi.fn();
const mockSet = vi.fn();
const mockOnValue = vi.fn();
const mockOff = vi.fn();

vi.mock('../firebase', () => ({
  db: {
    ref: vi.fn(() => ({
      onDisconnect: () => ({
        set: mockSet
      }),
      set: mockSet
    }))
  }
}));

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

describe('ConnectionService', () => {
  let connectionService: ConnectionService;

  beforeEach(() => {
    vi.clearAllMocks();
    connectionService = ConnectionService.getInstance();
    
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: true
    });
  });

  it('should be a singleton', () => {
    const instance1 = ConnectionService.getInstance();
    const instance2 = ConnectionService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should initialize with online status', () => {
    const status = connectionService.getStatus();
    expect(status.isOnline).toBe(true);
    expect(status.isFirebaseConnected).toBe(true);
  });

  it('should detect offline status', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false
    });

    // Simulate offline event
    const offlineEvent = new Event('offline');
    window.dispatchEvent(offlineEvent);

    const status = connectionService.getStatus();
    expect(status.isOnline).toBe(false);
  });

  it('should detect online status', () => {
    // Start offline
    Object.defineProperty(navigator, 'onLine', {
      value: false
    });
    
    const offlineEvent = new Event('offline');
    window.dispatchEvent(offlineEvent);

    // Go back online
    Object.defineProperty(navigator, 'onLine', {
      value: true
    });
    
    const onlineEvent = new Event('online');
    window.dispatchEvent(onlineEvent);

    const status = connectionService.getStatus();
    expect(status.isOnline).toBe(true);
  });

  it('should subscribe to status changes', () => {
    const callback = vi.fn();
    const unsubscribe = connectionService.onStatusChange(callback);

    // Trigger status change
    const offlineEvent = new Event('offline');
    window.dispatchEvent(offlineEvent);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        isOnline: false
      })
    );

    unsubscribe();
  });

  it('should unsubscribe from status changes', () => {
    const callback = vi.fn();
    const unsubscribe = connectionService.onStatusChange(callback);

    unsubscribe();

    // Trigger status change after unsubscribe
    const offlineEvent = new Event('offline');
    window.dispatchEvent(offlineEvent);

    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('should wait for connection', async () => {
    // Start offline
    Object.defineProperty(navigator, 'onLine', {
      value: false
    });
    
    const offlineEvent = new Event('offline');
    window.dispatchEvent(offlineEvent);

    const connectionPromise = connectionService.waitForConnection();

    // Go online after a delay
    setTimeout(() => {
      Object.defineProperty(navigator, 'onLine', {
        value: true
      });
      const onlineEvent = new Event('online');
      window.dispatchEvent(onlineEvent);
    }, 100);

    await expect(connectionPromise).resolves.toBeUndefined();
  });

  it('should timeout when waiting for connection', async () => {
    // Start offline
    Object.defineProperty(navigator, 'onLine', {
      value: false
    });
    
    const offlineEvent = new Event('offline');
    window.dispatchEvent(offlineEvent);

    await expect(
      connectionService.waitForConnection(100)
    ).rejects.toThrow('Connection timeout');
  });

  it('should resolve immediately if already connected', async () => {
    // Already online
    await expect(
      connectionService.waitForConnection()
    ).resolves.toBeUndefined();
  });

  it('should track Firebase connection status', () => {
    // Mock Firebase connection callback
    let firebaseCallback: (snapshot: any) => void;
    mockOnValue.mockImplementation((ref, callback) => {
      firebaseCallback = callback;
      return () => {};
    });

    // Reinitialize to trigger Firebase listener setup
    connectionService = ConnectionService.getInstance();

    // Simulate Firebase disconnect
    firebaseCallback!({ val: () => false });

    const status = connectionService.getStatus();
    expect(status.isFirebaseConnected).toBe(false);

    // Simulate Firebase reconnect
    firebaseCallback!({ val: () => true });

    const statusAfterReconnect = connectionService.getStatus();
    expect(statusAfterReconnect.isFirebaseConnected).toBe(true);
  });

  it('should handle Firebase connection errors', () => {
    const callback = vi.fn();
    connectionService.onStatusChange(callback);

    // Mock Firebase error
    let firebaseCallback: (snapshot: any) => void;
    mockOnValue.mockImplementation((ref, callback) => {
      firebaseCallback = callback;
      return () => {};
    });

    // Simulate Firebase error
    firebaseCallback!({ val: () => null });

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        isFirebaseConnected: false
      })
    );
  });

  it('should get connection quality', () => {
    const quality = connectionService.getConnectionQuality();
    expect(['excellent', 'good', 'poor', 'offline']).toContain(quality);
  });

  it('should return offline quality when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false
    });
    
    const offlineEvent = new Event('offline');
    window.dispatchEvent(offlineEvent);

    const quality = connectionService.getConnectionQuality();
    expect(quality).toBe('offline');
  });

  it('should cleanup on destroy', () => {
    const callback = vi.fn();
    connectionService.onStatusChange(callback);

    // Destroy should remove all listeners
    connectionService.destroy();

    // Trigger event after destroy
    const offlineEvent = new Event('offline');
    window.dispatchEvent(offlineEvent);

    expect(callback).not.toHaveBeenCalled();
  });
});