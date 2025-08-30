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
    this.baseUrl = import.meta.env.VITE_CAPTION_PROXY_URL || 'http://localhost:5001/lora-dataset-builder/us-central1/captionProxy';
  }

  async getAvailableProviders(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/caption/providers`);
      const data: CaptionProxyResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get providers');
      }
      
      return (data as any).providers?.map((p: any) => p.id) || [];
    } catch (error) {
      console.error('Failed to get available providers:', error);
      throw error;
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

  async checkHealth(): Promise<{ status: string; providers: any[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/caption/health`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Health check failed');
      }
      
      return {
        status: data.status,
        providers: data.providers || []
      };
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Convert CaptionResult to CaptionCandidate format used by the app
  resultToCandidate(result: CaptionResult): CaptionCandidate {
    return {
      modelId: result.modelId,
      caption: result.caption,
      createdAt: Date.now(),
      latencyMs: result.latency,
      tokensUsed: result.tokensUsed,
      error: result.error
    };
  }

  // Batch convert results to candidates
  resultsToCandidate(results: CaptionResult[]): CaptionCandidate[] {
    return results.map(result => this.resultToCandidate(result));
  }
}

// Export an instance of the service
export const captionProxyService = new CaptionProxyService();