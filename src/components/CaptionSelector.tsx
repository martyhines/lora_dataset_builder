import React, { useState, useCallback, useRef } from 'react';
import type { CaptionCandidate } from '../types';
import { generateId, announceToScreenReader, handleKeyboardActivation, KeyboardKeys } from '../utils/accessibility';

export interface CaptionSelectorProps {
  candidates: CaptionCandidate[];
  selectedIndex: number | null;
  onSelectionChange: (index: number) => void;
  selectedTextOverride?: string;
  onTextChange: (text: string) => void;
  onRegenerateProvider?: (modelId: string) => void;
  onRegenerateAll?: () => void;
  allowManualEntry?: boolean;
}

/**
 * Component for selecting and editing captions from multiple providers
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
export function CaptionSelector({
  candidates,
  selectedIndex,
  onSelectionChange,
  selectedTextOverride,
  onTextChange,
  onRegenerateProvider,
  onRegenerateAll,
  allowManualEntry = true
}: CaptionSelectorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [expandedCaptions, setExpandedCaptions] = useState<Set<number>>(new Set());
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCaption, setManualCaption] = useState('');
  
  // Accessibility IDs
  const selectorId = useRef(generateId('caption-selector'));
  const groupId = useRef(generateId('caption-group'));
  const selectedCaptionId = useRef(generateId('selected-caption'));
  const manualEntryId = useRef(generateId('manual-entry'));

  // Get the display text for the selected caption
  const getSelectedText = useCallback(() => {
    if (selectedTextOverride !== undefined) {
      return selectedTextOverride;
    }
    if (selectedIndex !== null && candidates[selectedIndex]) {
      return candidates[selectedIndex].caption;
    }
    return '';
  }, [selectedTextOverride, selectedIndex, candidates]);

  // Handle caption selection
  const handleSelection = useCallback((index: number) => {
    onSelectionChange(index);
    setIsEditing(false);
    setShowManualEntry(false);
    
    const provider = formatProviderName(candidates[index]?.modelId || '');
    announceToScreenReader(`Selected caption from ${provider}`);
  }, [onSelectionChange, candidates]);

  // Handle manual caption selection
  const handleManualSelection = useCallback(() => {
    if (manualCaption.trim()) {
      onTextChange(manualCaption.trim());
      onSelectionChange(-1); // Use -1 to indicate manual entry
      setShowManualEntry(false);
      announceToScreenReader('Manual caption selected');
    }
  }, [manualCaption, onTextChange, onSelectionChange]);

  // Handle text editing
  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(event.target.value);
  }, [onTextChange]);

  // Toggle caption expansion
  const toggleExpansion = useCallback((index: number) => {
    setExpandedCaptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // Format provider name for display
  const formatProviderName = (modelId: string) => {
    const parts = modelId.split(':');
    if (parts.length > 1) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return modelId;
  };



  // Check if all candidates have errors
  const allCandidatesHaveErrors = candidates.length > 0 && candidates.every(c => c.error);
  const hasValidCandidates = candidates.some(c => !c.error);

  if (candidates.length === 0 && !allowManualEntry) {
    return null;
  }

  return (
    <div className="space-y-3" role="region" aria-labelledby={`${selectorId.current}-title`}>
      <h4 id={`${selectorId.current}-title`} className="sr-only">Caption Selection</h4>
      
      {/* Caption Options */}
      <fieldset className="space-y-2">
        <legend className="sr-only">Choose a caption from the available options</legend>
        {candidates.map((candidate, index) => (
          <div key={index} className="border border-gray-600 rounded-lg p-3">
            {/* Provider Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {/* <input
                  type="radio"
                  id={`caption-${index}`}
                  name={`${groupId.current}-selection`}
                  checked={selectedIndex === index}
                  onChange={() => handleSelection(index)}
                  className="text-blue-500 focus:ring-blue-500 focus:ring-2"
                  aria-describedby={`caption-text-${index} caption-meta-${index}`}
                  disabled={!!candidate.error}
                /> */}
                <label 
                  htmlFor={`caption-${index}`}
                  className="text-sm font-medium text-gray-300 cursor-pointer"
                >
                  {formatProviderName(candidate.modelId)}
                </label>
              </div>
              
              {/* Provider Metadata */}
              <div id={`caption-meta-${index}`} className="flex items-center gap-2 text-xs text-gray-500">
                {candidate.latencyMs && (
                  <span aria-label={`Response time: ${candidate.latencyMs} milliseconds`}>
                    {candidate.latencyMs}ms
                  </span>
                )}
                {candidate.tokensUsed && (
                  <span aria-label={`Tokens used: ${candidate.tokensUsed}`}>
                    {candidate.tokensUsed} tokens
                  </span>
                )}
              </div>
            </div>

            {/* Caption Text */}
            {candidate.error ? (
              <div className="flex items-center justify-between">
                <div 
                  className="text-red-400 text-sm bg-red-900/20 p-2 rounded flex-1"
                  role="alert"
                  aria-live="polite"
                >
                  Error: {candidate.error}
                </div>
                {onRegenerateProvider && (
                  <button
                    onClick={() => onRegenerateProvider(candidate.modelId)}
                    className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Retry caption generation for ${formatProviderName(candidate.modelId)}`}
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-200">
                <p 
                  id={`caption-text-${index}`}
                  className={expandedCaptions.has(index) ? '' : 'line-clamp-3'}
                >
                  {candidate.caption}
                </p>
                
                {candidate.caption.length > 100 && (
                  <button
                    onClick={() => toggleExpansion(index)}
                    className="mt-1 text-blue-400 hover:text-blue-300 text-xs underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-expanded={expandedCaptions.has(index)}
                    aria-controls={`caption-text-${index}`}
                  >
                    {expandedCaptions.has(index) ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </fieldset>

      {/* Regeneration Controls */}
      {(onRegenerateAll || allowManualEntry) && (
        <div className="flex gap-2 pt-2 border-t border-gray-600">
          {onRegenerateAll && (
            <button
              onClick={onRegenerateAll}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Regenerate captions from all providers"
            >
              Regenerate All
            </button>
          )}
          {allowManualEntry && (
            <button
              onClick={() => setShowManualEntry(!showManualEntry)}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-expanded={showManualEntry}
              aria-controls={manualEntryId.current}
            >
              {showManualEntry ? 'Cancel Manual Entry' : 'Add Manual Caption'}
            </button>
          )}
        </div>
      )}

      {/* Manual Caption Entry */}
      {showManualEntry && allowManualEntry && (
        <div 
          id={manualEntryId.current}
          className="border border-yellow-600 rounded-lg p-3 bg-yellow-900/10"
          role="region"
          aria-labelledby={`${manualEntryId.current}-title`}
        >
          <h4 id={`${manualEntryId.current}-title`} className="text-sm font-medium text-yellow-300 mb-2">
            Manual Caption Entry
          </h4>
          <label htmlFor={`${manualEntryId.current}-textarea`} className="sr-only">
            Enter your custom caption text
          </label>
          <textarea
            id={`${manualEntryId.current}-textarea`}
            value={manualCaption}
            onChange={(e) => setManualCaption(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200 resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            rows={3}
            placeholder="Enter your custom caption..."
            aria-describedby={`${manualEntryId.current}-help`}
          />
          <div id={`${manualEntryId.current}-help`} className="sr-only">
            Enter a custom caption for this image. This will override any AI-generated captions.
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleManualSelection}
              disabled={!manualCaption.trim()}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Use This Caption
            </button>
            <button
              onClick={() => {
                setShowManualEntry(false);
                setManualCaption('');
              }}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Selected Caption Editor */}
      {((selectedIndex !== null && selectedIndex >= 0 && !candidates[selectedIndex]?.error) || 
        (selectedIndex === -1 && selectedTextOverride)) && (
        <div 
          id={selectedCaptionId.current}
          className="border border-blue-600 rounded-lg p-3 bg-blue-900/10"
          role="region"
          aria-labelledby={`${selectedCaptionId.current}-title`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 id={`${selectedCaptionId.current}-title`} className="text-sm font-medium text-blue-300">
              {selectedIndex === -1 ? 'Manual Caption' : 'Selected Caption'}
            </h4>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-expanded={isEditing}
              aria-controls={`${selectedCaptionId.current}-editor`}
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <div>
              <label htmlFor={`${selectedCaptionId.current}-editor`} className="sr-only">
                Edit the selected caption text
              </label>
              <textarea
                id={`${selectedCaptionId.current}-editor`}
                value={getSelectedText()}
                onChange={handleTextChange}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter your caption..."
                aria-describedby={`${selectedCaptionId.current}-help`}
              />
              <div id={`${selectedCaptionId.current}-help`} className="sr-only">
                Edit the caption text. Changes will be saved automatically.
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-200 whitespace-pre-wrap" aria-live="polite">
              {getSelectedText() || 'No caption selected'}
            </p>
          )}

          {selectedTextOverride !== undefined && (
            <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1" role="status">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span aria-label={selectedIndex === -1 ? 'This is a manually entered caption' : 'This caption has been customized'}>
                {selectedIndex === -1 ? 'Manual caption' : 'Custom caption'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}