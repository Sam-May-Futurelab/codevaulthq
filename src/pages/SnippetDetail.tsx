import { Play, Download, Copy, Heart, Eye, MessageCircle, Share, ArrowLeft } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';

const SnippetDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'javascript'>('html');

  // Mock data
  const snippet = {
    id: id || '1',
    title: 'Canvas Particle System',
    description: 'Dynamic particle effects using HTML5 Canvas with smooth animations and interactive mouse events.',
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
    },
    stats: {
      likes: 245,
      views: 1250,
      downloads: 89,
      comments: 12
    },    tags: ['canvas', 'particles', 'animation', 'javascript', 'interactive'],
  };
  return (
    <div className="min-h-screen">
      <div className="pt-8">
      
      {/* Back Navigation */}
      <Link to="/browse" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-8">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Browse</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">{snippet.title}</h1>
        <p className="text-gray-300">{snippet.description}</p>
      </div>        {/* Simple Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Takes 2/3 width */}
          <div className="lg:col-span-2">
            
            {/* Preview */}
            <div className="bg-vault-medium rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Live Preview</h2>
                <button className="bg-vault-accent hover:bg-vault-accent/80 text-black px-4 py-2 rounded flex items-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Fullscreen</span>
                </button>
              </div>
              <div className="bg-black/20 rounded border">
                <div className="w-full h-64 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-gray-400">Live Preview Coming Soon</span>
                </div>
              </div>            </div>

            {/* Code Tabs */}
            <div className="bg-vault-medium rounded-lg">
              <div className="flex border-b border-vault-light/30">                {(['html', 'css', 'javascript'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 font-medium ${
                      activeTab === tab
                        ? 'text-white bg-vault-accent/20 border-b-2 border-vault-accent'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">{activeTab.toUpperCase()}</span>                  <button 
                    onClick={() => navigator.clipboard.writeText(snippet.code[activeTab])}
                    className="bg-vault-light hover:bg-vault-light/80 text-white px-3 py-1 rounded text-sm flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                </div>
                
                <pre className="bg-vault-dark rounded p-4 overflow-x-auto max-h-96">
                  <code className="text-sm font-mono text-gray-300">
                    {snippet.code[activeTab]}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Sidebar - Takes 1/3 width */}
          <div className="space-y-6">
              {/* Actions */}
            <div className="bg-vault-medium rounded-lg p-6">
              <div className="space-y-3">
                <button className="w-full bg-vault-accent hover:bg-vault-accent/80 text-black py-3 rounded flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download ZIP</span>
                </button>
                
                <button className="w-full bg-vault-light hover:bg-vault-light/80 text-white py-3 rounded flex items-center justify-center space-x-2">
                  <Copy className="w-4 h-4" />
                  <span>Copy Embed</span>
                </button>
                  <div className="grid grid-cols-2 gap-3">
                  <button className="bg-vault-light hover:bg-vault-light/80 text-white py-3 rounded flex items-center justify-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span>{snippet.stats.likes}</span>
                  </button>
                  
                  <button className="bg-vault-light hover:bg-vault-light/80 text-white py-3 rounded flex items-center justify-center space-x-2">
                    <Share className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>            {/* Stats */}
            <div className="bg-vault-medium rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Eye className="w-4 h-4" />
                    <span>Views</span>
                  </div>
                  <span className="text-white">{snippet.stats.views}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Download className="w-4 h-4" />
                    <span>Downloads</span>
                  </div>
                  <span className="text-white">{snippet.stats.downloads}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <MessageCircle className="w-4 h-4" />
                    <span>Comments</span>
                  </div>
                  <span className="text-white">{snippet.stats.comments}</span>
                </div>
              </div>
            </div>            {/* Tags */}
            <div className="bg-vault-medium rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {snippet.tags.map((tag) => (                  <span
                    key={tag}
                    className="px-3 py-1 bg-vault-accent/20 text-vault-accent border border-vault-accent/30 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetDetail;
