import { useEffect, useRef, useState } from 'react';
import { BatchedAnimationManager } from '../utils/BatchedAnimationManager';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  isLowPerformance: boolean;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    isLowPerformance: false
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const animationIdRef = useRef<number | null>(null);
  const lowPerformanceThreshold = 24; // FPS below this triggers optimization

  useEffect(() => {
    const batchManager = BatchedAnimationManager.getInstance();
    let consecutiveLowFrames = 0;

    const measurePerformance = () => {
      const now = performance.now();
      const frameTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // Keep track of recent frame times (last 60 frames)
      frameTimesRef.current.push(frameTime);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      // Calculate average FPS over recent frames
      const avgFrameTime = frameTimesRef.current.reduce((sum, time) => sum + time, 0) / frameTimesRef.current.length;
      const fps = 1000 / avgFrameTime;

      // Detect low performance
      const isLowPerformance = fps < lowPerformanceThreshold;
      
      if (isLowPerformance) {
        consecutiveLowFrames++;
        if (consecutiveLowFrames >= 30) { // 30 consecutive low frames
          // Automatically reduce animation quality
          batchManager.adjustPerformance('low');
          console.log('Performance mode: LOW - Reduced animation complexity');
        }
      } else {
        consecutiveLowFrames = 0;
        // Gradually restore performance if stable
        if (fps > 50 && consecutiveLowFrames === 0) {
          batchManager.adjustPerformance('medium');
        }
      }

      // Get memory usage if available
      let memoryUsage: number | undefined;
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        memoryUsage = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
      }

      setMetrics({
        fps: Math.round(fps),
        frameTime: Math.round(avgFrameTime * 100) / 100,
        memoryUsage,
        isLowPerformance
      });

      animationIdRef.current = requestAnimationFrame(measurePerformance);
    };

    // Start monitoring
    animationIdRef.current = requestAnimationFrame(measurePerformance);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  // Manual performance level adjustment
  const setPerformanceLevel = (level: 'low' | 'medium' | 'high') => {
    const batchManager = BatchedAnimationManager.getInstance();
    batchManager.adjustPerformance(level);
  };

  // Get additional metrics from batch manager
  const getBatchManagerMetrics = () => {
    const batchManager = BatchedAnimationManager.getInstance();
    return batchManager.getMetrics();
  };

  return {
    metrics,
    setPerformanceLevel,
    getBatchManagerMetrics
  };
};
