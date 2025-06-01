// Utility for managing multiple animations efficiently
export class BatchedAnimationManager {
  private static instance: BatchedAnimationManager;
  private animationId: number | null = null;
  private animationCallbacks: Set<() => void> = new Set();
  private visibilityObserver: IntersectionObserver | null = null;
  private visibleElements: Set<Element> = new Set();
  private isTabVisible: boolean = true;
  private maxConcurrentAnimations: number = 6; // Limit concurrent animations
  
  static getInstance(): BatchedAnimationManager {
    if (!BatchedAnimationManager.instance) {
      BatchedAnimationManager.instance = new BatchedAnimationManager();
    }
    return BatchedAnimationManager.instance;
  }

  constructor() {
    this.setupVisibilityListener();
    this.setupIntersectionObserver();
  }

  private setupVisibilityListener() {
    // Pause all animations when tab is not visible
    document.addEventListener('visibilitychange', () => {
      this.isTabVisible = !document.hidden;
      if (this.isTabVisible) {
        this.startBatchedAnimation();
      } else {
        this.stopBatchedAnimation();
      }
    });
  }

  private setupIntersectionObserver() {
    // Only animate elements that are visible in viewport
    this.visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.visibleElements.add(entry.target);
          } else {
            this.visibleElements.delete(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );
  }

  observeElement(element: Element) {
    if (this.visibilityObserver) {
      this.visibilityObserver.observe(element);
    }
  }

  unobserveElement(element: Element) {
    if (this.visibilityObserver) {
      this.visibilityObserver.unobserve(element);
    }
    this.visibleElements.delete(element);
  }

  addAnimation(callback: () => void): () => void {
    this.animationCallbacks.add(callback);
    
    if (this.animationCallbacks.size === 1 && this.isTabVisible) {
      this.startBatchedAnimation();
    }

    // Return cleanup function
    return () => {
      this.animationCallbacks.delete(callback);
      if (this.animationCallbacks.size === 0) {
        this.stopBatchedAnimation();
      }
    };
  }

  private startBatchedAnimation() {
    if (this.animationId !== null) return;

    let frameCount = 0;
    const maxFPS = 30; // Throttle to 30fps
    const frameInterval = 1000 / maxFPS / 16.67; // ~2 frames

    const animate = () => {
      frameCount++;
      
      // Only run animation callbacks on throttled frames
      if (frameCount % Math.ceil(frameInterval) === 0) {
        // Limit concurrent animations based on visible elements
        const visibleCount = Math.min(this.visibleElements.size, this.maxConcurrentAnimations);
        let processedCount = 0;
        
        for (const callback of this.animationCallbacks) {
          if (processedCount >= visibleCount) break;
          
          try {
            callback();
            processedCount++;
          } catch (error) {
            console.warn('Animation callback error:', error);
          }
        }
      }

      if (this.animationCallbacks.size > 0 && this.isTabVisible) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.animationId = null;
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  private stopBatchedAnimation() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Utility to check if element is visible and should animate
  shouldAnimate(element: Element): boolean {
    return this.isTabVisible && this.visibleElements.has(element);
  }

  // Get performance metrics
  getMetrics() {
    return {
      activeAnimations: this.animationCallbacks.size,
      visibleElements: this.visibleElements.size,
      isTabVisible: this.isTabVisible,
      maxConcurrentAnimations: this.maxConcurrentAnimations
    };
  }

  // Adjust performance settings dynamically
  adjustPerformance(level: 'low' | 'medium' | 'high') {
    switch (level) {
      case 'low':
        this.maxConcurrentAnimations = 3;
        break;
      case 'medium':
        this.maxConcurrentAnimations = 6;
        break;
      case 'high':
        this.maxConcurrentAnimations = 12;
        break;
    }
  }

  dispose() {
    this.stopBatchedAnimation();
    if (this.visibilityObserver) {
      this.visibilityObserver.disconnect();
    }
    this.animationCallbacks.clear();
    this.visibleElements.clear();
  }
}
