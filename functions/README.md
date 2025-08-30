# LoRa Dataset Builder - Caption Proxy API

This directory contains the Firebase Cloud Functions that serve as a proxy for AI vision model APIs. The proxy provides a unified interface for multiple vision providers while protecting API keys and implementing rate limiting.

## Features

- **Multi-Provider Support**: OpenAI GPT-4V and Google Gemini Vision
- **Extensible Architecture**: Easy to add new vision providers
- **Rate Limiting**: Per-user and global rate limits
- **Request Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error handling with retry logic
- **Timeout Management**: Configurable timeouts for external API calls
- **CORS Support**: Configured for web application access

## API Endpoints

### GET /api/caption/providers
Returns list of available vision providers.

### POST /api/caption/:provider
Generate caption from specific provider (openai or gemini).

**Request Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "options": {
    "maxTokens": 150,
    "temperature": 0.7,
    "systemPrompt": "Custom prompt..."
  }
}
```

### POST /api/caption/batch
Generate captions from multiple providers in parallel.

**Query Parameters:**
- `providers`: Comma-separated list of providers (optional)

### GET /api/caption/health
Health check endpoint with provider status.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional Configuration
NODE_ENV=development
DEFAULT_TIMEOUT_MS=30000
MAX_RETRIES=3
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
CAPTION_RATE_LIMIT_MAX_REQUESTS=50
```

## Development

### Install Dependencies
```bash
npm install
```

### Build
```bash
npm run build
```

### Local Development
```bash
npm run serve
```

### Run Tests
```bash
npm test
```

### Deploy
```bash
npm run deploy
```

## Architecture

### Provider System
- `BaseVisionProvider`: Abstract base class with common functionality
- `OpenAIProvider`: OpenAI GPT-4V integration
- `GeminiProvider`: Google Gemini Vision integration
- `ProviderRegistry`: Manages provider instances and configuration

### Middleware
- **Validation**: Request validation using Joi schemas
- **Rate Limiting**: In-memory rate limiting with cleanup
- **Error Handling**: Centralized error handling and logging
- **CORS**: Cross-origin resource sharing configuration

### Services
- `CaptionService`: Orchestrates provider calls and handles business logic

## Adding New Providers

1. Create a new provider class extending `BaseVisionProvider`
2. Implement the `callProvider` method
3. Register the provider in `ProviderRegistry`
4. Add provider mapping in caption routes
5. Update environment variables and documentation

Example:
```typescript
export class NewProvider extends BaseVisionProvider {
  id = 'new:provider-model';
  
  async callProvider(imageUrl: string, options: any = {}): Promise<CaptionResult> {
    // Implementation here
  }
}
```

## Error Handling

The API implements comprehensive error handling:

- **Validation Errors** (400): Invalid request format or parameters
- **Authentication Errors** (401): Invalid API keys
- **Rate Limit Errors** (429): Too many requests
- **Provider Errors** (500): External API failures
- **Timeout Errors** (408): Request timeouts

All errors include:
- Error message
- HTTP status code
- Timestamp
- Request ID for tracking
- Provider information (when applicable)

## Rate Limiting

Two levels of rate limiting:
- **General**: 100 requests per minute per user/IP
- **Caption**: 50 caption requests per minute per user/IP

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Window reset time (Unix timestamp)

## Security

- API keys are stored as environment variables
- CORS is configured for specific origins
- Request validation prevents injection attacks
- Rate limiting prevents abuse
- No sensitive data is logged
- Timeout protection prevents resource exhaustion