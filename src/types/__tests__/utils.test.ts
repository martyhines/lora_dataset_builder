// Tests for utility functions

import {
  createImageDoc,
  createCaptionCandidate,
  createDefaultUserSettings,
  getSelectedCaption,
  calculateUploadProgress,
  sanitizeFilename,
  sanitizeCaption,
  getFileExtension,
  isSupportedImageExtension,
  formatFileSize
} from '../utils';

describe('Utility Functions', () => {
  describe('createImageDoc', () => {
    it('should create a valid ImageDoc', () => {
      const imageDoc = createImageDoc(
        'test-id',
        'test.jpg',
        'gs://bucket/path',
        'https://example.com/image.jpg'
      );
      
      expect(imageDoc.id).toBe('test-id');
      expect(imageDoc.filename).toBe('test.jpg');
      expect(imageDoc.status).toBe('pending');
      expect(imageDoc.candidates).toEqual([]);
      expect(imageDoc.selectedIndex).toBeNull();
      expect(typeof imageDoc.createdAt).toBe('number');
      expect(typeof imageDoc.updatedAt).toBe('number');
    });
  });

  describe('createCaptionCandidate', () => {
    it('should create a valid CaptionCandidate', () => {
      const candidate = createCaptionCandidate(
        'openai:gpt-4o-mini',
        'Test caption',
        1000,
        50
      );
      
      expect(candidate.modelId).toBe('openai:gpt-4o-mini');
      expect(candidate.caption).toBe('Test caption');
      expect(candidate.latencyMs).toBe(1000);
      expect(candidate.tokensUsed).toBe(50);
      expect(typeof candidate.createdAt).toBe('number');
    });
  });

  describe('createDefaultUserSettings', () => {
    it('should create default UserSettings', () => {
      const settings = createDefaultUserSettings();
      
      expect(settings.showDlButton).toBe(false);
      expect(settings.preferences?.defaultProviders).toEqual([]);
      expect(settings.preferences?.autoRegenerate).toBe(true);
    });
  });

  describe('getSelectedCaption', () => {
    it('should return selectedTextOverride when available', () => {
      const imageDoc = createImageDoc('id', 'test.jpg', 'path', 'url');
      imageDoc.selectedTextOverride = 'Custom caption';
      imageDoc.candidates = [createCaptionCandidate('model1', 'Original caption')];
      imageDoc.selectedIndex = 0;
      
      expect(getSelectedCaption(imageDoc)).toBe('Custom caption');
    });

    it('should return selected candidate caption when no override', () => {
      const imageDoc = createImageDoc('id', 'test.jpg', 'path', 'url');
      imageDoc.candidates = [createCaptionCandidate('model1', 'Selected caption')];
      imageDoc.selectedIndex = 0;
      
      expect(getSelectedCaption(imageDoc)).toBe('Selected caption');
    });

    it('should return empty string when no selection', () => {
      const imageDoc = createImageDoc('id', 'test.jpg', 'path', 'url');
      imageDoc.candidates = [createCaptionCandidate('model1', 'Caption')];
      imageDoc.selectedIndex = null;
      
      expect(getSelectedCaption(imageDoc)).toBe('');
    });
  });

  describe('calculateUploadProgress', () => {
    it('should calculate progress correctly', () => {
      const images = [
        { ...createImageDoc('1', 'test1.jpg', 'path', 'url'), status: 'complete' as const },
        { ...createImageDoc('2', 'test2.jpg', 'path', 'url'), status: 'processing' as const },
        { ...createImageDoc('3', 'test3.jpg', 'path', 'url'), status: 'error' as const },
        { ...createImageDoc('4', 'test4.jpg', 'path', 'url'), status: 'pending' as const }
      ];
      
      const progress = calculateUploadProgress(images);
      
      expect(progress.total).toBe(4);
      expect(progress.completed).toBe(1);
      expect(progress.failed).toBe(1);
      expect(progress.inProgress).toBe(2);
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeFilename('test<>file.jpg')).toBe('test__file.jpg');
      expect(sanitizeFilename('path/to/file.jpg')).toBe('pathtofile.jpg');
    });
  });

  describe('sanitizeCaption', () => {
    it('should remove control characters and trim', () => {
      expect(sanitizeCaption('  Test caption\x00  ')).toBe('Test caption');
    });

    it('should limit length', () => {
      const longCaption = 'a'.repeat(3000);
      expect(sanitizeCaption(longCaption)).toHaveLength(2000);
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(getFileExtension('test.jpg')).toBe('jpg');
      expect(getFileExtension('image.PNG')).toBe('png');
      expect(getFileExtension('noextension')).toBe('');
    });
  });

  describe('isSupportedImageExtension', () => {
    it('should validate supported extensions', () => {
      expect(isSupportedImageExtension('jpg')).toBe(true);
      expect(isSupportedImageExtension('PNG')).toBe(true);
      expect(isSupportedImageExtension('webp')).toBe(true);
      expect(isSupportedImageExtension('txt')).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
    });
  });
});