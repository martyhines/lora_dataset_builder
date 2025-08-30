"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const captionService_1 = require("../services/captionService");
const validation_1 = require("../middleware/validation");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
const captionService = new captionService_1.CaptionService();
// Get available providers
router.get('/providers', (req, res, next) => {
    try {
        const providers = captionService.getProviderInfo();
        res.json({
            success: true,
            providers,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        next(error);
    }
});
// Generate captions from multiple providers (must come before /:provider route)
router.post('/batch', rateLimit_1.captionRateLimit, validation_1.validateCaptionRequest, async (req, res, next) => {
    try {
        const request = req.body;
        const { providers } = req.query;
        let providerIds = [];
        if (providers && typeof providers === 'string') {
            // Map short names to full provider IDs
            const providerMap = {
                'openai': 'openai:gpt-4o-mini',
                'gemini': 'google:gemini-1.5-flash'
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
    }
    catch (error) {
        next(error);
    }
});
// Generate caption from specific provider
router.post('/:provider', rateLimit_1.captionRateLimit, validation_1.validateProvider, validation_1.validateCaptionRequest, async (req, res, next) => {
    try {
        const { provider } = req.params;
        const request = req.body;
        // Map provider parameter to full provider ID
        const providerMap = {
            'openai': 'openai:gpt-4o-mini',
            'gemini': 'google:gemini-1.5-flash'
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
    }
    catch (error) {
        next(error);
    }
});
// Health check endpoint
router.get('/health', (req, res) => {
    const providers = captionService.getProviderInfo();
    const enabledCount = providers.filter(p => p.enabled).length;
    res.json({
        success: true,
        status: enabledCount > 0 ? 'healthy' : 'degraded',
        providers,
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
//# sourceMappingURL=caption.js.map