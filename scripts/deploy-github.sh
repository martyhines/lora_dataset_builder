#!/bin/bash

# GitHub Pages Deployment Script for LoRa Dataset Builder
# This script helps deploy the application to GitHub Pages

set -e

echo "🚀 Deploying LoRa Dataset Builder to GitHub Pages..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not initialized. Please run 'git init' first."
    exit 1
fi

# Check if we have a remote origin
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Error: No remote origin found. Please add your GitHub repository as origin."
    echo "Example: git remote add origin https://github.com/martyhines/lora_dataset_builder.git"
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed. No 'dist' directory found."
    exit 1
fi

echo "✅ Build successful!"

# Create and switch to gh-pages branch
echo "🌿 Creating gh-pages branch..."
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages

# Remove all files except dist
echo "🧹 Cleaning gh-pages branch..."
git rm -rf . || true
git clean -fdx

# Copy dist contents to root
echo "📁 Copying build files..."
cp -r dist/* .

# Add all files
echo "➕ Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "🚀 Deploy to GitHub Pages - $(date)"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin gh-pages --force

# Switch back to main branch
echo "🔄 Switching back to main branch..."
git checkout main

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application should be available at:"
echo "   https://martyhines.github.io/lora_dataset_builder/"
echo ""
echo "📝 Note: It may take a few minutes for changes to appear."
echo "   You can check the status in your GitHub repository's Actions tab."
