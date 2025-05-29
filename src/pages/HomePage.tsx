import { motion } from 'framer-motion';
import { Code, Users, Download, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThreeHero from '../components/ThreeHero';
import SnippetCard from '../components/SnippetCard';
import TagCloud from '../components/TagCloud';

const HomePage = () => {
  // Mock data for now
  const featuredSnippets = [
    {
      id: '1',
      title: 'Floating Orb Animation',
      description: 'Beautiful CSS animation with floating particles',
      category: 'css' as const,
      tags: ['animation', 'css', 'particles'],
      author: { username: 'designmaster', displayName: 'Design Master', isVerified: true },
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
      author: { username: 'cssdev', displayName: 'CSS Developer', isVerified: false },
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
      author: { username: 'canvasking', displayName: 'Canvas King', isVerified: true },
      likes: 312,
      views: 1580,
      thumbnailUrl: '/api/placeholder/300/200'
    }
  ];

  const stats = [
    { icon: Code, label: 'Snippets', value: '12,547' },
    { icon: Users, label: 'Creators', value: '3,892' },
    { icon: Download, label: 'Downloads', value: '89,234' },
    { icon: Star, label: 'Stars', value: '156,789' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with 3D Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <ThreeHero />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold text-white mb-6"
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
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Discover, share, and showcase beautiful interactive code snippets.
            The ultimate vault for creative developers.
          </motion.p>          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link
              to="/browse"
              className="retro-button text-black px-10 py-4 rounded-xl font-bold text-lg uppercase tracking-wider transform transition-all duration-300 hover:scale-105 glow-green text-center"
            >
              Explore Snippets
            </Link>
            <Link
              to="/upload"
              className="retro-button-outline px-10 py-4 rounded-xl font-bold text-lg uppercase tracking-wider transform transition-all duration-300 hover:scale-105 glow-purple text-center"
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
      <section className="py-20 bg-gradient-to-br from-vault-dark via-vault-medium to-vault-dark border-y border-vault-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="bg-gradient-to-br from-vault-dark/80 to-vault-medium/80 rounded-xl p-8 border border-vault-accent/30 hover:border-vault-accent/60 transition-all duration-300 group-hover:scale-105 backdrop-blur-sm">
                  <stat.icon className="w-10 h-10 text-vault-accent mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-4xl font-bold text-white mb-2 font-mono">{stat.value}</div>
                  <div className="text-gray-300 uppercase tracking-wider text-sm font-semibold">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Snippets */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trending <span className="text-vault-accent">Snippets</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Discover the most popular code snippets from our community of creative developers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredSnippets.map((snippet, index) => (
              <motion.div
                key={snippet.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <SnippetCard snippet={snippet} />
              </motion.div>
            ))}
          </div>          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              to="/browse"
              className="bg-gradient-to-r from-vault-accent to-green-400 hover:from-green-400 hover:to-vault-accent text-black px-10 py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 hover:scale-105 glow-green inline-block"
            >
              View All Snippets
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Tag Cloud Section */}
      <section className="py-20 bg-vault-medium/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Explore by <span className="text-vault-purple">Tags</span>
            </h2>
            <p className="text-xl text-gray-400">
              Find exactly what you're looking for
            </p>
          </motion.div>

          <TagCloud />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
