import { Heart, Eye, ExternalLink, User, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LiveCodePreviewSimple from './LiveCodePreviewSimple';
import AudioFeedback from '../utils/AudioFeedback';
import type { SnippetData } from '../data/snippets';

interface SnippetCardProps {
  snippet: SnippetData;
}

const SnippetCard = ({ snippet }: SnippetCardProps) => {
  const audio = AudioFeedback.getInstance();
  const categoryColors = {
    css: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    javascript: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    html: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
    canvas: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    webgl: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    react: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
    vue: 'bg-green-500/20 text-green-300 border-green-400/30',
    animation: 'bg-pink-500/20 text-pink-300 border-pink-400/30'
  };

  const categoryIcons = {
    css: '🎨',
    javascript: '⚡',
    html: '🌐',
    canvas: '🖼️',
    webgl: '🎮',
    react: '⚛️',
    vue: '💚',
    animation: '✨'
  };return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => audio.playHover()}      className="bg-vault-medium/50 backdrop-blur-sm border border-vault-light/20 rounded-xl overflow-hidden group hover:border-vault-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-vault-accent/10 w-full h-full max-w-none flex flex-col"
      style={{ 
        height: '480px', 
        minHeight: '480px', 
        maxHeight: '480px' 
      }}
    >      {/* DEDICATED LIVE PREVIEW SECTION - Exactly 260px height */}
      <div 
        className="relative bg-gradient-to-br from-vault-dark to-vault-medium overflow-hidden flex-shrink-0"
        style={{ 
          height: '260px', 
          minHeight: '260px', 
          maxHeight: '260px' 
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
              <LiveCodePreviewSimple 
                html={snippet.code.html}
                css={snippet.code.css}
                javascript={snippet.code.javascript}
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
        )}        {/* Category Badge - Positioned bottom-right of preview for better visibility */}
        <div 
          className="absolute bottom-3 right-3 z-20" 
          style={{ 
            position: 'absolute',
            bottom: '12px', 
            right: '12px', 
            zIndex: '999' 
          }}
        >          <span 
            className={`px-3 py-2 rounded-lg text-xs font-bold border shadow-lg backdrop-blur-sm ${
              categoryColors[snippet.category as keyof typeof categoryColors] || 
              'bg-gray-500/20 text-gray-300 border-gray-400/30'
            }`}
            style={{
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '8px 12px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(16px)',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <span className="mr-1">
              {categoryIcons[snippet.category as keyof typeof categoryIcons] || '📄'}
            </span>
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
        </div>      </div>      {/* CONTENT SECTION - Exactly 220px remaining height (480px - 260px) */}
      <div 
        className="p-4 flex flex-col justify-between flex-shrink-0"
        style={{ 
          height: '220px', 
          minHeight: '220px', 
          maxHeight: '220px' 
        }}
      >        {/* Title and Description - Top section */}
        <div className="flex-shrink-0">          <Link
            to={`/snippet/${snippet.id}`}
            className="text-lg font-semibold line-clamp-1 leading-tight block"
            data-testid="snippet-title-link"
            style={{ 
              color: '#ffffff !important',
              textDecoration: 'none !important'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8) !important';
              e.currentTarget.style.textDecoration = 'none !important';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#ffffff !important';
              e.currentTarget.style.textDecoration = 'none !important';
            }}
          >
            {snippet.title}
          </Link>
          <p className="text-gray-400 text-sm mt-2 line-clamp-2 leading-relaxed">
            {snippet.description}
          </p>
        </div>        {/* Middle section - Tags */}
        <div 
          className="flex flex-wrap gap-2 my-4"
          style={{
            gap: '8px',
            margin: '16px 0'
          }}
        >
          {snippet.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 bg-vault-accent/10 text-vault-accent text-xs rounded-md border border-vault-accent/20 hover:border-vault-accent/40 transition-colors"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px'
              }}
            >
              {tag}
            </span>
          ))}
          {snippet.tags.length > 3 && (
            <span 
              className="px-3 py-1.5 text-gray-400 text-xs bg-vault-light/10 rounded-md border border-vault-light/20"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px'
              }}
            >
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
                <span className="text-xs">{snippet.stats.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span className="text-xs">{snippet.stats.views}</span>
              </div>
            </div>
          </div>          {/* Action Buttons */}
          <div className="mt-4 pt-2">
            <Link
              to={`/snippet/${snippet.id}`}
              className="w-full bg-vault-accent hover:bg-vault-accent/80 text-black py-2.5 px-4 rounded-lg text-sm font-medium transition-colors text-center block"
            >
              View Code
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SnippetCard;
