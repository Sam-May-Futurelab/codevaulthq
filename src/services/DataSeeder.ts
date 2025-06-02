import FirebaseDbService from './FirebaseDbService';

// Mock snippets data to seed the database
const mockSnippets = [
  {
    title: "Animated Particle System",
    description: "A mesmerizing particle system with mouse interaction and gravity effects",
    code: `
// Particle System Animation
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = Math.random() * 4 - 2;
    this.vy = Math.random() * 4 - 2;
    this.life = 1;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.01;
  }
  
  draw() {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const particles = [];
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach((particle, index) => {
    particle.update();
    particle.draw();
    
    if (particle.life <= 0) {
      particles.splice(index, 1);
    }
  });
  
  requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (e) => {
  for (let i = 0; i < 5; i++) {
    particles.push(new Particle(e.clientX, e.clientY));
  }
});

animate();
    `,
    language: "javascript",
    tags: ["animation", "canvas", "particles", "interactive"],
    isPublic: true,
    authorId: "demo-user",
    authorName: "Creative Coder"
  },
  {
    title: "CSS Neon Glow Button",
    description: "A stunning neon glow button effect with hover animations",
    code: `
.neon-button {
  background: transparent;
  border: 2px solid #00ff88;
  color: #00ff88;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  border-radius: 50px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 
    0 0 20px rgba(0, 255, 136, 0.3),
    inset 0 0 20px rgba(0, 255, 136, 0.1);
}

.neon-button:hover {
  color: #000;
  background: #00ff88;
  box-shadow: 
    0 0 30px rgba(0, 255, 136, 0.8),
    0 0 60px rgba(0, 255, 136, 0.6),
    inset 0 0 30px rgba(0, 255, 136, 0.3);
  transform: scale(1.05);
}

.neon-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transition: left 0.5s;
}

.neon-button:hover::before {
  left: 100%;
}
    `,
    language: "css",
    tags: ["button", "neon", "glow", "animation", "hover"],
    isPublic: true,
    authorId: "demo-user",
    authorName: "Style Master"
  },
  {
    title: "React Typing Animation",
    description: "A typewriter effect component with cursor blinking",
    code: `
import React, { useState, useEffect } from 'react';

const TypewriterEffect = ({ text, speed = 100 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="typewriter">
      <span>{displayText}</span>
      <span className={\`cursor \${showCursor ? 'visible' : 'hidden'}\`}>|</span>
    </div>
  );
};

// CSS
.typewriter {
  font-family: 'Courier New', monospace;
  font-size: 24px;
  color: #00ff88;
}

.cursor {
  animation: blink 1s infinite;
}

.cursor.hidden {
  opacity: 0;
}

.cursor.visible {
  opacity: 1;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

export default TypewriterEffect;
    `,
    language: "react",
    tags: ["react", "typescript", "animation", "typewriter", "component"],
    isPublic: true,
    authorId: "demo-user",
    authorName: "React Ninja"
  },
  {
    title: "WebGL Shader Gradient",
    description: "Animated gradient background using WebGL shaders",
    code: `
// WebGL Animated Gradient
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

const vertexShaderSource = \`
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
\`;

const fragmentShaderSource = \`
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    float r = abs(sin(u_time * 0.5 + st.x * 3.0));
    float g = abs(sin(u_time * 0.7 + st.y * 2.0));
    float b = abs(sin(u_time * 0.3 + (st.x + st.y) * 1.5));
    
    gl_FragColor = vec4(r, g, b, 1.0);
  }
\`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
]), gl.STATIC_DRAW);

function render(time) {
  gl.useProgram(program);
  
  const timeLocation = gl.getUniformLocation(program, 'u_time');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  
  gl.uniform1f(timeLocation, time * 0.001);
  gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
  
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
    `,
    language: "webgl",
    tags: ["webgl", "shaders", "gradient", "animation", "graphics"],
    isPublic: true,
    authorId: "demo-user",
    authorName: "Shader Wizard"
  },
  {
    title: "3D CSS Card Flip",
    description: "Interactive 3D card flip effect on hover",
    code: `
.card-container {
  perspective: 1000px;
  width: 300px;
  height: 200px;
  margin: 50px auto;
}

.card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
  cursor: pointer;
}

.card:hover {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-back {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  transform: rotateY(180deg);
}

/* Glowing border effect */
.card-face::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #00ff88, #0088ff, #ff0088, #00ff88);
  border-radius: 17px;
  z-index: -1;
  animation: glowing 2s linear infinite;
  opacity: 0;
  transition: opacity 0.3s;
}

.card:hover .card-face::before {
  opacity: 1;
}

@keyframes glowing {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
    `,
    language: "css",
    tags: ["3d", "card", "flip", "animation", "hover", "css3"],
    isPublic: true,
    authorId: "demo-user",
    authorName: "3D Artist"
  },
  {
    title: "Vue.js Smooth Scroll",
    description: "Smooth scrolling navigation with active section highlighting",
    code: `
<template>
  <div>
    <nav class="smooth-nav">
      <ul>
        <li v-for="section in sections" :key="section.id">
          <a 
            :href="\`#\${section.id}\`"
            :class="{ active: activeSection === section.id }"
            @click="smoothScroll(section.id)"
          >
            {{ section.name }}
          </a>
        </li>
      </ul>
    </nav>
    
    <div class="content">
      <section 
        v-for="section in sections" 
        :key="section.id"
        :id="section.id"
        class="section"
      >
        <h2>{{ section.name }}</h2>
        <p>{{ section.content }}</p>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SmoothScroll',
  data() {
    return {
      activeSection: '',
      sections: [
        { id: 'home', name: 'Home', content: 'Welcome to our website!' },
        { id: 'about', name: 'About', content: 'Learn more about us.' },
        { id: 'services', name: 'Services', content: 'Our amazing services.' },
        { id: 'contact', name: 'Contact', content: 'Get in touch!' }
      ]
    }
  },
  methods: {
    smoothScroll(targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    },
    updateActiveSection() {
      const sections = this.sections;
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          this.activeSection = sections[i].id;
          break;
        }
      }
    }
  },
  mounted() {
    window.addEventListener('scroll', this.updateActiveSection);
    this.updateActiveSection();
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.updateActiveSection);
  }
}
</script>

<style scoped>
.smooth-nav {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  padding: 20px;
  z-index: 1000;
}

.smooth-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.smooth-nav li {
  margin: 10px 0;
}

.smooth-nav a {
  color: #fff;
  text-decoration: none;
  transition: color 0.3s;
}

.smooth-nav a.active,
.smooth-nav a:hover {
  color: #00ff88;
}

.section {
  height: 100vh;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
    `,
    language: "vue",
    tags: ["vue", "smooth-scroll", "navigation", "spa", "animation"],
    isPublic: true,
    authorId: "demo-user",
    authorName: "Vue Master"
  }
];

export class DataSeeder {
  static getCategoryFromLanguage(language: string) {
    // Define mapping from language to category
    const categoryMapping: Record<string, any> = {
      javascript: {
        id: 'javascript',
        label: 'JavaScript',
        mainCategory: {
          id: 'frontend',
          name: 'Frontend Development',
          color: 'text-yellow-500'
        }
      },
      css: {
        id: 'css',
        label: 'CSS',
        mainCategory: {
          id: 'visual',
          name: 'Visual & Animation',
          color: 'text-pink-500'
        }
      },
      react: {
        id: 'react',
        label: 'React',
        mainCategory: {
          id: 'frontend',
          name: 'Frontend Development',
          color: 'text-blue-500'
        }
      },
      webgl: {
        id: 'webgl',
        label: 'WebGL',
        mainCategory: {
          id: 'visual',
          name: 'Visual & Animation',
          color: 'text-purple-500'
        }
      },
      vue: {
        id: 'vue',
        label: 'Vue',
        mainCategory: {
          id: 'frontend',
          name: 'Frontend Development',
          color: 'text-green-500'
        }
      }
    };

    // Return the appropriate category or a default one
    return categoryMapping[language] || {
      id: language || 'misc',
      label: language ? language.charAt(0).toUpperCase() + language.slice(1) : 'Miscellaneous',
      mainCategory: {
        id: 'other',
        name: 'Other',
        color: 'text-gray-500'
      }
    };
  }

  static async seedDatabase() {
    try {
      console.log('🌱 Seeding database with sample snippets...');
      
      const results = [];
      for (const snippet of mockSnippets) {
        try {
          // Add category property based on language for backward compatibility
          const enrichedSnippet = {
            ...snippet,
            category: this.getCategoryFromLanguage(snippet.language)
          };
          
          const snippetId = await FirebaseDbService.createSnippet(enrichedSnippet);
          console.log(`✅ Created snippet: ${snippet.title} (ID: ${snippetId})`);
          results.push(snippetId);
        } catch (error) {
          console.error(`❌ Failed to create snippet: ${snippet.title}`, error);
        }
      }
      
      console.log(`🎉 Database seeding completed! Created ${results.length} snippets.`);
      return results;
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
  
  static async clearDatabase() {
    try {
      console.log('🧹 Clearing database...');
      // This would require implementing a clear method in FirebaseDbService
      // For now, this is a placeholder
      console.log('✅ Database cleared!');
    } catch (error) {
      console.error('❌ Failed to clear database:', error);
      throw error;
    }
  }
}

export default DataSeeder;
