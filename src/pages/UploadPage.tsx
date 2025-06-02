import { motion } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Eye, Save, Upload, Tag, Palette, Code2, RefreshCw, Layout, Settings, Sparkles } from 'lucide-react';
import FirebaseDbService from '../services/FirebaseDbService';
import { useAuth } from '../hooks/useAuth.tsx';
import AuthModal from '../components/AuthModal';
import ColorPicker from '../components/ColorPicker';

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
  const { currentUser } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [snippetData, setSnippetData] = useState<SnippetData>({
    title: '',
    description: '',
    category: 'animations',
    tags: [],
    htmlCode: '<!-- Your HTML code here -->\n<div class="container">\n  <h1>Hello World</h1>\n</div>',
    cssCode: '/* Your CSS code here */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  font-family: Arial, sans-serif;\n}\n\nh1 {\n  color: #00ff88;\n  animation: glow 2s ease-in-out infinite alternate;\n}\n\n@keyframes glow {\n  from { text-shadow: 0 0 20px #00ff88; }\n  to { text-shadow: 0 0 30px #00ff88, 0 0 40px #00ff88; }\n}',
    jsCode: '// Your JavaScript code here\nconsole.log("Hello from Code Vault HQ!");\n\n// Add some interactivity\ndocument.addEventListener("DOMContentLoaded", function() {\n  const container = document.querySelector(".container");\n  \n  container.addEventListener("click", function() {\n    this.style.transform = this.style.transform === "scale(1.1)" ? "scale(1)" : "scale(1.1)";\n  });\n});'
  });  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('css');
  const [tagInput, setTagInput] = useState('');
  const [isPreviewUpdating, setIsPreviewUpdating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });
  const [editorFontSize, setEditorFontSize] = useState(16);
  const [editorWordWrap, setEditorWordWrap] = useState<'on' | 'off'>('on');
  const [editorLineNumbers, setEditorLineNumbers] = useState<'on' | 'off'>('on');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>('visual'); // Default to visual since animations is selected
  const previewRef = useRef<HTMLIFrameElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<any>(null);// Auto-update preview with debouncing
  const debouncedUpdatePreview = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      setIsPreviewUpdating(true);
      generatePreview();
      setLastSaved(new Date());
      setTimeout(() => setIsPreviewUpdating(false), 500);
    }, 1000); // Wait 1 second after user stops typing
  }, []);

  // Generate preview when component mounts or active tab changes
  useEffect(() => {
    generatePreview();
  }, [activeTab]);

  // Auto-update preview when code changes
  useEffect(() => {
    debouncedUpdatePreview();
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [snippetData.htmlCode, snippetData.cssCode, snippetData.jsCode, debouncedUpdatePreview]);  // Hierarchical category structure
  const categoryStructure = {
    essentials: {
      name: 'Essential Components',
      icon: Code2,
      color: 'text-blue-600',
      subcategories: [
        { id: 'ui-components', label: 'UI Components' },
        { id: 'forms', label: 'Forms & Inputs' },
        { id: 'navigation', label: 'Navigation' },
        { id: 'buttons', label: 'Buttons & CTAs' },
        { id: 'modals', label: 'Modals & Dialogs' }
      ]
    },
    visual: {
      name: 'Visual & Animation',
      icon: Palette,
      color: 'text-pink-500',
      subcategories: [
        { id: 'animations', label: 'Animations' },
        { id: 'transitions', label: 'Transitions' },
        { id: 'backgrounds', label: 'Background Effects' },
        { id: 'text-effects', label: 'Text Effects' },
        { id: 'loaders', label: 'Loading Indicators' }
      ]
    },
    layout: {
      name: 'Layout & Structure',
      icon: Layout,
      color: 'text-green-500',
      subcategories: [
        { id: 'grid-systems', label: 'Grid & Flexbox' },
        { id: 'responsive', label: 'Responsive Design' },
        { id: 'cards', label: 'Cards & Containers' },
        { id: 'heroes', label: 'Hero Sections' },
        { id: 'page-sections', label: 'Page Sections' }
      ]
    },
    interactive: {
      name: 'Interactive & Dynamic',
      icon: Settings,
      color: 'text-orange-500',
      subcategories: [
        { id: 'data-display', label: 'Data Visualization' },
        { id: 'interactive', label: 'Interactive Demos' },
        { id: 'games', label: 'Games & Playful' },
        { id: 'api', label: 'API Integration' },
        { id: 'auth', label: 'Authentication' }
      ]
    },
    advanced: {
      name: 'Advanced & Experimental',
      icon: Sparkles,
      color: 'text-purple-500',
      subcategories: [
        { id: 'canvas', label: 'Canvas & Graphics' },
        { id: 'webgl', label: 'WebGL & 3D' },
        { id: 'svg', label: 'SVG Animations' },
        { id: 'performance', label: 'Performance' },
        { id: 'accessibility', label: 'Accessibility' }
      ]
    }
  };


  const editorTabs = [
    { id: 'html', label: 'HTML', language: 'html' },
    { id: 'css', label: 'CSS', language: 'css' },
    { id: 'js', label: 'JavaScript', language: 'javascript' }
  ];  const handleCodeChange = (value: string | undefined, language: string) => {
    if (!value) return;
    
    const codeKey = language === 'html' ? 'htmlCode' : 
                   language === 'css' ? 'cssCode' : 'jsCode';
    
    setSnippetData(prev => ({
      ...prev,
      [codeKey]: value
    }));
    
    // Auto-save will be triggered by the useEffect watching code changes
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
  // Handle color selection from color picker
  const handleColorSelect = (color: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range: selection, text: color, forceMoveMarkers: true };
      editor.executeEdits("color-picker", [op]);
    }
    setIsColorPickerOpen(false);
    window.showToast?.('Color inserted into editor', 'success');
  };

  // Format the code in the editor
  const formatCode = () => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.getAction('editor.action.formatDocument')?.run();
      window.showToast?.('Code formatted', 'success');
    }
  };

  // Handle palette button click
  const handlePaletteClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setColorPickerPosition({
      x: rect.right + 10,
      y: rect.top
    });
    setIsColorPickerOpen(true);
  };

  const generatePreview = () => {
    console.log('Generating preview with active tab:', activeTab);
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
      console.log('Preview updated successfully');
    } else {
      console.error('Preview iframe reference not found');
    }
  };  // Manual save function (for Ctrl+S and save button)
  const handleManualSave = () => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    setIsPreviewUpdating(true);
    generatePreview();
    setLastSaved(new Date());
    setTimeout(() => setIsPreviewUpdating(false), 300);
    
    // Show a success toast
    window.showToast?.('Preview updated', 'success');
  };
  // Handle submission of the snippet
  const handleSubmit = async () => {
    try {
      console.log('Submitting snippet to Firebase:', snippetData);
      // Check if user is authenticated
      if (!currentUser) {
        window.showToast?.('Please sign in to upload snippets', 'error');
        return;
      }
      
      // Validate required fields
      if (!snippetData.title.trim()) {
        window.showToast?.('Please enter a title for your snippet', 'error');
        return;
      }
      
      if (!snippetData.description.trim()) {
        window.showToast?.('Please enter a description for your snippet', 'error');
        return;
      }      // Prepare snippet data for Firebase
      const firebaseSnippetData = {
        title: snippetData.title.trim(),
        description: snippetData.description.trim(),
        code: `${snippetData.htmlCode}\n\n/* CSS */\n${snippetData.cssCode}\n\n/* JavaScript */\n${snippetData.jsCode}`,
        language: snippetData.category,
        tags: snippetData.tags.filter(tag => tag.trim().length > 0),
        isPublic: true,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email || 'Anonymous User'
      };
      
      // Submit directly to Firebase
      const snippetId = await FirebaseDbService.createSnippet(firebaseSnippetData);
      
      console.log('✅ Snippet uploaded successfully! ID:', snippetId);
      window.showToast?.(`🎉 Snippet uploaded successfully! ID: ${snippetId}`, 'success');
        // Reset form
      setSnippetData({
        title: '',
        description: '',
        category: 'animations',
        tags: [],
        htmlCode: '<!-- Your HTML code here -->\n<div class="container">\n  <h1>Hello World</h1>\n</div>',
        cssCode: '/* Your CSS code here */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  font-family: Arial, sans-serif;\n}\n\nh1 {\n  color: #333;\n  font-size: 2rem;\n}',
        jsCode: '// Your JavaScript code here\nconsole.log("Hello, Code Vault HQ!");\n\n// Add your interactive functionality\ndocument.querySelector("h1").addEventListener("click", function() {\n  this.style.color = "#0ea5e9";\n  console.log("Title clicked!");\n});'
      });
      
    } catch (error) {      console.error('❌ Failed to upload snippet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      window.showToast?.(`Failed to upload snippet: ${errorMessage}`, 'error');
    }
  };  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-12 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Upload Your <span className="text-vault-accent">Snippet</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Share your amazing code with the community and help others learn from your expertise
          </p>        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 max-w-[1600px] mx-auto px-4">
          {/* Authentication Notice */}
          {!currentUser && (
            <div className="lg:col-span-2 bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-12 shadow-lg">
              <div className="flex items-center space-x-4 text-amber-800 mb-4">
                <Upload className="w-6 h-6" />
                <span className="font-bold text-xl">Sign in required</span>
              </div>              <p className="text-amber-700 text-base leading-relaxed">
                Please sign in to upload and save your code snippets to Code Vault HQ. Your snippets will be stored securely and made available to the community.
              </p>
            </div>
          )}

          {/* Left Panel - Form & Editor */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-32"
          >
            {/* Basic Info */}
            <div className="bg-white/95 border border-gray-200 rounded-2xl p-10 shadow-xl">
              <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                <Upload className="w-8 h-8 mr-4 text-vault-accent" />
                Snippet Details
              </h3>
              
              <div className="space-y-12">
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-4">
                    Title
                  </label>
                  <input
                    type="text"
                    value={snippetData.title}
                    onChange={(e) => setSnippetData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white border-2 border-gray-300 rounded-xl px-6 py-4 text-gray-800 placeholder-gray-500 focus:border-vault-accent focus:outline-none transition-all duration-200 text-lg"
                    placeholder="Enter snippet title"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-4">
                    Description
                  </label>
                  <textarea
                    value={snippetData.description}                    onChange={(e) => setSnippetData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full bg-white border-2 border-gray-300 rounded-xl px-6 py-4 text-gray-800 placeholder-gray-500 focus:border-vault-accent focus:outline-none transition-all duration-200 resize-none text-lg"
                    placeholder="Describe your snippet and its functionality"
                  />
                </div>                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-4">
                    Category
                  </label>
                  
                  {/* Main Categories */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(categoryStructure).map(([key, mainCategory]) => (
                        <button
                          key={key}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedMainCategory(selectedMainCategory === key ? null : key);
                          }}
                          type="button"
                          className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer min-h-[80px] flex flex-col items-center justify-center ${
                            selectedMainCategory === key
                              ? 'border-vault-accent bg-vault-accent/15 text-vault-accent shadow-lg transform scale-105'
                              : 'border-gray-300 bg-white hover:border-vault-accent/60 text-gray-700 hover:shadow-md hover:transform hover:scale-102 hover:bg-gray-50'
                          }`}
                        >
                          <mainCategory.icon className={`w-6 h-6 mb-2 ${
                            selectedMainCategory === key ? 'text-vault-accent' : mainCategory.color
                          }`} />
                          <div className="text-sm font-semibold text-center">{mainCategory.name}</div>
                        </button>
                      ))}
                    </div>
                      {/* Subcategories */}
                    {selectedMainCategory && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                      >
                        {(() => {
                          const mainCategory = categoryStructure[selectedMainCategory as keyof typeof categoryStructure];
                          const IconComponent = mainCategory.icon;
                          return (
                            <>
                              <div className="flex items-center space-x-3 mb-4">
                                <IconComponent className={`w-5 h-5 ${mainCategory.color}`} />
                                <h4 className="text-lg font-bold text-gray-800">
                                  {mainCategory.name}
                                </h4>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {mainCategory.subcategories.map((subcat) => (
                                  <button
                                    key={subcat.id}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setSnippetData(prev => ({ ...prev, category: subcat.id }));
                                      window.showToast?.(`Category selected: ${subcat.label}`, 'info');
                                    }}
                                    type="button"
                                    className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer flex items-center space-x-2 ${
                                      snippetData.category === subcat.id
                                        ? 'border-vault-accent bg-vault-accent/15 text-vault-accent shadow-lg transform scale-105'
                                        : 'border-gray-200 bg-white hover:border-vault-accent/40 text-gray-700 hover:shadow-md hover:bg-gray-50'
                                    }`}
                                  >
                                    <div className={`w-2 h-2 rounded-full ${mainCategory.color.replace('text-', 'bg-')}`}></div>
                                    <div className="text-sm font-medium">{subcat.label}</div>
                                  </button>
                                ))}
                              </div>
                            </>
                          );
                        })()}
                      </motion.div>
                    )}
                    
                    {/* Selected Category Display */}
                    {snippetData.category && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>                          <span className="text-blue-800 font-semibold">                            Selected: {(() => {
                              // Find the selected category label
                              for (const [_key, mainCategory] of Object.entries(categoryStructure)) {
                                const subcat = mainCategory.subcategories.find(sub => sub.id === snippetData.category);
                                if (subcat) {
                                  return `${mainCategory.name} > ${subcat.label}`;
                                }
                              }
                              return snippetData.category;
                            })()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div><div>
                  <label className="block text-xl font-bold text-gray-700 mb-8">
                    Tags
                  </label>
                  <div className="space-y-6">
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        className="flex-1 bg-white border-3 border-gray-300 rounded-2xl px-8 py-5 text-gray-800 placeholder-gray-500 focus:border-vault-accent focus:outline-none transition-all duration-200 text-lg font-medium"
                        placeholder="Add tags (press Enter)"
                      />
                      <button
                        onClick={addTag}
                        type="button"
                        className="bg-vault-accent hover:bg-green-600 text-white px-8 py-5 rounded-2xl font-bold transition-all duration-200 flex items-center space-x-4 shadow-xl hover:shadow-2xl hover:transform hover:scale-105 min-w-[120px]"
                      >
                        <Tag className="w-6 h-6" />
                        <span>Add</span>
                      </button>
                    </div>                    {snippetData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-4">
                        {snippetData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-blue-50 text-blue-700 px-6 py-4 rounded-2xl text-lg flex items-center space-x-4 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                          >
                            <span>#{tag}</span>
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:text-red-500 transition-colors font-bold text-xl w-6 h-6 flex items-center justify-center"
                            >
                              ×
                            </button>
                          </span>                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="bg-white/95 border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
              {/* Editor Header */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-12 py-16 border-b border-gray-200">
                <div className="mb-12">
                  <h3 className="text-4xl font-bold text-gray-800 flex items-center mb-8">
                    <Code2 className="w-10 h-10 mr-6 text-vault-accent" />
                    Code Editor
                  </h3>
                  <p className="text-gray-600 text-xl leading-relaxed">
                    Write your HTML, CSS, and JavaScript code. Click the tabs below to switch between languages.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mb-8">{/* Added bottom margin for more spacing */}{/* ...existing button content... */}
                  <div className="flex items-center space-x-4">
                    {lastSaved && (
                      <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center space-x-2 border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                    <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePaletteClick}
                      type="button"
                      className="px-5 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-3 bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl hover:transform hover:scale-105"
                      title="Color Palette"
                    >
                      <Palette className="w-5 h-5" />
                      <span>Colors</span>
                    </button>
                    <button
                      onClick={formatCode}
                      type="button"
                      className="px-5 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:transform hover:scale-105"
                      title="Format Code"
                    >
                      <Code2 className="w-5 h-5" />
                      <span>Format</span>
                    </button>
                    <button
                      onClick={handleManualSave}
                      disabled={isPreviewUpdating}
                      type="button"
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl ${
                        isPreviewUpdating
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-vault-accent hover:bg-green-600 text-white hover:transform hover:scale-105'
                      }`}
                    >
                      {isPreviewUpdating ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Save & Preview</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>              {/* Editor Tabs - Made Much More Prominent */}
              <div className="bg-gradient-to-r from-slate-100 to-slate-200 border-b-2 border-gray-300 py-4">
                <div className="flex justify-center space-x-8 px-12">
                  {editorTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔥 TAB CLICKED:', tab.id);
                        setActiveTab(tab.id as 'html' | 'css' | 'js');
                        window.showToast?.(`Switched to ${tab.label} editor`, 'info');
                      }}
                      className={`px-16 py-6 text-3xl font-black transition-all duration-300 border-4 cursor-pointer relative rounded-2xl min-w-[180px] transform hover:scale-105 shadow-xl ${
                        activeTab === tab.id
                          ? 'text-white bg-gradient-to-r from-vault-accent to-green-500 border-vault-accent shadow-2xl scale-110 ring-4 ring-vault-accent/30'
                          : 'text-gray-700 bg-white border-gray-300 hover:text-vault-accent hover:border-vault-accent hover:shadow-2xl hover:bg-vault-accent/5'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <span className="text-4xl">
                          {tab.id === 'html' ? '🌐' : tab.id === 'css' ? '🎨' : '⚡'}
                        </span>
                        <span className="font-black tracking-wider">{tab.label}</span>
                      </div>                      {activeTab === tab.id && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white shadow-lg">
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Editor Settings */}
              <div className="bg-slate-50 px-12 py-10 border-b border-gray-200">{/* Increased padding */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-16">{/* Increased spacing between controls */}                    <div className="flex items-center space-x-6">{/* Increased spacing within each control */}
                      <label className="text-lg font-bold text-gray-700">Font Size:</label>
                      <select 
                        value={editorFontSize} 
                        onChange={(e) => setEditorFontSize(Number(e.target.value))}
                        className="bg-white border-2 border-gray-300 rounded-xl px-5 py-3 text-lg text-gray-700 focus:border-vault-accent focus:ring-2 focus:ring-vault-accent/20 shadow-md"
                      >
                        <option className="text-gray-800" value={12}>12px</option>
                        <option className="text-gray-800" value={14}>14px</option>
                        <option className="text-gray-800" value={16}>16px</option>
                        <option className="text-gray-800" value={18}>18px</option>
                        <option className="text-gray-800" value={20}>20px</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="text-lg font-bold text-gray-700">Word Wrap:</label>
                      <button
                        onClick={() => setEditorWordWrap(editorWordWrap === 'on' ? 'off' : 'on')}                        className={`px-6 py-3 rounded-xl text-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg ${
                          editorWordWrap === 'on' 
                            ? 'bg-vault-accent text-white border-2 border-vault-accent transform scale-105' 
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:transform hover:scale-102'
                        }`}
                      >
                        {editorWordWrap === 'on' ? 'On' : 'Off'}
                      </button>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="text-lg font-bold text-gray-700">Line Numbers:</label>
                      <button
                        onClick={() => setEditorLineNumbers(editorLineNumbers === 'on' ? 'off' : 'on')}
                        className={`px-6 py-3 rounded-xl text-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg ${
                          editorLineNumbers === 'on' 
                            ? 'bg-vault-accent text-white border-2 border-vault-accent transform scale-105' 
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:transform hover:scale-102'
                        }`}
                      >
                        {editorLineNumbers === 'on' ? 'On' : 'Off'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-lg text-gray-600 bg-gray-100 px-6 py-4 rounded-xl border border-gray-200 shadow-md">
                    Press <kbd className="bg-white px-4 py-2 rounded-lg text-base font-mono border border-gray-300 shadow-sm">Ctrl+S</kbd> to save
                  </div>
                </div>
              </div>              {/* Currently Editing Indicator */}
              <div className="bg-slate-100 px-6 py-4 border-b border-gray-200">
                <span className="bg-vault-accent text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md inline-block">
                  Currently editing: {activeTab.toUpperCase()}
                </span>
              </div>

              {/* Monaco Editor Container */}
              <div className="h-[600px] bg-[#1e1e1e]">
                <Editor
                  height="100%"
                  language={editorTabs.find(tab => tab.id === activeTab)?.language}
                  value={
                    activeTab === 'html' ? snippetData.htmlCode :
                    activeTab === 'css' ? snippetData.cssCode :
                    snippetData.jsCode
                  }
                  onChange={(value) => handleCodeChange(value, editorTabs.find(tab => tab.id === activeTab)?.language || 'css')}                  onMount={(editor, monaco) => {
                    // Store editor reference for color picker
                    editorRef.current = editor;
                    
                    // Add Ctrl+S keyboard shortcut
                    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                      handleManualSave();
                      return true; // Event handled
                    });
                  }}theme="vs-dark"
                  options={{
                    fontSize: editorFontSize,
                    fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: editorWordWrap,
                    lineNumbers: editorLineNumbers,                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',                    automaticLayout: true,
                    padding: { top: 20, bottom: 20 }
                  }}                />
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-10"
          >
            {/* Preview Controls */}
            <div className="bg-white/95 border border-gray-200 rounded-2xl p-10 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold text-gray-800 flex items-center">
                  <Eye className="w-8 h-8 mr-4 text-vault-accent" />
                  Live Preview
                </h3>
                <div className="flex items-center space-x-4">
                  {isPreviewUpdating && (
                    <div className="flex items-center space-x-3 text-blue-600 bg-blue-50 px-5 py-3 rounded-xl border border-blue-200 shadow-md">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="text-base font-semibold">Updating...</span>
                    </div>
                  )}
                  <button
                    onClick={handleManualSave}
                    disabled={isPreviewUpdating}
                    type="button"
                    className={`transition-all duration-200 flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl ${
                      isPreviewUpdating
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-vault-accent hover:bg-green-600 text-white hover:transform hover:scale-105'
                    }`}
                  >
                    <Play className="w-5 h-5" />
                    <span>Update Now</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3 text-green-700">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-base font-semibold">
                    <strong>Auto-save:</strong> Preview updates automatically as you type (1 second delay)
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-blue-700">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <p className="text-base font-semibold">
                    <strong>Keyboard shortcut:</strong> Press <kbd className="bg-white px-3 py-2 rounded-lg text-sm border border-gray-300 font-mono shadow-sm">Ctrl+S</kbd> in the editor to save immediately
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-purple-700">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <p className="text-base font-semibold">
                    <strong>Manual update:</strong> Click "Update Now" button anytime
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Frame */}
            <div className="bg-white/95 border border-gray-200 rounded-2xl overflow-hidden shadow-xl">              <div className="bg-slate-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div className="ml-6 text-gray-600 text-lg font-semibold">Live Preview</div>
                </div>
              </div>

              <div className="h-[500px]">
                <iframe
                  ref={previewRef}
                  className="w-full h-full border-0"
                  title="Code Preview"
                  sandbox="allow-scripts"
                />
              </div>
            </div>            {/* Submit Button */}
            <motion.button
              onClick={() => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                  window.showToast?.('Please sign in to continue', 'info');
                } else {
                  handleSubmit();
                }
              }}
              disabled={isPreviewUpdating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-6 rounded-2xl font-bold text-xl uppercase tracking-wider transition-all duration-300 shadow-xl hover:shadow-2xl ${
                currentUser 
                  ? 'bg-gradient-to-r from-vault-accent to-green-600 hover:from-green-500 hover:to-green-700 text-white transform hover:scale-105' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white cursor-pointer transform hover:scale-105'
              }`}
            >              <Save className="w-6 h-6 inline mr-3" />
              {currentUser ? '🚀 Publish Snippet' : '🔐 Sign In to Publish'}            </motion.button></motion.div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signin"
      />

      {/* Color Picker */}
      <ColorPicker
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        onColorSelect={handleColorSelect}
        position={colorPickerPosition}
      />
    </div>
  );
};

export default UploadPage;
