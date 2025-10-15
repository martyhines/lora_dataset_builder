import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { type User } from 'firebase/auth';
import { AuthService, type AuthUser } from '../services/auth';

interface AuthContextType {
  user: User | null;
  authUser: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  migrateImages: () => Promise<number>;
  hasOrphanedImages: boolean;
  checkOrphanedImages: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasOrphanedImages, setHasOrphanedImages] = useState(false);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setUser(user);
      
      if (user) {
        setAuthUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
      } else {
        setAuthUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await AuthService.signIn(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await AuthService.signUp(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      throw error;
    }
  };

  const migrateImages = async (): Promise<number> => {
    try {
      const count = await AuthService.migrateExistingImages();
      setHasOrphanedImages(false);
      return count;
    } catch (error) {
      throw error;
    }
  };

  const checkOrphanedImages = async () => {
    try {
      const hasOrphaned = await AuthService.hasOrphanedImages();
      setHasOrphanedImages(hasOrphaned);
    } catch (error) {
      console.error('Failed to check orphaned images:', error);
    }
  };

  // Check for orphaned images when user changes
  useEffect(() => {
    if (user) {
      checkOrphanedImages();
    } else {
      setHasOrphanedImages(false);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    authUser,
    loading,
    signIn,
    signUp,
    signOut,
    migrateImages,
    hasOrphanedImages,
    checkOrphanedImages
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
