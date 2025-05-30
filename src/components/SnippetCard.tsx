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
    webgl: 'bg-green-500/20 text-green-400 border-green-500/30',
    animation: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
  };  return (    <motion.div
      whileHover={{ y: -8, rotateX: 5 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      onHoverStart={() => audio.playHover()}
      className="interactive-card snippet-card w-full max-w-xs mx-auto aspect-[5/7] bg-vault-medium/50 backdrop-blur-sm border border-vault-light/20 rounded-xl overflow-hidden group hover:border-vault-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-vault-accent/20 flex flex-col"
    >
      {/* Thumbnail/Preview */}
      <div className="relative h-40 bg-gradient-to-br from-vault-dark to-vault-medium overflow-hidden flex-shrink-0">{snippet.thumbnailUrl ? (
          <img
            src={snippet.thumbnailUrl}
            alt={snippet.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />        ) : (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            {/* Live Preview Component */}
            <div className="absolute inset-0">
              <LivePreview 
                type={snippet.category as 'css' | 'canvas' | 'javascript' | 'animation'} 
                className="w-full h-full" 
              />
            </div>
            
            {/* Overlay with icon */}
            <div className="relative z-10 w-16 h-16 bg-vault-dark/60 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-vault-accent/30">
              <ExternalLink className="w-8 h-8 text-vault-accent" />
            </div>
          </div>
        )}
          {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
            categoryColors[snippet.category as keyof typeof categoryColors] || 
            'bg-gray-500/20 text-gray-400 border-gray-500/30'
          }`}>
            {snippet.category.toUpperCase()}
          </span>
        </div>        {/* Quick Actions */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => audio.playClick()}
            className="bg-vault-dark/80 hover:bg-vault-dark text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>      {/* Content */}
      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-6">
          <Link
            to={`/snippet/${snippet.id}`}
            className="text-lg font-semibold text-white hover:text-vault-accent transition-colors line-clamp-2 leading-tight"
          >
            {snippet.title}
          </Link>
          <p className="text-gray-400 text-xs mt-3 line-clamp-2">
            {snippet.description}
          </p>
        </div>        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6 flex-1">
          {snippet.tags.slice(0, 2).map((tag, index) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="px-3 py-2 bg-gradient-to-r from-vault-accent/20 to-vault-purple/20 text-vault-accent text-xs rounded-full border border-vault-accent/30 hover:border-vault-accent/60 transition-all cursor-pointer font-medium"
            >
              #{tag}
            </motion.span>
          ))}
          {snippet.tags.length > 2 && (
            <span className="px-3 py-2 text-zinc-400 text-xs bg-vault-light/20 rounded-full border border-vault-light/30">
              +{snippet.tags.length - 2}
            </span>
          )}
        </div>{/* Author */}
        <div className="flex items-center justify-between text-xs mt-auto">
          <Link
            to={`/profile/${snippet.author.username}`}
            className="flex items-center space-x-2 group/author flex-1 min-w-0"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-vault-accent to-vault-purple rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 text-white" />
            </div>            <div className="flex items-center space-x-1 min-w-0">
              <span className="text-gray-300 group-hover/author:text-white transition-colors truncate">
                {snippet.author.displayName}
              </span>
              {snippet.author.isVerified && (
                <CheckCircle className="w-3 h-3 text-vault-accent flex-shrink-0" />
              )}
              {snippet.author.isPro && (
                <span className="pro-badge text-xs font-bold flex-shrink-0">✨</span>
              )}
            </div>
          </Link>          {/* Stats */}
          <div className="flex items-center space-x-3 text-gray-400 ml-3 flex-shrink-0">
            <div className="flex items-center space-x-1.5">
              <Heart className="w-3 h-3" />
              <span className="text-xs">{snippet.likes}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Eye className="w-3 h-3" />
              <span className="text-xs">{snippet.views}</span>
            </div>
          </div>
        </div>
      </div>      {/* Hover Actions */}
      <div className="px-6 pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex space-x-3">
          <Link
            to={`/snippet/${snippet.id}`}
            className="flex-1 bg-vault-accent hover:bg-vault-accent/80 text-black py-2.5 px-4 rounded-lg text-xs font-medium transition-colors text-center"
          >
            View
          </Link>
          <button className="bg-vault-light hover:bg-vault-light/80 text-white p-2.5 rounded-lg transition-colors">
            <Download className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SnippetCard;
