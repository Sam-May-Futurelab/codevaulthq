import { Heart, Eye, Download, ExternalLink, User, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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
    };
    likes: number;
    views: number;
    thumbnailUrl?: string;
  };
}

const SnippetCard = ({ snippet }: SnippetCardProps) => {
  const categoryColors = {
    css: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    javascript: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    html: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    canvas: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    webgl: 'bg-green-500/20 text-green-400 border-green-500/30',
    animation: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-vault-medium/50 backdrop-blur-sm border border-vault-light/20 rounded-xl overflow-hidden group hover:border-vault-accent/50 transition-all duration-300"
    >
      {/* Thumbnail/Preview */}
      <div className="relative h-48 bg-gradient-to-br from-vault-dark to-vault-medium overflow-hidden">
        {snippet.thumbnailUrl ? (
          <img
            src={snippet.thumbnailUrl}
            alt={snippet.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 bg-vault-accent/20 rounded-full flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-vault-accent" />
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
            categoryColors[snippet.category as keyof typeof categoryColors] || 
            'bg-gray-500/20 text-gray-400 border-gray-500/30'
          }`}>
            {snippet.category.toUpperCase()}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="bg-vault-dark/80 hover:bg-vault-dark text-white p-2 rounded-lg backdrop-blur-sm transition-colors">
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <Link
            to={`/snippet/${snippet.id}`}
            className="text-xl font-semibold text-white hover:text-vault-accent transition-colors line-clamp-2"
          >
            {snippet.title}
          </Link>
          <p className="text-gray-400 text-sm mt-2 line-clamp-2">
            {snippet.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {snippet.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-vault-light/30 text-gray-300 text-xs rounded-md hover:bg-vault-accent/20 hover:text-vault-accent transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
          {snippet.tags.length > 3 && (
            <span className="px-2 py-1 text-gray-400 text-xs">
              +{snippet.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Author */}
        <div className="flex items-center justify-between">
          <Link
            to={`/profile/${snippet.author.username}`}
            className="flex items-center space-x-2 group/author"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-vault-accent to-vault-purple rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-300 group-hover/author:text-white transition-colors">
                {snippet.author.displayName}
              </span>
              {snippet.author.isVerified && (
                <CheckCircle className="w-4 h-4 text-vault-accent" />
              )}
            </div>
          </Link>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-gray-400 text-sm">
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{snippet.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{snippet.views}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Actions */}
      <div className="px-6 pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex space-x-2">
          <Link
            to={`/snippet/${snippet.id}`}
            className="flex-1 bg-vault-accent hover:bg-vault-accent/80 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors text-center"
          >
            View Details
          </Link>
          <button className="bg-vault-light hover:bg-vault-light/80 text-white p-2 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SnippetCard;
