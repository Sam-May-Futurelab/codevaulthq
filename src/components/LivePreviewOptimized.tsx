import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useAnimationControl } from '../hooks/useAnimationControl';
import { BatchedAnimationManager } from '../utils/BatchedAnimationManager';

interface LivePreviewProps {
  type: 'css' | 'canvas' | 'javascript' | 'animation' | 'webgl' | 'react' | 'vue';
  className?: string;
}

const LivePreview = ({ type, className = "" }: LivePreviewProps) => {  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    registerWithBatchManager: true
  });
  const { registerAnimation, cleanupAnimations, shouldAnimate } = useAnimationControl();

  // Pause/resume animations based on visibility and preference
    useEffect(() => {
    if (type === 'canvas' && canvasRef.current && isIntersecting && shouldAnimate) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const batchManager = BatchedAnimationManager.getInstance();
      let frame = 0;
      
      // Particle system with performance optimization
      const particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        maxLife: number;
        size: number;
        hue: number;
      }> = [];

      const createParticle = () => {
        return {
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          life: 80,
          maxLife: 80,
          size: Math.random() * 2.5 + 0.8,
          hue: Math.random() * 60 + 260 // Purple to blue range
        };
      };

      // Initialize particles - reduce count for performance
      const particleCount = isIntersecting ? 15 : 8;
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }

      const animate = () => {
        if (!shouldAnimate || !isIntersecting) return;

        // Optimize frame rate - skip frames when not fully visible
        frame++;
        if (frame % 2 === 0) { // Run at 30fps instead of 60fps for performance
          ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Update and draw particles
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            
            // Update position with bounds checking
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            // Bounce off edges
            if (p.x <= 0 || p.x >= canvas.width) p.vx *= -0.8;
            if (p.y <= 0 || p.y >= canvas.height) p.vy *= -0.8;
            
            // Keep in bounds
            p.x = Math.max(0, Math.min(canvas.width, p.x));
            p.y = Math.max(0, Math.min(canvas.height, p.y));
            
            // Fade out
            const alpha = p.life / p.maxLife;
            
            // Draw particle with optimized glow effect
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // Reduced glow for performance
            ctx.shadowBlur = 4;
            ctx.shadowColor = `hsl(${p.hue}, 80%, 70%)`;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${p.hue}, 80%, 70%)`;
            ctx.fill();
            
            ctx.restore();
                  // Remove dead particles
            if (p.life <= 0) {
              particles.splice(i, 1);
              particles.push(createParticle()); // Add new particle
            }
          }
        }
        
        // Let the batch manager handle animation scheduling instead of directly using requestAnimationFrame
      };
      
      // Register this animation with the batch manager
      const cleanupBatchAnimation = batchManager.addAnimation(animate);

      return () => {
        // Clean up batch animation when component unmounts
        cleanupBatchAnimation();
        cleanupAnimations();
      };
    }
  }, [type, isIntersecting, shouldAnimate, registerAnimation, cleanupAnimations]);

  const renderPreview = () => {
    // Only render animations if they should animate and are visible
    const animateProps = shouldAnimate && isIntersecting;
    
    switch (type) {
      case 'css':
        return (
          <div ref={targetRef} className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
            {/* Central Floating Orb - Perfectly centered */}
            <motion.div
              animate={animateProps ? {
                y: [0, -8, 0],
                scale: [1, 1.15, 1],
                boxShadow: [
                  "0 0 15px rgba(59, 130, 246, 0.5)",
                  "0 0 30px rgba(59, 130, 246, 0.8)",
                  "0 0 15px rgba(59, 130, 246, 0.5)"
                ]
              } : {}}
              transition={{
                duration: 3,
                repeat: animateProps ? Infinity : 0,
                ease: "easeInOut"
              }}
              className="w-10 h-10 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full relative z-10"
            />
            
            {/* Floating Particles - Controlled positioning */}
            {animateProps && Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  x: [0, Math.sin(i * 1.2) * 18, 0],
                  y: [0, Math.cos(i * 1.2) * 15, 0],
                  opacity: [0.4, 0.9, 0.4],
                  scale: [0.5, 1.2, 0.5]
                }}
                transition={{
                  duration: 3.5 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4
                }}
                className="absolute w-1.5 h-1.5 bg-blue-300 rounded-full"
                style={{
                  left: `${50 + Math.cos(i * 90 * Math.PI / 180) * 25}%`,
                  top: `${50 + Math.sin(i * 90 * Math.PI / 180) * 25}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </div>
        );

      case 'canvas':
        return (
          <div ref={targetRef} className="relative w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
          </div>
        );

      case 'javascript':
        return (
          <div ref={targetRef} className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-900/60 to-orange-900/60 overflow-hidden">
            {/* Interactive Button - Perfectly centered */}
            <motion.div
              whileHover={animateProps ? {
                scale: 1.08,
                boxShadow: "0 12px 25px rgba(251, 191, 36, 0.4)"
              } : {}}
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-sm font-bold rounded-lg cursor-pointer transform transition-all duration-300 relative z-10 shadow-lg"
            >
              Click Me!
            </motion.div>

            {/* Interactive Code Symbols - Reduced for performance */}
            {animateProps && ['{', '}', 'const'].map((symbol, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 3 + i * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5
                }}
                className="absolute text-yellow-400 font-mono text-xs font-bold opacity-70"
                style={{
                  left: `${30 + i * 30}%`,
                  top: `${30 + i * 15}%`
                }}
              >
                {symbol}
              </motion.div>
            ))}
          </div>
        );

      case 'animation':
        return (
          <div ref={targetRef} className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-900/40 to-purple-900/40 overflow-hidden">
            {/* Central rotating element - Perfectly centered */}
            <motion.div
              animate={animateProps ? {
                rotate: 360,
              } : {}}
              transition={{
                duration: 8,
                repeat: animateProps ? Infinity : 0,
                ease: "linear"
              }}
              className="relative"
            >
              <motion.div
                animate={animateProps ? {
                  scale: [1, 1.3, 1],
                  opacity: [0.8, 1, 0.8]
                } : {}}
                transition={{
                  duration: 2.5,
                  repeat: animateProps ? Infinity : 0,
                  ease: "easeInOut"
                }}
                className="w-12 h-12 border-3 border-vault-accent rounded-xl"
              />
            </motion.div>
            
            {/* Orbiting elements - Reduced for performance */}
            {animateProps && Array.from({ length: 2 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 6 + i * 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  transformOrigin: `${30 + i * 15}px ${30 + i * 15}px`
                }}
              >
                <motion.div
                  animate={{
                    scale: [0.7, 1.2, 0.7],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4
                  }}
                  className="w-3 h-3 bg-vault-accent rounded-full shadow-lg"
                />
              </motion.div>
            ))}
          </div>
        );

      case 'webgl':
        return (
          <div ref={targetRef} className="relative w-full h-full bg-gradient-to-br from-emerald-900 to-teal-900 overflow-hidden">
            {/* Simulated 3D Cube */}
            <motion.div
              animate={animateProps ? {
                rotateX: [0, 360],
                rotateY: [0, 360],
              } : {}}
              transition={{
                duration: 8,
                repeat: animateProps ? Infinity : 0,
                ease: "linear"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-16 h-16" style={{ perspective: '200px' }}>
                <motion.div
                  animate={animateProps ? {
                    rotateZ: [0, 180, 360],
                  } : {}}
                  transition={{
                    duration: 4,
                    repeat: animateProps ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-400 rounded-lg shadow-2xl"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(25deg) rotateY(25deg)'
                  }}
                />
              </div>
            </motion.div>
            
            {/* Floating wireframe elements - Reduced for performance */}
            {animateProps && Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  x: [0, Math.sin(i * 1.0) * 40, 0],
                  y: [0, Math.cos(i * 1.0) * 30, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
                className="absolute w-2 h-2 border border-emerald-300 rounded-sm"
                style={{
                  left: `${20 + (i % 3) * 30}%`,
                  top: `${20 + Math.floor(i / 3) * 30}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </div>
        );

      case 'react':
        return (
          <div ref={targetRef} className="relative w-full h-full bg-gradient-to-br from-blue-900/80 to-cyan-900/80 overflow-hidden">
            {/* React Logo Spinning */}
            <motion.div
              animate={animateProps ? {
                rotate: 360,
              } : {}}
              transition={{
                duration: 8,
                repeat: animateProps ? Infinity : 0,
                ease: "linear"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-20 h-20">
                {/* Electron Orbits - Reduced for performance */}
                {animateProps && Array.from({ length: 2 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      rotate: i === 1 ? -360 : 360,
                    }}
                    transition={{
                      duration: 4 + i,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 border-2 border-cyan-400/60 rounded-full"
                    style={{
                      transform: `rotate(${i * 90}deg)`,
                      borderRadius: '50%'
                    }}
                  />
                ))}
                
                {/* Central Nucleus */}
                <motion.div
                  animate={animateProps ? {
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: animateProps ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 m-auto w-6 h-6 bg-cyan-400 rounded-full"
                />
              </div>
            </motion.div>
          </div>
        );

      case 'vue':
        return (
          <div ref={targetRef} className="relative w-full h-full bg-gradient-to-br from-green-900/80 to-emerald-900/80 overflow-hidden">
            {/* Vue Logo Triangle */}
            <motion.div
              animate={animateProps ? {
                rotateY: [0, 360],
              } : {}}
              transition={{
                duration: 8,
                repeat: animateProps ? Infinity : 0,
                ease: "linear"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Main Triangle */}
                <motion.div
                  animate={animateProps ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    duration: 3,
                    repeat: animateProps ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className="w-0 h-0 border-l-[25px] border-r-[25px] border-b-[45px] border-l-transparent border-r-transparent border-b-green-400"
                />
                
                {/* Inner Triangle */}
                <motion.div
                  animate={animateProps ? {
                    scale: [0.8, 1, 0.8],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: animateProps ? Infinity : 0,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-emerald-300"
                />
              </div>
            </motion.div>
          </div>
        );

      default:
        return (
          <div ref={targetRef} className="relative w-full h-full flex items-center justify-center">
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
