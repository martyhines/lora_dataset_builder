import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from '../Toolbar';
import type { ImageDoc } from '../../types';

// Mock the useExport hook
vi.mock('../../hooks/useExport', () => ({
  useExport: () => ({
    stats: {
      totalImages: 3,
      imagesWithCaptions: 2,
      imagesWithOverrides: 1,
      readyForExport: 2
    },
    toggleDownloadButton: vi.fn(),
    showDownloadButton: true
  })
}));

// Mock the accessibility utils
vi.mock('../../utils/accessibility', () => ({
  generateId: (prefix: string) => `${prefix}-test-id`,
  announceToScreenReader: vi.fn()
}));

describe('Toolbar Batch Actions Integration', () => {
  const mockImages: ImageDoc[] = [
    {
      id: 'image-1',
      filename: 'test1.jpg',
      storagePath: 'gs://bucket/test1.jpg',
      downloadURL: 'https://example.com/test1.jpg',
      status: 'complete',
      candidates: [
        {
          modelId: 'openai:gpt-4o-mini',
          caption: 'Test caption 1',
          createdAt: Date.now()
        }
      ],
      selectedIndex: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'image-2',
      filename: 'test2.jpg',
      storagePath: 'gs://bucket/test2.jpg',
      downloadURL: 'https://example.com/test2.jpg',
      status: 'complete',
      candidates: [
        {
          modelId: 'openai:gpt-4o-mini',
          caption: 'Test caption 2',
          createdAt: Date.now()
        }
      ],
      selectedIndex: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ];

  const mockProps = {
    images: mockImages,
    selectedImageIds: [],
    selectionMode: false,
    onBatchSelectionChange: vi.fn(),
    onBatchDelete: vi.fn(),
    onToggleSelectionMode: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render selection mode toggle when callback is provided', () => {
    render(<Toolbar {...mockProps} />);
    
    expect(screen.getByText('Select Images')).toBeInTheDocument();
  });

  it('should not render selection mode toggle when callback is not provided', () => {
    const { onToggleSelectionMode, ...propsWithoutToggle } = mockProps;
    render(<Toolbar {...propsWithoutToggle} />);
    
    expect(screen.queryByText('Select Images')).not.toBeInTheDocument();
  });

  it('should show batch selection controls when in selection mode', () => {
    render(<Toolbar {...mockProps} selectionMode={true} />);
    
    expect(screen.getByText('Exit Selection')).toBeInTheDocument();
    expect(screen.getByText('Select All')).toBeInTheDocument();
  });

  it('should show selection count when images are selected', () => {
    render(<Toolbar {...mockProps} selectionMode={true} selectedImageIds={['image-1']} />);
    
    expect(screen.getByText('(1 selected)')).toBeInTheDocument();
  });

  it('should show clear selection button when images are selected', () => {
    render(<Toolbar {...mockProps} selectionMode={true} selectedImageIds={['image-1']} />);
    
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('should call onToggleSelectionMode when selection mode toggle is clicked', () => {
    render(<Toolbar {...mockProps} />);
    
    fireEvent.click(screen.getByText('Select Images'));
    expect(mockProps.onToggleSelectionMode).toHaveBeenCalledTimes(1);
  });

  it('should call onBatchSelectionChange when select all is clicked', () => {
    render(<Toolbar {...mockProps} selectionMode={true} />);
    
    const selectAllCheckbox = screen.getByRole('checkbox');
    fireEvent.click(selectAllCheckbox);
    
    expect(mockProps.onBatchSelectionChange).toHaveBeenCalledWith(['image-1', 'image-2']);
  });

  it('should call onBatchSelectionChange to deselect all when all are selected', () => {
    render(<Toolbar {...mockProps} selectionMode={true} selectedImageIds={['image-1', 'image-2']} />);
    
    const selectAllCheckbox = screen.getByRole('checkbox');
    fireEvent.click(selectAllCheckbox);
    
    expect(mockProps.onBatchSelectionChange).toHaveBeenCalledWith([]);
  });

  it('should call onBatchSelectionChange when clear selection is clicked', () => {
    render(<Toolbar {...mockProps} selectionMode={true} selectedImageIds={['image-1']} />);
    
    fireEvent.click(screen.getByText('Clear'));
    expect(mockProps.onBatchSelectionChange).toHaveBeenCalledWith([]);
  });

  it('should have proper accessibility attributes for batch actions', () => {
    render(<Toolbar {...mockProps} selectionMode={true} />);
    
    const selectAllCheckbox = screen.getByRole('checkbox');
    expect(selectAllCheckbox).toHaveAttribute('aria-describedby');
    
    const selectionModeButton = screen.getByText('Exit Selection');
    expect(selectionModeButton).toHaveAttribute('aria-label');
  });

  it('should not show batch actions when no images exist', () => {
    render(<Toolbar {...mockProps} images={[]} />);
    
    expect(screen.queryByText('Select Images')).not.toBeInTheDocument();
  });
});