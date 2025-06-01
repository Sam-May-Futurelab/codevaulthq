import { Download, Copy, Heart, Eye, MessageCircle, Share, ArrowLeft } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import LiveCodePreview from '../components/LiveCodePreview';
import { snippetsData } from '../data/snippets';

const SnippetDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'javascript'>('html');

  // Get snippet from centralized data
  const snippet = snippetsData[id || '1'] || snippetsData['1'];return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto pt-8">
      
      {/* Back Navigation */}
      <Link to="/browse" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-8">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Browse</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">{snippet.title}</h1>
        <p className="text-gray-300">{snippet.description}</p>
      </div>{/* Simple Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Takes 2/3 width */}
          <div className="lg:col-span-2">            {/* Live Preview */}
            <div className="mb-6">
              <LiveCodePreview 
                html={snippet.code.html}
                css={snippet.code.css}
                javascript={snippet.code.javascript}
                title="Live Preview"
              />
            </div>

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
