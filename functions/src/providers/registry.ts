import { VisionProvider, ProviderConfig } from '../types';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';

export class ProviderRegistry {
  private providers: Map<string, VisionProvider> = new Map();
  private configs: Map<string, ProviderConfig> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Read API keys from environment variables
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    console.log('ProviderRegistry: Initializing providers');
    console.log('ProviderRegistry: OpenAI key available:', !!openaiKey);
    console.log('ProviderRegistry: Gemini key available:', !!geminiKey);

    // Initialize OpenAI provider if API key is available
    if (openaiKey) {
      const openaiProvider = new OpenAIProvider(openaiKey, 30000, 3);
      this.providers.set(openaiProvider.id, openaiProvider);
      this.configs.set(openaiProvider.id, {
        id: openaiProvider.id,
        enabled: true,
        timeout: 30000,
        maxRetries: 3
      });
      console.log('ProviderRegistry: OpenAI provider initialized');
    }

    // Initialize Gemini provider if API key is available
    if (geminiKey) {
      const geminiProvider = new GeminiProvider(geminiKey, 30000, 3);
      this.providers.set(geminiProvider.id, geminiProvider);
      this.configs.set(geminiProvider.id, {
        id: geminiProvider.id,
        enabled: true,
        timeout: 30000,
        maxRetries: 3
      });
      console.log('ProviderRegistry: Gemini provider initialized');
    }

    console.log('ProviderRegistry: Available providers:', this.getAvailableProviders());
  }

  getProvider(providerId: string): VisionProvider | undefined {
    return this.providers.get(providerId);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys()).filter(id => {
      const config = this.configs.get(id);
      return config?.enabled !== false;
    });
  }

  getAllProviders(): VisionProvider[] {
    return Array.from(this.providers.values()).filter(provider => {
      const config = this.configs.get(provider.id);
      return config?.enabled !== false;
    });
  }

  isProviderEnabled(providerId: string): boolean {
    const config = this.configs.get(providerId);
    return config?.enabled !== false && this.providers.has(providerId);
  }

  setProviderEnabled(providerId: string, enabled: boolean): void {
    const config = this.configs.get(providerId);
    if (config) {
      config.enabled = enabled;
    }
  }

  getProviderConfig(providerId: string): ProviderConfig | undefined {
    return this.configs.get(providerId);
  }

  // Method to add new providers dynamically (for extensibility)
  registerProvider(provider: VisionProvider, config: ProviderConfig): void {
    this.providers.set(provider.id, provider);
    this.configs.set(provider.id, config);
  }
}