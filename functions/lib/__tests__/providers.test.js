"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("../providers/openai");
const gemini_1 = require("../providers/gemini");
const registry_1 = require("../providers/registry");
describe('Vision Providers', () => {
    describe('OpenAIProvider', () => {
        it('should create instance with API key', () => {
            const provider = new openai_1.OpenAIProvider('test-key');
            expect(provider.id).toBe('openai:gpt-4o-mini');
        });
        it('should throw error without API key', () => {
            expect(() => new openai_1.OpenAIProvider('')).toThrow('OpenAI API key is required');
        });
        it('should validate image URL', async () => {
            const provider = new openai_1.OpenAIProvider('test-key');
            await expect(provider.callProvider('invalid-url')).rejects.toThrow('Malformed image URL');
        });
    });
    describe('GeminiProvider', () => {
        it('should create instance with API key', () => {
            const provider = new gemini_1.GeminiProvider('test-key');
            expect(provider.id).toBe('google:gemini-pro-vision');
        });
        it('should throw error without API key', () => {
            expect(() => new gemini_1.GeminiProvider('')).toThrow('Gemini API key is required');
        });
        it('should validate image URL', async () => {
            const provider = new gemini_1.GeminiProvider('test-key');
            await expect(provider.callProvider('invalid-url')).rejects.toThrow('Malformed image URL');
        });
    });
    describe('ProviderRegistry', () => {
        it('should initialize without API keys', () => {
            const registry = new registry_1.ProviderRegistry();
            expect(registry.getAvailableProviders()).toEqual([]);
        });
        it('should register providers dynamically', () => {
            const registry = new registry_1.ProviderRegistry();
            const mockProvider = new openai_1.OpenAIProvider('test-key');
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
            const registry = new registry_1.ProviderRegistry();
            const mockProvider = new openai_1.OpenAIProvider('test-key');
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
//# sourceMappingURL=providers.test.js.map