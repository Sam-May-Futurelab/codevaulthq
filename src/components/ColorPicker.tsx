import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
  position: { x: number; y: number };
}

const ColorPicker = ({ isOpen, onClose, onColorSelect, position }: ColorPickerProps) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState('#00ff88');
  
  // Common colors palette
  const predefinedColors = [
    // Greens
    '#00ff88', '#4ade80', '#22c55e', '#16a34a',
    // Blues
    '#38bdf8', '#0ea5e9', '#3b82f6', '#2563eb',
    // Purples
    '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9',
    // Pinks/Reds
    '#fb7185', '#f43f5e', '#ef4444', '#dc2626',
    // Yellows/Oranges
    '#facc15', '#f59e0b', '#f97316', '#ea580c'
  ];

  // Close the picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Insert the selected color
  const handleColorClick = (color: string) => {
    setSelectedColor(color);
    onColorSelect(color);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      ref={pickerRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 bg-vault-dark/95 border border-vault-light/30 rounded-lg p-4 shadow-xl backdrop-blur-md"
      style={{
        top: position.y,
        left: position.x,
        maxWidth: '320px',
        width: '300px'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm font-medium">Color Palette</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Selected color preview */}
        <div className="flex items-center space-x-4">
          <div 
            className="w-8 h-8 rounded-full border border-vault-light/50"
            style={{ backgroundColor: selectedColor }}
          />
          <div className="text-white text-sm font-mono">{selectedColor}</div>
        </div>

        {/* Color grid */}
        <div className="grid grid-cols-5 gap-2">
          {predefinedColors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              className="w-10 h-10 rounded-md cursor-pointer transition-transform hover:scale-110 relative"
              style={{ backgroundColor: color }}
            >
              {color === selectedColor && (
                <div className="absolute inset-0 border-2 border-white rounded-md"></div>
              )}
            </button>
          ))}
        </div>

        {/* Custom color input */}
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="flex-1 bg-vault-medium border border-vault-light/30 rounded px-2 py-1 text-white text-sm font-mono"
          />
          <button
            onClick={() => onColorSelect(selectedColor)}
            className="bg-vault-accent text-black px-2 py-1 rounded text-sm font-medium"
          >
            Use
          </button>
        </div>

        <div className="text-xs text-gray-400 mt-2">
          Click a color to insert it into your code
        </div>
      </div>
    </motion.div>
  );
};

export default ColorPicker;
