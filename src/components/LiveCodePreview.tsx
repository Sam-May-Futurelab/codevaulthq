import React, { useEffect, useRef, useState } from 'react';
import { Play, RefreshCw, Maximize } from 'lucide-react';

interface LiveCodePreviewProps {
  html: string;
  css: string;
  javascript: string;
  title?: string;
  onFullscreen?: () => void;
}

const LiveCodePreview: React.FC<LiveCodePreviewProps> = ({ 
  html, 
  css, 
  javascript, 
  title = "Live Preview",
  onFullscreen 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreviewCode = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #1a1a1a;
            color: #ffffff;
            overflow-x: hidden;
        }
        * {
            box-sizing: border-box;
        }
        ${css}
    </style>
</head>
<body>
    ${html}
    <script>
        try {
            ${javascript}
        } catch (error) {
            console.error('Preview Error:', error);
            document.body.innerHTML = '<div style="color: #ff6b6b; padding: 20px; text-align: center;">Error executing JavaScript: ' + error.message + '</div>';
        }
    </script>
</body>
</html>`;
  };

  const updatePreview = () => {
    if (!iframeRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const previewCode = generatePreviewCode();
      const blob = new Blob([previewCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      iframeRef.current.src = url;
      
      // Clean up blob URL after iframe loads
      iframeRef.current.onload = () => {
        URL.revokeObjectURL(url);
        setIsLoading(false);
      };
      
      iframeRef.current.onerror = () => {
        setError('Failed to load preview');
        setIsLoading(false);
      };
    } catch (err) {
      setError('Error generating preview');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updatePreview();
  }, [html, css, javascript]);

  const handleRefresh = () => {
    updatePreview();
  };

  const handleFullscreen = () => {
    if (onFullscreen) {
      onFullscreen();
    } else if (iframeRef.current) {
      iframeRef.current.requestFullscreen?.();
    }
  };  return (
    <div className="bg-vault-medium rounded-lg p-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 overflow-hidden">
        <h2 className="text-white font-semibold flex items-center gap-2 truncate">
          <Play className="w-5 h-5 text-vault-accent shrink-0" />
          {title}
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-vault-light hover:bg-vault-light/80 text-white px-3 py-2 rounded flex items-center space-x-2 disabled:opacity-50"
            title="Refresh Preview"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleFullscreen}
            className="bg-vault-accent hover:bg-vault-accent/80 text-black px-4 py-2 rounded flex items-center space-x-2"
            title="Open in Fullscreen"
          >
            <Maximize className="w-4 h-4" />
            <span>Fullscreen</span>
          </button>
        </div>
      </div>
      
      <div className="relative bg-black/20 rounded border border-vault-light/20 overflow-hidden flex items-center justify-center" style={{ minHeight: '300px' }}>
        {error ? (
          <div className="w-full h-64 flex items-center justify-center text-red-400 bg-red-500/10 border border-red-500/20 rounded">
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">Preview Error</div>
              <div className="text-sm opacity-75">{error}</div>
              <button 
                onClick={handleRefresh}
                className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-vault-dark/50 flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-vault-accent">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Loading preview...</span>
                </div>
              </div>
            )}            <div className="w-full flex items-center justify-center" style={{ minHeight: '300px' }}>
              <iframe
                ref={iframeRef}
                className="w-full h-64 border-0 bg-transparent max-w-full"
                title="Code Preview"
                sandbox="allow-scripts allow-same-origin"
                style={{ minHeight: '300px', transform: 'scale(1)', transformOrigin: 'center' }}
              />
            </div>
          </>
        )}
      </div>
      
      <div className="mt-3 text-xs text-gray-400 bg-vault-dark/30 rounded px-3 py-2">
        <div className="flex items-center justify-between">
          <span>🚀 Live preview with isolated sandbox</span>
          <span>Refresh to reset state</span>
        </div>
      </div>
    </div>
  );
};

export default LiveCodePreview;
