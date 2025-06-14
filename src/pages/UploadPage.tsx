import { motion } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import { Play, Eye, Save, Upload, Tag, Palette, Code2, RefreshCw, Layout, Settings, Sparkles, Trash2 } from 'lucide-react';
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
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);    const [snippetData, setSnippetData] = useState<SnippetData>({
    title: '',
    description: '',
    category: 'animations',
    tags: [],
    htmlCode: '<!-- Your HTML code here -->\n<!-- Examples: -->\n<!-- <div class="container"> -->\n<!-- <h1>Your Heading</h1> -->\n<!-- </div> -->\n',
    cssCode: '/* Your CSS code here */\n/* Examples: */\n/* body { */\n/*   background-color: #f5f5f5; */\n/*   font-family: Arial, sans-serif; */\n/* } */\n',
    jsCode: '// Your JavaScript code here\n// Examples:\n// document.addEventListener("DOMContentLoaded", function() {\n//   console.log("DOM loaded!");\n// });\n'
  });  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('css');
  const [tagInput, setTagInput] = useState('');  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isPreviewUpdating, setIsPreviewUpdating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });
  const [editorFontSize, setEditorFontSize] = useState(16);  const previewRef = useRef<HTMLIFrameElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<any>(null);
  const currentBlobUrlRef = useRef<string | null>(null);// Auto-update preview with debouncing
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
  }, [snippetData.htmlCode, snippetData.cssCode, snippetData.jsCode, debouncedUpdatePreview]);

  // Global keyboard listener for Ctrl+S as backup
  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      // Ctrl+S anywhere on the page
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        console.log('🌍 Global Ctrl+S detected - preventing default and updating preview');
        e.preventDefault();
        e.stopPropagation();
        
        // Cancel any pending updates
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
        
        // Update preview immediately
        generatePreview();
        setLastSaved(new Date());
        window.showToast?.('🌍 Global Ctrl+S: Preview updated!', 'success');
      }
      
      // F5 for refresh (but allow default if not focused on editor)
      if (e.key === 'F5' && document.activeElement?.closest('.monaco-editor')) {
        console.log('🌍 Global F5 detected in editor');
        e.preventDefault();
        generatePreview();
        setLastSaved(new Date());
        window.showToast?.('🔄 F5: Preview refreshed!', 'success');
      }
    };    document.addEventListener('keydown', handleGlobalKeydown, true);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeydown, true);
    };
  }, []);
  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-category-dropdown]')) {
        setShowCategoryDropdown(false);
        setExpandedCategory(null); // Reset expanded state when closing
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCategoryDropdown]);

  // Cleanup effect for blob URLs and timeouts
  useEffect(() => {
    return () => {
      // Clean up any pending timeouts
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      // Clean up any blob URLs
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
    };
  }, []);

// Hierarchical category structure
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
    }  };

  // Helper function to get gradient colors for each category
  const getGradientColors = (categoryKey: string): string => {
    const gradients = {
      essentials: '#3B82F6, #1E40AF', // Blue gradient
      visual: '#EC4899, #BE185D', // Pink gradient  
      layout: '#10B981, #047857', // Green gradient
      interactive: '#F97316, #EA580C', // Orange gradient
      advanced: '#8B5CF6, #7C3AED' // Purple gradient
    };
    return gradients[categoryKey as keyof typeof gradients] || '#6B7280, #4B5563';
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
    if (!tagInput.trim()) return;
    
    // Split by commas and process each tag
    const newTags = tagInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0 && !snippetData.tags.includes(tag));
    
    if (newTags.length > 0) {
      setSnippetData(prev => ({
        ...prev,
        tags: [...prev.tags, ...newTags]
      }));
      
      // Show appropriate feedback
      if (newTags.length === 1) {
        window.showToast?.(`Added tag: ${newTags[0]}`, 'success');
      } else {
        window.showToast?.(`Added ${newTags.length} tags: ${newTags.join(', ')}`, 'success');
      }
    }
    
    setTagInput('');
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
  };  // Clear all code in the editors
  const clearAllCode = () => {
    // Add confirmation to prevent accidental clearing
    if (window.confirm('Are you sure you want to clear all code? This cannot be undone.')) {
      setSnippetData(prev => ({
        ...prev,
        htmlCode: '<!-- Your HTML code here -->\n<!-- Examples: -->\n<!-- <div class="container"> -->\n<!-- <h1>Your Heading</h1> -->\n<!-- </div> -->\n',
        cssCode: '/* Your CSS code here */\n/* Examples: */\n/* body { */\n/*   background-color: #f5f5f5; */\n/*   font-family: Arial, sans-serif; */\n/* } */\n',
        jsCode: '// Your JavaScript code here\n// Examples:\n// document.addEventListener("DOMContentLoaded", function() {\n//   console.log("DOM loaded!");\n// });\n'
      }));
      window.showToast?.('🗑️ All code editors cleared', 'success');
      // Update preview immediately
      setTimeout(() => generatePreview(), 100);
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
  };  const generatePreview = () => {
    console.log('Generating preview with active tab:', activeTab);
    
    try {
      // Clean up any existing blob URL
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }

      // Create the HTML for the preview
      const previewHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CodeVault Preview</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              background: #0a0a0a; 
              color: white;
              font-family: Arial, sans-serif;
            }
            ${snippetData.cssCode || '/* No CSS code */'}
          </style>
        </head>
        <body>
          ${snippetData.htmlCode || '<!-- No HTML code -->'}
          <script>
            // Wrapped in try-catch to prevent errors from breaking the preview
            try {
              ${snippetData.jsCode || '// No JavaScript code'}
            } catch (error) {
              console.error('JavaScript error in preview:', error);
            }
          </script>
        </body>
        </html>
      `;

      if (previewRef.current) {
        // Use srcdoc instead of blob URLs to avoid security issues
        previewRef.current.srcdoc = previewHtml;
        
        // Clear any existing src to prevent conflicts
        previewRef.current.src = '';
        
        // Log successful update
        console.log('Preview updated with new content using srcdoc');
      } else {
        console.error('Preview iframe reference not found');
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      // Fallback: try to show error message in preview
      if (previewRef.current) {
        previewRef.current.srcdoc = `
          <html>
            <body style="background: #0a0a0a; color: white; padding: 20px; font-family: Arial, sans-serif;">
              <h3>⚠️ Preview Error</h3>
              <p>There was an error generating the preview.</p>
              <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
            </body>
          </html>
        `;
      }
    }
  };// Manual save function (for the Update Now button)
  const handleManualSave = () => {
    console.log('🔄 Manual save triggered');
    
    // Cancel any pending debounced updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Update preview immediately
    generatePreview();
    
    // Update last saved timestamp
    setLastSaved(new Date());
    
    // Show success message
    window.showToast?.('💾 Preview updated', 'success');
  };// Handle submission of the snippet
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
      }
        if (snippetData.description.length > 140) {
        window.showToast?.('Description cannot exceed 140 characters', 'error');
        return;
      }
      
      // Validate category selection
      if (!snippetData.category) {
        window.showToast?.('Please select a category for your snippet', 'error');
        return;
      }// Prepare snippet data for Firebase
      // Find the complete category information
      let categoryInfo = { 
        id: snippetData.category, 
        label: snippetData.category, 
        mainCategory: { 
          id: 'visual', 
          name: 'Visual & Animation', 
          color: 'text-pink-500' 
        } 
      };
      
      for (const [mainCategoryKey, mainCategory] of Object.entries(categoryStructure)) {
        const subcat = mainCategory.subcategories.find(sub => sub.id === snippetData.category);
        if (subcat) {
          categoryInfo = {
            id: subcat.id,
            label: subcat.label,
            mainCategory: {
              id: mainCategoryKey,
              name: mainCategory.name,
              color: mainCategory.color
            }
          };
          break;
        }
      }

      const firebaseSnippetData = {
        title: snippetData.title.trim(),
        description: snippetData.description.trim(),
        code: `${snippetData.htmlCode}\n\n/* CSS */\n${snippetData.cssCode}\n\n/* JavaScript */\n${snippetData.jsCode}`,
        language: snippetData.category, // Keep for backward compatibility
        category: categoryInfo,
        tags: snippetData.tags.filter(tag => tag.trim().length > 0),
        isPublic: true,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email || 'Anonymous User'
      };
        // Submit directly to Firebase
      const snippetId = await FirebaseDbService.createSnippet(firebaseSnippetData);
      
      console.log('✅ Snippet uploaded successfully! ID:', snippetId);
      window.showToast?.(`🎉 Snippet uploaded successfully! Redirecting to your profile...`, 'success');
        // Reset form
      setSnippetData({
        title: '',
        description: '',
        category: 'css',
        tags: [],
        htmlCode: '<!-- Your HTML code here -->\n',
        cssCode: '/* Your CSS code here */\n',
        jsCode: '// Your JavaScript code here\n'
      });
      
      // Redirect to profile page after a short delay to show success message
      setTimeout(() => {
        const username = currentUser.displayName || currentUser.email?.split('@')[0] || 'user';
        navigate(`/profile/${username}`);
      }, 2000);
      
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
                </div>                <div>                  <label className="block text-base font-semibold text-gray-700 mb-4">
                    Description
                    <span className="text-sm text-gray-500 ml-2">
                      ({snippetData.description.length}/140 characters)
                    </span>
                  </label>
                  <textarea
                    value={snippetData.description}
                    onChange={(e) => {
                      const newValue = e.target.value;                      if (newValue.length <= 140) {
                        setSnippetData(prev => ({ ...prev, description: newValue }));
                      } else {
                        window.showToast?.('Description cannot exceed 140 characters', 'error');
                      }
                    }}
                    rows={4}                    className={`w-full bg-white border-2 rounded-xl px-6 py-4 text-gray-800 placeholder-gray-500 focus:outline-none transition-all duration-200 resize-none text-lg ${
                      snippetData.description.length > 120 
                        ? 'border-orange-400 focus:border-orange-500' 
                        : 'border-gray-300 focus:border-vault-accent'
                    }`}
                    placeholder="Describe your snippet and its functionality (max 140 characters)"
                  />                  {snippetData.description.length > 120 && (
                    <div className={`mt-2 text-sm font-medium ${
                      snippetData.description.length >= 140 
                        ? 'text-red-600' 
                        : 'text-orange-600'
                    }`}>
                      {snippetData.description.length >= 140 
                        ? '⚠️ Maximum character limit reached' 
                        : `📝 ${140 - snippetData.description.length} characters remaining`}
                    </div>
                  )}
                </div>                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-4">
                    Category <span className="text-red-500">*</span>
                    <span className="block text-sm text-gray-500 font-normal mt-2">
                      Choose from our organized categories (required)
                    </span>
                  </label>                  {/* Compact Category Dropdown */}
                  <div className="relative" data-category-dropdown>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowCategoryDropdown(!showCategoryDropdown);
                      }}
                      className={`w-full bg-white border-2 rounded-xl px-6 py-4 text-left transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-md cursor-pointer ${
                        snippetData.category
                          ? 'border-vault-accent text-gray-800 bg-green-50'
                          : 'border-gray-300 text-gray-500 hover:border-vault-accent hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {snippetData.category ? (
                          <>                            {(() => {
                              // Find the selected category details
                              for (const [mainKey, mainCategory] of Object.entries(categoryStructure)) {
                                const subcat = mainCategory.subcategories.find(sub => sub.id === snippetData.category);
                                if (subcat) {
                                  return [
                                    <div 
                                      key="gradient"
                                      className="w-4 h-4 rounded-full shadow-sm"
                                      style={{
                                        background: `linear-gradient(135deg, ${getGradientColors(mainKey)})`
                                      }}
                                    />,
                                    <span key="label" className="font-semibold text-gray-800">
                                      {subcat.label}
                                    </span>,
                                    <span key="category" className="text-sm text-gray-500">
                                      in {mainCategory.name}
                                    </span>
                                  ];
                                }
                              }
                              return null;
                            })()}
                          </>
                        ) : (
                          <>
                            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                            <span className="font-medium">Click to select a category</span>
                            <span className="text-sm text-gray-400">(required)</span>
                          </>
                        )}
                      </div>
                      <div className={`transform transition-transform duration-200 text-vault-accent font-bold ${showCategoryDropdown ? 'rotate-180' : ''}`}>
                        ▼
                      </div>
                    </button>                    {/* Dropdown Menu - Accordion Style */}
                    {showCategoryDropdown && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998] flex items-center justify-center p-4"
                           onClick={(e) => {
                             if (e.target === e.currentTarget) {
                               setShowCategoryDropdown(false);
                               setExpandedCategory(null);
                             }
                           }}>
                        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto w-full max-w-md"
                             style={{ backgroundColor: '#ffffff' }}>
                        {Object.entries(categoryStructure).map(([mainKey, mainCategory]) => {
                          const isExpanded = expandedCategory === mainKey;
                          
                          return (
                            <div key={mainKey} className="border-b border-gray-100 last:border-b-0">                              {/* Collapsible Main Category Header */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setExpandedCategory(isExpanded ? null : mainKey);
                                }}
                                className={`w-full px-4 py-3 font-bold flex items-center justify-between hover:bg-gray-100 transition-colors duration-200`}
                                style={{ backgroundColor: '#f9fafb', color: '#374151' }}
                              >                                <div className="flex items-center">
                                  <mainCategory.icon className="w-5 h-5 mr-3" style={{ color: '#374151' }} />
                                  <span style={{ color: '#374151' }}>{mainCategory.name}</span>
                                </div>
                                <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} style={{ color: '#374151' }}>
                                  ▼
                                </div>
                              </button>
                                {/* Collapsible Subcategories */}
                              {isExpanded && (
                                <div className="bg-white" style={{ backgroundColor: '#ffffff' }}>
                                  {mainCategory.subcategories.map((subcat) => {
                                    const isSelected = snippetData.category === subcat.id;
                                    return (
                                      <button
                                        key={subcat.id}
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setSnippetData(prev => ({ ...prev, category: subcat.id }));
                                          setShowCategoryDropdown(false);
                                          setExpandedCategory(null);
                                          window.showToast?.(`Category selected: ${subcat.label}`, 'success');
                                        }}                                        className={`w-full px-8 py-3 text-left hover:bg-blue-50 transition-all duration-200 flex items-center justify-between group ${
                                          isSelected ? 'bg-green-50 border-l-4 border-green-500 font-semibold' : 'hover:pl-10'
                                        }`}
                                        style={{ color: isSelected ? '#065f46' : '#374151' }}
                                      >
                                        <div className="flex items-center space-x-3">                                          <div 
                                            className="w-3 h-3 rounded-full opacity-60 group-hover:opacity-100 shadow-sm"
                                            style={{
                                              background: `linear-gradient(135deg, ${getGradientColors(mainKey)})`
                                            }}
                                          />
                                          <span className={`${isSelected ? 'text-green-700' : 'text-gray-700'}`} style={{ color: isSelected ? '#065f46' : '#374151' }}>
                                            {subcat.label}
                                          </span>
                                        </div>
                                        
                                        {isSelected && (
                                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );                        })}
                        </div>
                      </div>
                    )}
                  </div>
                </div><div>                  <label className="block text-xl font-bold text-gray-700 mb-8">
                    Tags
                    <span className="block text-sm text-gray-500 font-normal mt-2">
                      Add individual tags or use commas to add multiple at once (e.g., "react, animation, css")
                    </span>
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
                        placeholder="Add tags (comma separated: react, animation, css)"
                      />
                      <button
                        onClick={addTag}
                        type="button"
                        className="bg-vault-accent hover:bg-green-600 text-white px-8 py-5 rounded-2xl font-bold transition-all duration-200 flex items-center space-x-4 shadow-xl hover:shadow-2xl hover:transform hover:scale-105 min-w-[120px]"
                      >
                        <Tag className="w-6 h-6" />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Tag Preview */}
                    {tagInput.trim() && tagInput.includes(',') && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="text-sm font-semibold text-yellow-800 mb-2">
                          🏷️ Will add these tags:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tagInput
                            .split(',')
                            .map(tag => tag.trim().toLowerCase())
                            .filter(tag => tag.length > 0 && !snippetData.tags.includes(tag))
                            .map((tag, index) => (
                              <span
                                key={index}
                                className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-medium border border-yellow-300"
                              >
                                #{tag}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {snippetData.tags.length > 0 && (
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
            <div className="bg-white/95 border border-gray-200 rounded-2xl overflow-hidden shadow-xl">              {/* Compact Editor Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Code2 className="w-5 h-5 mr-2 text-vault-accent" />
                    Code Editor
                  </h3>
                  <div className="flex items-center space-x-3">
                    {lastSaved && (
                      <div className="text-green-600 text-sm">
                        Saved: {lastSaved.toLocaleTimeString()}
                      </div>
                    )}
                    <button
                      onClick={handleManualSave}
                      disabled={isPreviewUpdating}
                      type="button"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        isPreviewUpdating
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-vault-accent text-white hover:bg-vault-accent-dark'
                      }`}
                    >
                      {isPreviewUpdating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Update Preview</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>              {/* Compact Editor Tabs */}
              <div className="bg-gray-100 flex border-b">
                {editorTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveTab(tab.id as 'html' | 'css' | 'js');
                    }}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-vault-accent border-b-2 border-vault-accent'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Compact Editor Controls */}
              <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={clearAllCode}
                    type="button"
                    className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                  <button
                    onClick={handlePaletteClick}
                    type="button"
                    className="text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                  >
                    <Palette className="w-3 h-3" />
                    <span>Colors</span>
                  </button>
                  <button
                    onClick={formatCode}
                    type="button"
                    className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <Code2 className="w-3 h-3" />
                    <span>Format</span>
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <span>Font: {editorFontSize}px</span>
                  <button
                    onClick={() => setEditorFontSize(prev => prev < 20 ? prev + 2 : 12)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    A+
                  </button>
                  <span>Ctrl+S to update</span>
                </div>
              </div>              {/* Monaco Editor Container - CLEAN NO OVERLAPS */}
              <div className="h-[600px] bg-[#1e1e1e]">
                <Editor
                  height="100%"
                  language={editorTabs.find(tab => tab.id === activeTab)?.language}
                  value={
                    activeTab === 'html' ? snippetData.htmlCode :
                    activeTab === 'css' ? snippetData.cssCode :
                    snippetData.jsCode
                  }
                  onChange={(value) => handleCodeChange(value, editorTabs.find(tab => tab.id === activeTab)?.language || 'css')}onMount={(editor, monaco) => {
                    // Store editor reference for color picker
                    editorRef.current = editor;
                      // Enhanced Ctrl+S keyboard shortcut with proper event handling
                    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                      console.log('🎯 Ctrl+S pressed in Monaco Editor - FIXED VERSION');
                      
                      // Prevent browser default save dialog
                      if (window.event) {
                        window.event.preventDefault();
                        window.event.stopPropagation();
                      }
                      
                      // Cancel any pending updates
                      if (updateTimeoutRef.current) {
                        clearTimeout(updateTimeoutRef.current);
                      }
                      
                      // Update preview immediately
                      generatePreview();
                      
                      // Update last saved timestamp
                      setLastSaved(new Date());
                      
                      // Show success message
                      window.showToast?.('🚀 Ctrl+S: Preview updated successfully!', 'success');
                      
                      return true; // Event handled
                    });
                    
                    // Additional keyboard shortcuts for better accessibility
                    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
                      formatCode();
                      return true;
                    });
                    
                    // Alternative shortcut: F5 to refresh preview
                    editor.addCommand(monaco.KeyCode.F5, () => {
                      console.log('🎯 F5 pressed - refreshing preview');
                      if (updateTimeoutRef.current) {
                        clearTimeout(updateTimeoutRef.current);
                      }
                      generatePreview();
                      setLastSaved(new Date());
                      window.showToast?.('🔄 F5: Preview refreshed!', 'success');
                      return true;
                    });
                    
                    // Alternative shortcut: Ctrl+Enter to update preview
                    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                      console.log('🎯 Ctrl+Enter pressed - updating preview');
                      if (updateTimeoutRef.current) {
                        clearTimeout(updateTimeoutRef.current);
                      }
                      generatePreview();
                      setLastSaved(new Date());
                      window.showToast?.('⚡ Ctrl+Enter: Preview updated!', 'success');
                      return true;
                    });
                  }}theme="vs-dark"                  options={{
                    fontSize: editorFontSize,
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
                    automaticLayout: true,
                    padding: { top: 20, bottom: 20 },
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    cursorWidth: 2,
                    // Fix cursor position issues
                    mouseWheelZoom: false,
                    fastScrollSensitivity: 5,
                    renderWhitespace: 'none',
                    roundedSelection: true
                  }}/>
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
                  )}                  <button
                    onClick={handleManualSave}
                    disabled={isPreviewUpdating}
                    type="button"
                    className={`transition-all duration-200 flex items-center space-x-4 px-8 py-4 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transform hover:scale-110 border-4 ${
                      isPreviewUpdating
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'
                        : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white border-green-400 ring-4 ring-green-400/30'
                    }`}
                  >
                    <Play className="w-7 h-7" />
                    <span>🚀 UPDATE NOW</span>
                  </button>
                </div>
              </div>                <div className="space-y-4 bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-2xl border-2 border-blue-200 shadow-lg">
                <div className="flex items-center space-x-3 text-green-700">
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-md"></div>
                  <p className="text-lg font-bold">
                    <strong>Auto-save:</strong> Preview updates automatically as you type (1 second delay)
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-blue-700">
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-md"></div>
                  <p className="text-lg font-bold">
                    <strong>Multiple shortcuts:</strong> <kbd className="bg-white px-3 py-2 rounded-lg text-sm border-2 border-blue-300 font-mono shadow-sm font-bold">Ctrl+S</kbd>, <kbd className="bg-white px-3 py-2 rounded-lg text-sm border-2 border-green-300 font-mono shadow-sm font-bold">Ctrl+Enter</kbd>, or <kbd className="bg-white px-3 py-2 rounded-lg text-sm border-2 border-purple-300 font-mono shadow-sm font-bold">F5</kbd>
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-purple-700">
                  <div className="w-4 h-4 bg-purple-500 rounded-full shadow-md"></div>
                  <p className="text-lg font-bold">
                    <strong>Manual update:</strong> Click any "Update" button or use the floating quick update button
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-orange-700">
                  <div className="w-4 h-4 bg-orange-500 rounded-full shadow-md"></div>
                  <p className="text-lg font-bold">
                    <strong>Global shortcuts:</strong> Work anywhere on this page, even outside the editor
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
