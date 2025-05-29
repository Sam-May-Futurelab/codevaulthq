import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Eye, Save, Upload, Tag, Palette, Code2, FileImage } from 'lucide-react';

interface SnippetData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}

const UploadPage = () => {
  const [snippetData, setSnippetData] = useState<SnippetData>({
    title: '',
    description: '',
    category: 'css',
    tags: [],
    htmlCode: '<!-- Your HTML code here -->\n<div class="container">\n  <h1>Hello World</h1>\n</div>',
    cssCode: '/* Your CSS code here */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  font-family: Arial, sans-serif;\n}\n\nh1 {\n  color: #00ff88;\n  animation: glow 2s ease-in-out infinite alternate;\n}\n\n@keyframes glow {\n  from { text-shadow: 0 0 20px #00ff88; }\n  to { text-shadow: 0 0 30px #00ff88, 0 0 40px #00ff88; }\n}',
    jsCode: '// Your JavaScript code here\nconsole.log("Hello from Code Vault HQ!");\n\n// Add some interactivity\ndocument.addEventListener("DOMContentLoaded", function() {\n  const container = document.querySelector(".container");\n  \n  container.addEventListener("click", function() {\n    this.style.transform = this.style.transform === "scale(1.1)" ? "scale(1)" : "scale(1.1)";\n  });\n});'
  });
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('css');
  const [tagInput, setTagInput] = useState('');
  const previewRef = useRef<HTMLIFrameElement>(null);

  const categories = [
    { id: 'css', label: 'CSS', icon: Palette, color: 'text-blue-400' },
    { id: 'javascript', label: 'JavaScript', icon: Code2, color: 'text-yellow-400' },
    { id: 'html', label: 'HTML', icon: FileImage, color: 'text-orange-400' },
    { id: 'canvas', label: 'Canvas', icon: Code2, color: 'text-purple-400' },
    { id: 'webgl', label: 'WebGL', icon: Code2, color: 'text-green-400' },
    { id: 'animation', label: 'Animation', icon: Play, color: 'text-pink-400' }
  ];

  const editorTabs = [
    { id: 'html', label: 'HTML', language: 'html' },
    { id: 'css', label: 'CSS', language: 'css' },
    { id: 'js', label: 'JavaScript', language: 'javascript' }
  ];

  const handleCodeChange = (value: string | undefined, language: string) => {
    if (!value) return;
    
    const codeKey = language === 'html' ? 'htmlCode' : 
                   language === 'css' ? 'cssCode' : 'jsCode';
    
    setSnippetData(prev => ({
      ...prev,
      [codeKey]: value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !snippetData.tags.includes(tagInput.trim().toLowerCase())) {
      setSnippetData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSnippetData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const generatePreview = () => {
    const previewHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          body { margin: 0; padding: 20px; background: #0a0a0a; color: white; }
          ${snippetData.cssCode}
        </style>
      </head>
      <body>
        ${snippetData.htmlCode}
        <script>
          ${snippetData.jsCode}
        </script>
      </body>
      </html>
    `;

    if (previewRef.current) {
      const blob = new Blob([previewHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      previewRef.current.src = url;
    }
  };

  const handleSubmit = () => {
    // TODO: Implement actual submission logic
    console.log('Submitting snippet:', snippetData);
    alert('Snippet submission will be implemented with backend integration!');
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Upload Your <span className="text-vault-accent">Snippet</span>
          </h1>
          <p className="text-xl text-gray-400">
            Share your amazing code with the community
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Form & Editor */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Basic Info */}
            <div className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-vault-accent" />
                Snippet Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={snippetData.title}
                    onChange={(e) => setSnippetData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-vault-dark border border-vault-light/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-vault-accent focus:outline-none transition-colors"
                    placeholder="Enter snippet title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={snippetData.description}
                    onChange={(e) => setSnippetData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-vault-dark border border-vault-light/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-vault-accent focus:outline-none transition-colors resize-none"
                    placeholder="Describe your snippet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSnippetData(prev => ({ ...prev, category: category.id }))}
                        className={`p-3 rounded-lg border transition-all duration-200 ${
                          snippetData.category === category.id
                            ? 'border-vault-accent bg-vault-accent/10 text-vault-accent'
                            : 'border-vault-light/30 bg-vault-dark hover:border-vault-accent/50 text-gray-300'
                        }`}
                      >
                        <category.icon className={`w-4 h-4 mx-auto mb-1 ${category.color}`} />
                        <div className="text-xs font-medium">{category.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 bg-vault-dark border border-vault-light/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-vault-accent focus:outline-none transition-colors"
                      placeholder="Add tags"
                    />
                    <button
                      onClick={addTag}
                      className="bg-vault-accent hover:bg-vault-accent/80 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {snippetData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {snippetData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-vault-purple/20 text-vault-purple px-3 py-1 rounded-full text-sm flex items-center space-x-1 border border-vault-purple/30"
                        >
                          <span>#{tag}</span>
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="bg-vault-medium/50 border border-vault-light/20 rounded-xl overflow-hidden">
              <div className="border-b border-vault-light/20">
                <div className="flex space-x-0">
                  {editorTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'html' | 'css' | 'js')}
                      className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                        activeTab === tab.id
                          ? 'text-vault-accent border-vault-accent bg-vault-dark/50'
                          : 'text-gray-400 border-transparent hover:text-white hover:bg-vault-dark/30'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-96">
                <Editor
                  height="100%"
                  language={editorTabs.find(tab => tab.id === activeTab)?.language}
                  value={
                    activeTab === 'html' ? snippetData.htmlCode :
                    activeTab === 'css' ? snippetData.cssCode :
                    snippetData.jsCode
                  }
                  onChange={(value) => handleCodeChange(value, editorTabs.find(tab => tab.id === activeTab)?.language || 'css')}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    automaticLayout: true
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Preview Controls */}
            <div className="bg-vault-medium/50 border border-vault-light/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-vault-accent" />
                  Live Preview
                </h3>
                
                <div className="flex space-x-2">
                  <button
                    onClick={generatePreview}
                    className="bg-vault-accent hover:bg-vault-accent/80 text-black px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Update Preview</span>
                  </button>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm">
                Click "Update Preview" to see your code in action
              </p>
            </div>

            {/* Preview Frame */}
            <div className="bg-vault-medium/50 border border-vault-light/20 rounded-xl overflow-hidden">
              <div className="bg-vault-dark/50 px-4 py-2 border-b border-vault-light/20">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-4 text-gray-400 text-sm">Preview</div>
                </div>
              </div>
              
              <div className="h-96">
                <iframe
                  ref={previewRef}
                  className="w-full h-full border-0"
                  title="Code Preview"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full retro-button text-black py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 glow-green"
            >
              <Save className="w-5 h-5 inline mr-2" />
              Publish Snippet
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
