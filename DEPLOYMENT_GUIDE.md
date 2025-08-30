# 🚀 GitHub Pages Deployment Guide

This guide will walk you through deploying your LoRa Dataset Builder to GitHub Pages with automatic deployment via GitHub Actions.

## 📋 Prerequisites

- ✅ **GitHub Account**: You need a GitHub account (martyhines)
- ✅ **Git Installed**: Git should be installed on your machine
- ✅ **Firebase Project**: Production Firebase project is already created
- ✅ **Local Repository**: Git repository is already initialized

## 🎯 Step-by-Step Deployment

### **Step 1: Create GitHub Repository**

1. **Go to GitHub**: Visit [github.com](https://github.com)
2. **Create New Repository**: Click the "+" icon → "New repository"
3. **Repository Settings**:
   - **Repository name**: `lora_dataset_builder`
   - **Description**: `Beautiful, modern web application for building and managing image datasets with AI-powered caption generation`
   - **Visibility**: Public (recommended for GitHub Pages)
   - **Initialize**: Don't initialize with README (we already have one)
4. **Click "Create repository"**

### **Step 2: Connect Local Repository to GitHub**

```bash
# Add the remote origin (replace with your actual GitHub username if different)
git remote add origin https://github.com/martyhines/lora_dataset_builder.git

# Verify the remote was added
git remote -v

# Push your code to GitHub
git push -u origin main
```

### **Step 3: Configure GitHub Pages**

1. **Go to Repository Settings**: In your GitHub repository, click "Settings"
2. **Pages Section**: Click "Pages" in the left sidebar
3. **Source**: Select "Deploy from a branch"
4. **Branch**: Select `gh-pages` branch
5. **Folder**: Select `/ (root)`
6. **Click "Save"**

### **Step 4: Set Up GitHub Actions Secrets**

1. **Go to Repository Settings** → **Secrets and variables** → **Actions**
2. **Add the following secrets**:

```bash
# Firebase Configuration (from your .env.production file)
VITE_FIREBASE_API_KEY=AIzaSyAfWv4Jjjv0ghvn6av4FmZ_Y5kjxCYuwho
VITE_FIREBASE_AUTH_DOMAIN=lora-dataset-builder-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lora-dataset-builder-prod
VITE_FIREBASE_STORAGE_BUCKET=lora-dataset-builder-prod.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=524055956982
VITE_FIREBASE_APP_ID=1:524055956982:web:526363bdb84f39f2780bd7
```

### **Step 5: Test the Build**

```bash
# Test the build locally
npm run build

# Check that the dist folder was created
ls -la dist/
```

### **Step 6: Deploy to GitHub Pages**

#### **Option A: Automatic Deployment (Recommended)**

The GitHub Actions workflow will automatically deploy on every push to the `main` branch.

1. **Push your changes**:
   ```bash
   git add .
   git commit -m "🚀 Ready for deployment"
   git push origin main
   ```

2. **Check GitHub Actions**: Go to your repository → "Actions" tab
3. **Monitor the deployment**: The workflow will build and deploy automatically

#### **Option B: Manual Deployment**

If you prefer manual deployment:

```bash
# Run the deployment script
./scripts/deploy-github.sh
```

### **Step 7: Verify Deployment**

1. **Wait a few minutes** for GitHub Pages to update
2. **Visit your site**: [https://martyhines.github.io/lora_dataset_builder](https://martyhines.github.io/lora_dataset_builder)
3. **Check for issues**: Look at the browser console for any errors

## 🔧 Troubleshooting

### **Common Issues**

#### **Build Failures**
```bash
# Check if the build works locally
npm run build

# Check for TypeScript errors (these won't prevent deployment)
npx tsc --noEmit
```

#### **GitHub Actions Failures**
1. **Check the Actions tab** in your repository
2. **Look at the error logs** for specific issues
3. **Verify secrets are set correctly** in repository settings

#### **Page Not Loading**
1. **Check the gh-pages branch** exists and has content
2. **Verify GitHub Pages settings** are correct
3. **Wait a few minutes** - GitHub Pages can take time to update

### **Debug Commands**

```bash
# Check Git status
git status

# Check remote configuration
git remote -v

# Check if gh-pages branch exists
git branch -a

# Check build output
ls -la dist/
```

## 🌐 Custom Domain (Optional)

If you want to use a custom domain:

1. **Add CNAME file** to your `public/` folder:
   ```
   yourdomain.com
   ```

2. **Configure DNS**: Point your domain to GitHub Pages
3. **Update GitHub Pages settings** to use custom domain

## 📱 Testing Your Deployment

### **Local Testing**
```bash
# Test the production build locally
npm run build
npm run preview
```

### **Production Testing**
- Test all major features
- Check mobile responsiveness
- Verify Firebase connections work
- Test image uploads and gallery

## 🔄 Updating Your Deployment

### **Automatic Updates**
- Every push to `main` branch triggers automatic deployment
- No manual intervention needed

### **Manual Updates**
```bash
# Make your changes
git add .
git commit -m "Update description"
git push origin main

# Or use the manual deployment script
./scripts/deploy-github.sh
```

## 📊 Monitoring

### **GitHub Actions**
- Monitor build status in the Actions tab
- Check for deployment failures
- View build logs for debugging

### **GitHub Pages**
- Check Pages settings for deployment status
- Monitor for any build errors
- Verify the site is accessible

## 🎉 Success!

Once deployed, your LoRa Dataset Builder will be available at:
**https://martyhines.github.io/lora_dataset_builder**

## 📞 Need Help?

- **GitHub Issues**: Create an issue in your repository
- **GitHub Actions**: Check the Actions tab for build logs
- **GitHub Pages**: Check Pages settings and status
- **Firebase**: Verify your production project configuration

---

**Happy Deploying! 🚀✨**
