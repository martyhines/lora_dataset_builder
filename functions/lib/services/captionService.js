"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionService = void 0;
const registry_1 = require("../providers/registry");
class CaptionService {
    constructor() {
        this.registry = new registry_1.ProviderRegistry();
    }
    async generateCaption(providerId, request) {
        // Validate provider exists and is enabled
        if (!this.registry.isProviderEnabled(providerId)) {
            throw this.createError(`Provider '${providerId}' is not available or disabled`, 400);
        }
        const provider = this.registry.getProvider(providerId);
        if (!provider) {
            throw this.createError(`Provider '${providerId}' not found`, 404);
        }
        try {
            const result = await provider.callProvider(request.imageUrl, request.options);
            // Validate result
            if (!result.caption || typeof result.caption !== 'string') {
                throw this.createError(`Invalid response from provider '${providerId}'`, 500);
            }
            return result;
        }
        catch (error) {
            // Re-throw ProxyError as-is
            if (error instanceof Error && 'statusCode' in error) {
                throw error;
            }
            // Wrap other errors
            throw this.createError(`Provider '${providerId}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
        }
    }
    async generateCaptionFromMultipleProviders(providerIds, request) {
        if (!providerIds || providerIds.length === 0) {
            providerIds = this.registry.getAvailableProviders();
        }
        if (providerIds.length === 0) {
            throw this.createError('No providers available', 503);
        }
        // Generate captions in parallel
        const promises = providerIds.map(async (providerId) => {
            try {
                return await this.generateCaption(providerId, request);
            }
            catch (error) {
                // Return error result instead of throwing
                return {
                    modelId: providerId,
                    caption: '',
                    latency: 0,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });
        const results = await Promise.all(promises);
        // Check if at least one provider succeeded
        const successfulResults = results.filter(r => !r.error);
        if (successfulResults.length === 0) {
            throw this.createError('All providers failed to generate captions', 500);
        }
        return results;
    }
    getAvailableProviders() {
        return this.registry.getAvailableProviders();
    }
    getProviderInfo() {
        const availableProviders = this.registry.getAvailableProviders();
        return availableProviders.map(id => ({
            id,
            enabled: this.registry.isProviderEnabled(id)
        }));
    }
    createError(message, statusCode = 500) {
        const error = new Error(message);
        error.statusCode = statusCode;
        return error;
    }
}
exports.CaptionService = CaptionService;
//# sourceMappingURL=captionService.js.map