# Deployment Guide

## Overview

This guide covers deploying the LoRa Dataset Builder to production environments including Firebase Hosting, GitHub Pages, and Cloud Functions.

## Prerequisites

1. **Firebase CLI**: Install and authenticate
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Production Firebase Project**: Create a new Firebase project for production
   ```bash
   firebase projects:create lora-dataset-builder-prod
   ```

3. **Environment Variables**: Configure production environment variables

## Environment Setup

### 1. Production Firebase Project

1. Create a new Firebase project: `lora-dataset-builder-prod`
2. Enable Authentication (Anonymous provider)
3. Enable Firestore Database
4. Enable Cloud Storage
5. Enable Cloud Functions

### 2. Environment Variables

Copy `.env.production` and update with your production values:

```bash
cp .env.production .env.production.local
# Edit .env.production.local with your actual production values
```

Required variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_CAPTION_PROXY_URL`

### 3. API Keys (Functions)

Configure API keys in Firebase Functions environment:

```bash
firebase functions:config:set openai.api_key="your_openai_key" --project production
firebase functions:config:set google.api_key="your_google_key" --project production
```

## Deployment Options

### Option 1: Firebase Hosting + Functions

Deploy both frontend and backend to Firebase:

```bash
# Build and deploy everything
npm run deploy:production

# Or step by step:
npm run build
npm run functions:build
firebase deploy --project production
```

### Option 2: GitHub Pages + Firebase Functions

Deploy frontend to GitHub Pages, backend to Firebase:

```bash
# Deploy functions to Firebase
npm run functions:deploy:production

# Deploy frontend to GitHub Pages
npm run deploy:gh
```

### Option 3: Automated CI/CD

Use GitHub Actions for automated deployment:

1. Set up repository secrets:
   - `FIREBASE_TOKEN`: Get with `firebase login:ci`
   - `VITE_FIREBASE_*`: All Firebase config variables
   - `CUSTOM_DOMAIN`: (Optional) Custom domain for GitHub Pages

2. Push to main branch triggers automatic deployment

## Security Configuration

### 1. Firestore Security Rules

Production rules are already configured in `firestore.rules`:
- User data isolation
- Input validation
- Proper authentication checks

### 2. Storage Security Rules

Production rules are already configured in `storage.rules`:
- File size limits (10MB)
- Content type validation
- User isolation

### 3. CORS Configuration

Functions are configured with production CORS settings:
- Restricted origins in production
- Proper headers and methods
- Credential support

## Monitoring and Maintenance

### 1. Firebase Console

Monitor your application at:
- https://console.firebase.google.com/project/lora-dataset-builder-prod

Key metrics to watch:
- Function invocations and errors
- Firestore read/write operations
- Storage usage
- Authentication activity

### 2. Error Tracking

Consider integrating error tracking:
- Sentry for client-side errors
- Firebase Crashlytics
- Cloud Logging for functions

### 3. Performance Monitoring

- Firebase Performance Monitoring
- Lighthouse CI for performance regression testing
- Real User Monitoring (RUM)

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check function CORS configuration
   - Verify domain whitelist
   - Ensure proper headers

2. **Authentication Issues**
   - Verify Firebase config
   - Check project ID matches
   - Ensure anonymous auth is enabled

3. **Function Deployment Failures**
   - Check Node.js version (18+)
   - Verify API keys are set
   - Check function memory/timeout limits

4. **Build Failures**
   - Verify all environment variables are set
   - Check TypeScript compilation
   - Ensure dependencies are installed

### Debug Commands

```bash
# Check Firebase project
firebase projects:list

# Test functions locally
npm run functions:serve

# Check function logs
firebase functions:log --project production

# Test build locally
npm run build && npm run preview
```

## Rollback Procedure

If deployment fails or issues arise:

1. **Rollback Functions**:
   ```bash
   firebase functions:delete captionProxy --project production
   # Redeploy previous version
   ```

2. **Rollback Frontend**:
   - GitHub Pages: Revert commit and push
   - Firebase Hosting: Use Firebase console to rollback

3. **Database Issues**:
   - Use Firestore backup/restore
   - Check security rules changes

## Performance Optimization

### Production Optimizations

1. **Vite Build Optimizations**:
   - Code splitting configured
   - Asset optimization
   - Tree shaking enabled

2. **Firebase Optimizations**:
   - Firestore indexes configured
   - Storage lifecycle rules
   - Function memory/timeout tuning

3. **CDN and Caching**:
   - Firebase Hosting CDN
   - Proper cache headers
   - Asset versioning

## Cost Management

### Monitoring Costs

1. **Firebase Usage**:
   - Monitor Firestore operations
   - Track Storage usage
   - Watch Function invocations

2. **API Costs**:
   - OpenAI API usage
   - Google Gemini API usage
   - Set up billing alerts

### Cost Optimization

1. **Rate Limiting**: Configured in functions
2. **Caching**: Implement response caching
3. **Cleanup**: Automatic data cleanup rules
4. **Monitoring**: Set up usage alerts

## Support

For deployment issues:
1. Check this documentation
2. Review Firebase console logs
3. Check GitHub Actions logs
4. Review function error logs