import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface LivePreviewProps {
  type: 'css' | 'canvas' | 'javascript' | 'animation' | 'webgl' | 'react' | 'vue';
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
      
      // Particle system
      const particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        maxLife: number;
        size: number;
        hue: number;
      }> = [];      const createParticle = () => {
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
      };// Initialize particles
      for (let i = 0; i < 30; i++) {
        particles.push(createParticle());
      }      const animate = () => {
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
          
          // Draw particle with enhanced glow effect
          ctx.save();
          ctx.globalAlpha = alpha;
          
          // Enhanced glow
          ctx.shadowBlur = 8;
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
  }, [type]);  const renderPreview = () => {
    switch (type) {
      case 'css':
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
            {/* Central Floating Orb - Perfectly centered */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                scale: [1, 1.15, 1],
                boxShadow: [
                  "0 0 15px rgba(59, 130, 246, 0.5)",
                  "0 0 30px rgba(59, 130, 246, 0.8)",
                  "0 0 15px rgba(59, 130, 246, 0.5)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-10 h-10 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full relative z-10"
            />
            
            {/* Floating Particles - Controlled positioning */}
            {Array.from({ length: 6 }).map((_, i) => (
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
                  left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 25}%`,
                  top: `${50 + Math.sin(i * 60 * Math.PI / 180) * 25}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
            
            {/* Subtle Glow Rings - Centered */}
            {Array.from({ length: 2 }).map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                animate={{
                  scale: [1, 2.2, 1],
                  opacity: [0.4, 0, 0.4]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 2
                }}
                className="absolute w-12 h-12 border border-blue-400/40 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </div>
        );      case 'canvas':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
            {/* Canvas overlay indicator */}
            <div className="absolute bottom-2 right-2 text-purple-300 text-xs font-mono opacity-80 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
              &lt;canvas&gt;
            </div>
          </div>
        );      case 'javascript':
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-900/60 to-orange-900/60 overflow-hidden">
            {/* Interactive Button - Perfectly centered */}
            <motion.div
              whileHover={{
                scale: 1.08,
                boxShadow: "0 12px 25px rgba(251, 191, 36, 0.4)"
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-sm font-bold rounded-lg cursor-pointer transform transition-all duration-300 relative z-10 shadow-lg"
            >
              Click Me!
            </motion.div>

            {/* Interactive Code Symbols - Fixed positioning */}
            {['{', '}', '(', ')', ';', 'const'].map((symbol, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  x: [0, Math.sin(i * 1.5) * 15, 0],
                  opacity: [0.4, 0.9, 0.4],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 3.5 + i * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5
                }}
                className="absolute text-yellow-400 font-mono text-xs font-bold opacity-70"
                style={{
                  left: `${20 + (i % 3) * 25}%`,
                  top: `${25 + Math.floor(i / 3) * 35}%`
                }}
              >
                {symbol}
              </motion.div>
            ))}
            
            {/* Animated cursor - Fixed positioning */}
            <motion.div
              animate={{
                x: [20, -20, 20],
                y: [15, -15, 15],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-0.5 h-4 bg-yellow-400"
              style={{
                left: '65%',
                top: '45%'
              }}
            />
          </div>
        );      case 'animation':
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-900/40 to-purple-900/40 overflow-hidden">
            {/* Central rotating element - Perfectly centered */}
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              className="relative"
            >
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-12 h-12 border-3 border-vault-accent rounded-xl"
              />
            </motion.div>
            
            {/* Orbiting elements - Fixed positioning */}
            {Array.from({ length: 4 }).map((_, i) => (
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
                  transformOrigin: `${25 + i * 8}px ${25 + i * 8}px`
                }}
              >
                <motion.div
                  animate={{
                    scale: [0.7, 1.2, 0.7],
                    backgroundColor: [
                      "rgba(0, 255, 136, 0.9)",
                      "rgba(139, 92, 246, 0.9)",
                      "rgba(59, 130, 246, 0.9)",
                      "rgba(0, 255, 136, 0.9)"
                    ]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4
                  }}
                  className="w-3 h-3 rounded-full shadow-lg"
                />
              </motion.div>
            ))}
            
            {/* Pulsing background waves - Centered */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={`pulse-${i}`}
                animate={{
                  scale: [1, 2.5, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.5
                }}
                className="absolute w-8 h-8 bg-gradient-to-r from-vault-purple/40 to-vault-accent/40 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />            ))}
          </div>
        );

      case 'webgl':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-emerald-900 to-teal-900 overflow-hidden">
            {/* Simulated 3D Cube */}
            <motion.div
              animate={{
                rotateX: [0, 360],
                rotateY: [0, 360],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-16 h-16" style={{ perspective: '200px' }}>
                <motion.div
                  animate={{
                    rotateZ: [0, 180, 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
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
            
            {/* Floating wireframe elements - Edge to edge */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  x: [0, Math.sin(i * 0.8) * 60, 0],
                  y: [0, Math.cos(i * 0.8) * 50, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.8, 1.4, 0.8]
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
                className="absolute w-2 h-2 border border-emerald-300 rounded-sm"
                style={{
                  left: `${10 + (i % 4) * 25}%`,
                  top: `${10 + Math.floor(i / 4) * 25}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
            
            {/* Corner elements to test full width */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute top-2 left-2 w-3 h-3 bg-emerald-400 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute top-2 right-2 w-3 h-3 bg-teal-400 rounded-full"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-2 left-2 w-3 h-3 bg-emerald-300 rounded-full"
            />
            
            {/* WebGL indicator */}
            <div className="absolute bottom-2 right-2 text-emerald-300 text-xs font-mono opacity-80 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
              WebGL
            </div>
          </div>
        );

      case 'react':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-blue-900/80 to-cyan-900/80 overflow-hidden">
            {/* React Logo Spinning */}
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-24 h-24">
                {/* Electron Orbits - Larger to fill space */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      rotate: i === 1 ? -360 : 360,
                    }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 border-2 border-cyan-400/60 rounded-full"
                    style={{
                      transform: `rotate(${i * 60}deg)`,
                      borderRadius: '50%'
                    }}
                  />
                ))}
                
                {/* Central Nucleus */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    boxShadow: [
                      "0 0 10px rgba(34, 211, 238, 0.5)",
                      "0 0 20px rgba(34, 211, 238, 0.8)",
                      "0 0 10px rgba(34, 211, 238, 0.5)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 m-auto w-6 h-6 bg-cyan-400 rounded-full"
                />
              </div>
            </motion.div>
            
            {/* Component brackets - Full coverage */}
            {['<', '>', '</', '>', 'jsx', 'tsx'].map((bracket, i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: [0.4, 1, 0.4],
                  scale: [0.8, 1.2, 0.8],
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
                className="absolute text-cyan-300 text-sm font-bold font-mono"
                style={{
                  left: `${5 + (i % 3) * 45}%`,
                  top: `${10 + Math.floor(i / 3) * 40}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {bracket}
              </motion.div>
            ))}
            
            {/* Edge indicators for full width test */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            
            {/* React indicator */}
            <div className="absolute bottom-2 right-2 text-cyan-300 text-xs font-mono opacity-80 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
              ⚛️ React
            </div>
          </div>
        );

      case 'vue':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-green-900/80 to-emerald-900/80 overflow-hidden">
            {/* Vue Logo Triangle */}
            <motion.div
              animate={{
                rotateY: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* Main Triangle - Larger */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    filter: [
                      "drop-shadow(0 0 5px rgba(34, 197, 94, 0.5))",
                      "drop-shadow(0 0 15px rgba(34, 197, 94, 0.8))",
                      "drop-shadow(0 0 5px rgba(34, 197, 94, 0.5))"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-0 h-0 border-l-[25px] border-r-[25px] border-b-[45px] border-l-transparent border-r-transparent border-b-green-400"
                />
                
                {/* Inner Triangle */}
                <motion.div
                  animate={{
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-emerald-300"
                />
              </div>
            </motion.div>
            
            {/* Floating V elements - Full coverage */}
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  x: [0, Math.sin(i * 1.1) * 35, 0],
                  y: [0, Math.cos(i * 1.1) * 30, 0],
                  opacity: [0.3, 0.9, 0.3],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 4 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
                className="absolute text-green-400 text-sm font-bold font-mono"
                style={{
                  left: `${10 + (i % 5) * 20}%`,
                  top: `${10 + Math.floor(i / 5) * 40}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                V
              </motion.div>
            ))}
            
            {/* Progressive waves - Larger to fill space */}
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={`wave-${i}`}
                animate={{
                  scale: [1, 4, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.5
                }}
                className="absolute w-8 h-8 border-2 border-green-400/40 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
            
            {/* Side borders for width test */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-green-400/50 to-transparent" />
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-green-400/50 to-transparent" />
            
            {/* Vue indicator */}
            <div className="absolute bottom-2 right-2 text-green-300 text-xs font-mono opacity-80 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
              Vue.js
            </div>
          </div>
        );

      default:
        return (
          <div className="relative w-full h-full flex items-center justify-center">
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
