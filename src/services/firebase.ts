import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Production Firebase configuration
const productionConfig = {
  apiKey: "AIzaSyAfWv4Jjjv0ghvn6av4FmZ_Y5kjxCYuwho",
  authDomain: "lora-dataset-builder-prod.firebaseapp.com",
  projectId: "lora-dataset-builder-prod",
  storageBucket: "lora-dataset-builder-prod.firebasestorage.app",
  messagingSenderId: "524055956982",
  appId: "1:524055956982:web:526363bdb84f39f2780bd7"
};

// Development Firebase configuration (from environment variables)
const developmentConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Use production config in production, development config in development
const firebaseConfig = import.meta.env.PROD ? productionConfig : developmentConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development only
if (import.meta.env.DEV) {
  let emulatorsConnected = false;
  
  console.log('🔍 Attempting to connect to Firebase emulators...');
  console.log('🔍 Emulator ports - Firestore: 8082, Storage: 9199');
  
  try {
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, '127.0.0.1', 8082);
    console.log('✅ Firestore emulator connected');
    
    // Connect to Storage emulator
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    console.log('✅ Storage emulator connected');
    
    emulatorsConnected = true;
    console.log('🔥 All Firebase emulators connected successfully');
    
  } catch (error) {
    if (error instanceof Error && error.message?.includes('already')) {
      console.log('🔥 Firebase emulators already connected');
      emulatorsConnected = true;
    } else {
      console.error('❌ Failed to connect to Firebase emulators:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
    }
  }
  
  if (!emulatorsConnected) {
    console.warn('⚠️ Running without emulators - this will connect to production Firebase!');
  }
} else {
  console.log('🚀 Connected to production Firebase');
}