import { ProviderRegistry } from '../providers/registry';
import { CaptionRequest, CaptionResult, ProxyError } from '../types';

export class CaptionService {
  private registry: ProviderRegistry;

  constructor() {
    this.registry = new ProviderRegistry();
  }

  async generateCaption(providerId: string, request: CaptionRequest): Promise<CaptionResult> {
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
    } catch (error) {
      // Re-throw ProxyError as-is
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      // Wrap other errors
      throw this.createError(
        `Provider '${providerId}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  async generateCaptionFromMultipleProviders(
    providerIds: string[],
    request: CaptionRequest
  ): Promise<CaptionResult[]> {
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
      } catch (error) {
        // Return error result instead of throwing
        return {
          modelId: providerId,
          caption: '',
          latency: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        } as CaptionResult;
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

  getAvailableProviders(): string[] {
    return this.registry.getAvailableProviders();
  }

  getProviderInfo(): Array<{ id: string; enabled: boolean }> {
    const availableProviders = this.registry.getAvailableProviders();
    return availableProviders.map(id => ({
      id,
      enabled: this.registry.isProviderEnabled(id)
    }));
  }

  private createError(message: string, statusCode: number = 500): ProxyError {
    const error = new Error(message) as ProxyError;
    error.statusCode = statusCode;
    return error;
  }
}