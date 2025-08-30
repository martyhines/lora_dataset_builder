// Tests for validation functions

import {
  validateCaptionCandidate,
  validateImageDoc,
  validateUserSettings,
  validateImageFile,
  validateImageUrl
} from '../validation';

describe('Validation Functions', () => {
  describe('validateCaptionCandidate', () => {
    it('should validate a correct CaptionCandidate', () => {
      const candidate = {
        modelId: 'openai:gpt-4o-mini',
        caption: 'A test caption',
        createdAt: Date.now(),
        latencyMs: 1000,
        tokensUsed: 50
      };
      
      expect(validateCaptionCandidate(candidate)).toBe(true);
    });

    it('should reject invalid CaptionCandidate', () => {
      const invalidCandidate = {
        modelId: '',
        caption: 123, // should be string
        createdAt: 'invalid' // should be number
      };
      
      expect(validateCaptionCandidate(invalidCandidate)).toBe(false);
    });
  });

  describe('validateImageDoc', () => {
    it('should validate a correct ImageDoc', () => {
      const imageDoc = {
        id: 'test-id',
        filename: 'test.jpg',
        storagePath: 'gs://bucket/path',
        downloadURL: 'https://example.com/image.jpg',
        status: 'complete' as const,
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      expect(validateImageDoc(imageDoc)).toBe(true);
    });

    it('should reject ImageDoc with invalid status', () => {
      const invalidImageDoc = {
        id: 'test-id',
        filename: 'test.jpg',
        storagePath: 'gs://bucket/path',
        downloadURL: 'https://example.com/image.jpg',
        status: 'invalid-status',
        candidates: [],
        selectedIndex: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      expect(validateImageDoc(invalidImageDoc)).toBe(false);
    });
  });

  describe('validateUserSettings', () => {
    it('should validate correct UserSettings', () => {
      const settings = {
        showDlButton: true,
        preferences: {
          defaultProviders: ['openai', 'gemini'],
          autoRegenerate: false
        }
      };
      
      expect(validateUserSettings(settings)).toBe(true);
    });

    it('should validate minimal UserSettings', () => {
      const settings = {
        showDlButton: false
      };
      
      expect(validateUserSettings(settings)).toBe(true);
    });
  });

  describe('validateImageFile', () => {
    it('should validate correct image file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      expect(validateImageFile(file)).toBe(true);
    });

    it('should reject non-image file', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      expect(validateImageFile(file)).toBe(false);
    });
  });

  describe('validateImageUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateImageUrl('https://example.com/image.jpg')).toBe(true);
      expect(validateImageUrl('http://example.com/image.png')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateImageUrl('not-a-url')).toBe(false);
      expect(validateImageUrl('ftp://example.com/image.jpg')).toBe(false);
    });
  });
});