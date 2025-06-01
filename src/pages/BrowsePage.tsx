import { motion } from 'framer-motion';
import { useState } from 'react';
import { Search, Grid, List } from 'lucide-react';
import SnippetCard from '../components/SnippetCard.tsx';
import { snippetsData } from '../data/snippets';

const BrowsePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const allSnippets = Object.values(snippetsData); // Centralized data
  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'css', label: 'CSS' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'html', label: 'HTML' },
    { id: 'canvas', label: 'Canvas' },
    { id: 'webgl', label: 'WebGL' },
    { id: 'react', label: 'React' },
    { id: 'vue', label: 'Vue.js' },
    { id: 'animation', label: 'Animation' }
  ];

  const popularTags = ['animation', 'css', 'javascript', 'hover', 'particles', 'loader', '3d', 'interactive'];
  const sortOptions = [
    { id: 'recent', label: 'Most Recent' },
    { id: 'popular', label: 'Most Popular' },
    { id: 'views', label: 'Most Viewed' },
    { id: 'likes', label: 'Most Liked' }
  ];

  // Filter snippets based on search and filters
  const filteredSnippets = allSnippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || snippet.category === selectedCategory;
    const matchesTag = selectedTag === 'all' || snippet.tags.includes(selectedTag);
    
    return matchesSearch && matchesCategory && matchesTag;
  });

  // Sort snippets
  const sortedSnippets = [...filteredSnippets].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.stats.likes - a.stats.likes;
      case 'views':
        return b.stats.views - a.stats.views;
      case 'likes':
        return b.stats.likes - a.stats.likes;
      default:
        return 0; // Recent would need timestamp
    }
  });  return (
    <div className="min-h-screen">
      <div className="pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Browse <span className="text-vault-accent">Snippets</span>
          </h1>
          <p className="text-xl text-gray-400">
            Discover amazing code from our community
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-6 mb-8"
        >          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search snippets, tags, creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-vault-dark border border-vault-light/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-accent focus:border-transparent text-white placeholder-gray-400 text-lg"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-vault-dark border border-vault-light/30 rounded-lg px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-vault-accent"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Tag</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full bg-vault-dark border border-vault-light/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-vault-accent"
              >
                <option value="all">All Tags</option>
                {popularTags.map((tag) => (
                  <option key={tag} value={tag}>
                    #{tag}
                  </option>
                ))}
              </select>
            </div>            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-vault-dark border border-vault-light/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-vault-accent"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">View</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-vault-accent text-black'
                      : 'bg-vault-dark text-gray-300 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-vault-accent text-black'
                      : 'bg-vault-dark text-gray-300 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="text-gray-400 text-sm mt-4">
            Showing {sortedSnippets.length} of {allSnippets.length} snippets
          </div>
        </motion.div>        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >          {sortedSnippets.length > 0 ? (
            <div className={`${
              viewMode === 'grid' 
                ? 'snippet-grid' 
                : 'grid grid-cols-1 gap-10'
            }`}>
              {sortedSnippets.map((snippet, index) => (
                <motion.div
                  key={snippet.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <SnippetCard snippet={snippet} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-vault-medium rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">No snippets found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </motion.div>

        {/* Pagination placeholder */}
        {sortedSnippets.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <button className="bg-vault-accent hover:bg-vault-accent/80 text-black px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105">
              Load More Snippets
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
