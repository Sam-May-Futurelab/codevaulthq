import { motion } from 'framer-motion';
import { User, Upload, Eye, Heart, Calendar, Code } from 'lucide-react';
import SnippetCard from '../components/SnippetCard.tsx';
import { useAuth } from '../hooks/useAuth';
import { useUserSnippets, useDeleteSnippet } from '../hooks/useFirebaseData';
import { useState } from 'react';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [deletingSnippetId, setDeletingSnippetId] = useState<string | null>(null);
  
  // Get user's snippets
  const { snippets: userSnippets, loading, refetch } = useUserSnippets(currentUser?.uid);
  const { deleteSnippet } = useDeleteSnippet();
  
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
  }

  return (
    <div className="min-h-screen">
      <div className="pt-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-8 mb-8"
        >
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-20 h-20 bg-vault-accent rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-black" />
            </div>            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous'}
              </h1>
              <p className="text-gray-400">{currentUser.email}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(currentUser.metadata?.creationTime || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-vault-accent/20 rounded-lg mx-auto mb-2">
                <Upload className="w-6 h-6 text-vault-accent" />
              </div>
              <div className="text-2xl font-bold text-white">{userSnippets.length}</div>
              <div className="text-sm text-gray-400">Snippets</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mx-auto mb-2">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Views</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-lg mx-auto mb-2">
                <Heart className="w-6 h-6 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalLikes.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Likes</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-lg mx-auto mb-2">
                <Code className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {new Set(userSnippets.map(s => s.language)).size}
              </div>
              <div className="text-sm text-gray-400">Languages</div>
            </div>
          </div>
        </motion.div>

        {/* My Snippets Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">My Snippets</h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">{userSnippets.length} snippets</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-vault-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your snippets...</p>
            </div>
          ) : userSnippets.length > 0 ? (
            <div className="snippet-grid">
              {userSnippets.map((snippet, index) => (                <motion.div
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
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-vault-medium rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">No snippets yet</h3>
              <p className="text-gray-400 mb-6">Start creating and sharing your code snippets</p>
              <button 
                onClick={() => window.location.href = '/upload'}
                className="bg-vault-accent hover:bg-vault-accent/80 text-black px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
              >
                Upload Your First Snippet
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
