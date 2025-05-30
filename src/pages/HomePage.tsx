import { motion } from 'framer-motion';
import { Code, Users, Download, Star, Heart, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import ThreeHero from '../components/ThreeHero.tsx';
import SnippetCard from '../components/SnippetCard.tsx';
import TagCloud from '../components/TagCloud.tsx';
import { GSAPAnimations } from '../utils/GSAPAnimations';

const HomePage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize GSAP animations
    GSAPAnimations.initScrollAnimations();
    GSAPAnimations.initInteractiveAnimations();
    
    // Animate counters for stats
    const statElements = document.querySelectorAll('.stat-value');
    statElements.forEach((element, index) => {
      const values = [12547, 3892, 89234, 156789];
      GSAPAnimations.animateCounter(element as HTMLElement, values[index]);
    });

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
  // Category colors for consistency
  const categoryColors = {
    css: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    javascript: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    html: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    canvas: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    webgl: 'bg-green-500/20 text-green-400 border-green-500/30',
    animation: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
  };
  // Mock data for now
  const featuredSnippets = [
    {
      id: '1',
      title: 'Floating Orb Animation',
      description: 'Beautiful CSS animation with floating particles',
      category: 'css' as const,
      tags: ['animation', 'css', 'particles'],
      author: { username: 'designmaster', displayName: 'Design Master', isVerified: true, isPro: true },
      likes: 245,
      views: 1250,
      thumbnailUrl: '/api/placeholder/300/200'
    },
    {
      id: '2', 
      title: 'Interactive Button Hover',
      description: 'Smooth hover effects with CSS transforms',
      category: 'css' as const,
      tags: ['button', 'hover', 'transform'],
      author: { username: 'cssdev', displayName: 'CSS Developer', isVerified: false, isPro: false },
      likes: 189,
      views: 890,
      thumbnailUrl: '/api/placeholder/300/200'
    },
    {
      id: '3',
      title: 'Canvas Particle System',
      description: 'Dynamic particle effects using HTML5 Canvas',
      category: 'canvas' as const,
      tags: ['canvas', 'particles', 'animation'],
      author: { username: 'canvasking', displayName: 'Canvas King', isVerified: true, isPro: true },
      likes: 312,
      views: 1580,
      thumbnailUrl: '/api/placeholder/300/200'
    }
  ];
  const stats = [
    { icon: Code, label: 'Snippets', value: '12,547', subtitle: 'Interactive treasures' },
    { icon: Users, label: 'Creators', value: '3,892', subtitle: 'Creative coders' },
    { icon: Download, label: 'Downloads', value: '89,234', subtitle: 'Code shared globally' },
    { icon: Star, label: 'Stars', value: '156,789', subtitle: 'Developer favorites' }
  ];  return (
    <div className="min-h-screen">
      {/* Hero Section with 3D Background */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden mb-40">
        <ThreeHero /><div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-24">
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
          </motion.p>            <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm md:text-base text-vault-accent mb-16 font-code scan-line floating"
          >
            12,547 snippets in the vault… and counting.
          </motion.p>            <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-10 justify-center"
          >            <Link
              to="/browse"
              className="magnetic-button gsap-button retro-button text-black px-10 py-4 rounded-xl font-bold text-lg uppercase tracking-wider transform transition-all duration-300 hover:scale-105 glow-green text-center"
            >
              Explore Snippets
            </Link>            <Link
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
      </section>      {/* Stats Section */}
      <section ref={statsRef} className="stats-section py-32 bg-gradient-to-br from-vault-dark via-vault-medium to-vault-dark border-y border-vault-accent/20 my-24">        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group stat-card"
              >                <div className="interactive-card bg-gradient-to-br from-vault-dark/80 to-vault-medium/80 rounded-xl p-12 border border-vault-accent/30 hover:border-vault-accent/60 transition-all duration-300 group-hover:scale-105 backdrop-blur-sm">                  <stat.icon className="w-12 h-12 text-vault-accent mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-4xl font-bold text-white mb-4 font-mono stat-value">{stat.value}</div>
                  <div className="text-gray-300 uppercase tracking-wider text-sm font-semibold">{stat.label}</div>
                  <div className="text-zinc-500 text-xs mt-2 italic">{stat.subtitle}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>      {/* Featured Snippets */}
      <section className="py-32 mt-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 font-display">
              Trending <span className="text-vault-accent">Snippets</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-6">
              Discover the most popular code snippets from our community of creative developers
            </p>
            <p className="text-sm text-vault-accent font-code">
              ✨ Curated by creative coders across the cosmos
            </p>
          </motion.div><div className="snippet-grid">
            {featuredSnippets.map((snippet, index) => (
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
          </div>          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-20"
          >            <Link
              to="/browse"
              className="magnetic-button gsap-button bg-gradient-to-r from-vault-accent to-green-400 hover:from-green-400 hover:to-vault-accent text-black px-10 py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 hover:scale-105 glow-green inline-block"
            >
              View All Snippets
            </Link>
          </motion.div>
        </div>
      </section>      {/* Top 10 of the Month - Horizontal Scroll Carousel */}
      <section className="top10-section py-32 bg-gradient-to-r from-vault-purple/10 via-transparent to-vault-accent/10 my-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 font-display">
              🏆 Top 10 <span className="text-vault-purple">of the Month</span>
            </h2>
            <p className="text-lg text-gray-400 mb-6">
              The most impressive snippets developers are talking about
            </p>
            <p className="text-sm text-vault-purple font-code">
              🚀 Ranked by community engagement and creativity
            </p>
          </motion.div>

          {/* Horizontal Scroll Container */}
          <div className="relative">
            <div className="flex space-x-8 overflow-x-auto pb-6 scrollbar-thin scrollbar-track-vault-dark scrollbar-thumb-vault-accent/50">
              {featuredSnippets.concat(featuredSnippets).map((snippet, index) => (
                <motion.div
                  key={`top10-${snippet.id}-${index}`}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}                  className="flex-shrink-0 w-80 top10-item"
                >
                  <div className="interactive-card relative bg-vault-medium/30 backdrop-blur-sm border border-vault-light/20 rounded-xl p-4 hover:border-vault-purple/50 transition-all duration-300 group">
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-vault-purple to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-vault-purple/20 to-vault-accent/20 rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-6 h-6 text-vault-purple" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold line-clamp-1">{snippet.title}</h3>
                        <p className="text-gray-400 text-xs line-clamp-1">{snippet.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Heart className="w-4 h-4" />
                        <span>{snippet.likes}</span>
                        <Eye className="w-4 h-4 ml-2" />
                        <span>{snippet.views}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        categoryColors[snippet.category as keyof typeof categoryColors] || 
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {snippet.category.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>      {/* Tag Cloud Section */}
      <section className="py-32 bg-vault-medium/30 mt-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 font-display">
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
      </section>      {/* Trending Tags */}
      <section className="trending-section py-32 mt-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 font-display">
              🔥 Trending <span className="text-vault-accent">Tags</span>
            </h2>
            <p className="text-lg text-gray-400">
              What developers are creating right now
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {/*
              Replace with dynamic data as needed
            */}
            {['WebGL', 'Particles', 'Hover Effects', '3D CSS', 'Scroll Animation', 'Microinteractions'].map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}                whileHover={{ scale: 1.05, y: -5 }}
                className="trending-tag interactive-card bg-vault-medium/30 backdrop-blur-sm border border-vault-light/20 rounded-xl p-8 text-center hover:border-vault-accent/50 transition-all duration-300 cursor-pointer group"
              >                <div className="text-2xl font-bold text-white mb-2 font-mono">{Math.floor(Math.random() * 1000)}</div>
                <div className="text-sm text-gray-300 mb-3">{tag}</div>
                <div className="text-xs text-vault-accent font-semibold">{`+${Math.floor(Math.random() * 30)}%`}</div>
                <div className="mt-3 h-1 bg-vault-dark rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.random() * 60 + 40}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-vault-accent to-vault-purple rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
