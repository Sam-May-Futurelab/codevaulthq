import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Grid, List } from 'lucide-react';
import SnippetCard from '../components/SnippetCard.tsx';
import { snippetsData } from '../data/snippets';
import { useFirebaseSnippets } from '../hooks/useFirebaseData';

const BrowsePage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Read URL parameters on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const tagParam = searchParams.get('tag');
    const queryParam = searchParams.get('q');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (tagParam) {
      setSelectedTag(tagParam);
    }
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [searchParams]);
    // Get Firebase snippets (user uploaded)
  const { snippets: firebaseSnippets } = useFirebaseSnippets({
    orderByField: 'createdAt',
    orderDirection: 'desc',
    limitCount: 50,
    realtime: true
  });
  
  // Combine Firebase snippets with mock data
  const [allSnippets, setAllSnippets] = useState<any[]>([]);
  
  useEffect(() => {
    const mockSnippetsArray = Object.values(snippetsData);
    const combinedSnippets = [
      ...firebaseSnippets,
      ...mockSnippetsArray
    ];
    
    // Remove duplicates based on ID
    const uniqueSnippets = combinedSnippets.filter((snippet, index, self) => 
      index === self.findIndex(s => s.id === snippet.id)
    );
    
    setAllSnippets(uniqueSnippets);  }, [firebaseSnippets]);

  // Hierarchical category structure (same as HomePage)
  const categoryStructure = {
    essentials: {
      name: 'Essential Components',
      subcategories: [
        { id: 'ui-components', label: 'UI Components' },
        { id: 'forms', label: 'Forms & Inputs' },
        { id: 'navigation', label: 'Navigation' },
        { id: 'buttons', label: 'Buttons & CTAs' },
        { id: 'modals', label: 'Modals & Dialogs' }
      ]
    },
    visual: {
      name: 'Visual & Animation',
      subcategories: [
        { id: 'animations', label: 'Animations' },
        { id: 'transitions', label: 'Transitions' },
        { id: 'backgrounds', label: 'Background Effects' },
        { id: 'text-effects', label: 'Text Effects' },
        { id: 'loaders', label: 'Loading Indicators' }
      ]
    },
    layout: {
      name: 'Layout & Structure',
      subcategories: [
        { id: 'grid-systems', label: 'Grid & Flexbox' },
        { id: 'responsive', label: 'Responsive Design' },
        { id: 'cards', label: 'Cards & Containers' },
        { id: 'heroes', label: 'Hero Sections' },
        { id: 'page-sections', label: 'Page Sections' }
      ]
    },
    interactive: {
      name: 'Interactive & Dynamic',
      subcategories: [
        { id: 'data-display', label: 'Data Visualization' },
        { id: 'interactive', label: 'Interactive Demos' },
        { id: 'games', label: 'Games & Playful' },
        { id: 'api', label: 'API Integration' },
        { id: 'auth', label: 'Authentication' }
      ]
    },    advanced: {
      name: 'Advanced & Experimental',
      subcategories: [
        { id: 'canvas', label: 'Canvas & Graphics' },
        { id: 'webgl', label: 'WebGL & 3D' },
        { id: 'svg', label: 'SVG Animations' },
        { id: 'performance', label: 'Performance' },
        { id: 'accessibility', label: 'Accessibility' }
      ]
    },
    utilities: {
      name: 'Tools & Utilities',
      subcategories: [
        { id: 'utilities', label: 'Developer Tools' },
        { id: 'plugins', label: 'Plugins & Add-ons' },
        { id: 'extensions', label: 'Browser Extensions' },
        { id: 'snippets', label: 'Code Snippets' },
        { id: 'generators', label: 'Generators' }
      ]
    }
  };

  // Build comprehensive category list for dropdown
  const categories = [
    { id: 'all', label: 'All Categories' },
    // Main categories
    ...Object.entries(categoryStructure).map(([key, category]) => ({
      id: key,
      label: category.name
    })),
    // Subcategories
    ...Object.values(categoryStructure).flatMap(category =>
      category.subcategories.map(sub => ({
        id: sub.id,
        label: sub.label
      }))
    ),
    // Legacy categories for backward compatibility
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
  ];  // Helper function to get category from snippet (improved)
  const getSnippetCategory = (snippet: any) => {
    // Handle new hierarchical category structure
    if (snippet.category && typeof snippet.category === 'object' && snippet.category.id) {
      return snippet.category.id;
    }
    // Fallback to old format or language field
    return snippet.category || snippet.language || 'javascript';
  };

  // Helper function to check if snippet matches category filter
  const matchesCategory = (snippet: any, categoryFilter: string) => {
    if (categoryFilter === 'all') return true;
    
    const snippetCategory = getSnippetCategory(snippet);
    
    // Direct match
    if (snippetCategory === categoryFilter) return true;
    
    // Check if it's a main category match
    if (snippet.category && typeof snippet.category === 'object' && snippet.category.mainCategory) {
      if (snippet.category.mainCategory.id === categoryFilter) return true;
    }
    
    // Check if the filter is a main category and snippet belongs to its subcategories
    for (const [mainCatKey, mainCat] of Object.entries(categoryStructure)) {
      if (mainCatKey === categoryFilter) {
        // Check if snippet's category is one of this main category's subcategories
        return mainCat.subcategories.some(sub => sub.id === snippetCategory);
      }
    }
    
    return false;
  };
  // Helper function to generate results text
  const getResultsText = () => {
    const count = sortedSnippets.length;
    
    if (selectedCategory !== 'all' && selectedTag !== 'all') {
      const categoryName = categories.find(cat => cat.id === selectedCategory)?.label || selectedCategory;
      return `Showing ${count} snippet${count !== 1 ? 's' : ''} for ${categoryName} category with #${selectedTag} tag`;
    } else if (selectedCategory !== 'all') {
      const categoryName = categories.find(cat => cat.id === selectedCategory)?.label || selectedCategory;
      return `Showing ${count} snippet${count !== 1 ? 's' : ''} for ${categoryName} category`;
    } else if (selectedTag !== 'all') {
      return `Showing ${count} snippet${count !== 1 ? 's' : ''} with #${selectedTag} tag`;
    } else if (searchQuery) {
      return `Showing ${count} search result${count !== 1 ? 's' : ''} for "${searchQuery}"`;
    } else {
      return `Showing ${count} of ${allSnippets.length} snippet${count !== 1 ? 's' : ''}`;
    }
  };
  
  // Filter snippets based on search and filters
  const filteredSnippets = allSnippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         snippet.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const categoryMatch = matchesCategory(snippet, selectedCategory);
    const matchesTag = selectedTag === 'all' || snippet.tags.includes(selectedTag);
    
    return matchesSearch && categoryMatch && matchesTag;
  });

  // Sort snippets
  const sortedSnippets = [...filteredSnippets].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        const aLikes = a.stats?.likes || a.metrics?.likes || a.analytics?.likes || 0;
        const bLikes = b.stats?.likes || b.metrics?.likes || b.analytics?.likes || 0;
        return bLikes - aLikes;
      case 'views':
        const aViews = a.stats?.views || a.metrics?.views || a.analytics?.views || 0;
        const bViews = b.stats?.views || b.metrics?.views || b.analytics?.views || 0;
        return bViews - aViews;
      case 'likes':
        const aLikesSort = a.stats?.likes || a.metrics?.likes || a.analytics?.likes || 0;
        const bLikesSort = b.stats?.likes || b.metrics?.likes || b.analytics?.likes || 0;
        return bLikesSort - aLikesSort;
      default:
        // For recent, prioritize Firebase snippets (they have createdAt timestamps)
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt.seconds * 1000).getTime() - new Date(a.createdAt.seconds * 1000).getTime();
        }
        if (a.createdAt && !b.createdAt) return -1;
        if (!a.createdAt && b.createdAt) return 1;
        return 0;
    }
  });return (
    <div className="min-h-screen">
      <div className="pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Browse <span className="text-vault-accent">Snippets</span>
          </h1>
          <p className="text-lg text-gray-400">
            Discover amazing code from our community
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-4 mb-6"
        >          {/* Search Bar */}          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search snippets, tags, creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-vault-dark border border-vault-light/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-accent focus:border-transparent text-white placeholder-gray-400"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">            {/* Category Filter */}            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Category</label>              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-vault-dark border border-vault-light/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-vault-accent"
                style={{ 
                  colorScheme: 'dark',
                  backgroundColor: '#0a0a0a',
                  color: '#ffffff'
                }}
              >                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>{/* Tag Filter */}            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Tag</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full bg-vault-dark border border-vault-light/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-vault-accent [&>option]:bg-vault-dark [&>option]:text-white"
              >
                <option value="all" className="bg-vault-dark text-white">All Tags</option>
                {popularTags.map((tag) => (
                  <option key={tag} value={tag} className="bg-vault-dark text-white">
                    #{tag}
                  </option>
                ))}
              </select>
            </div>{/* Sort */}            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-vault-dark border border-vault-light/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-vault-accent [&>option]:bg-vault-dark [&>option]:text-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id} className="bg-vault-dark text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>{/* View Mode */}            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">View</label>
              <div className="flex space-x-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-vault-accent text-black'
                      : 'bg-vault-dark text-gray-300 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-vault-accent text-black'
                      : 'bg-vault-dark text-gray-300 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>          {/* Results count */}
          <div className="text-gray-400 text-sm mt-3 mb-6">
            {getResultsText()}
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
