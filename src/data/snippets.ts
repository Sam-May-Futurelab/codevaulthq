export interface SnippetData {
  id: string;
  title: string;
  description: string;
  category: 'css' | 'javascript' | 'html' | 'canvas' | 'webgl' | 'react' | 'vue' | 'animation';
  tags: string[];
  author: {
    username: string;
    displayName: string;
    isVerified: boolean;
    isPro?: boolean;
  };
  stats: {
    likes: number;
    views: number;
    downloads: number;
    comments: number;
  };
  code: {
    html: string;
    css: string;
    javascript: string;
  };
  thumbnailUrl?: string;
}

export const snippetsData: Record<string, SnippetData> = {
  '1': {
    id: '1',
    title: 'Canvas Particle System',
    description: 'Dynamic particle effects using HTML5 Canvas with smooth animations and interactive mouse events.',
    category: 'canvas',
    tags: ['canvas', 'particles', 'animation', 'javascript', 'interactive'],
    author: { username: 'canvasking', displayName: 'Canvas King', isVerified: true },
    stats: { likes: 245, views: 1250, downloads: 89, comments: 12 },
    code: {
      html: `<canvas id="particles" width="400" height="300"></canvas>`,
      css: `#particles {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  cursor: crosshair;
}`,
      javascript: `const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
const particles = [];

for(let i = 0; i < 50; i++) {
  particles.push({
    x: Math.random() * 400,
    y: Math.random() * 300,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3,
    size: Math.random() * 4 + 1,
    color: \`hsl(\${Math.random() * 360}, 70%, 70%)\`
  });
}

function animate() {
  ctx.clearRect(0, 0, 400, 300);
  
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    
    if(p.x < 0 || p.x > 400) p.vx *= -1;
    if(p.y < 0 || p.y > 300) p.vy *= -1;
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });
  
  requestAnimationFrame(animate);
}

animate();`
    }
  },
  '2': {
    id: '2',
    title: 'Floating Button Animation',
    description: 'Beautiful CSS hover effects with smooth transforms and glowing animations.',
    category: 'css',
    tags: ['button', 'hover', 'animation', 'css', 'glow'],
    author: { username: 'designmaster', displayName: 'Design Master', isVerified: true },
    stats: { likes: 189, views: 890, downloads: 67, comments: 8 },
    code: {
      html: `<div class="container">
  <button class="glow-button">
    <span>Hover Me</span>
    <div class="glow"></div>
  </button>
</div>`,
      css: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: #1a1a1a;
}

.glow-button {
  position: relative;
  padding: 15px 30px;
  background: linear-gradient(45deg, #ff6b6b, #ffa726);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.glow-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(255, 107, 107, 0.4);
}

.glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s;
}

.glow-button:hover .glow {
  left: 100%;
}`,
      javascript: `// Add click ripple effect
document.querySelector('.glow-button').addEventListener('click', function(e) {
  const button = e.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple');
  
  button.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 600);
});

// Add ripple CSS
const style = document.createElement('style');
style.textContent = \`
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  }
  @keyframes ripple {
    to { transform: scale(4); opacity: 0; }
  }
\`;
document.head.appendChild(style);`
    }
  },
  '3': {
    id: '3',
    title: 'Morphing Shape Loader',
    description: 'CSS-only loading animation with smooth morphing shapes and color transitions.',
    category: 'animation',
    tags: ['loader', 'animation', 'morphing', 'css', 'loading'],
    author: { username: 'animatemaster', displayName: 'Animate Master', isVerified: true },
    stats: { likes: 156, views: 743, downloads: 45, comments: 5 },
    code: {
      html: `<div class="loader-container">
  <div class="morphing-loader">
    <div class="shape"></div>
  </div>
  <p class="loading-text">Loading...</p>
</div>`,
      css: `.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: #1a1a1a;
  gap: 20px;
}

.morphing-loader {
  width: 80px;
  height: 80px;
  position: relative;
}

.shape {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
  background-size: 400% 400%;
  animation: morph 2s ease-in-out infinite, gradient 3s ease infinite;
  border-radius: 50%;
}

@keyframes morph {
  0%, 100% {
    border-radius: 50%;
    transform: rotate(0deg) scale(1);
  }
  25% {
    border-radius: 25% 75% 50% 50%;
    transform: rotate(90deg) scale(1.1);
  }
  50% {
    border-radius: 25%;
    transform: rotate(180deg) scale(0.9);
  }
  75% {
    border-radius: 75% 25% 50% 50%;
    transform: rotate(270deg) scale(1.1);
  }
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.loading-text {
  color: #667eea;
  font-size: 16px;
  font-weight: 500;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}`,
      javascript: `// Add dynamic loading messages
const messages = [
  'Loading...',
  'Almost there...',
  'Getting ready...',
  'Just a moment...'
];

let messageIndex = 0;
const textElement = document.querySelector('.loading-text');

setInterval(() => {
  messageIndex = (messageIndex + 1) % messages.length;
  textElement.textContent = messages[messageIndex];
}, 1500);

// Add completion animation after 8 seconds
setTimeout(() => {
  const shape = document.querySelector('.shape');
  const text = document.querySelector('.loading-text');
  
  shape.style.animation = 'none';
  shape.style.background = '#4ade80';
  shape.style.borderRadius = '50%';
  shape.style.transform = 'scale(1.2)';
  shape.style.transition = 'all 0.5s ease';
  
  text.textContent = '✓ Complete!';
  text.style.color = '#4ade80';
}, 8000);`
    }
  },
  '4': {
    id: '4',
    title: 'Interactive Card Flip',
    description: 'Smooth 3D card flip animation with hover effects and interactive elements.',
    category: 'css',
    tags: ['card', 'flip', '3d', 'hover', 'animation'],
    author: { username: 'flipmaster', displayName: 'Flip Master', isVerified: true },
    stats: { likes: 203, views: 967, downloads: 78, comments: 15 },
    code: {
      html: `<div class="card-container">
  <div class="flip-card">
    <div class="flip-card-inner">
      <div class="flip-card-front">
        <h3>Front Side</h3>
        <p>Hover to flip</p>
        <div class="icon">🎴</div>
      </div>
      <div class="flip-card-back">
        <h3>Back Side</h3>
        <p>Amazing content here!</p>
        <button class="action-btn">Click Me</button>
      </div>
    </div>
  </div>
</div>`,
      css: `.card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: #1a1a1a;
  perspective: 1000px;
}

.flip-card {
  width: 200px;
  height: 250px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.flip-card:hover {
  transform: rotateY(180deg);
}

.flip-card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.flip-card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.flip-card-back {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  transform: rotateY(180deg);
}

.icon {
  font-size: 48px;
  margin: 10px 0;
}

.action-btn {
  padding: 10px 20px;
  background: rgba(255,255,255,0.2);
  border: 2px solid white;
  border-radius: 25px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: white;
  color: #f5576c;
}`,
      javascript: `// Add click interactions
document.querySelector('.action-btn').addEventListener('click', function() {
  const card = document.querySelector('.flip-card');
  const btn = this;
  
  // Add click effect
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => {
    btn.style.transform = 'scale(1)';
  }, 150);
  
  // Change button text temporarily
  const originalText = btn.textContent;
  btn.textContent = '✓ Clicked!';
  btn.style.background = '#4ade80';
  btn.style.borderColor = '#4ade80';
  btn.style.color = 'white';
    setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = 'rgba(255,255,255,0.2)';
    btn.style.borderColor = 'white';
    btn.style.color = 'white';
  }, 2000);
});`
    }
  }
};

// Helper function to get all snippets as an array
export const getAllSnippets = (): SnippetData[] => {
  return Object.values(snippetsData);
};

// Helper function to get a specific snippet by ID
export const getSnippetById = (id: string): SnippetData | null => {
  return snippetsData[id] || null;
};

// Helper function for converting to the format needed by SnippetCard
export const formatSnippetForCard = (snippet: SnippetData) => ({
  id: snippet.id,
  title: snippet.title,
  description: snippet.description,
  category: snippet.category,
  tags: snippet.tags,
  author: snippet.author,
  likes: snippet.stats.likes,
  views: snippet.stats.views,
  thumbnailUrl: snippet.thumbnailUrl
});
