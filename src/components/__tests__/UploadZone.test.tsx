import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UploadZone } from '../UploadZone';

// Mock DataTransfer for testing environment
global.DataTransfer = class MockDataTransfer {
  items = {
    add: vi.fn()
  };
  files: File[] = [];
} as any;

// Mock the validation function
vi.mock('../../types/validation', () => ({
  validateImageFile: vi.fn((file: File) => {
    // Mock validation - accept files with image/ MIME type and reasonable size
    return file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024;
  })
}));

const { validateImageFile } = await import('../../types/validation');

// Mock the utils
vi.mock('../../types/utils', () => ({
  formatFileSize: vi.fn((bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  })
}));

describe('UploadZone', () => {
  const mockOnFilesSelected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload zone with default state', () => {
    render(
      <UploadZone
        onFilesSelected={mockOnFilesSelected}
        isUploading={false}
      />
    );

    expect(screen.getByText('Upload images')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop images here, or click to select files')).toBeInTheDocument();
    expect(screen.getByText(/Supports JPEG, PNG, WebP, GIF/)).toBeInTheDocument();
  });

  it('shows uploading state when isUploading is true', () => {
    const progress = {
      total: 5,
      completed: 2,
      failed: 1,
      inProgress: 2
    };

    render(
      <UploadZone
        onFilesSelected={mockOnFilesSelected}
        isUploading={true}
        progress={progress}
      />
    );

    expect(screen.getByText('Uploading images...')).toBeInTheDocument();
    expect(screen.getByText('2 completed')).toBeInTheDocument();
    expect(screen.getByText('2 in progress')).toBeInTheDocument();
    expect(screen.getByText('1 failed')).toBeInTheDocument();
  });

  it('handles file input change', async () => {
    render(
      <UploadZone
        onFilesSelected={mockOnFilesSelected}
        isUploading={false}
      />
    );

    // Create mock files
    const file1 = new File(['test'], 'test1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['test'], 'test2.png', { type: 'image/png' });

    // Find the hidden file input
    const fileInput = screen.getByDisplayValue('') as HTMLInputElement;
    
    // Mock the files property
    Object.defineProperty(fileInput, 'files', {
      value: [file1, file2],
      writable: false,
    });

    // Trigger change event
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockOnFilesSelected).toHaveBeenCalled();
    });
  });

  it('handles drag and drop', async () => {
    render(
      <UploadZone
        onFilesSelected={mockOnFilesSelected}
        isUploading={false}
      />
    );

    // Find the drop zone by looking for the container with the drag handlers
    const dropZone = screen.getByText('Upload images').closest('div')?.parentElement;
    
    // Create mock files
    const file1 = new File(['test'], 'test1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['test'], 'test2.png', { type: 'image/png' });

    // Mock drag and drop
    const mockDataTransfer = {
      files: [file1, file2]
    };

    fireEvent.dragEnter(dropZone!, {
      dataTransfer: mockDataTransfer
    });

    expect(screen.getByText('Drop images here')).toBeInTheDocument();

    fireEvent.drop(dropZone!, {
      dataTransfer: mockDataTransfer
    });

    await waitFor(() => {
      expect(mockOnFilesSelected).toHaveBeenCalled();
    });
  });

  it('shows validation errors for invalid files', async () => {
    // Mock validation to fail for large files
    (validateImageFile as any).mockImplementation((file: File) => {
      return file.size <= 1024; // 1KB limit
    });

    render(
      <UploadZone
        onFilesSelected={mockOnFilesSelected}
        isUploading={false}
        maxFileSize={1024} // 1KB limit
      />
    );

    const dropZone = screen.getByText('Upload images').closest('div')?.parentElement;
    
    // Create a file that's too large
    const largeFile = new File(['x'.repeat(2048)], 'large.jpg', { type: 'image/jpeg' });

    const mockDataTransfer = {
      files: [largeFile]
    };

    fireEvent.drop(dropZone!, {
      dataTransfer: mockDataTransfer
    });

    await waitFor(() => {
      expect(screen.getByText(/Some files could not be uploaded/)).toBeInTheDocument();
    });
  });

  it('disables interaction when disabled prop is true', () => {
    render(
      <UploadZone
        onFilesSelected={mockOnFilesSelected}
        isUploading={false}
        disabled={true}
      />
    );

    // The disabled styles should be on the main drop zone div (the one with drag handlers)
    const uploadText = screen.getByText('Upload images');
    const dropZone = uploadText.closest('div[class*="border-2"]');
    expect(dropZone).toHaveClass('opacity-50');
    expect(dropZone).toHaveClass('cursor-not-allowed');
  });

  it('shows progress bar during upload', () => {
    const progress = {
      total: 10,
      completed: 3,
      failed: 0,
      inProgress: 7
    };

    render(
      <UploadZone
        onFilesSelected={mockOnFilesSelected}
        isUploading={true}
        progress={progress}
      />
    );

    expect(screen.getByText('30% complete')).toBeInTheDocument();
    
    // Check if progress bar exists
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '30%' });
  });

  it('respects maxFiles limit', async () => {
    render(
      <UploadZone
        onFilesSelected={mockOnFilesSelected}
        isUploading={false}
        maxFiles={2}
      />
    );

    const dropZone = screen.getByText('Upload images').closest('div')?.parentElement;
    
    // Create more files than the limit
    const files = [
      new File(['test'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test'], 'test2.jpg', { type: 'image/jpeg' }),
      new File(['test'], 'test3.jpg', { type: 'image/jpeg' })
    ];

    const mockDataTransfer = { files };

    fireEvent.drop(dropZone!, {
      dataTransfer: mockDataTransfer
    });

    await waitFor(() => {
      expect(screen.getByText(/Too many files selected/)).toBeInTheDocument();
    });

    expect(mockOnFilesSelected).not.toHaveBeenCalled();
  });
});