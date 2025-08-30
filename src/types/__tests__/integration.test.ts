// Integration tests to verify types work with existing code structure

import {
  ImageDoc,
  UserSettings,
  createImageDoc,
  createCaptionCandidate,
  createDefaultUserSettings,
  validateImageDoc,
  validateCaptionCandidate,
  validateUserSettings,
  imagesToDatasetEntries,
  getSelectedCaption
} from '../index';

describe('Type Integration Tests', () => {
  it('should create and validate a complete workflow', () => {
    // Create an image document
    const imageDoc = createImageDoc(
      'test-image-123',
      'sample-image.jpg',
      'gs://my-bucket/uploads/user123/test-image-123/sample-image.jpg',
      'https://firebasestorage.googleapis.com/v0/b/my-bucket/o/uploads%2Fuser123%2Ftest-image-123%2Fsample-image.jpg?alt=media'
    );

    // Validate the created image document
    expect(validateImageDoc(imageDoc)).toBe(true);
    expect(imageDoc.status).toBe('pending');
    expect(imageDoc.candidates).toHaveLength(0);

    // Add caption candidates
    const candidate1 = createCaptionCandidate(
      'openai:gpt-4o-mini',
      'A beautiful landscape with mountains and trees',
      1250,
      85
    );

    const candidate2 = createCaptionCandidate(
      'google:gemini-pro-vision',
      'Scenic mountain view with forest in the foreground',
      980,
      72
    );

    // Validate candidates
    expect(validateCaptionCandidate(candidate1)).toBe(true);
    expect(validateCaptionCandidate(candidate2)).toBe(true);

    // Update image with candidates
    const updatedImage: ImageDoc = {
      ...imageDoc,
      status: 'complete',
      candidates: [candidate1, candidate2],
      selectedIndex: 0,
      updatedAt: Date.now()
    };

    // Validate updated image
    expect(validateImageDoc(updatedImage)).toBe(true);
    expect(getSelectedCaption(updatedImage)).toBe('A beautiful landscape with mountains and trees');

    // Test with text override
    const imageWithOverride: ImageDoc = {
      ...updatedImage,
      selectedTextOverride: 'Custom caption for training data'
    };

    expect(getSelectedCaption(imageWithOverride)).toBe('Custom caption for training data');

    // Test dataset export
    const images = [updatedImage, imageWithOverride];
    const datasetEntries = imagesToDatasetEntries(images);

    expect(datasetEntries).toHaveLength(2);
    expect(datasetEntries[0].caption).toBe('A beautiful landscape with mountains and trees');
    expect(datasetEntries[1].caption).toBe('Custom caption for training data');
    expect(datasetEntries[0].url).toBe(updatedImage.downloadURL);
    expect(datasetEntries[0].filename).toBe(updatedImage.filename);
  });

  it('should create and validate user settings', () => {
    const defaultSettings = createDefaultUserSettings();
    expect(validateUserSettings(defaultSettings)).toBe(true);
    expect(defaultSettings.showDlButton).toBe(false);
    expect(defaultSettings.preferences?.autoRegenerate).toBe(true);

    const customSettings: UserSettings = {
      showDlButton: true,
      preferences: {
        defaultProviders: ['openai:gpt-4o-mini', 'google:gemini-pro-vision'],
        autoRegenerate: false
      }
    };

    expect(validateUserSettings(customSettings)).toBe(true);
  });

  it('should handle error scenarios correctly', () => {
    // Test image with error status
    const errorImage = createImageDoc('error-id', 'error.jpg', 'path', 'https://example.com/error.jpg');
    errorImage.status = 'error';
    errorImage.error = 'Failed to process image';

    expect(validateImageDoc(errorImage)).toBe(true);
    expect(getSelectedCaption(errorImage)).toBe('');

    // Test candidate with error
    const errorCandidate = createCaptionCandidate(
      'openai:gpt-4o-mini',
      '',
      undefined,
      undefined,
      'API rate limit exceeded'
    );

    expect(validateCaptionCandidate(errorCandidate)).toBe(true);
    expect(errorCandidate.error).toBe('API rate limit exceeded');
  });

  it('should filter incomplete images from dataset export', () => {
    const completeImage = createImageDoc('complete', 'complete.jpg', 'path', 'url');
    completeImage.status = 'complete';
    completeImage.candidates = [createCaptionCandidate('model', 'Caption')];
    completeImage.selectedIndex = 0;

    const pendingImage = createImageDoc('pending', 'pending.jpg', 'path', 'url');
    pendingImage.status = 'pending';

    const errorImage = createImageDoc('error', 'error.jpg', 'path', 'url');
    errorImage.status = 'error';

    const images = [completeImage, pendingImage, errorImage];
    const datasetEntries = imagesToDatasetEntries(images);

    // Only the complete image with selected caption should be exported
    expect(datasetEntries).toHaveLength(1);
    expect(datasetEntries[0].filename).toBe('complete.jpg');
  });
});