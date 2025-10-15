import type { CaptionCandidate } from '../types';

export interface CaptionRequest {
  imageUrl: string;
  options?: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  };
}

export interface CaptionResult {
  modelId: string;
  caption: string;
  latency: number;
  tokensUsed?: number;
  error?: string;
}

export interface CaptionProxyResponse {
  success: boolean;
  result?: CaptionResult;
  results?: CaptionResult[];
  error?: string;
  message?: string;
  timestamp: string;
}

export class CaptionProxyService {
  private baseUrl: string;

  constructor() {
    // Production Firebase Functions URL
    const PRODUCTION_URL = 'https://us-central1-lora-dataset-builder-prod.cloudfunctions.net/captionProxy';
    // Development URL (for local testing)
    const DEVELOPMENT_URL = 'http://localhost:5001/lora-dataset-builder/us-central1/captionProxy';
    
    this.baseUrl = import.meta.env.PROD ? PRODUCTION_URL : DEVELOPMENT_URL;
  }

  async getAvailableProviders(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/caption/providers`);
      const data: CaptionProxyResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get providers');
      }
      
      return (data as any).providers?.map((p: any) => p.id) || ['openai', 'gemini'];
    } catch (error) {
      console.error('Failed to get available providers:', error);
      // Fallback to default providers
      return ['openai', 'gemini'];
    }
  }

  async generateCaption(provider: string, request: CaptionRequest): Promise<CaptionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/caption/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: CaptionProxyResponse = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      if (!data.result) {
        throw new Error('No result returned from proxy');
      }

      return data.result;
    } catch (error) {
      console.error(`Failed to generate caption with ${provider}:`, error);
      throw error;
    }
  }

  async generateCaptionsFromMultipleProviders(
    request: CaptionRequest,
    providers?: string[]
  ): Promise<CaptionResult[]> {
    try {
      const url = new URL(`${this.baseUrl}/api/caption/batch`);
      if (providers && providers.length > 0) {
        url.searchParams.set('providers', providers.join(','));
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: CaptionProxyResponse = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data.results || [];
    } catch (error) {
      console.error('Failed to generate captions from multiple providers:', error);
      throw error;
    }
  }

  resultsToCandidate(results: CaptionResult[]): CaptionCandidate[] {
    return results.map(result => ({
      modelId: result.modelId,
      caption: result.caption,
      createdAt: Date.now(),
      latencyMs: result.latency,
      tokensUsed: result.tokensUsed,
      error: result.error || undefined
    }));
  }
}

export const captionProxyService = new CaptionProxyService();