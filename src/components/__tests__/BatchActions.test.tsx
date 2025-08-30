import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BatchActions } from '../BatchActions';
import { ImageDoc } from '../../types';

const mockImages: ImageDoc[] = [
  {
    id: 'image-1',
    filename: 'test1.jpg',
    storagePath: 'uploads/test1.jpg',
    downloadURL: 'https://example.com/test1.jpg',
    status: 'complete',
    candidates: [],
    selectedIndex: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'image-2',
    filename: 'test2.jpg',
    storagePath: 'uploads/test2.jpg',
    downloadURL: 'https://example.com/test2.jpg',
    status: 'complete',
    candidates: [],
    selectedIndex: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'image-3',
    filename: 'test3.jpg',
    storagePath: 'uploads/test3.jpg',
    downloadURL: 'https://example.com/test3.jpg',
    status: 'complete',
    candidates: [],
    selectedIndex: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

describe('BatchActions', () => {
  const mockOnSelectionChange = vi.fn();
  const mockOnBatchDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders batch actions toolbar', () => {
    render(
      <BatchActions
        images={mockImages}
        selectedImageIds={[]}
        onSelectionChange={mockOnSelectionChange}
        onBatchDelete={mockOnBatchDelete}
      />
    );

    expect(screen.getByText('Select All')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('handles select all functionality', () => {
    render(
      <BatchActions
        images={mockImages}
        selectedImageIds={[]}
        onSelectionChange={mockOnSelectionChange}
        onBatchDelete={mockOnBatchDelete}
      />
    );

    const selectAllCheckbox = screen.getByRole('checkbox');
    fireEvent.click(selectAllCheckbox);

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['image-1', 'image-2', 'image-3']);
  });

  it('handles deselect all when all images are selected', () => {
    render(
      <BatchActions
        images={mockImages}
        selectedImageIds={['image-1', 'image-2', 'image-3']}
        onSelectionChange={mockOnSelectionChange}
        onBatchDelete={mockOnBatchDelete}
      />
    );

    expect(screen.getByText('Deselect All')).toBeInTheDocument();
    
    const selectAllCheckbox = screen.getByRole('checkbox');
    expect(selectAllCheckbox).toBeChecked();
    
    fireEvent.click(selectAllCheckbox);
    expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
  });

  it('shows selection count when images are selected', () => {
    render(
      <BatchActions
        images={mockImages}
        selectedImageIds={['image-1', 'image-2']}
        onSelectionChange={mockOnSelectionChange}
        onBatchDelete={mockOnBatchDelete}
      />
    );

    expect(screen.getByText('2 of 3 selected')).toBeInTheDocument();
    expect(screen.getByText('Delete Selected (2)')).toBeInTheDocument();
  });

  it('shows clear selection button when images are selected', () => {
    render(
      <BatchActions
        images={mockImages}
        selectedImageIds={['image-1']}
        onSelectionChange={mockOnSelectionChange}
        onBatchDelete={mockOnBatchDelete}
      />
    );

    const clearButton = screen.getByText('Clear Selection');
    fireEvent.click(clearButton);

    expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
  });

  it('opens confirmation dialog when delete is clicked', () => {
    render(
      <BatchActions
        images={mockImages}
        selectedImageIds={['image-1', 'image-2']}
        onSelectionChange={mockOnSelectionChange}
        onBatchDelete={mockOnBatchDelete}
      />
    );

    const deleteButton = screen.getByText('Delete Selected (2)');
    fireEvent.click(deleteButton);

    expect(screen.getByText('Delete 2 Images?')).toBeInTheDocument();
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('handles successful batch deletion', async () => {
    mockOnBatchDelete.mockResolvedValue({
      successful: ['image-1', 'image-2'],
      failed: []
    });

    render(
      <BatchActions
        images={mockImages}
        selectedImageIds={['image-1', 'image-2']}
        onSelectionChange={mockOnSelectionChange}
        onBatchDelete={mockOnBatchDelete}
      />
    );

    // Open confirmation dialog
    fireEvent.click(screen.getByText('Delete Selected (2)'));
    expect(screen.getByText('Delete 2 Images?')).toBeInTheDocument();
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Confirm Delete'));

    await waitFor(() => {
      expect(mockOnBatchDelete).toHaveBeenCalledWith(['image-1', 'image-2']);
    });

    // Should clear selection of successfully deleted images
    await waitFor(() => {
      expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
    });
  });

  it('handles partial batch deletion failure', async () => {
    mockOnBatchDelete.mockResolvedValue({
      successful: ['image-1'],
      failed: [{ imageId: 'image-2', error: 'Network error' }]
    });

    render(
      <BatchActions
        images={mockImages}
        selectedImageIds={['image-1', 'image-2']}
        onSelectionChange={mockOnSelectionChange}
        onBatchDelete={mockOnBatchDelete}
      />
    );

    // Open confirmation and confirm deletion
    fireEvent.click(screen.getByText('Delete Selected (2)'));
    fireEvent.click(screen.getByText('Confirm Delete'));

    await waitFor(() => {
      const successElements = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('Successfully deleted 1 image') || false;
      });
      expect(successElements.length).toBeGreaterThan(0);
      
      const failureElements = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('Failed to delete 1 image') || false;
      });
      expect(failureElements.length).toBeGreaterThan(0);
    });

    // Should show retry button
    expect(screen.getByText('Retry Failed (1)')).toBeInTheDocument();

    // Should update selection to remove successful deletions
    expect(mockOnSelectionChange).toHaveBeenCalledWith(['image-2']);
  });

  it('handles retry of failed deletions', async () => {
    // First call fails partially
    mockOnBatchDelete
      .mockResolvedValueOnce({
        successful: ['image-1'],
        failed: [{ imageId: 'image-2', error: 'Network error' }]
      })
      .mockResolvedValueOnce({
        successful: ['image-2'],
        failed: []
      });

    render(
      <BatchActions
        images={mockImages}
        selectedImageIds={['image-1', 'image-2']}
        onSelectionChange={mockOnSelectionChange}
        onBatchDelete={mockOnBatchDelete}
      />
    );

    // Initial deletion
    fireEvent.click(screen.getByText('Delete Selected (2)'));
    fireEvent.click(screen.getByText('Confirm Delete'));

    await waitFor(() => {
      expect(screen.getByText('Retry Failed (1)')).toBeInTheDocument();
    });

    // Retry failed deletions
    fireEvent.click(screen.getByText('Retry Failed (1)'));

    await waitFor(() => {
      expect(mockOnBatchDelete).toHaveBeenCalledTimes(2);
      expect(mockOnBatchDelete).toHaveBeenLastCalledWith(['image-2']);
    });

    // Should update selection to remove all successfully deleted images
    await waitFor(() => {
      expect(mockOnSelectionChange).toHaveBeenCalledWith(['image-2']); // First call removes image-1
    });
  });

  it('shows progress during deletion', async () => {
    let progressCallback: ((completed: number, total: number, current: string) => void) | undefined;
    
    mockOnBatchDelete.mockImplementation(async (imageIds) => {
      // Simulate progress updates
      if (progressCallback) {
        progressCallback(0, imageIds.length, 'image-1');
        await new Promise(resolve => setTimeout(resolve, 100));
        progressCallback(1, imageIds.length, 'image-2');
        await new Promise(resolve => setTimeout(resolve, 100));
        progressCallback(imageIds.length, imageIds.length, '');
      }
      
      return { successful: imageIds, failed: [] };
    });

    render(
      <BatchActions
        images={mockImages}
        selectedImageIds={['image-1', 'image-2']}
        onSelectionChange={mockOnSelectionChange}
        onBatchDelete={mockOnBatchDelete}
      />
    );

    fireEvent.click(screen.getByText('Delete Selected (2)'));
    fireEvent.click(screen.getByText('Confirm Delete'));

    await waitFor(() => {
      expect(screen.getByText('Deleting images...')).toBeInTheDocument();
    });
  });

  it('disables actions when disabled prop is true', () => {
    render(
      <BatchActions
        images={mockImages}
        selectedImageIds={['image-1']}
        onSelectionChange={mockOnSelectionChange}
        onBatchDelete={mockOnBatchDelete}
        disabled={true}
      />
    );

    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(screen.getByText('Delete Selected (1)')).toBeDisabled();
  });

  it('cancels deletion dialog', () => {
    render(
      <BatchActions
        images={mockImages}
        selectedImageIds={['image-1']}
        onSelectionChange={mockOnSelectionChange}
        onBatchDelete={mockOnBatchDelete}
      />
    );

    // Open dialog
    fireEvent.click(screen.getByText('Delete Selected (1)'));
    expect(screen.getByText('Delete 1 Image?')).toBeInTheDocument();

    // Cancel
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Delete 1 Image?')).not.toBeInTheDocument();
  });

  it('handles empty image list', () => {
    render(
      <BatchActions
        images={[]}
        selectedImageIds={[]}
        onSelectionChange={mockOnSelectionChange}
        onBatchDelete={mockOnBatchDelete}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    expect(screen.queryByText('Delete Selected')).not.toBeInTheDocument();
  });
});