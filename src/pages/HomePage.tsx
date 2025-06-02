import { motion } from 'framer-motion';
import { Code, Users, Download, Star, Code2, Palette, Layout, Settings, Sparkles, Wrench } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import ThreeHero from '../components/ThreeHero.tsx';
import SnippetCard from '../components/SnippetCard.tsx';
import TagCloud from '../components/TagCloud.tsx';
import { GSAPAnimations } from '../utils/GSAPAnimations';
import { useFirebaseSnippets } from '../hooks/useFirebaseData';
import { usePlatformStats } from '../hooks/useSnippetData';
import { snippetsData } from '../data/snippets';
import DataSeeder from '../services/DataSeeder';

const HomePage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const navigate = useNavigate();
  
  // Hierarchical category structure
  const categoryStructure = {
    essentials: {
      name: 'Essential Components',
      icon: Code2,
      color: 'text-blue-600',
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
      icon: Palette,
      color: 'text-pink-500',
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
      icon: Layout,
      color: 'text-green-500',
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
      icon: Settings,
      color: 'text-orange-500',
      subcategories: [
        { id: 'data-display', label: 'Data Visualization' },
        { id: 'interactive', label: 'Interactive Demos' },
        { id: 'games', label: 'Games & Playful' },
        { id: 'api', label: 'API Integration' },
        { id: 'auth', label: 'Authentication' }
      ]
    },    advanced: {
      name: 'Advanced & Experimental',
      icon: Sparkles,
      color: 'text-purple-500',
      subcategories: [
        { id: 'canvas', label: 'Canvas & Graphics' },
        { id: 'webgl', label: 'WebGL & 3D' },
        { id: 'svg', label: 'SVG Animations' },
        { id: 'performance', label: 'Performance' },
        { id: 'accessibility', label: 'Accessibility' }
      ]
    },    utilities: {
      name: 'Tools & Utilities',
      icon: Wrench,
      color: 'text-gray-500',
      subcategories: [
        { id: 'utilities', label: 'Developer Tools' },
        { id: 'plugins', label: 'Plugins & Add-ons' },
        { id: 'extensions', label: 'Browser Extensions' },
        { id: 'snippets', label: 'Code Snippets' },
        { id: 'generators', label: 'Generators' }
      ]
    }
  };
  
  // Get Firebase snippets (user uploaded)
  const { snippets: firebaseSnippets, loading: loadingFirebase, error: errorFirebase } = useFirebaseSnippets({
    orderByField: 'createdAt',
    orderDirection: 'desc',
    limitCount: 50,
    realtime: true
  });

  const { stats: platformStats, loading: loadingStats, error: errorStats } = usePlatformStats();
  
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
    
    setAllSnippets(uniqueSnippets);
  }, [firebaseSnippets]);
  
  // Get trending and top snippets from combined data
  const getTrendingSnippets = (limit = 6) => {
    return [...allSnippets]
      .sort((a, b) => {
        const aViews = a.stats?.views || a.metrics?.views || a.analytics?.views || 0;
        const bViews = b.stats?.views || b.metrics?.views || b.analytics?.views || 0;
        return bViews - aViews;
      })
      .slice(0, limit);
  };
  
  const getTopSnippets = (limit = 10) => {
    return [...allSnippets]
      .sort((a, b) => {
        const aLikes = a.stats?.likes || a.metrics?.likes || a.analytics?.likes || 0;
        const bLikes = b.stats?.likes || b.metrics?.likes || b.analytics?.likes || 0;
        return bLikes - aLikes;
      })
      .slice(0, limit);
  };
  
  const displayTrendingSnippets = getTrendingSnippets(6);
  const displayTopSnippets = getTopSnippets(10);
  
  // Debug Firebase connection
  console.log('Firebase Connection Debug:', {
    firebaseSnippets: firebaseSnippets.length,
    allSnippets: allSnippets.length,
    loadingFirebase,
    errorFirebase,
    platformStats,
    loadingStats,
    errorStats
  });

  const seedDatabase = async () => {
    if (isSeeding) return;
    
    setIsSeeding(true);
    try {
      await DataSeeder.seedDatabase();
      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error('Failed to seed database:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    // Initialize GSAP animations
    GSAPAnimations.initScrollAnimations();
    GSAPAnimations.initInteractiveAnimations();
      // Animate counters for stats with real data once loaded
    if (platformStats && !loadingStats) {
      const statElements = document.querySelectorAll('.stat-value');
      const values = [
        platformStats.totalSnippets,
        platformStats.activeUsers,
        platformStats.totalDownloads,
        platformStats.totalLikes
      ];
      
      statElements.forEach((element, index) => {
        GSAPAnimations.animateCounter(element as HTMLElement, values[index]);
      });
    }

    // Add magnetic effect to buttons
    const buttons = document.querySelectorAll('.magnetic-button');
    const cleanupFunctions: (() => void)[] = [];
    
    buttons.forEach(button => {
      const cleanup = GSAPAnimations.createMagneticEffect(button as HTMLElement);
      cleanupFunctions.push(cleanup);
    });

    // Add particle trail to hero section
    if (heroRef.current) {
      const cleanup = GSAPAnimations.createParticleTrail(heroRef.current);
      cleanupFunctions.push(cleanup);
    }

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };  }, [platformStats, loadingStats]);

  const stats = [
    { 
      icon: Code, 
      label: 'Snippets', 
      value: loadingStats ? '12,547' : platformStats?.totalSnippets.toLocaleString() || '12,547', 
      subtitle: 'Interactive treasures' 
    },    { 
      icon: Users, 
      label: 'Creators', 
      value: loadingStats ? '3,892' : platformStats?.activeUsers.toLocaleString() || '3,892', 
      subtitle: 'Creative coders' 
    },
    { 
      icon: Download, 
      label: 'Downloads', 
      value: loadingStats ? '89,234' : platformStats?.totalDownloads.toLocaleString() || '89,234', 
      subtitle: 'Code shared globally' 
    },
    { 
      icon: Star, 
      label: 'Stars', 
      value: loadingStats ? '156,789' : platformStats?.totalLikes.toLocaleString() || '156,789', 
      subtitle: 'Developer favorites' 
    }
  ];

  return (
    <>      {/* Hero Section with 3D Background - Full Width */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden mb-40">
        <ThreeHero />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-24">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-7xl md:text-9xl font-bold text-white mb-20 font-display tracking-tight floating"
          >
            Code Vault
            <span className="bg-gradient-to-r from-vault-accent to-vault-purple bg-clip-text text-transparent">
              {' '}HQ
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-400 mb-8 max-w-2xl mx-auto hero-subtitle floating"
          >
            Discover, share, and showcase beautiful interactive code snippets.
            The ultimate vault for creative developers.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm md:text-base text-vault-accent mb-16 font-code scan-line floating"
          >
            {loadingStats ? '12,547' : platformStats?.totalSnippets.toLocaleString() || '12,547'} snippets in the vault… and counting.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-10 justify-center"
          >
            <Link
              to="/browse"
              className="magnetic-button gsap-button retro-button text-black px-10 py-4 rounded-xl font-bold text-lg uppercase tracking-wider transform transition-all duration-300 hover:scale-105 glow-green text-center"
            >
              Explore Snippets
            </Link>
            
            <Link
              to="/upload"
              className="magnetic-button gsap-button retro-button-outline px-10 py-4 rounded-xl font-bold text-lg uppercase tracking-wider transform transition-all duration-300 hover:scale-105 glow-purple text-center"
            >
              Upload Your Code
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-vault-accent rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-vault-accent rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Rest of content - Full Width */}
      <div className="px-4">
      
        {/* Stats Section */}
        <section ref={statsRef} className="stats-section py-32 bg-gradient-to-br from-vault-dark via-vault-medium to-vault-dark border-y border-vault-accent/20 my-24">
          <div className="px-6 sm:px-8 lg:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {stats.map((stat: any, index: number) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center group stat-card"
                >
                  <div className="interactive-card bg-gradient-to-br from-vault-dark/80 to-vault-medium/80 rounded-xl p-12 border border-vault-accent/30 hover:border-vault-accent/60 transition-all duration-300 group-hover:scale-105 backdrop-blur-sm">
                    <stat.icon className="w-12 h-12 text-vault-accent mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-4xl font-bold text-white mb-4 font-mono stat-value">{stat.value}</div>
                    <div className="text-gray-300 uppercase tracking-wider text-sm font-semibold">{stat.label}</div>
                    <div className="text-zinc-500 text-xs mt-2 italic">{stat.subtitle}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Snippets */}
        <section className="py-32 mt-24">
          <div className="px-6 sm:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-24"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 font-display">
                Trending <span className="text-vault-accent">Snippets</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-6">
                Discover the most popular code snippets from our community of creative developers
              </p>
              <p className="text-sm text-vault-accent font-code">
                ✨ Curated by creative coders across the cosmos
              </p>
            </motion.div>            {loadingFirebase ? (
              <div className="text-center py-12">
                <div className="text-vault-accent text-lg">Loading snippets...</div>
                {import.meta.env.DEV && (
                  <button
                    onClick={seedDatabase}
                    disabled={isSeeding}
                    className="mt-4 px-6 py-2 bg-vault-accent text-black rounded-lg font-bold hover:bg-vault-accent/80 transition-colors disabled:opacity-50"
                  >
                    {isSeeding ? 'Seeding Database...' : 'Seed Sample Data'}
                  </button>
                )}
              </div>
            ) : (
              <div className="snippet-grid">
                {displayTrendingSnippets.map((snippet: any, index: number) => (
                  <motion.div
                    key={snippet.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="snippet-card"
                  >
                    <SnippetCard snippet={snippet} />
                  </motion.div>
                ))}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center mt-20"
            >
              <Link
                to="/browse"
                className="magnetic-button gsap-button bg-gradient-to-r from-vault-accent to-green-400 hover:from-green-400 hover:to-vault-accent text-black px-10 py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 hover:scale-105 glow-green inline-block"
              >
                View All Snippets
              </Link>
            </motion.div>
          </div>
        </section>        {/* Browse by Category Section */}
        <section className="category-section py-32 bg-gradient-to-r from-vault-purple/10 via-transparent to-vault-accent/10 my-24">
          <div className="px-6 sm:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 font-display">
                Browse by <span className="text-vault-purple">Category</span>
              </h2>
              <p className="text-lg text-gray-400 mb-6">
                Discover code snippets organized by functionality and purpose
              </p>
              <p className="text-sm text-vault-purple font-code">
                🎯 Find exactly what you need with our curated categories
              </p>
            </motion.div>            {/* Category Grid - Compact Layout */}
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(categoryStructure).map(([key, category], index) => {
                  const IconComponent = category.icon;
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="interactive-card bg-vault-medium/30 backdrop-blur-sm border border-vault-light/20 rounded-xl p-4 hover:border-vault-purple/50 transition-all duration-300 group cursor-pointer hover:scale-105"
                      onClick={() => navigate(`/browse?category=${key}`)}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-vault-purple/20 to-vault-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <IconComponent className={`w-6 h-6 ${category.color}`} />
                        </div>
                        <h3 className="text-white font-semibold text-sm group-hover:text-vault-purple transition-colors mb-2 leading-tight">
                          {category.name}
                        </h3>
                        <p className="text-gray-400 text-xs mb-3">
                          {category.subcategories.length} categories
                        </p>
                        
                        {/* Show top 2 subcategories as tags */}
                        <div className="space-y-1">
                          {category.subcategories.slice(0, 2).map((sub) => (
                            <div
                              key={sub.id}
                              className="text-xs text-vault-purple/70 bg-vault-purple/10 rounded px-2 py-1 hover:bg-vault-purple/20 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/browse?category=${sub.id}`);
                              }}
                            >
                              {sub.label}
                            </div>
                          ))}
                          {category.subcategories.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{category.subcategories.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );                })}
              </div>
            </div>
          </div>
        </section>

        {/* Tag Cloud Section */}
        <section className="py-32 bg-vault-medium/30 mt-24">
          <div className="px-6 sm:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-24"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 font-display">
                Explore by <span className="text-vault-purple">Tags</span>
              </h2>
              <p className="text-xl text-gray-400 mb-6">
                Find exactly what you're looking for
              </p>
              <p className="text-sm text-vault-purple font-code">
                🎯 Navigate the code multiverse with precision
              </p>
            </motion.div>

            <TagCloud />
          </div>
        </section>

        {/* Trending Tags */}
        <section className="trending-section py-32 mt-24">
          <div className="px-6 sm:px-8 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 font-display">
                🔥 Trending <span className="text-vault-accent">Tags</span>
              </h2>
              <p className="text-lg text-gray-400">
                What developers are creating right now
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {['WebGL', 'Particles', 'Hover Effects', '3D CSS', 'Scroll Animation', 'Microinteractions'].map((tag, index) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="trending-tag interactive-card bg-vault-medium/30 backdrop-blur-sm border border-vault-light/20 rounded-xl p-8 text-center hover:border-vault-accent/50 transition-all duration-300 cursor-pointer group"
                >                  <div className="text-2xl font-bold text-white mb-2 font-mono">42</div>
                  <div className="text-sm text-gray-300 mb-3">{tag}</div>
                  <div className="text-xs text-vault-accent font-semibold">+12%</div>
                  <div className="mt-3 h-1 bg-vault-dark rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "65%" }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-vault-accent to-vault-purple rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Development Database Controls */}
        {import.meta.env.DEV && (
          <div className="text-center mt-8 p-4 bg-vault-medium/20 rounded-lg border border-vault-light/20">
            <p className="text-gray-400 text-sm mb-3">Development Tools</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={seedDatabase}
                disabled={isSeeding}
                className="px-4 py-2 bg-vault-accent text-black rounded-lg font-bold hover:bg-vault-accent/80 transition-colors disabled:opacity-50"
              >
                {isSeeding ? 'Seeding...' : 'Seed Firebase Data'}
              </button>              <button
                onClick={() => {
                  console.log('Firebase Debug Info:', {
                    firebaseSnippets: firebaseSnippets.length,
                    allSnippets: allSnippets.length,
                    displayTrending: displayTrendingSnippets.length,
                    displayTop: displayTopSnippets.length,
                    errors: { errorFirebase, errorStats }
                  });
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-500 transition-colors"
              >
                Debug Firebase
              </button>
            </div>
            {(errorFirebase || errorStats) && (
              <div className="mt-3 text-red-400 text-xs">
                <p>Errors: {errorFirebase || errorStats}</p>
              </div>
            )}
          </div>
        )}
        
      </div>
    </>
  );
};

export default HomePage;
