import { motion } from 'framer-motion';
import { Code, Play, Download, Copy, Heart, Eye, MessageCircle, Share } from 'lucide-react';
import { useParams } from 'react-router-dom';

const SnippetDetail = () => {
  const { id } = useParams();

  // Mock data - replace with actual API call
  const snippet = {
    id: id || '1',
    title: 'Floating Orb Animation',
    description: 'A beautiful CSS animation featuring floating particles and a glowing orb effect. Perfect for hero sections and loading states.',
    code: {
      html: `<div class="orb-container">
  <div class="orb"></div>
  <div class="particles"></div>
</div>`,
      css: `.orb-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 50px auto;
}

.orb {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, #00ff88 0%, #0ea5e9 100%);
  border-radius: 50%;
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}`,
      javascript: `// Add interactive hover effect
document.querySelector('.orb').addEventListener('mouseover', function() {
  this.style.transform = 'scale(1.2)';
});

document.querySelector('.orb').addEventListener('mouseout', function() {
  this.style.transform = 'scale(1)';
});`
    },
    author: {
      username: 'designmaster',
      displayName: 'Design Master',
      avatar: '/api/placeholder/40/40',
      isVerified: true
    },
    stats: {
      likes: 245,
      views: 1250,
      downloads: 89,
      comments: 12
    },
    tags: ['animation', 'css', 'particles', 'orb', 'glow'],
    category: 'css',
    createdAt: '2025-05-20',
    license: 'MIT'
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold text-white mb-4">{snippet.title}</h1>
              <p className="text-gray-400 text-lg">{snippet.description}</p>
            </motion.div>

            {/* Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Live Preview</h2>
                <button className="bg-vault-accent hover:bg-vault-accent/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                  <Play className="w-4 h-4" />
                  <span>Run</span>
                </button>
              </div>
              
              <div className="bg-white rounded-lg h-64 flex items-center justify-center">
                <div className="text-gray-500">Preview would render here</div>
              </div>
            </motion.div>

            {/* Code Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-vault-medium/50 border border-vault-light/20 rounded-xl overflow-hidden"
            >
              <div className="flex border-b border-vault-light/20">
                <button className="px-6 py-3 text-white bg-vault-accent/20 border-b-2 border-vault-accent">
                  HTML
                </button>
                <button className="px-6 py-3 text-gray-400 hover:text-white transition-colors">
                  CSS
                </button>
                <button className="px-6 py-3 text-gray-400 hover:text-white transition-colors">
                  JavaScript
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">HTML</span>
                  <button className="bg-vault-light hover:bg-vault-light/80 text-white px-3 py-1 rounded text-sm flex items-center space-x-2 transition-colors">
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                </div>
                
                <pre className="bg-vault-dark rounded-lg p-4 overflow-x-auto">
                  <code className="text-green-400 text-sm font-mono">
                    {snippet.code.html}
                  </code>
                </pre>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-6"
            >
              <div className="space-y-3">
                <button className="w-full bg-vault-accent hover:bg-vault-accent/80 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                  <Download className="w-5 h-5" />
                  <span>Download ZIP</span>
                </button>
                
                <button className="w-full bg-vault-light hover:bg-vault-light/80 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                  <Copy className="w-5 h-5" />
                  <span>Copy Embed Code</span>
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-vault-dark hover:bg-vault-dark/80 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span>{snippet.stats.likes}</span>
                  </button>
                  
                  <button className="bg-vault-dark hover:bg-vault-dark/80 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                    <Share className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Eye className="w-4 h-4" />
                    <span>Views</span>
                  </div>
                  <span className="text-white font-medium">{snippet.stats.views}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Download className="w-4 h-4" />
                    <span>Downloads</span>
                  </div>
                  <span className="text-white font-medium">{snippet.stats.downloads}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <MessageCircle className="w-4 h-4" />
                    <span>Comments</span>
                  </div>
                  <span className="text-white font-medium">{snippet.stats.comments}</span>
                </div>
              </div>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {snippet.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-vault-accent/20 text-vault-accent border border-vault-accent/30 rounded-full text-sm hover:bg-vault-accent/30 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetDetail;
