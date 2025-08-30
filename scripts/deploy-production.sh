#!/bin/bash

# Production Deployment Script for LoRa Dataset Builder
set -e

echo "🚀 Starting production deployment..."

# Check if required environment variables are set
if [ -z "$FIREBASE_TOKEN" ]; then
    echo "❌ FIREBASE_TOKEN environment variable is required for CI/CD deployment"
    echo "Run: firebase login:ci to get your token"
    exit 1
fi

# Load production environment variables
if [ -f ".env.production" ]; then
    echo "📋 Loading production environment variables..."
    export $(cat .env.production | xargs)
else
    echo "❌ .env.production file not found"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci
cd functions && npm ci && cd ..

# Run tests
echo "🧪 Running tests..."
npm run test:run
npm run functions:test

# Build the application
echo "🔨 Building application..."
npm run build

# Build functions
echo "🔧 Building functions..."
npm run functions:build

# Deploy to Firebase (production project)
echo "🚀 Deploying to Firebase production..."
firebase use production
firebase deploy --project production --token "$FIREBASE_TOKEN"

# Deploy to GitHub Pages (if enabled)
if [ "$DEPLOY_TO_GITHUB_PAGES" = "true" ]; then
    echo "📄 Deploying to GitHub Pages..."
    npm run deploy:gh
fi

echo "✅ Production deployment completed successfully!"
echo "🌐 Application URL: https://lora-dataset-builder-prod.web.app"
echo "🔗 Functions URL: https://us-central1-lora-dataset-builder-prod.cloudfunctions.net/captionProxy"