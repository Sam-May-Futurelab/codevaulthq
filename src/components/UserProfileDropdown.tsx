import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Code, Heart, Download } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useNavigate } from 'react-router-dom';

interface UserProfileDropdownProps {
  onSignInClick: () => void;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ onSignInClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!currentUser) {
    return (
      <button
        onClick={onSignInClick}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt={currentUser.displayName || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentUser.displayName || 'User'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {currentUser.displayName || 'User'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUser.email}
                </div>
              </div>
            </div>

            {userProfile && (
              <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userProfile.stats.snippetsCount}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                    <Code className="w-3 h-3 mr-1" />
                    Snippets
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userProfile.stats.totalLikes}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                    <Heart className="w-3 h-3 mr-1" />
                    Likes
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userProfile.stats.totalDownloads}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                    <Download className="w-3 h-3 mr-1" />
                    Downloads
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/profile');
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center space-x-3"
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to settings page
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center space-x-3"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <hr className="my-2 border-gray-200 dark:border-gray-700" />

            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 flex items-center space-x-3"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
