"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderRegistry = void 0;
const openai_1 = require("./openai");
const gemini_1 = require("./gemini");
class ProviderRegistry {
    constructor() {
        this.providers = new Map();
        this.configs = new Map();
        this.initializeProviders();
    }
    initializeProviders() {
        // Initialize OpenAI provider if API key is available
        const openaiKey = process.env.OPENAI_API_KEY;
        if (openaiKey) {
            const openaiProvider = new openai_1.OpenAIProvider(openaiKey, 30000, 3);
            this.providers.set(openaiProvider.id, openaiProvider);
            this.configs.set(openaiProvider.id, {
                id: openaiProvider.id,
                enabled: true,
                timeout: 30000,
                maxRetries: 3
            });
        }
        // Initialize Gemini provider if API key is available
        const geminiKey = process.env.GEMINI_API_KEY;
        if (geminiKey) {
            const geminiProvider = new gemini_1.GeminiProvider(geminiKey, 30000, 3);
            this.providers.set(geminiProvider.id, geminiProvider);
            this.configs.set(geminiProvider.id, {
                id: geminiProvider.id,
                enabled: true,
                timeout: 30000,
                maxRetries: 3
            });
        }
    }
    getProvider(providerId) {
        return this.providers.get(providerId);
    }
    getAvailableProviders() {
        return Array.from(this.providers.keys()).filter(id => {
            const config = this.configs.get(id);
            return (config === null || config === void 0 ? void 0 : config.enabled) !== false;
        });
    }
    getAllProviders() {
        return Array.from(this.providers.values()).filter(provider => {
            const config = this.configs.get(provider.id);
            return (config === null || config === void 0 ? void 0 : config.enabled) !== false;
        });
    }
    isProviderEnabled(providerId) {
        const config = this.configs.get(providerId);
        return (config === null || config === void 0 ? void 0 : config.enabled) !== false && this.providers.has(providerId);
    }
    setProviderEnabled(providerId, enabled) {
        const config = this.configs.get(providerId);
        if (config) {
            config.enabled = enabled;
        }
    }
    getProviderConfig(providerId) {
        return this.configs.get(providerId);
    }
    // Method to add new providers dynamically (for extensibility)
    registerProvider(provider, config) {
        this.providers.set(provider.id, provider);
        this.configs.set(provider.id, config);
    }
}
exports.ProviderRegistry = ProviderRegistry;
//# sourceMappingURL=registry.js.map