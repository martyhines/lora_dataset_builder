import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UploadZone } from '../UploadZone';
import { useUpload } from '../../hooks/useUpload';

// Mock the useUpload hook
vi.mock('../../hooks/useUpload');

// Mock the validation function
vi.mock('../../types/validation', () => ({
  validateImageFile: vi.fn(() => true)
}));

// Mock the utils
vi.mock('../../types/utils', () => ({
  formatFileSize: vi.fn((bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  })
}));

describe('UploadZone Integration', () => {
  const mockUploadFiles = vi.fn();
  const mockUseUpload = useUpload as any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseUpload.mockReturnValue({
      uploadStates: [],
      isUploading: false,
      overallProgress: { total: 0, completed: 0, failed: 0, inProgress: 0 },
      uploadFiles: mockUploadFiles,
      retryFailedUploads: vi.fn(),
      clearUploadHistory: vi.fn(),
      removeUpload: vi.fn()
    });
  });

  it('integrates with useUpload hook for file uploads', async () => {
    const onFilesSelected = vi.fn();
    
    render(
      <UploadZone
        onFilesSelected={onFilesSelected}
        isUploading={false}
      />
    );

    // Create mock files
    const file1 = new File(['test'], 'test1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['test'], 'test2.png', { type: 'image/png' });

    // Find the drop zone
    const dropZone = screen.getByText('Upload images').closest('div')?.parentElement;
    
    // Mock drag and drop
    const mockDataTransfer = {
      files: [file1, file2]
    };

    fireEvent.drop(dropZone!, {
      dataTransfer: mockDataTransfer
    });

    await waitFor(() => {
      expect(onFilesSelected).toHaveBeenCalled();
    });

    // Verify the files were passed correctly
    const callArgs = onFilesSelected.mock.calls[0][0];
    expect(callArgs).toHaveLength(2);
  });

  it('shows upload progress when files are being uploaded', () => {
    mockUseUpload.mockReturnValue({
      uploadStates: [
        ['file1', { file: new File(['test'], 'test1.jpg'), status: 'uploading', progress: 50 }],
        ['file2', { file: new File(['test'], 'test2.jpg'), status: 'complete', progress: 100 }]
      ],
      isUploading: true,
      overallProgress: { total: 2, completed: 1, failed: 0, inProgress: 1 },
      uploadFiles: mockUploadFiles,
      retryFailedUploads: vi.fn(),
      clearUploadHistory: vi.fn(),
      removeUpload: vi.fn()
    });

    render(
      <UploadZone
        onFilesSelected={vi.fn()}
        isUploading={true}
        progress={{ total: 2, completed: 1, failed: 0, inProgress: 1 }}
      />
    );

    expect(screen.getByText('Uploading images...')).toBeInTheDocument();
    expect(screen.getByText('1 completed')).toBeInTheDocument();
    expect(screen.getByText('1 in progress')).toBeInTheDocument();
    expect(screen.getByText('50% complete')).toBeInTheDocument();
  });

  it('handles validation errors properly', async () => {
    const onFilesSelected = vi.fn();
    
    render(
      <UploadZone
        onFilesSelected={onFilesSelected}
        isUploading={false}
        maxFiles={1} // Limit to 1 file
      />
    );

    // Create more files than allowed
    const file1 = new File(['test'], 'test1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['test'], 'test2.jpg', { type: 'image/jpeg' });

    const dropZone = screen.getByText('Upload images').closest('div')?.parentElement;
    
    const mockDataTransfer = {
      files: [file1, file2]
    };

    fireEvent.drop(dropZone!, {
      dataTransfer: mockDataTransfer
    });

    await waitFor(() => {
      expect(screen.getByText(/Too many files selected/)).toBeInTheDocument();
    });

    // Should not call onFilesSelected when validation fails
    expect(onFilesSelected).not.toHaveBeenCalled();
  });
});