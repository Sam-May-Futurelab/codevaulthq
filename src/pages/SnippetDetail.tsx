import { Download, Copy, Heart, Eye, MessageCircle, Share, ArrowLeft } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LiveCodePreview from '../components/LiveCodePreview';
import { snippetsData } from '../data/snippets';
import { useFirebaseSnippets } from '../hooks/useFirebaseData';

const SnippetDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'javascript'>('html');
  const [snippet, setSnippet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get Firebase snippets
  const { snippets: firebaseSnippets } = useFirebaseSnippets({
    realtime: true
  });

  // Find the correct snippet (Firebase or mock)
  useEffect(() => {
    if (!id) {
      setSnippet(snippetsData['1']);
      setLoading(false);
      return;
    }

    // First check Firebase snippets
    const firebaseSnippet = firebaseSnippets.find(s => s.id === id);
    if (firebaseSnippet) {
      setSnippet(firebaseSnippet);
      setLoading(false);
      return;
    }

    // Fallback to mock data
    const mockSnippet = snippetsData[id];
    if (mockSnippet) {
      setSnippet(mockSnippet);
      setLoading(false);
      return;
    }

    // If still not found and we have Firebase snippets loaded, use default
    if (firebaseSnippets.length > 0) {
      setSnippet(snippetsData['1']);
      setLoading(false);
    }
  }, [id, firebaseSnippets]);

  // Helper function to get code object from snippet
  const getCodeObject = () => {
    if (!snippet) return { html: '', css: '', javascript: '' };
    
    const code = snippet.code;
    if (typeof code === 'string') {
      // Parse Firebase format: HTML\n\n/* CSS */\nCSS\n\n/* JavaScript */\nJS
      const cssMarker = '/* CSS */';
      const jsMarker = '/* JavaScript */';
      
      const cssIndex = code.indexOf(cssMarker);
      const jsIndex = code.indexOf(jsMarker);
      
      let html = '';
      let css = '';
      let javascript = '';
      
      if (cssIndex !== -1 && jsIndex !== -1) {
        // All three sections present
        html = code.substring(0, cssIndex).trim();
        css = code.substring(cssIndex + cssMarker.length, jsIndex).trim();
        javascript = code.substring(jsIndex + jsMarker.length).trim();
      } else if (cssIndex !== -1) {
        // HTML and CSS sections
        html = code.substring(0, cssIndex).trim();
        css = code.substring(cssIndex + cssMarker.length).trim();
      } else if (jsIndex !== -1) {
        // HTML and JavaScript sections
        html = code.substring(0, jsIndex).trim();
        javascript = code.substring(jsIndex + jsMarker.length).trim();
      } else {
        // Single section - try to detect type
        if (code.includes('<') && (code.includes('html') || code.includes('div') || code.includes('body'))) {
          html = code;
        } else if (code.includes('{') && code.includes(':') && (code.includes('color') || code.includes('background') || code.includes('margin'))) {
          css = code;
        } else if (code.includes('function') || code.includes('=>') || code.includes('var') || code.includes('let') || code.includes('const')) {
          javascript = code;
        } else {
          // Default to HTML if unsure
          html = code;
        }
      }
      
      return { html, css, javascript };
    }
    return code || { html: '', css: '', javascript: '' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Snippet not found</div>
      </div>
    );
  }
  // Helper function to get stats with fallbacks
  const getStats = () => {
    if (!snippet) return { views: 0, downloads: 0, comments: 0, likes: 0 };
    
    // Check if snippet has analytics property (Firebase format)
    if (snippet.analytics) {
      return {
        views: snippet.analytics.views || 0,
        downloads: snippet.analytics.downloads || 0,
        comments: snippet.analytics.comments || 0,
        likes: snippet.analytics.likes || 0
      };
    }
    
    // Check if snippet has stats property (mock format)
    if (snippet.stats) {
      return snippet.stats;
    }
    
    // Check if snippet has metrics property
    if (snippet.metrics) {
      return snippet.metrics;
    }
    
    // Fallback
    return { views: 0, downloads: 0, comments: 0, likes: 0 };
  };

  const codeObj = getCodeObject();
  const stats = getStats();  return (
    <div className="min-h-screen bg-vault-dark overflow-x-hidden">
      {/* Container with very strict width constraints */}
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '2rem 1rem', overflow: 'hidden' }}>
        {/* Back Navigation */}
        <Link to="/browse" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>

        {/* Header */}
        <div className="mb-8" style={{ overflow: 'hidden' }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ wordBreak: 'break-word' }}>{snippet.title}</h1>
          <p className="text-lg text-gray-300" style={{ wordBreak: 'break-word' }}>{snippet.description}</p>
        </div>

        {/* Main Content - Single Column Layout with Very Strict Constraints */}
        <div className="space-y-8" style={{ overflow: 'hidden' }}>
          
          {/* Live Preview */}
          <div className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-6" style={{ overflow: 'hidden', maxWidth: '100%' }}>
            <h2 className="text-xl font-semibold text-white mb-4">Live Preview</h2>
            <div style={{ overflow: 'hidden', maxWidth: '100%' }}>
              <LiveCodePreview
                html={codeObj.html}
                css={codeObj.css}
                javascript={codeObj.javascript}
                title=""
              />
            </div>
          </div>

          {/* Code Tabs */}
          <div className="bg-vault-medium/50 border border-vault-light/20 rounded-xl overflow-hidden">
            <div className="flex border-b border-vault-light/30 bg-vault-medium/30">
              {(['html', 'css', 'javascript'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium transition-all ${
                    activeTab === tab
                      ? 'text-white bg-vault-accent/20 border-b-2 border-vault-accent'
                      : 'text-gray-400 hover:text-white hover:bg-vault-light/10'
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-300 text-sm font-medium">{activeTab.toUpperCase()} Code</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(codeObj[activeTab])}
                  className="bg-vault-accent hover:bg-vault-accent/80 text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Code</span>
                </button>
              </div>              <pre className="bg-vault-dark border border-vault-light/20 rounded-lg p-4 overflow-auto max-h-96 break-all">
                <code className="text-sm font-mono text-gray-300 break-all whitespace-pre-wrap">
                  {codeObj[activeTab]}
                </code>
              </pre>
            </div>
          </div>          {/* Action Cards - Single Column */}
          <div className="space-y-6" style={{ overflow: 'hidden', maxWidth: '100%' }}>
            
            {/* Actions */}
            <div className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-6" style={{ overflow: 'hidden' }}>
              <h3 className="text-white font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-vault-accent hover:bg-vault-accent/80 text-black py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                
                <button className="w-full bg-vault-light hover:bg-vault-light/80 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all">
                  <Copy className="w-4 h-4" />
                  <span>Copy Embed</span>
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-vault-light hover:bg-vault-light/80 text-white py-2 rounded-lg font-medium flex items-center justify-center space-x-1 transition-all">
                    <Heart className="w-4 h-4" />
                    <span>{stats.likes}</span>
                  </button>
                  
                  <button className="bg-vault-light hover:bg-vault-light/80 text-white py-2 rounded-lg font-medium flex items-center justify-center space-x-1 transition-all">
                    <Share className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-6" style={{ overflow: 'hidden' }}>
              <h3 className="text-white font-semibold mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between" style={{ maxWidth: '100%' }}>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Eye className="w-5 h-5 text-vault-accent" />
                    <span>Views</span>
                  </div>
                  <span className="text-white font-medium">{stats.views.toLocaleString()}</span>
                </div>
                  <div className="flex items-center justify-between" style={{ maxWidth: '100%' }}>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Download className="w-5 h-5 text-vault-accent" />
                    <span>Downloads</span>
                  </div>
                  <span className="text-white font-medium">{stats.downloads.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between" style={{ maxWidth: '100%' }}>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <MessageCircle className="w-5 h-5 text-vault-accent" />
                    <span>Comments</span>
                  </div>
                  <span className="text-white font-medium">{stats.comments.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-6" style={{ overflow: 'hidden' }}>
              <h3 className="text-white font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2" style={{ maxWidth: '100%' }}>
                {snippet.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-2 bg-vault-accent/20 text-vault-accent border border-vault-accent/30 rounded-lg text-sm font-medium hover:bg-vault-accent/30 transition-colors cursor-pointer"
                    style={{ wordBreak: 'break-word' }}
                  >
                    #{tag}
                  </span>
                )) || []}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetDetail;
