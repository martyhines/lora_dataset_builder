# API Documentation

This document describes the Caption Proxy API used by the LoRa Dataset Builder.

## Overview

The Caption Proxy API is a Firebase Cloud Function that provides a unified interface to multiple AI vision models. It handles authentication, rate limiting, error handling, and response normalization.

## Base URL

```
https://us-central1-{project-id}.cloudfunctions.net/captionProxy
```

## Authentication

All requests require Firebase Authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer {firebase-id-token}
```

## Rate Limiting

- **Global**: 100 requests per minute per IP
- **Caption Generation**: 50 requests per minute per user
- **Provider Specific**: Varies by AI provider

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

## Endpoints

### GET /api/caption/providers

Get list of available vision providers.

#### Response

```json
{
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI GPT-4V",
      "modelId": "openai:gpt-4o-mini",
      "enabled": true,
      "capabilities": ["image-to-text"],
      "maxImageSize": 20971520,
      "supportedFormats": ["image/jpeg", "image/png", "image/webp"]
    },
    {
      "id": "gemini",
      "name": "Google Gemini Vision",
      "modelId": "gemini:gemini-1.5-flash",
      "enabled": true,
      "capabilities": ["image-to-text"],
      "maxImageSize": 20971520,
      "supportedFormats": ["image/jpeg", "image/png", "image/webp"]
    }
  ]
}
```

### POST /api/caption/{provider}

Generate caption from a specific provider.

#### Parameters

- `provider` (path): Provider ID (`openai`, `gemini`)

#### Request Body

```json
{
  "imageUrl": "https://example.com/image.jpg",
  "options": {
    "maxTokens": 100,
    "temperature": 0.7,
    "systemPrompt": "Describe this image for a machine learning dataset."
  }
}
```

#### Request Schema

```typescript
interface CaptionRequest {
  imageUrl: string;           // Public URL to the image
  options?: {
    maxTokens?: number;       // Maximum tokens to generate (default: 100)
    temperature?: number;     // Creativity level 0-1 (default: 0.7)
    systemPrompt?: string;    // Custom system prompt
  };
}
```

#### Response

```json
{
  "modelId": "openai:gpt-4o-mini",
  "caption": "A golden retriever playing in a park with a frisbee",
  "latency": 1250,
  "tokensUsed": 15,
  "metadata": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "timestamp": 1703123456789,
    "requestId": "req_abc123"
  }
}
```

#### Response Schema

```typescript
interface CaptionResult {
  modelId: string;            // Model identifier
  caption: string;            // Generated caption
  latency: number;            // Response time in milliseconds
  tokensUsed?: number;        // Tokens consumed
  metadata: {
    provider: string;         // Provider name
    model: string;            // Model name
    timestamp: number;        // Generation timestamp
    requestId: string;        // Unique request ID
  };
}
```

### POST /api/caption/batch

Generate captions from multiple providers in parallel.

#### Request Body

```json
{
  "imageUrl": "https://example.com/image.jpg",
  "providers": ["openai", "gemini"],
  "options": {
    "maxTokens": 100,
    "temperature": 0.7,
    "systemPrompt": "Describe this image for a machine learning dataset."
  }
}
```

#### Response

```json
{
  "results": [
    {
      "provider": "openai",
      "success": true,
      "result": {
        "modelId": "openai:gpt-4o-mini",
        "caption": "A golden retriever playing in a park",
        "latency": 1250,
        "tokensUsed": 15
      }
    },
    {
      "provider": "gemini",
      "success": true,
      "result": {
        "modelId": "gemini:gemini-1.5-flash",
        "caption": "A dog playing with a frisbee outdoors",
        "latency": 980,
        "tokensUsed": 12
      }
    }
  ],
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "totalLatency": 2230
  }
}
```

### GET /api/caption/health

Health check endpoint.

#### Response

```json
{
  "status": "healthy",
  "timestamp": 1703123456789,
  "version": "1.0.0",
  "providers": {
    "openai": {
      "status": "healthy",
      "lastCheck": 1703123456789,
      "responseTime": 150
    },
    "gemini": {
      "status": "healthy", 
      "lastCheck": 1703123456789,
      "responseTime": 120
    }
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "PROVIDER_ERROR",
    "message": "OpenAI API request failed: Rate limit exceeded",
    "details": {
      "provider": "openai",
      "statusCode": 429,
      "retryAfter": 60
    },
    "requestId": "req_abc123",
    "timestamp": 1703123456789
  }
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_REQUEST` | Malformed request body | 400 |
| `INVALID_IMAGE_URL` | Invalid or inaccessible image URL | 400 |
| `UNSUPPORTED_FORMAT` | Image format not supported | 400 |
| `IMAGE_TOO_LARGE` | Image exceeds size limit | 413 |
| `UNAUTHORIZED` | Invalid or missing authentication | 401 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `PROVIDER_ERROR` | AI provider API error | 502 |
| `PROVIDER_UNAVAILABLE` | Provider temporarily unavailable | 503 |
| `TIMEOUT` | Request timeout | 504 |
| `INTERNAL_ERROR` | Server error | 500 |

### Retry Logic

The API implements automatic retry with exponential backoff for certain errors:

- **Retryable**: Network errors, timeouts, 5xx errors
- **Non-retryable**: Authentication errors, validation errors, 4xx errors
- **Max retries**: 3 attempts
- **Backoff**: 1s, 2s, 4s with jitter

## Usage Examples

### JavaScript/TypeScript

```typescript
class CaptionAPI {
  constructor(private baseUrl: string, private getAuthToken: () => Promise<string>) {}

  async generateCaption(provider: string, imageUrl: string, options?: any) {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}/api/caption/${provider}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl, options })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Caption generation failed: ${error.error.message}`);
    }

    return response.json();
  }

  async batchGenerate(imageUrl: string, providers: string[], options?: any) {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}/api/caption/batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl, providers, options })
    });

    return response.json();
  }
}

// Usage
const api = new CaptionAPI(
  'https://us-central1-your-project.cloudfunctions.net/captionProxy',
  () => firebase.auth().currentUser?.getIdToken() || Promise.reject('Not authenticated')
);

// Generate caption from OpenAI
const result = await api.generateCaption('openai', 'https://example.com/image.jpg', {
  maxTokens: 50,
  temperature: 0.5
});

// Generate captions from multiple providers
const batchResult = await api.batchGenerate(
  'https://example.com/image.jpg',
  ['openai', 'gemini']
);
```

### cURL Examples

```bash
# Get available providers
curl -X GET \
  "https://us-central1-your-project.cloudfunctions.net/captionProxy/api/caption/providers" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Generate caption from OpenAI
curl -X POST \
  "https://us-central1-your-project.cloudfunctions.net/captionProxy/api/caption/openai" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "options": {
      "maxTokens": 100,
      "temperature": 0.7
    }
  }'

# Batch generate captions
curl -X POST \
  "https://us-central1-your-project.cloudfunctions.net/captionProxy/api/caption/batch" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "providers": ["openai", "gemini"],
    "options": {
      "maxTokens": 100,
      "temperature": 0.7,
      "systemPrompt": "Describe this image for a machine learning dataset."
    }
  }'

# Health check
curl -X GET \
  "https://us-central1-your-project.cloudfunctions.net/captionProxy/api/caption/health"
```

### Python Example

```python
import requests
import json

class CaptionAPI:
    def __init__(self, base_url, auth_token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {auth_token}',
            'Content-Type': 'application/json'
        }
    
    def generate_caption(self, provider, image_url, options=None):
        url = f"{self.base_url}/api/caption/{provider}"
        data = {'imageUrl': image_url}
        if options:
            data['options'] = options
        
        response = requests.post(url, headers=self.headers, json=data)
        response.raise_for_status()
        return response.json()
    
    def batch_generate(self, image_url, providers, options=None):
        url = f"{self.base_url}/api/caption/batch"
        data = {
            'imageUrl': image_url,
            'providers': providers
        }
        if options:
            data['options'] = options
        
        response = requests.post(url, headers=self.headers, json=data)
        response.raise_for_status()
        return response.json()

# Usage
api = CaptionAPI(
    'https://us-central1-your-project.cloudfunctions.net/captionProxy',
    'YOUR_FIREBASE_TOKEN'
)

# Generate caption
result = api.generate_caption('openai', 'https://example.com/image.jpg', {
    'maxTokens': 50,
    'temperature': 0.5
})

print(f"Caption: {result['caption']}")
print(f"Latency: {result['latency']}ms")
```

## Provider-Specific Details

### OpenAI GPT-4V

- **Model**: `gpt-4o-mini`
- **Max image size**: 20MB
- **Supported formats**: JPEG, PNG, WebP
- **Rate limits**: 500 requests per minute
- **Token limits**: 4096 tokens per request

#### Options

```typescript
interface OpenAIOptions {
  maxTokens?: number;        // 1-4096, default: 100
  temperature?: number;      // 0-2, default: 0.7
  systemPrompt?: string;     // Custom system message
  detail?: 'low' | 'high';   // Image detail level, default: 'auto'
}
```

### Google Gemini Vision

- **Model**: `gemini-1.5-flash`
- **Max image size**: 20MB
- **Supported formats**: JPEG, PNG, WebP
- **Rate limits**: 300 requests per minute
- **Token limits**: 1048576 tokens per request

#### Options

```typescript
interface GeminiOptions {
  maxTokens?: number;        // 1-1048576, default: 100
  temperature?: number;      // 0-1, default: 0.7
  systemPrompt?: string;     // Custom system instruction
  topP?: number;            // 0-1, default: 0.95
  topK?: number;            // 1-40, default: 40
}
```

## Best Practices

### Image Optimization

1. **Resize images** to reasonable dimensions (max 2048px)
2. **Compress images** to reduce file size and improve latency
3. **Use supported formats** (JPEG, PNG, WebP)
4. **Ensure public URLs** are accessible without authentication

### Error Handling

1. **Implement retry logic** for transient errors
2. **Handle rate limits** gracefully with exponential backoff
3. **Validate requests** before sending to API
4. **Log errors** for debugging and monitoring

### Performance

1. **Use batch requests** when generating multiple captions
2. **Cache results** to avoid duplicate requests
3. **Implement timeouts** to prevent hanging requests
4. **Monitor latency** and adjust based on performance

### Security

1. **Validate image URLs** to prevent SSRF attacks
2. **Sanitize inputs** to prevent injection attacks
3. **Use HTTPS** for all requests
4. **Rotate API keys** regularly

## Monitoring and Analytics

### Metrics Available

- **Request volume**: Total requests per provider
- **Success rate**: Percentage of successful requests
- **Latency**: Average response time per provider
- **Error rate**: Percentage of failed requests
- **Token usage**: Total tokens consumed per provider

### Logging

All requests are logged with:
- Request ID for tracing
- User ID (anonymized)
- Provider and model used
- Response time and status
- Error details (if applicable)

### Alerts

Set up alerts for:
- High error rates (>5%)
- Slow response times (>10s)
- Rate limit violations
- Provider outages

## Changelog

### v1.0.0 (Current)
- Initial release with OpenAI and Gemini support
- Batch processing capabilities
- Rate limiting and error handling
- Health check endpoint

### Planned Features
- Additional providers (Anthropic Claude, Stability AI)
- Webhook support for async processing
- Advanced filtering and content moderation
- Usage analytics and reporting