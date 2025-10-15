import { Router, Request, Response, NextFunction } from 'express';
import { CaptionService } from '../services/captionService';
import { validateCaptionRequest, validateProvider } from '../middleware/validation';
import { captionRateLimit } from '../middleware/rateLimit';
import { CaptionRequest } from '../types';

const router = Router();
const captionService = new CaptionService();

// Get available providers
router.get('/providers', (req: Request, res: Response, next: NextFunction) => {
  try {
    const providers = captionService.getProviderInfo();
    res.json({
      success: true,
      providers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Generate captions from multiple providers (must come before /:provider route)
router.post(
  '/batch',
  captionRateLimit,
  validateCaptionRequest,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const request: CaptionRequest = req.body;
      const { providers } = req.query;

      let providerIds: string[] = [];
      if (providers && typeof providers === 'string') {
        // Map short names to full provider IDs
        const providerMap: { [key: string]: string } = {
          'openai': 'openai:gpt-4o-mini',
          'gemini': 'google:gemini-2.0-flash'
        };

        providerIds = providers.split(',').map(p => {
          const mapped = providerMap[p.trim()];
          if (!mapped) {
            throw new Error(`Unknown provider: ${p}`);
          }
          return mapped;
        });
      }

      const results = await captionService.generateCaptionFromMultipleProviders(providerIds, request);

      res.json({
        success: true,
        results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

// Generate caption from specific provider
router.post(
  '/:provider',
  captionRateLimit,
  validateProvider,
  validateCaptionRequest,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { provider } = req.params;
      const request: CaptionRequest = req.body;

      // Map provider parameter to full provider ID
      const providerMap: { [key: string]: string } = {
        'openai': 'openai:gpt-4o-mini',
        'gemini': 'google:gemini-2.0-flash'
      };

      const providerId = providerMap[provider];
      if (!providerId) {
        res.status(400).json({
          error: true,
          message: `Unknown provider: ${provider}. Available providers: ${Object.keys(providerMap).join(', ')}`,
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await captionService.generateCaption(providerId, request);

      res.json({
        success: true,
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  const providers = captionService.getProviderInfo();
  const enabledCount = providers.filter(p => p.enabled).length;

  res.json({
    success: true,
    status: enabledCount > 0 ? 'healthy' : 'degraded',
    providers,
    timestamp: new Date().toISOString()
  });
});

export default router;