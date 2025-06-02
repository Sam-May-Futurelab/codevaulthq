import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Code, Heart, Download } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useNavigate } from 'react-router-dom';

interface UserProfileDropdownProps {
  onSignInClick: () => void;
  isMobile?: boolean;
  onMenuClick?: () => void; // Function to call when mobile menu items are clicked
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ onSignInClick, isMobile = false, onMenuClick }) => {
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
  };  if (!currentUser) {
    return (
      <button
        onClick={() => {
          setIsOpen(false); // Close any open dropdown
          onSignInClick();
        }}
        className="w-full bg-vault-accent hover:bg-vault-accent/80 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
      >
        <User className="w-4 h-4" />
        <span>Sign In</span>
      </button>
    );
  }

  // Mobile layout - show expanded menu directly
  if (isMobile) {
    return (
      <div className="space-y-2">
        {/* User Info */}
        <div className="flex items-center space-x-3 p-3 bg-vault-medium/30 rounded-lg">
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'User'}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-vault-accent rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-black" />
            </div>
          )}
          <div className="flex-1">
            <div className="font-medium text-white text-sm">
              {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
            </div>
            <div className="text-xs text-gray-400">
              {currentUser.email}
            </div>
          </div>
        </div>        {/* Menu Items */}
        <div className="space-y-1">
          <button
            onClick={() => {
              navigate('/profile');
              onMenuClick?.(); // Close mobile menu
            }}
            className="w-full px-3 py-2 text-left hover:bg-vault-medium/50 text-gray-300 hover:text-white flex items-center space-x-3 transition-colors rounded-lg text-sm"
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => {
              // Navigate to settings page
              onMenuClick?.(); // Close mobile menu
            }}
            className="w-full px-3 py-2 text-left hover:bg-vault-medium/50 text-gray-300 hover:text-white flex items-center space-x-3 transition-colors rounded-lg text-sm"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>          <button
            onClick={async () => {
              await handleSignOut();
              onMenuClick?.(); // Close mobile menu
            }}
            className="w-full px-3 py-2 text-left hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center space-x-3 transition-colors rounded-lg text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-vault-medium/50 transition-colors w-full"
      >
        {currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt={currentUser.displayName || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-vault-accent rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-black" />
          </div>
        )}
        <span className="text-sm font-medium text-white flex-1 text-left">
          {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
        </span>
      </button>      {isOpen && (
        <>
          {/* Backdrop overlay for desktop */}
          <div 
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-vault-dark/95 backdrop-blur-md border border-vault-light/30 rounded-lg shadow-2xl z-40">
          {/* User Info */}
          <div className="p-4 border-b border-vault-light/20">
            <div className="flex items-center space-x-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-vault-accent rounded-full flex items-center justify-center">                  <User className="w-6 h-6 text-black" />
                </div>
              )}
              <div>
                <div className="font-medium text-white">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-sm text-gray-400">
                  {currentUser.email}
                </div>
              </div>
            </div>

            {userProfile && (
              <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-white">
                    {userProfile.stats.snippetsCount}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center justify-center">
                    <Code className="w-3 h-3 mr-1" />
                    Snippets
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">
                    {userProfile.stats.totalLikes}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center justify-center">
                    <Heart className="w-3 h-3 mr-1" />
                    Likes
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">
                    {userProfile.stats.totalDownloads}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center justify-center">
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
              className="w-full px-4 py-2 text-left hover:bg-vault-medium/50 text-gray-300 hover:text-white flex items-center space-x-3 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to settings page
              }}
              className="w-full px-4 py-2 text-left hover:bg-vault-medium/50 text-gray-300 hover:text-white flex items-center space-x-3 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <hr className="my-2 border-vault-light/20" />            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center space-x-3 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default UserProfileDropdown;
