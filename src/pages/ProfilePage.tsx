import { motion } from 'framer-motion';
import { User, Upload, Eye, Heart, Calendar, Code, Plus, ArrowRight } from 'lucide-react';
import SnippetCard from '../components/SnippetCard.tsx';
import { useAuth } from '../hooks/useAuth';
import { useUserSnippets, useDeleteSnippet } from '../hooks/useFirebaseData';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [deletingSnippetId, setDeletingSnippetId] = useState<string | null>(null);
    // Get user's snippets
  const { snippets: userSnippets, loading, refetch } = useUserSnippets(currentUser?.uid);
  const { deleteSnippet } = useDeleteSnippet();
  
  // Debug log to help understand the loading state
  console.log('ProfilePage Debug:', {
    currentUser: !!currentUser,
    userId: currentUser?.uid,
    loading,
    snippetsLength: userSnippets.length
  });
  
  // Handle delete snippet
  const handleDeleteSnippet = async (snippetId: string) => {
    if (!confirm('Are you sure you want to delete this snippet? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingSnippetId(snippetId);
      await deleteSnippet(snippetId);
      
      // Show success message
      window.showToast?.('Snippet deleted successfully', 'success');
      
      // Refresh the snippets list
      refetch();
    } catch (error) {
      console.error('Failed to delete snippet:', error);
      window.showToast?.('Failed to delete snippet', 'error');
    } finally {
      setDeletingSnippetId(null);
    }  };
  
  // Calculate stats
  const totalViews = userSnippets.reduce((sum, snippet) => 
    sum + (snippet.analytics?.views || snippet.metrics?.views || snippet.stats?.views || 0), 0
  );
  const totalLikes = userSnippets.reduce((sum, snippet) =>
    sum + (snippet.analytics?.likes || snippet.metrics?.likes || snippet.stats?.likes || 0), 0
  );
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-gray-400">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-vault-dark">
      {/* Container with proper width constraints */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-5 lg:p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-vault-accent rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-black" />
                </div>
              )}
              
              <div className="flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-white mb-1">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous'}
                </h1>
                <p className="text-gray-400 text-sm">{currentUser.email}</p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Joined {new Date(currentUser.metadata?.creationTime || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>{/* Upload Button - Enhanced */}
            <div className="flex-shrink-0">
              <button
                onClick={() => navigate('/upload')}
                className="bg-gradient-to-r from-vault-accent to-yellow-400 hover:from-vault-accent/90 hover:to-yellow-400/90 text-black px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2 hover:scale-105 shadow-xl transform hover:shadow-2xl"
              >
                <Plus className="w-5 h-5" />
                <span>Upload Snippet</span>
              </button>
            </div>          </div>          
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-6 bg-vault-dark/30 rounded-lg p-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-vault-accent/20 rounded-lg mx-auto mb-1">
                <Upload className="w-5 h-5 text-vault-accent" />
              </div>
              <div className="text-lg font-bold text-white">{userSnippets.length}</div>
              <div className="text-xs text-gray-400">Snippets</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-lg mx-auto mb-1">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-lg font-bold text-white">{totalViews.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total Views</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-red-500/20 rounded-lg mx-auto mb-1">
                <Heart className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-lg font-bold text-white">{totalLikes.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total Likes</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-lg mx-auto mb-1">
                <Code className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-lg font-bold text-white">
                {new Set(userSnippets.map(s => s.language)).size}
              </div>
              <div className="text-xs text-gray-400">Languages</div>
            </div>
          </div></motion.div>        {/* My Snippets Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 md:mb-0">My Snippets</h2>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-gray-400 text-sm min-w-[80px]">{userSnippets.length} {userSnippets.length === 1 ? 'snippet' : 'snippets'}</span>
              {userSnippets.length > 0 && (
                <button
                  onClick={() => navigate('/upload')}
                  className="bg-vault-medium hover:bg-vault-light/10 text-vault-accent px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 border border-vault-light/20 hover:border-vault-accent/50 hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add New Snippet</span>
                </button>
              )}
            </div>
          </div>{loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-vault-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your snippets...</p>
              <p className="text-gray-500 text-sm mt-2">This may take a moment to connect to the database</p>
            </div>          ) : userSnippets.length > 0 ? (
            <div className="snippet-grid">
              {userSnippets.map((snippet, index) => (
                <motion.div
                  key={snippet.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <SnippetCard 
                    snippet={snippet} 
                    showDeleteButton={true}
                    onDelete={handleDeleteSnippet}
                    isDeleting={deletingSnippetId === snippet.id}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-vault-medium/30 border border-vault-light/20 rounded-xl p-8 lg:p-12 text-center"
            >
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-vault-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-12 h-12 text-vault-accent" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">Share Your First Snippet!</h3>
                
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Ready to showcase your coding skills? Upload your first code snippet and join our community of developers.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3 text-left">
                    <div className="w-6 h-6 bg-vault-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-vault-accent text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Choose your code</h4>
                      <p className="text-gray-400 text-sm">Select a snippet you're proud of - any language works!</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 text-left">
                    <div className="w-6 h-6 bg-vault-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-vault-accent text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Add details</h4>
                      <p className="text-gray-400 text-sm">Write a description and add relevant tags</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 text-left">
                    <div className="w-6 h-6 bg-vault-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-vault-accent text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Share & inspire</h4>
                      <p className="text-gray-400 text-sm">Help other developers learn from your code</p>
                    </div>
                  </div>
                </div>                <button 
                  onClick={() => navigate('/upload')}
                  className="bg-gradient-to-r from-vault-accent to-yellow-400 hover:from-vault-accent/90 hover:to-yellow-400/90 text-black px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl flex items-center space-x-3 mx-auto group"
                >
                  <Upload className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  <span>Upload Your First Snippet</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </motion.div>          )}
        </motion.div>
      </div>      {/* Floating Upload Button for when user has snippets */}
      {userSnippets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <button
            onClick={() => navigate('/upload')}
            className="bg-gradient-to-r from-vault-accent to-yellow-400 hover:from-vault-accent/90 hover:to-yellow-400/90 text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group"
            title="Upload new snippet"
          >
            <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
