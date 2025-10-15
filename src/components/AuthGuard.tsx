import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the app
  if (user) {
    return <>{children}</>;
  }

  // If user is not authenticated, show auth forms
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLoginMode ? (
          <LoginForm onSwitchToSignup={() => setIsLoginMode(false)} />
        ) : (
          <SignupForm onSwitchToLogin={() => setIsLoginMode(true)} />
        )}
      </div>
    </div>
  );
};


