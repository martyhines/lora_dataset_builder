import { OpenAIProvider } from '../providers/openai';
import { GeminiProvider } from '../providers/gemini';
import { ProviderRegistry } from '../providers/registry';

describe('Vision Providers', () => {
  describe('OpenAIProvider', () => {
    it('should create instance with API key', () => {
      const provider = new OpenAIProvider('test-key');
      expect(provider.id).toBe('openai:gpt-4o-mini');
    });

    it('should throw error without API key', () => {
      expect(() => new OpenAIProvider('')).toThrow('OpenAI API key is required');
    });

    it('should validate image URL', async () => {
      const provider = new OpenAIProvider('test-key');
      await expect(provider.callProvider('invalid-url')).rejects.toThrow('Malformed image URL');
    });
  });

  describe('GeminiProvider', () => {
    it('should create instance with API key', () => {
      const provider = new GeminiProvider('test-key');
      expect(provider.id).toBe('google:gemini-pro-vision');
    });

    it('should throw error without API key', () => {
      expect(() => new GeminiProvider('')).toThrow('Gemini API key is required');
    });

    it('should validate image URL', async () => {
      const provider = new GeminiProvider('test-key');
      await expect(provider.callProvider('invalid-url')).rejects.toThrow('Malformed image URL');
    });
  });

  describe('ProviderRegistry', () => {
    it('should initialize without API keys', () => {
      const registry = new ProviderRegistry();
      expect(registry.getAvailableProviders()).toEqual([]);
    });

    it('should register providers dynamically', () => {
      const registry = new ProviderRegistry();
      const mockProvider = new OpenAIProvider('test-key');
      
      registry.registerProvider(mockProvider, {
        id: mockProvider.id,
        enabled: true,
        timeout: 30000,
        maxRetries: 3
      });

      expect(registry.getAvailableProviders()).toContain(mockProvider.id);
      expect(registry.getProvider(mockProvider.id)).toBe(mockProvider);
    });

    it('should handle provider enabling/disabling', () => {
      const registry = new ProviderRegistry();
      const mockProvider = new OpenAIProvider('test-key');
      
      registry.registerProvider(mockProvider, {
        id: mockProvider.id,
        enabled: true,
        timeout: 30000,
        maxRetries: 3
      });

      expect(registry.isProviderEnabled(mockProvider.id)).toBe(true);
      
      registry.setProviderEnabled(mockProvider.id, false);
      expect(registry.isProviderEnabled(mockProvider.id)).toBe(false);
    });
  });
});