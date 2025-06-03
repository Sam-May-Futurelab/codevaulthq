/**
 * Enhanced View Tracking Hook
 * Provides advanced view tracking with unique views, engagement duration, and detailed analytics
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useSnippetInteraction } from './useFirebaseData';

interface ViewTrackingOptions {
  /** Minimum time (ms) before a view is considered valid */
  minViewDuration?: number;
  /** Track unique views per user */
  trackUniqueViews?: boolean;
  /** Track scroll depth */
  trackScrollDepth?: boolean;
  /** Track time spent on snippet */
  trackEngagementTime?: boolean;
  /** Debounce multiple rapid views */
  debounceMs?: number;
}

interface ViewMetadata {
  userAgent?: string;
  referrer?: string;
  viewDuration: number;
  scrollDepth?: number;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  isUniqueView?: boolean;
  sessionId?: string;
}

export const useEnhancedViewTracking = (
  snippetId: string,
  options: ViewTrackingOptions = {}
) => {
  const {
    minViewDuration = 1000, // 1 second minimum
    trackUniqueViews = true,
    trackScrollDepth = false,
    trackEngagementTime = true,
    debounceMs = 2000
  } = options;

  const { currentUser } = useAuth();
  const { trackInteraction } = useSnippetInteraction(snippetId);
  
  const viewStartTime = useRef<number | null>(null);
  const hasTrackedView = useRef(false);
  const scrollDepth = useRef(0);
  const lastViewTracked = useRef<number>(0);
  const isVisible = useRef(false);

  // Generate session ID for this view session
  const sessionId = useRef(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // Detect device type
  const getDeviceType = useCallback((): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, []);

  // Track scroll depth
  const trackScroll = useCallback(() => {
    if (!trackScrollDepth) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentDepth = Math.round((scrollTop / docHeight) * 100);
    
    scrollDepth.current = Math.max(scrollDepth.current, currentDepth);
  }, [trackScrollDepth]);

  // Check if this is a unique view for the user
  const isUniqueView = useCallback(async (): Promise<boolean> => {
    if (!trackUniqueViews || !currentUser) return false;
    
    // Check localStorage for unique view tracking
    const viewKey = `viewed_${snippetId}_${currentUser.uid}`;
    const hasViewed = localStorage.getItem(viewKey);
    
    if (!hasViewed) {
      localStorage.setItem(viewKey, Date.now().toString());
      return true;
    }
    
    return false;
  }, [snippetId, currentUser, trackUniqueViews]);

  // Main view tracking function
  const trackView = useCallback(async () => {
    const now = Date.now();
    
    // Debounce rapid consecutive views
    if (now - lastViewTracked.current < debounceMs) {
      return;
    }
    
    const viewDuration = trackEngagementTime && viewStartTime.current ? now - viewStartTime.current : 0;
    
    // Only track if minimum view duration is met
    if (viewDuration < minViewDuration) {
      return;
    }

    const metadata: ViewMetadata = {
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewDuration,
      deviceType: getDeviceType(),
      sessionId: sessionId.current,
      isUniqueView: await isUniqueView()
    };

    if (trackScrollDepth) {
      metadata.scrollDepth = scrollDepth.current;
    }

    try {
      await trackInteraction('view', metadata);
      hasTrackedView.current = true;
      lastViewTracked.current = now;
      
      console.log('Enhanced view tracked:', {
        snippetId,
        duration: viewDuration,
        unique: metadata.isUniqueView,
        device: metadata.deviceType
      });
    } catch (error) {
      console.warn('Failed to track enhanced view:', error);
    }
  }, [
    snippetId, 
    trackInteraction, 
    minViewDuration, 
    debounceMs, 
    getDeviceType, 
    isUniqueView, 
    trackScrollDepth
  ]);

  // Handle visibility change
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Page became hidden - track the view if it was visible
      if (isVisible.current && viewStartTime.current && !hasTrackedView.current) {
        trackView();
      }
    } else {
      // Page became visible - reset timer
      viewStartTime.current = Date.now();
      isVisible.current = true;
    }
  }, [trackView]);

  // Handle page unload
  const handleBeforeUnload = useCallback(() => {
    if (isVisible.current && viewStartTime.current && !hasTrackedView.current) {
      // Use sendBeacon for reliable tracking on page unload
      const viewDuration = Date.now() - viewStartTime.current;
      if (viewDuration >= minViewDuration) {
        // Note: sendBeacon is more reliable but limited in data
        navigator.sendBeacon('/api/track-view', JSON.stringify({
          snippetId,
          userId: currentUser?.uid,
          duration: viewDuration,
          type: 'view'
        }));
      }
    }
  }, [snippetId, currentUser, minViewDuration]);

  // Setup tracking
  useEffect(() => {
    // Initialize view tracking
    viewStartTime.current = Date.now();
    isVisible.current = true;
    hasTrackedView.current = false;

    // Setup event listeners
    if (trackScrollDepth) {
      window.addEventListener('scroll', trackScroll, { passive: true });
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Track view after minimum duration
    const viewTimer = setTimeout(() => {
      if (isVisible.current && !hasTrackedView.current) {
        trackView();
      }
    }, minViewDuration);

    return () => {
      // Cleanup
      if (trackScrollDepth) {
        window.removeEventListener('scroll', trackScroll);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(viewTimer);

      // Final view tracking on unmount
      if (isVisible.current && viewStartTime.current && !hasTrackedView.current) {
        trackView();
      }
    };
  }, [
    snippetId,
    trackScroll,
    trackScrollDepth,
    handleVisibilityChange,
    handleBeforeUnload,
    trackView,
    minViewDuration
  ]);

  return {
    hasTrackedView: hasTrackedView.current,
    currentViewDuration: viewStartTime.current ? Date.now() - viewStartTime.current : 0,
    scrollDepth: scrollDepth.current,
    sessionId: sessionId.current
  };
};
