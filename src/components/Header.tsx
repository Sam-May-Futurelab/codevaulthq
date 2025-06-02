import { Link } from 'react-router-dom';
import { Search, Upload, Menu, Shield, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import UserProfileDropdown from './UserProfileDropdown';
import AuthModal from './AuthModal';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSignInClick = () => {
    setIsAuthModalOpen(true);
  };

  // Close menu when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="bg-vault-dark/90 backdrop-blur-sm border-b border-vault-light/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-vault-accent to-vault-purple rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white group-hover:text-vault-accent transition-colors">
                Code Vault HQ
              </span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-10">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search snippets, tags, creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-vault-medium border border-vault-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-accent focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/browse"
                className="text-gray-300 hover:text-white px-4 py-3 rounded-md text-sm font-medium transition-colors"
              >
                Browse
              </Link>
              <Link
                to="/upload"
                className="bg-vault-accent hover:bg-vault-accent/80 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </Link>
              <UserProfileDropdown onSignInClick={handleSignInClick} />
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white p-2 rounded-md transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                  onClick={() => setIsMenuOpen(false)}
                />
                
                {/* Sidebar */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'tween', duration: 0.3 }}
                  className="fixed left-0 top-0 h-full w-80 bg-vault-dark border-r border-vault-light/20 z-50 md:hidden shadow-2xl"
                >
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between p-6 border-b border-vault-light/20">
                    <Link 
                      to="/" 
                      className="flex items-center space-x-2 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-vault-accent to-vault-purple rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg font-bold text-white">
                        Code Vault HQ
                      </span>
                    </Link>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-vault-medium/50 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="p-6 border-b border-vault-light/20">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search snippets, tags, creators..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-vault-medium border border-vault-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-accent focus:border-transparent text-white placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-2">
                      <Link
                        to="/browse"
                        className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-vault-medium/50 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Browse Snippets</span>
                      </Link>
                      
                      <Link
                        to="/upload"
                        className="flex items-center space-x-3 bg-vault-accent hover:bg-vault-accent/80 text-black px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Upload Snippet</span>
                      </Link>
                      
                      {/* User Profile Section */}
                      <div className="pt-4 border-t border-vault-light/20 mt-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                          Account
                        </h3>
                        <div className="px-4">
                          <UserProfileDropdown onSignInClick={handleSignInClick} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-vault-light/20">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">
                        Code Vault HQ © 2025
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Share your creativity
                      </p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signin"      />
    </>
  );
};

export default Header;
