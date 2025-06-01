import { useRef, useCallback } from 'react';
import { BatchedAnimationManager } from '../utils/BatchedAnimationManager';

interface UseAnimationControlOptions {
  enableReducedMotion?: boolean;
  pauseOnInvisible?: boolean;
}

export const useAnimationControl = (options: UseAnimationControlOptions = {}) => {
  const {
    enableReducedMotion = true
  } = options;

  const animationIds = useRef<Set<number>>(new Set());
  const isActive = useRef(true);

  // Check for reduced motion preference
  const prefersReducedMotion = enableReducedMotion && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const registerAnimation = useCallback((animationId: number) => {
    if (!prefersReducedMotion && isActive.current) {
      animationIds.current.add(animationId);
    }
    return animationId;
  }, [prefersReducedMotion]);

  const pauseAnimations = useCallback(() => {
    isActive.current = false;
    animationIds.current.forEach(id => {
      cancelAnimationFrame(id);
    });
    animationIds.current.clear();
  }, []);

  const resumeAnimations = useCallback(() => {
    isActive.current = true;
  }, []);

  const cleanupAnimations = useCallback(() => {
    animationIds.current.forEach(id => {
      cancelAnimationFrame(id);
    });
    animationIds.current.clear();
  }, []);
  return {
    registerAnimation,
    pauseAnimations,
    resumeAnimations,
    cleanupAnimations,
    shouldAnimate: !prefersReducedMotion && isActive.current,
    prefersReducedMotion,
    getBatchManager: () => BatchedAnimationManager.getInstance()
  };
};
