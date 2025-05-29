import { Link } from 'react-router-dom';
import { Search, Upload, User, Menu, Shield } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (    <header className="bg-vault-dark/90 backdrop-blur-sm border-b border-vault-light/20 sticky top-0 z-50">
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
          </Link>          {/* Search Bar */}
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
            <button className="text-gray-300 hover:text-white p-2 rounded-md transition-colors">
              <User className="w-5 h-5" />
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2 rounded-md transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-vault-light/20 py-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-vault-medium border border-vault-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-accent focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Link
                to="/browse"
                className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Browse
              </Link>
              <Link
                to="/upload"
                className="block bg-vault-accent hover:bg-vault-accent/80 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Upload Snippet
              </Link>
              <button className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left">
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
