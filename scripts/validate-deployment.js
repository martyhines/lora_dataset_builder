#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Checks if all required configuration is in place for production deployment
 */

import fs from 'fs';
import path from 'path';

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_CAPTION_PROXY_URL'
];

const requiredFiles = [
  '.env.production',
  'functions/.env.production',
  'firebase.production.json',
  'firestore.rules',
  'storage.rules'
];

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing required file: ${filePath}`);
    return false;
  }
  console.log(`✅ Found: ${filePath}`);
  return true;
}

function checkEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing environment file: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const missing = [];
  
  requiredEnvVars.forEach(varName => {
    if (!content.includes(varName) || content.includes(`${varName}=your_`)) {
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    console.error(`❌ ${filePath} missing or has placeholder values for: ${missing.join(', ')}`);
    return false;
  }
  
  console.log(`✅ Environment file configured: ${filePath}`);
  return true;
}

function validatePackageJson() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = [
    'build',
    'deploy:production',
    'deploy:gh',
    'functions:build',
    'functions:deploy'
  ];
  
  const missing = requiredScripts.filter(script => !packageJson.scripts[script]);
  
  if (missing.length > 0) {
    console.error(`❌ Missing package.json scripts: ${missing.join(', ')}`);
    return false;
  }
  
  console.log('✅ Package.json scripts configured');
  return true;
}

function validateFirebaseConfig() {
  try {
    const firebaserc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
    
    if (!firebaserc.projects.production) {
      console.error('❌ No production project configured in .firebaserc');
      return false;
    }
    
    console.log(`✅ Firebase production project: ${firebaserc.projects.production}`);
    return true;
  } catch (error) {
    console.error('❌ Invalid .firebaserc file');
    return false;
  }
}

function main() {
  console.log('🔍 Validating deployment configuration...\n');
  
  let allValid = true;
  
  // Check required files
  console.log('📁 Checking required files:');
  requiredFiles.forEach(file => {
    if (!checkFile(file)) allValid = false;
  });
  
  console.log('\n🔧 Checking environment configuration:');
  if (!checkEnvFile('.env.production')) allValid = false;
  if (!checkEnvFile('functions/.env.production')) allValid = false;
  
  console.log('\n📦 Checking package configuration:');
  if (!validatePackageJson()) allValid = false;
  
  console.log('\n🔥 Checking Firebase configuration:');
  if (!validateFirebaseConfig()) allValid = false;
  
  console.log('\n' + '='.repeat(50));
  
  if (allValid) {
    console.log('✅ All deployment requirements satisfied!');
    console.log('🚀 Ready for production deployment');
    process.exit(0);
  } else {
    console.log('❌ Deployment validation failed');
    console.log('📋 Please fix the issues above before deploying');
    process.exit(1);
  }
}

main();