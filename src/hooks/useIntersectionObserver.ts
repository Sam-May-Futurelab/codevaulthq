import { useEffect, useRef, useState } from 'react';
import { BatchedAnimationManager } from '../utils/BatchedAnimationManager';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
  registerWithBatchManager?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    freezeOnceVisible = false,
    registerWithBatchManager = false
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);
        
        if (isVisible && !hasBeenVisible) {
          setHasBeenVisible(true);
        }

        // If freezeOnceVisible is true, keep showing as visible once it has been seen
        if (freezeOnceVisible && hasBeenVisible) {
          setIsIntersecting(true);
        }
        
        // Register/unregister with BatchedAnimationManager if requested
        if (registerWithBatchManager) {
          const batchManager = BatchedAnimationManager.getInstance();
          if (isVisible) {
            batchManager.observeElement(element);
          } else if (!freezeOnceVisible) {
            batchManager.unobserveElement(element);
          }
        }
      },
      { threshold, rootMargin }
    );    observer.observe(element);

    // Initial registration with batch manager if the element is already visible
    if (registerWithBatchManager) {
      const batchManager = BatchedAnimationManager.getInstance();
      const rect = element.getBoundingClientRect();
      const isInitiallyVisible = 
        rect.top < window.innerHeight && 
        rect.bottom > 0 && 
        rect.left < window.innerWidth && 
        rect.right > 0;
      
      if (isInitiallyVisible) {
        batchManager.observeElement(element);
      }
    }

    return () => {
      observer.unobserve(element);
      
      // Clean up batch manager registration on unmount
      if (registerWithBatchManager) {
        const batchManager = BatchedAnimationManager.getInstance();
        batchManager.unobserveElement(element);
      }
    };
  }, [threshold, rootMargin, freezeOnceVisible, hasBeenVisible, registerWithBatchManager]);

  return { targetRef, isIntersecting, hasBeenVisible };
};
