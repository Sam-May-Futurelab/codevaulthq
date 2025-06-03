import { motion } from 'framer-motion';
import { Code, Users, Download, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import ThreeHero from '../components/ThreeHero.tsx';
import SnippetCard from '../components/SnippetCard.tsx';
import TagCloud from '../components/TagCloud.tsx';
import { GSAPAnimations } from '../utils/GSAPAnimations';
import { useFirebaseSnippets } from '../hooks/useFirebaseData';
import DataSeeder from '../services/DataSeeder';

const HomePage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Get Firebase snippets (user uploaded)
  const { snippets: firebaseSnippets, loading: loadingFirebase, error: errorFirebase } = useFirebaseSnippets({
    orderByField: 'createdAt',
    orderDirection: 'desc',
    limitCount: 50,
    realtime: true
  });
  
  // Use only Firebase snippets for display
  const [allSnippets, setAllSnippets] = useState<any[]>([]);
  
  useEffect(() => {
    // Use only Firebase snippets, no mock data
    setAllSnippets(firebaseSnippets);
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

  const displayTrendingSnippets = getTrendingSnippets(10);

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
    };
  }, []);

  const stats = [
    { 
      icon: Code, 
      label: 'Snippets', 
      value: allSnippets.length.toLocaleString() || '0', 
      subtitle: 'Interactive treasures' 
    },
    { 
      icon: Users, 
      label: 'Creators', 
      value: '3,892', 
      subtitle: 'Creative coders' 
    },
    { 
      icon: Download, 
      label: 'Downloads', 
      value: '89,234', 
      subtitle: 'Code shared globally' 
    },
    { 
      icon: Star, 
      label: 'Stars', 
      value: '156,789', 
      subtitle: 'Developer favorites' 
    }
  ];

  return (
    <>
      {/* Hero Section with 3D Background - Full Width */}
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
            {allSnippets.length.toLocaleString()} snippets in the vault… and counting.
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
                Latest <span className="text-vault-accent">Snippets</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-6">
                Discover the newest code snippets from our community of creative developers
              </p>
              <p className="text-sm text-vault-accent font-code">
                ✨ Fresh code from creative developers
              </p>
            </motion.div>
            
            {loadingFirebase ? (
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
              </button>
              <button
                onClick={() => {
                  console.log('Firebase Debug Info:', {
                    firebaseSnippets: firebaseSnippets.length,
                    allSnippets: allSnippets.length,
                    displayTrending: displayTrendingSnippets.length,
                    error: errorFirebase
                  });
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-500 transition-colors"
              >
                Debug Firebase
              </button>
            </div>
            {errorFirebase && (
              <div className="mt-3 text-red-400 text-xs">
                <p>Error: {errorFirebase}</p>
              </div>
            )}
          </div>
        )}
        
      </div>
    </>
  );
};

export default HomePage;
