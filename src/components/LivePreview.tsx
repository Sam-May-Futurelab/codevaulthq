import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface LivePreviewProps {
  type: 'css' | 'canvas' | 'javascript' | 'animation';
  className?: string;
}

const LivePreview = ({ type, className = "" }: LivePreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (type === 'canvas' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationId: number;
      let frame = 0;

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Simple particle animation
        for (let i = 0; i < 5; i++) {
          const x = 50 + Math.sin(frame * 0.02 + i) * 30;
          const y = 50 + Math.cos(frame * 0.02 + i * 0.5) * 20;
          
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${120 + i * 20}, 70%, 60%)`;
          ctx.fill();
        }
        
        frame++;
        animationId = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }
  }, [type]);

  const renderPreview = () => {
    switch (type) {
      case 'css':
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg"
            />
            <motion.div
              animate={{
                x: [0, 20, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-2 h-2 bg-blue-300 rounded-full"
            />
          </div>
        );

      case 'canvas':
        return (
          <canvas
            ref={canvasRef}
            width={100}
            height={100}
            className="w-full h-full"
          />
        );

      case 'javascript':
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-yellow-400 font-mono text-xs"
            >
              {'</>'}
            </motion.div>
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                style={{
                  left: `${30 + i * 20}%`,
                  top: `${60 + i * 5}%`
                }}
              />
            ))}
          </div>
        );

      case 'animation':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
              className="w-6 h-6 border-2 border-vault-accent border-t-transparent rounded-full"
            />
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-8 h-8 border border-vault-purple/50 rounded-full"
            />
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse" />
          </div>
        );
    }
  };

  return (
    <div className={`${className}`}>
      {renderPreview()}
    </div>
  );
};

export default LivePreview;
