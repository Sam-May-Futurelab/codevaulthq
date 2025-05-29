import { motion } from 'framer-motion';
import { useState } from 'react';

const TagCloud = () => {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  const tags = [
    { name: 'animation', size: 'text-4xl', popularity: 892 },
    { name: 'css', size: 'text-5xl', popularity: 1245 },
    { name: 'javascript', size: 'text-3xl', popularity: 756 },
    { name: 'hover', size: 'text-2xl', popularity: 423 },
    { name: 'button', size: 'text-3xl', popularity: 634 },
    { name: 'loader', size: 'text-4xl', popularity: 812 },
    { name: '3d', size: 'text-2xl', popularity: 345 },
    { name: 'particles', size: 'text-3xl', popularity: 567 },
    { name: 'canvas', size: 'text-4xl', popularity: 723 },
    { name: 'webgl', size: 'text-2xl', popularity: 234 },
    { name: 'scroll', size: 'text-3xl', popularity: 456 },
    { name: 'transition', size: 'text-2xl', popularity: 389 },
    { name: 'transform', size: 'text-3xl', popularity: 512 },
    { name: 'gradient', size: 'text-2xl', popularity: 367 },
    { name: 'blur', size: 'text-3xl', popularity: 445 },
    { name: 'glow', size: 'text-2xl', popularity: 298 },
    { name: 'shadow', size: 'text-2xl', popularity: 321 },
    { name: 'responsive', size: 'text-3xl', popularity: 578 },
    { name: 'mobile', size: 'text-2xl', popularity: 234 },
    { name: 'interactive', size: 'text-4xl', popularity: 689 }
  ];

  const getTagColor = (index: number) => {
    const colors = [
      'text-vault-accent',
      'text-vault-purple',
      'text-blue-400',
      'text-green-400',
      'text-yellow-400',
      'text-pink-400',
      'text-indigo-400',
      'text-red-400'
    ];
    return colors[index % colors.length];
  };

  const getRandomPosition = (index: number) => {
    // Create a more organic distribution
    const angle = (index * 137.5) % 360; // Golden angle
    const radius = 40 + (index % 3) * 20;
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;
    
    return {
      x: `${50 + x}%`,
      y: `${50 + y}%`
    };
  };

  return (
    <div className="relative h-96 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border border-vault-accent/20" />
          ))}
        </div>
      </div>

      {/* Tag Cloud */}
      <div className="relative h-full">
        {tags.map((tag, index) => {
          const position = getRandomPosition(index);
          const isHovered = hoveredTag === tag.name;
          
          return (
            <motion.button
              key={tag.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.05,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.2, 
                zIndex: 10,
                transition: { duration: 0.2 }
              }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 font-bold transition-all duration-300 hover:drop-shadow-lg cursor-pointer ${
                tag.size
              } ${getTagColor(index)} ${
                isHovered ? 'opacity-100' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                left: position.x,
                top: position.y,
                filter: isHovered ? `drop-shadow(0 0 20px currentColor)` : 'none'
              }}
              onMouseEnter={() => setHoveredTag(tag.name)}
              onMouseLeave={() => setHoveredTag(null)}
            >
              #{tag.name}
              
              {/* Popularity indicator */}
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: isHovered ? 1 : 0,
                  y: isHovered ? 0 : 10
                }}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs text-gray-400 whitespace-nowrap bg-vault-dark/80 px-2 py-1 rounded backdrop-blur-sm"
              >
                {tag.popularity} snippets
              </motion.span>
            </motion.button>
          );
        })}
      </div>

      {/* Floating particles for extra effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-vault-accent/30 rounded-full"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
            }}
            animate={{
              x: [
                Math.random() * 100 + '%',
                Math.random() * 100 + '%',
                Math.random() * 100 + '%'
              ],
              y: [
                Math.random() * 100 + '%',
                Math.random() * 100 + '%',
                Math.random() * 100 + '%'
              ],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Center Call to Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
      >
        <div className="bg-vault-dark/80 backdrop-blur-sm border border-vault-accent/30 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-white mb-2">Explore by Tags</h3>
          <p className="text-gray-400 text-sm">Click any tag to discover amazing snippets</p>
        </div>
      </motion.div>
    </div>
  );
};

export default TagCloud;
