"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCaptionRequest = validateCaptionRequest;
exports.validateProvider = validateProvider;
const joi_1 = __importDefault(require("joi"));
const captionRequestSchema = joi_1.default.object({
    imageUrl: joi_1.default.string().uri().required().messages({
        'string.uri': 'imageUrl must be a valid URL',
        'any.required': 'imageUrl is required'
    }),
    options: joi_1.default.object({
        maxTokens: joi_1.default.number().integer().min(1).max(1000).optional(),
        temperature: joi_1.default.number().min(0).max(2).optional(),
        systemPrompt: joi_1.default.string().max(2000).optional()
    }).optional()
});
function validateCaptionRequest(req, res, next) {
    const { error, value } = captionRequestSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });
    if (error) {
        const validationError = new Error(`Validation error: ${error.details.map(d => d.message).join(', ')}`);
        validationError.statusCode = 400;
        return next(validationError);
    }
    // Replace request body with validated and sanitized data
    req.body = value;
    next();
}
function validateProvider(req, res, next) {
    const { provider } = req.params;
    if (!provider || typeof provider !== 'string') {
        const error = new Error('Provider parameter is required');
        error.statusCode = 400;
        return next(error);
    }
    // Validate provider format (should be like "openai" or "gemini")
    if (!/^[a-z]+$/.test(provider)) {
        const error = new Error('Invalid provider format');
        error.statusCode = 400;
        return next(error);
    }
    next();
}
//# sourceMappingURL=validation.js.map