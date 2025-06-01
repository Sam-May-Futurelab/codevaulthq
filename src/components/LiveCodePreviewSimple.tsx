import React, { useEffect, useRef, useState } from 'react';

interface LiveCodePreviewSimpleProps {
  html: string;
  css: string;
  javascript: string;
  className?: string;
}

const LiveCodePreviewSimple: React.FC<LiveCodePreviewSimpleProps> = ({ 
  html, 
  css, 
  javascript,
  className = ""
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);  const generatePreviewCode = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <style>
        html, body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #1a1a1a;
            color: #ffffff;
            overflow: hidden;
            width: 100%;
            height: 100%;
        }
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 10px;
        }
        * {
            box-sizing: border-box;
        }        /* Improved content container for better centering */
        .preview-container {
            max-width: 100%;
            max-height: 100%;
            transform-origin: center;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        /* Gentle scaling only for extremely large elements */
        .card-container, .flip-card {
            transform: scale(0.9);
            transform-origin: center;
        }
        ${css}
    </style>
</head>
<body>
    <div class="preview-container">
        ${html}
    </div>
    <script>
        try {
            ${javascript}
        } catch (error) {
            console.error('Preview Error:', error);
        }
    </script>
</body>
</html>`;
  };

  const updatePreview = () => {
    if (!iframeRef.current) return;
    
    setError(null);
    
    try {
      const previewCode = generatePreviewCode();
      const blob = new Blob([previewCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      iframeRef.current.src = url;
      
      // Clean up blob URL after iframe loads
      iframeRef.current.onload = () => {
        URL.revokeObjectURL(url);
      };
      
      iframeRef.current.onerror = () => {
        setError('Failed to load preview');
      };
    } catch (err) {
      setError('Error generating preview');
    }
  };

  useEffect(() => {
    updatePreview();
  }, [html, css, javascript]);
  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`} style={{ overflow: 'hidden' }}>
      {error ? (
        <div className="w-full h-full flex items-center justify-center text-red-400 bg-red-500/10">
          <div className="text-center text-xs">
            Preview Error
          </div>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0 bg-transparent"
          title="Code Preview"
          sandbox="allow-scripts allow-same-origin"
          style={{ 
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        />
      )}
    </div>
  );
};

export default LiveCodePreviewSimple;
