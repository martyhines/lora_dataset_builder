import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCrossTabSync } from '../useCrossTabSync';
import type { ImageDoc } from '../../types';

// Mock BroadcastChannel
const mockPostMessage = vi.fn();
const mockClose = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

const mockBroadcastChannel = {
  postMessage: mockPostMessage,
  close: mockClose,
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
  onmessage: null,
  onmessageerror: null
};

beforeEach(() => {
  vi.clearAllMocks();
  global.BroadcastChannel = vi.fn(() => mockBroadcastChannel) as any;
  
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useCrossTabSync', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useCrossTabSync());

    expect(result.current.connectedTabs).toBe(1);
    expect(result.current.isLeaderTab).toBe(true);
    expect(result.current.lastSyncTime).toBeNull();
  });

  it('should create BroadcastChannel on mount', () => {
    renderHook(() => useCrossTabSync());

    expect(global.BroadcastChannel).toHaveBeenCalledWith('lora-dataset-sync');
  });

  it('should broadcast image updates', () => {
    const { result } = renderHook(() => useCrossTabSync());

    const mockImage: Partial<ImageDoc> = {
      id: 'test-id',
      filename: 'test.jpg',
      status: 'complete'
    };

    act(() => {
      result.current.broadcastImageUpdate(mockImage as ImageDoc);
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'image-updated',
      data: mockImage,
      timestamp: expect.any(Number),
      tabId: expect.any(String)
    });
  });

  it('should broadcast image deletion', () => {
    const { result } = renderHook(() => useCrossTabSync());

    act(() => {
      result.current.broadcastImageDelete('test-id');
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'image-deleted',
      data: { imageId: 'test-id' },
      timestamp: expect.any(Number),
      tabId: expect.any(String)
    });
  });

  it('should broadcast image creation', () => {
    const { result } = renderHook(() => useCrossTabSync());

    const mockImage: Partial<ImageDoc> = {
      id: 'new-id',
      filename: 'new.jpg',
      status: 'pending'
    };

    act(() => {
      result.current.broadcastImageCreate(mockImage as ImageDoc);
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'image-created',
      data: mockImage,
      timestamp: expect.any(Number),
      tabId: expect.any(String)
    });
  });

  it('should request sync from other tabs', () => {
    const { result } = renderHook(() => useCrossTabSync());

    act(() => {
      result.current.requestSync();
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'sync-request',
      data: {},
      timestamp: expect.any(Number),
      tabId: expect.any(String)
    });
  });

  it('should handle incoming messages', () => {
    const mockOnImageUpdate = vi.fn();
    const mockOnImageDelete = vi.fn();
    const mockOnImageCreate = vi.fn();

    renderHook(() => useCrossTabSync({
      onImageUpdate: mockOnImageUpdate,
      onImageDelete: mockOnImageDelete,
      onImageCreate: mockOnImageCreate
    }));

    // Get the message handler
    const messageHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];

    expect(messageHandler).toBeDefined();

    // Simulate image update message
    const updateMessage = {
      data: {
        type: 'image-updated',
        data: { id: 'test-id', filename: 'test.jpg' },
        timestamp: Date.now(),
        tabId: 'other-tab'
      }
    };

    act(() => {
      messageHandler(updateMessage);
    });

    expect(mockOnImageUpdate).toHaveBeenCalledWith(updateMessage.data.data);

    // Simulate image delete message
    const deleteMessage = {
      data: {
        type: 'image-deleted',
        data: { imageId: 'test-id' },
        timestamp: Date.now(),
        tabId: 'other-tab'
      }
    };

    act(() => {
      messageHandler(deleteMessage);
    });

    expect(mockOnImageDelete).toHaveBeenCalledWith('test-id');

    // Simulate image create message
    const createMessage = {
      data: {
        type: 'image-created',
        data: { id: 'new-id', filename: 'new.jpg' },
        timestamp: Date.now(),
        tabId: 'other-tab'
      }
    };

    act(() => {
      messageHandler(createMessage);
    });

    expect(mockOnImageCreate).toHaveBeenCalledWith(createMessage.data.data);
  });

  it('should ignore messages from same tab', () => {
    const mockOnImageUpdate = vi.fn();

    const { result } = renderHook(() => useCrossTabSync({
      onImageUpdate: mockOnImageUpdate
    }));

    // Get the message handler
    const messageHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];

    // Get the current tab ID
    const currentTabId = (result.current as any).tabId;

    // Simulate message from same tab
    const message = {
      data: {
        type: 'image-updated',
        data: { id: 'test-id' },
        timestamp: Date.now(),
        tabId: currentTabId
      }
    };

    act(() => {
      messageHandler(message);
    });

    expect(mockOnImageUpdate).not.toHaveBeenCalled();
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useCrossTabSync());

    unmount();

    expect(mockClose).toHaveBeenCalled();
    expect(mockRemoveEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should handle tab leadership election', () => {
    const { result } = renderHook(() => useCrossTabSync());

    // Initially should be leader
    expect(result.current.isLeaderTab).toBe(true);

    // Get the message handler
    const messageHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];

    // Simulate sync request from another tab (indicating another leader)
    const syncRequestMessage = {
      data: {
        type: 'sync-request',
        data: {},
        timestamp: Date.now(),
        tabId: 'other-tab'
      }
    };

    act(() => {
      messageHandler(syncRequestMessage);
    });

    // Should respond to sync request
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'sync-response'
      })
    );
  });
});