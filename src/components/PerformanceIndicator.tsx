import { useEffect, useState } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { BatchedAnimationManager } from '../utils/BatchedAnimationManager';

interface PerformanceIndicatorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showDetails?: boolean;
}

const PerformanceIndicator = ({ 
  position = 'bottom-right',
  showDetails = false
}: PerformanceIndicatorProps) => {
  const { metrics, getBatchManagerMetrics } = usePerformanceMonitor();
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<'good' | 'medium' | 'poor'>('good');
  const [batchMetrics, setBatchMetrics] = useState({
    activeAnimations: 0,
    visibleElements: 0,
    isTabVisible: true,
    maxConcurrentAnimations: 6
  });

  // Updates status based on FPS
  useEffect(() => {
    if (metrics.fps >= 45) {
      setStatus('good');
    } else if (metrics.fps >= 24) {
      setStatus('medium');
    } else {
      setStatus('poor');
    }

    // Update batch manager metrics
    const intervalId = setInterval(() => {
      setBatchMetrics(getBatchManagerMetrics());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [metrics.fps, getBatchManagerMetrics]);

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  // Status colors
  const statusColors = {
    good: 'bg-green-500',
    medium: 'bg-yellow-500',
    poor: 'bg-red-500'
  };

  // Manual performance level adjustment
  const setPerformanceLevel = (level: 'low' | 'medium' | 'high') => {
    const batchManager = BatchedAnimationManager.getInstance();
    batchManager.adjustPerformance(level);
    
    // Update the metrics immediately
    setBatchMetrics(getBatchManagerMetrics());
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 flex flex-col items-end gap-2`}
    >
      {expanded && showDetails && (
        <div className="bg-vault-dark/90 backdrop-blur-md p-4 rounded-lg border border-vault-light/20 text-white text-sm w-64 shadow-lg">
          <div className="flex justify-between mb-2">
            <span>FPS:</span>
            <span className={metrics.fps < 30 ? 'text-red-400' : metrics.fps < 45 ? 'text-yellow-400' : 'text-green-400'}>
              {metrics.fps}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Frame Time:</span>
            <span>{metrics.frameTime.toFixed(2)}ms</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Active Animations:</span>
            <span>{batchMetrics.activeAnimations}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Visible Elements:</span>
            <span>{batchMetrics.visibleElements}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Max Concurrent:</span>
            <span>{batchMetrics.maxConcurrentAnimations}</span>
          </div>
          
          {/* Performance level buttons */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <button 
              onClick={() => setPerformanceLevel('low')}
              className="py-1 px-2 bg-vault-accent/20 hover:bg-vault-accent/40 rounded text-xs font-medium transition-colors"
            >
              Low
            </button>
            <button
              onClick={() => setPerformanceLevel('medium')}
              className="py-1 px-2 bg-vault-accent/20 hover:bg-vault-accent/40 rounded text-xs font-medium transition-colors"
            >
              Medium
            </button>
            <button
              onClick={() => setPerformanceLevel('high')}
              className="py-1 px-2 bg-vault-accent/20 hover:bg-vault-accent/40 rounded text-xs font-medium transition-colors"
            >
              High
            </button>
          </div>
        </div>
      )}

      <button 
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold ${
          expanded ? 'bg-vault-dark/90 backdrop-blur-md border border-vault-light/20' : 'bg-vault-dark/70 backdrop-blur-sm'
        } text-white transition-all duration-300 hover:bg-vault-dark`}
      >
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
        <span>
          {expanded ? 'Performance' : metrics.fps < 30 ? 'Low FPS' : 'Performance'}
        </span>
      </button>
    </div>
  );
};

export default PerformanceIndicator;
