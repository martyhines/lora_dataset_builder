import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { CaptionSelector } from '../CaptionSelector';
import { CaptionCandidate } from '../../types';

// Mock data for testing
const mockCandidates: CaptionCandidate[] = [
  {
    modelId: 'openai:gpt-4o-mini',
    caption: 'A beautiful landscape with mountains and trees in the background',
    createdAt: Date.now(),
    latencyMs: 1250,
    tokensUsed: 85
  },
  {
    modelId: 'google:gemini-pro-vision',
    caption: 'This is a very long caption that should be truncated when displayed initially. It contains a lot of descriptive text about the image that goes on and on to test the expansion functionality.',
    createdAt: Date.now(),
    latencyMs: 890,
    tokensUsed: 120
  },
  {
    modelId: 'anthropic:claude-vision',
    caption: 'Short caption',
    createdAt: Date.now(),
    error: 'API rate limit exceeded'
  }
];

describe('CaptionSelector', () => {
  const mockOnSelectionChange = vi.fn();
  const mockOnTextChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all caption candidates with radio buttons', () => {
    render(
      <CaptionSelector
        candidates={mockCandidates}
        selectedIndex={null}
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
      />
    );

    // Check that all candidates are rendered
    expect(screen.getByText('Openai')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();

    // Check that radio buttons are present
    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(3);
  });

  it('should display provider metadata (latency and tokens)', () => {
    render(
      <CaptionSelector
        candidates={mockCandidates}
        selectedIndex={null}
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
      />
    );

    // Check metadata display
    expect(screen.getByText('1250ms')).toBeInTheDocument();
    expect(screen.getByText('85 tokens')).toBeInTheDocument();
    expect(screen.getByText('890ms')).toBeInTheDocument();
    expect(screen.getByText('120 tokens')).toBeInTheDocument();
  });

  it('should handle caption selection', () => {
    render(
      <CaptionSelector
        candidates={mockCandidates}
        selectedIndex={null}
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
      />
    );

    // Click on the first radio button
    const firstRadio = screen.getByLabelText('Openai');
    fireEvent.click(firstRadio);

    expect(mockOnSelectionChange).toHaveBeenCalledWith(0);
  });

  it('should show selected caption editor when a caption is selected', () => {
    render(
      <CaptionSelector
        candidates={mockCandidates}
        selectedIndex={0}
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
      />
    );

    // Check that selected caption section is visible
    expect(screen.getByText('Selected Caption')).toBeInTheDocument();
    
    // Check that the edit button is present (indicates the editor is shown)
    expect(screen.getByText('Edit')).toBeInTheDocument();
    
    // Check that there are multiple instances of the caption text (one in list, one in editor)
    const captionElements = screen.getAllByText(mockCandidates[0].caption);
    expect(captionElements.length).toBeGreaterThan(1);
  });

  it('should allow editing of selected caption', async () => {
    render(
      <CaptionSelector
        candidates={mockCandidates}
        selectedIndex={0}
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
      />
    );

    // Click edit button
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Check that textarea appears
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();

    // Type in the textarea
    fireEvent.change(textarea, { target: { value: 'Custom edited caption' } });

    expect(mockOnTextChange).toHaveBeenCalledWith('Custom edited caption');
  });

  it('should display custom caption indicator when override is present', () => {
    render(
      <CaptionSelector
        candidates={mockCandidates}
        selectedIndex={0}
        selectedTextOverride="Custom caption text"
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
      />
    );

    // Check for custom caption indicator
    expect(screen.getByText('Custom caption')).toBeInTheDocument();
    expect(screen.getByText('Custom caption text')).toBeInTheDocument();
  });

  it('should handle caption expansion for long text', () => {
    render(
      <CaptionSelector
        candidates={mockCandidates}
        selectedIndex={null}
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
      />
    );

    // Check that long caption is truncated initially
    const showMoreButton = screen.getByText('Show more');
    expect(showMoreButton).toBeInTheDocument();

    // Click to expand
    fireEvent.click(showMoreButton);

    // Check that full text is now visible and button text changed
    expect(screen.getByText('Show less')).toBeInTheDocument();
  });

  it('should display error state for failed captions', () => {
    render(
      <CaptionSelector
        candidates={mockCandidates}
        selectedIndex={null}
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
      />
    );

    // Check that error is displayed
    expect(screen.getByText('Error: API rate limit exceeded')).toBeInTheDocument();
  });

  it('should not show selected caption editor for error candidates', () => {
    render(
      <CaptionSelector
        candidates={mockCandidates}
        selectedIndex={2} // Error candidate
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
      />
    );

    // Selected caption editor should not be visible for error candidates
    expect(screen.queryByText('Selected Caption')).not.toBeInTheDocument();
  });

  it('should return null when no candidates are provided and manual entry is disabled', () => {
    const { container } = render(
      <CaptionSelector
        candidates={[]}
        selectedIndex={null}
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
        allowManualEntry={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should show manual entry option when no candidates are provided but manual entry is allowed', () => {
    render(
      <CaptionSelector
        candidates={[]}
        selectedIndex={null}
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
        allowManualEntry={true}
      />
    );

    expect(screen.getByText('Add Manual Caption')).toBeInTheDocument();
  });

  it('should format provider names correctly', () => {
    const candidatesWithComplexNames: CaptionCandidate[] = [
      {
        modelId: 'openai:gpt-4o-mini',
        caption: 'Test caption',
        createdAt: Date.now()
      },
      {
        modelId: 'simple-model',
        caption: 'Another caption',
        createdAt: Date.now()
      }
    ];

    render(
      <CaptionSelector
        candidates={candidatesWithComplexNames}
        selectedIndex={null}
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
      />
    );

    // Check formatted provider names
    expect(screen.getByText('Openai')).toBeInTheDocument();
    expect(screen.getByText('simple-model')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <CaptionSelector
        candidates={mockCandidates}
        selectedIndex={0}
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
      />
    );

    // Check that radio buttons have proper aria-describedby
    const radioButtons = screen.getAllByRole('radio');
    radioButtons.forEach((radio, index) => {
      expect(radio).toHaveAttribute('aria-describedby', `caption-text-${index}`);
    });

    // Check that error candidates have disabled radio buttons
    const errorRadio = screen.getByLabelText('Anthropic');
    expect(errorRadio).toBeDisabled();

    // Check that textarea has proper aria-label when in edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-label', 'Edit selected caption');
  });

  it('should show retry button for error candidates', () => {
    const mockOnRegenerateProvider = vi.fn();
    const errorCandidates: CaptionCandidate[] = [
      {
        modelId: 'openai:gpt-4o-mini',
        caption: '',
        createdAt: Date.now(),
        error: 'API timeout'
      }
    ];

    render(
      <CaptionSelector
        candidates={errorCandidates}
        selectedIndex={null}
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
        onRegenerateProvider={mockOnRegenerateProvider}
      />
    );

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockOnRegenerateProvider).toHaveBeenCalledWith('openai:gpt-4o-mini');
  });

  it('should show regenerate all button when callback is provided', () => {
    const mockOnRegenerateAll = vi.fn();

    render(
      <CaptionSelector
        candidates={mockCandidates}
        selectedIndex={0}
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
        onRegenerateAll={mockOnRegenerateAll}
      />
    );

    const regenerateButton = screen.getByText('Regenerate All');
    expect(regenerateButton).toBeInTheDocument();

    fireEvent.click(regenerateButton);
    expect(mockOnRegenerateAll).toHaveBeenCalled();
  });

  it('should handle manual caption entry', () => {
    render(
      <CaptionSelector
        candidates={mockCandidates}
        selectedIndex={null}
        onSelectionChange={mockOnSelectionChange}
        onTextChange={mockOnTextChange}
        allowManualEntry={true}
      />
    );

    // Open manual entry
    const manualButton = screen.getByText('Add Manual Caption');
    fireEvent.click(manualButton);

    // Enter manual caption
    const textarea = screen.getByLabelText('Manual caption entry');
    fireEvent.change(textarea, { target: { value: 'My custom caption' } });

    // Use the caption
    const useButton = screen.getByText('Use This Caption');
    fireEvent.click(useButton);

    expect(mockOnTextChange).toHaveBeenCalledWith('My custom caption');
    expect(mockOnSelectionChange).toHaveBeenCalledWith(-1);
  });
});