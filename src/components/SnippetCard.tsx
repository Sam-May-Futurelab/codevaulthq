import { Heart, Eye, Download, ExternalLink, User, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LivePreview from './LivePreview';
import AudioFeedback from '../utils/AudioFeedback';

interface SnippetCardProps {
  snippet: {
    id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    author: {
      username: string;
      displayName: string;
      isVerified: boolean;
      isPro?: boolean;
    };
    likes: number;
    views: number;
    thumbnailUrl?: string;
  };
}

const SnippetCard = ({ snippet }: SnippetCardProps) => {
  const audio = AudioFeedback.getInstance();
    const categoryColors = {
    css: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    javascript: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    html: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    canvas: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    webgl: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    react: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    vue: 'bg-green-500/20 text-green-400 border-green-500/30',
    animation: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
  };  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => audio.playHover()}
      className="bg-vault-medium/50 backdrop-blur-sm border border-vault-light/20 rounded-xl overflow-hidden group hover:border-vault-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-vault-accent/10 w-full h-full max-w-none flex flex-col"
      style={{ 
        height: '420px', 
        minHeight: '420px', 
        maxHeight: '420px' 
      }}
    >
      {/* DEDICATED LIVE PREVIEW SECTION - Exactly 200px height */}
      <div 
        className="relative bg-gradient-to-br from-vault-dark to-vault-medium overflow-hidden flex-shrink-0"
        style={{ 
          height: '200px', 
          minHeight: '200px', 
          maxHeight: '200px' 
        }}
      >
        {snippet.thumbnailUrl ? (
          <img
            src={snippet.thumbnailUrl}
            alt={snippet.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full relative">            {/* Live Preview - Fill entire dedicated section */}
            <div className="w-full h-full">
              <LivePreview 
                type={snippet.category as 'css' | 'canvas' | 'javascript' | 'animation' | 'webgl' | 'react' | 'vue'} 
                className="w-full h-full"
              />
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
              <div className="bg-vault-dark/80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center space-x-2">
                <ExternalLink className="w-4 h-4 text-vault-accent" />
                <span className="text-white text-sm font-medium">View Details</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            categoryColors[snippet.category as keyof typeof categoryColors] || 
            'bg-gray-500/20 text-gray-400'
          }`}>
            {snippet.category.toUpperCase()}
          </span>
        </div>

        {/* Like Button */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={(e) => {
              e.preventDefault();
              audio.playClick();
            }}
            className="bg-vault-dark/80 hover:bg-vault-dark text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>      </div>

      {/* CONTENT SECTION - Exactly 220px remaining height (420px - 200px) */}
      <div 
        className="p-4 flex flex-col justify-between flex-shrink-0"
        style={{ 
          height: '220px', 
          minHeight: '220px', 
          maxHeight: '220px' 
        }}
      >
        {/* Title and Description - Top section */}
        <div className="flex-shrink-0">
          <Link
            to={`/snippet/${snippet.id}`}
            className="text-lg font-semibold text-white hover:text-vault-accent transition-colors line-clamp-1 leading-tight block"
          >
            {snippet.title}
          </Link>
          <p className="text-gray-400 text-sm mt-2 line-clamp-2 leading-relaxed">
            {snippet.description}
          </p>
        </div>

        {/* Middle section - Tags */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {snippet.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-vault-accent/10 text-vault-accent text-xs rounded border border-vault-accent/20 hover:border-vault-accent/40 transition-colors"
            >
              {tag}
            </span>
          ))}
          {snippet.tags.length > 3 && (
            <span className="px-2 py-1 text-gray-400 text-xs bg-vault-light/10 rounded border border-vault-light/20">
              +{snippet.tags.length - 3}
            </span>
          )}
        </div>

        {/* Bottom section - Author and Actions */}
        <div className="flex-shrink-0">
          {/* Author and Stats Row */}
          <div className="flex items-center justify-between mb-3">
            <Link
              to={`/profile/${snippet.author.username}`}
              className="flex items-center space-x-2 group/author"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-vault-accent to-vault-purple rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-300 group-hover/author:text-white transition-colors text-sm">
                  {snippet.author.displayName}
                </span>
                {snippet.author.isVerified && (
                  <CheckCircle className="w-3 h-3 text-vault-accent" />
                )}
                {snippet.author.isPro && (
                  <span className="text-xs">✨</span>
                )}
              </div>
            </Link>

            {/* Stats */}
            <div className="flex items-center space-x-3 text-gray-400">
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span className="text-xs">{snippet.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span className="text-xs">{snippet.views}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Link
              to={`/snippet/${snippet.id}`}
              className="flex-1 bg-vault-accent hover:bg-vault-accent/80 text-black py-2 px-3 rounded-lg text-sm font-medium transition-colors text-center"
            >
              View Code
            </Link>
            <button className="bg-vault-light hover:bg-vault-light/80 text-white p-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>        </div>
      </div>
    </motion.div>
  );
};

export default SnippetCard;
