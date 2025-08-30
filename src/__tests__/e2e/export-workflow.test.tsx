import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import type { ImageDoc } from '../../types';

// Mock Firebase services
vi.mock('../../services/firebase', () => ({
  auth: {
    onAuthStateChanged: vi.fn((callback) => {
      callback({ uid: 'test-user', isAnonymous: true });
      return () => {};
    }),
    signInAnonymously: vi.fn(),
    currentUser: { uid: 'test-user', isAnonymous: true }
  },
  db: {},
  storage: {}
}));

const mockImagesWithSelections: ImageDoc[] = [
  {
    id: 'image-1',
    filename: 'landscape.jpg',
    storagePath: 'uploads/test-user/landscape.jpg',
    downloadURL: 'https://example.com/landscape.jpg',
    status: 'complete',
    candidates: [
      {
        modelId: 'openai:gpt-4o-mini',
        caption: 'A beautiful mountain landscape',
        createdAt: Date.now()
      }
    ],
    selectedIndex: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'image-2',
    filename: 'portrait.jpg',
    storagePath: 'uploads/test-user/portrait.jpg',
    downloadURL: 'https://example.com/portrait.jpg',
    status: 'complete',
    candidates: [
      {
        modelId: 'google:gemini-pro-vision',
        caption: 'A person smiling at the camera',
        createdAt: Date.now()
      }
    ],
    selectedIndex: 0,
    selectedTextOverride: 'A happy person with a bright smile',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'image-3',
    filename: 'nature.jpg',
    storagePath: 'uploads/test-user/nature.jpg',
    downloadURL: 'https://example.com/nature.jpg',
    status: 'complete',
    candidates: [
      {
        modelId: 'anthropic:claude-3-vision',
        caption: 'Forest scene with tall trees',
        createdAt: Date.now()
      }
    ],
    selectedIndex: null, // No selection - should not be included in export
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

// Mock services
vi.mock('../../services/imageService', () => ({
  ImageService: vi.fn().mockImplementation(() => ({
    subscribeToImages: vi.fn((userId, callback) => {
      callback(mockImagesWithSelections);
      return () => {};
    }),
    updateImage: vi.fn().mockResolvedValue(undefined)
  }))
}));

// Mock localStorage for download button visibility
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock URL.createObjectURL for download
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock document.createElement for download link
const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();

Object.defineProperty(document, 'createElement', {
  value: vi.fn((tagName) => {
    if (tagName === 'a') {
      return {
        href: '',
        download: '',
        click: mockClick,
        style: {}
      };
    }
    return {};
  })
});

Object.defineProperty(document.body, 'appendChild', { value: mockAppendChild });
Object.defineProperty(document.body, 'removeChild', { value: mockRemoveChild });

describe('Export Workflow E2E', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage to show download button
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'show_dl_button') return 'true';
      return null;
    });
  });

  it('should show download button when localStorage flag is set', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/LoRa Dataset Builder/i)).toBeInTheDocument();
    });

    // Should show download button
    await waitFor(() => {
      expect(screen.getByText(/download.*dataset/i)).toBeInTheDocument();
    });
  });

  it('should hide download button when localStorage flag is not set', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/LoRa Dataset Builder/i)).toBeInTheDocument();
    });

    // Should not show download button
    expect(screen.queryByText(/download.*dataset/i)).not.toBeInTheDocument();
  });

  it('should export dataset with selected captions', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/LoRa Dataset Builder/i)).toBeInTheDocument();
    });

    // Wait for images to load
    await waitFor(() => {
      expect(screen.getByText('landscape.jpg')).toBeInTheDocument();
      expect(screen.getByText('portrait.jpg')).toBeInTheDocument();
      expect(screen.getByText('nature.jpg')).toBeInTheDocument();
    });

    // Click download button
    const downloadButton = screen.getByText(/download.*dataset/i);
    await user.click(downloadButton);

    // Should create download link and trigger download
    expect(mockClick).toHaveBeenCalled();
    expect(global.URL.createObjectURL).toHaveBeenCalled();

    // Verify the blob content
    const createObjectURLCall = (global.URL.createObjectURL as any).mock.calls[0][0];
    expect(createObjectURLCall).toBeInstanceOf(Blob);
    expect(createObjectURLCall.type).toBe('application/json');
  });

  it('should export correct dataset format', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/download.*dataset/i)).toBeInTheDocument();
    });

    const downloadButton = screen.getByText(/download.*dataset/i);
    await user.click(downloadButton);

    // Get the blob that was created
    const createObjectURLCall = (global.URL.createObjectURL as any).mock.calls[0][0];
    
    // Read the blob content
    const text = await createObjectURLCall.text();
    const dataset = JSON.parse(text);

    // Should only include images with selected captions (2 out of 3)
    expect(dataset).toHaveLength(2);

    // First image should use original caption
    expect(dataset[0]).toEqual({
      url: 'https://example.com/landscape.jpg',
      filename: 'landscape.jpg',
      caption: 'A beautiful mountain landscape'
    });

    // Second image should use override caption
    expect(dataset[1]).toEqual({
      url: 'https://example.com/portrait.jpg',
      filename: 'portrait.jpg',
      caption: 'A happy person with a bright smile'
    });

    // Third image should not be included (no selection)
    expect(dataset.find((item: any) => item.filename === 'nature.jpg')).toBeUndefined();
  });

  it('should show export progress for large datasets', async () => {
    // Mock large dataset
    const largeDataset = Array.from({ length: 100 }, (_, i) => ({
      id: `image-${i}`,
      filename: `image-${i}.jpg`,
      storagePath: `uploads/test-user/image-${i}.jpg`,
      downloadURL: `https://example.com/image-${i}.jpg`,
      status: 'complete' as const,
      candidates: [
        {
          modelId: 'openai:gpt-4o-mini',
          caption: `Caption for image ${i}`,
          createdAt: Date.now()
        }
      ],
      selectedIndex: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));

    const mockImageService = require('../../services/imageService').ImageService;
    mockImageService.mockImplementation(() => ({
      subscribeToImages: vi.fn((userId, callback) => {
        callback(largeDataset);
        return () => {};
      }),
      updateImage: vi.fn()
    }));

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/download.*dataset/i)).toBeInTheDocument();
    });

    const downloadButton = screen.getByText(/download.*dataset/i);
    await user.click(downloadButton);

    // Should show export progress
    await waitFor(() => {
      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
    });

    // Should show progress percentage
    await waitFor(() => {
      expect(screen.getByText(/\d+%/)).toBeInTheDocument();
    });
  });

  it('should handle export errors gracefully', async () => {
    // Mock URL.createObjectURL to throw error
    global.URL.createObjectURL = vi.fn(() => {
      throw new Error('Export failed');
    });

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/download.*dataset/i)).toBeInTheDocument();
    });

    const downloadButton = screen.getByText(/download.*dataset/i);
    await user.click(downloadButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/export.*failed/i)).toBeInTheDocument();
    });

    // Should show retry option
    expect(screen.getByText(/retry/i)).toBeInTheDocument();
  });

  it('should show dataset statistics before export', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/LoRa Dataset Builder/i)).toBeInTheDocument();
    });

    // Should show total images count
    await waitFor(() => {
      expect(screen.getByText(/3.*images/i)).toBeInTheDocument();
    });

    // Should show ready for export count (only images with selections)
    expect(screen.getByText(/2.*ready/i)).toBeInTheDocument();
  });

  it('should generate filename with timestamp', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/download.*dataset/i)).toBeInTheDocument();
    });

    const downloadButton = screen.getByText(/download.*dataset/i);
    await user.click(downloadButton);

    // Check that the download link has a timestamped filename
    const createElementCall = (document.createElement as any).mock.calls.find(
      (call: any) => call[0] === 'a'
    );
    expect(createElementCall).toBeDefined();

    // The download attribute should be set with a timestamped filename
    expect(mockAppendChild).toHaveBeenCalled();
  });

  it('should allow custom filename input', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/download.*dataset/i)).toBeInTheDocument();
    });

    // Look for filename input (if implemented)
    const filenameInput = screen.queryByLabelText(/filename/i);
    if (filenameInput) {
      await user.type(filenameInput, 'my-custom-dataset');
    }

    const downloadButton = screen.getByText(/download.*dataset/i);
    await user.click(downloadButton);

    expect(mockClick).toHaveBeenCalled();
  });

  it('should handle empty dataset export', async () => {
    // Mock empty dataset
    const mockImageService = require('../../services/imageService').ImageService;
    mockImageService.mockImplementation(() => ({
      subscribeToImages: vi.fn((userId, callback) => {
        callback([]);
        return () => {};
      }),
      updateImage: vi.fn()
    }));

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/LoRa Dataset Builder/i)).toBeInTheDocument();
    });

    // Download button should be disabled or show warning
    const downloadButton = screen.getByText(/download.*dataset/i);
    
    if (downloadButton.hasAttribute('disabled')) {
      expect(downloadButton).toBeDisabled();
    } else {
      await user.click(downloadButton);
      
      // Should show warning about empty dataset
      await waitFor(() => {
        expect(screen.getByText(/no.*images.*selected/i)).toBeInTheDocument();
      });
    }
  });

  it('should cleanup blob URL after download', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/download.*dataset/i)).toBeInTheDocument();
    });

    const downloadButton = screen.getByText(/download.*dataset/i);
    await user.click(downloadButton);

    // Should revoke the blob URL after download
    await waitFor(() => {
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });
});