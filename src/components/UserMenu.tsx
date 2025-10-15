import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthService } from '../services/auth';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const { authUser, signOut, migrateImages, hasOrphanedImages } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleMigrateImages = async () => {
    if (!hasOrphanedImages) {
      alert('No orphaned images found to migrate!');
      return;
    }

    setMigrating(true);
    try {
      const count = await migrateImages();
      alert(`Successfully migrated ${count} images to your account!`);
      setIsOpen(false);
    } catch (error: any) {
      alert(`Migration failed: ${error.message}`);
    } finally {
      setMigrating(false);
    }
  };

  if (!authUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 text-white hover:bg-white/20 transition-all duration-200 border border-white/20"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-semibold">
          {authUser.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="hidden sm:block text-sm font-medium">
          {authUser.email}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg rounded-lg shadow-2xl border border-white/20 z-20">
            <div className="py-2">
              <div className="px-4 py-2 text-sm text-gray-300 border-b border-white/10">
                <p className="font-medium">{authUser.email}</p>
                <p className="text-xs text-gray-400">Signed in</p>
              </div>
              
              {hasOrphanedImages && (
                <button
                  onClick={handleMigrateImages}
                  disabled={migrating}
                  className="w-full text-left px-4 py-2 text-sm text-blue-300 hover:bg-blue-500/20 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  <span>{migrating ? 'Migrating...' : 'Migrate Images'}</span>
                </button>
              )}
              
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-500/20 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
