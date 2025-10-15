import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  collection, 
  query, 
  getDocs, 
  writeBatch, 
  doc 
} from 'firebase/firestore';
import { db } from './firebase';

const auth = getAuth();

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export class AuthService {
  /**
   * Sign up with email and password
   */
  static async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  /**
   * Get current user
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Migrate all existing images to current user
   * This should be called once after user signs up
   */
  static async migrateExistingImages(): Promise<number> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      console.log('🔄 Starting image migration for user:', user.uid);
      
      // Get all images from the old 'images' collection (regardless of userId field)
      const oldImagesQuery = query(collection(db, 'images'));
      const snapshot = await getDocs(oldImagesQuery);
      
      if (snapshot.empty) {
        console.log('No images found in old collection to migrate');
        return 0;
      }

      console.log(`📊 Found ${snapshot.size} images in old collection to migrate`);

      // Create a batch to move all images to user-specific collection
      const batch = writeBatch(db);
      let migratedCount = 0;

      for (const docSnapshot of snapshot.docs) {
        const imageData = docSnapshot.data();
        
        // Add the image to the user-specific collection
        const userImageRef = doc(collection(db, 'users', user.uid, 'images'), docSnapshot.id);
        batch.set(userImageRef, {
          ...imageData,
          userId: user.uid, // Ensure userId is set
          migratedAt: Date.now()
        });
        
        // Delete from old collection
        batch.delete(docSnapshot.ref);
        migratedCount++;
      }

      await batch.commit();
      
      console.log(`✅ Successfully migrated ${migratedCount} images to user ${user.uid}`);
      return migratedCount;
    } catch (error: any) {
      console.error('❌ Migration error:', error);
      throw new Error(error.message || 'Failed to migrate images');
    }
  }

  /**
   * Check if user has any orphaned images to migrate
   */
  static async hasOrphanedImages(): Promise<boolean> {
    try {
      // Check if there are any images in the old collection
      const oldImagesQuery = query(collection(db, 'images'));
      const snapshot = await getDocs(oldImagesQuery);
      return !snapshot.empty;
    } catch (error: any) {
      console.error('Check orphaned images error:', error);
      return false;
    }
  }
}
