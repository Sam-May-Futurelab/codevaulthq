/**
 * Enhanced Like System Hook
 * Provides advanced like functionality with animations, persistent state, and notifications
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useSnippetInteraction } from './useFirebaseData';

interface LikeState {
  isLiked: boolean;
  likeCount: number;
  isAnimating: boolean;
  canLike: boolean;
}

interface LikeOptions {
  /** Enable like animations */
  enableAnimations?: boolean;
  /** Show notifications for likes */
  showNotifications?: boolean;
  /** Persist like state across sessions */
  persistState?: boolean;
  /** Debounce rapid clicks */
  debounceMs?: number;
  /** Enable optimistic updates */
  optimisticUpdates?: boolean;
}

interface LikeMetadata {
  timestamp: number;
  source: 'button' | 'keyboard' | 'gesture';
  deviceType: string;
  sessionId: string;
}

export const useEnhancedLikeSystem = (
  snippetId: string,
  initialLikeCount: number = 0,
  options: LikeOptions = {}
) => {
  const {
    enableAnimations = true,
    showNotifications = true,
    persistState = true,
    debounceMs = 300,
    optimisticUpdates = true
  } = options;

  const { currentUser } = useAuth();
  const { trackInteraction } = useSnippetInteraction(snippetId);
  
  const [likeState, setLikeState] = useState<LikeState>({
    isLiked: false,
    likeCount: initialLikeCount,
    isAnimating: false,
    canLike: true
  });

  const lastLikeTime = useRef(0);
  const animationTimeout = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef(`like_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Load persisted like state
  useEffect(() => {
    if (!persistState || !currentUser) return;

    const likeKey = `liked_${snippetId}_${currentUser.uid}`;
    const savedLikeState = localStorage.getItem(likeKey);
    
    if (savedLikeState) {
      try {
        const parsed = JSON.parse(savedLikeState);
        setLikeState(prev => ({
          ...prev,
          isLiked: parsed.isLiked,
          likeCount: initialLikeCount // Always use the latest count from server
        }));
      } catch (error) {
        console.warn('Failed to parse saved like state:', error);
      }
    }
  }, [snippetId, currentUser, persistState, initialLikeCount]);

  // Save like state to localStorage
  const saveLikeState = useCallback((isLiked: boolean) => {
    if (!persistState || !currentUser) return;

    const likeKey = `liked_${snippetId}_${currentUser.uid}`;
    const stateToSave = {
      isLiked,
      timestamp: Date.now(),
      snippetId
    };
    
    localStorage.setItem(likeKey, JSON.stringify(stateToSave));
  }, [snippetId, currentUser, persistState]);

  // Show notification
  const showLikeNotification = useCallback((isLiked: boolean) => {
    if (!showNotifications) return;

    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${isLiked ? '#10B981' : '#6B7280'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = isLiked ? '❤️ Liked!' : '💔 Unliked';
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }, [showNotifications]);

  // Create like animation
  const createLikeAnimation = useCallback((element: HTMLElement) => {
    if (!enableAnimations) return;

    // Heart burst animation
    const burstColors = ['#FF6B6B', '#FF8E53', '#FF6B9D', '#C44569'];
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = 30 + Math.random() * 20;
      
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: ${burstColors[i % burstColors.length]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
      `;
      
      element.appendChild(particle);
      
      const startX = element.offsetWidth / 2;
      const startY = element.offsetHeight / 2;
      
      particle.style.left = startX + 'px';
      particle.style.top = startY + 'px';
      
      // Animate particle
      particle.animate([
        { 
          transform: `translate(0, 0) scale(1)`,
          opacity: 1 
        },
        { 
          transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`,
          opacity: 0 
        }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      };
    }

    // Scale animation for the heart
    element.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.3)' },
      { transform: 'scale(1)' }
    ], {
      duration: 300,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    });
  }, [enableAnimations]);

  // Handle like toggle
  const toggleLike = useCallback(async (
    event?: React.MouseEvent | KeyboardEvent,
    source: 'button' | 'keyboard' | 'gesture' = 'button'
  ) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!currentUser) {
      // Could show auth modal here
      console.warn('User must be authenticated to like snippets');
      return;
    }

    const now = Date.now();
    
    // Debounce rapid clicks
    if (now - lastLikeTime.current < debounceMs) {
      return;
    }
    
    if (!likeState.canLike) return;

    lastLikeTime.current = now;
    const newIsLiked = !likeState.isLiked;

    // Optimistic update
    if (optimisticUpdates) {
      setLikeState(prev => ({
        ...prev,
        isLiked: newIsLiked,
        likeCount: newIsLiked ? prev.likeCount + 1 : prev.likeCount - 1,
        isAnimating: true,
        canLike: false
      }));

      // Reset animation and re-enable after delay
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
      
      animationTimeout.current = setTimeout(() => {
        setLikeState(prev => ({
          ...prev,
          isAnimating: false,
          canLike: true
        }));
      }, 500);
    }

    // Save state immediately for responsiveness
    saveLikeState(newIsLiked);

    // Show notification
    showLikeNotification(newIsLiked);

    // Create animation if element reference available
    if (enableAnimations && event?.currentTarget instanceof HTMLElement) {
      createLikeAnimation(event.currentTarget);
    }

    // Track interaction with metadata
    const metadata: LikeMetadata = {
      timestamp: now,
      source,
      deviceType: navigator.userAgent,
      sessionId: sessionId.current
    };

    try {
      await trackInteraction('like', metadata);
      console.log('Like interaction tracked:', { snippetId, isLiked: newIsLiked });
    } catch (error) {
      console.error('Failed to track like interaction:', error);
      
      // Revert optimistic update on failure
      if (optimisticUpdates) {
        setLikeState(prev => ({
          ...prev,
          isLiked: !newIsLiked,
          likeCount: newIsLiked ? prev.likeCount - 1 : prev.likeCount + 1
        }));
        saveLikeState(!newIsLiked);
      }
    }
  }, [
    currentUser,
    likeState,
    debounceMs,
    optimisticUpdates,
    saveLikeState,
    showLikeNotification,
    enableAnimations,
    createLikeAnimation,
    trackInteraction,
    snippetId
  ]);

  // Handle keyboard shortcuts
  const handleKeyboardLike = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
      event.preventDefault();
      toggleLike(event, 'keyboard');
    }
  }, [toggleLike]);

  // Setup keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardLike);
    return () => document.removeEventListener('keydown', handleKeyboardLike);
  }, [handleKeyboardLike]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, []);

  return {
    ...likeState,
    toggleLike,
    likeCount: likeState.likeCount,
    isLiked: likeState.isLiked,
    isAnimating: likeState.isAnimating,
    canLike: likeState.canLike && !!currentUser,
    isAuthenticated: !!currentUser
  };
};
