/**
 * React Hooks for Snippet Data Management
 * Provides easy integration with the statistics and API services
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import SnippetApiService from '../services/SnippetApiService';
import type { SnippetWithAnalytics, PaginatedSnippets, SearchOptions } from '../services/SnippetApiService';
import SnippetStatisticsService from '../services/SnippetStatisticsService';

// Hook for getting top ranked snippets
export function useTopRankedSnippets(limit: number = 10, refreshInterval?: number) {
  const [snippets, setSnippets] = useState<SnippetWithAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiService = useRef(SnippetApiService.getInstance());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.current.getTopRankedSnippets(limit);
      setSnippets(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch top ranked snippets');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();

    // Set up refresh interval if specified
    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { snippets, loading, error, refresh };
}

// Hook for getting trending snippets
export function useTrendingSnippets(limit: number = 10, timeframe: 'hour' | 'day' | 'week' = 'day', refreshInterval?: number) {
  const [snippets, setSnippets] = useState<SnippetWithAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiService = useRef(SnippetApiService.getInstance());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.current.getTrendingSnippets(limit, timeframe);
      setSnippets(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trending snippets');
    } finally {
      setLoading(false);
    }
  }, [limit, timeframe]);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { snippets, loading, error, refresh };
}

// Hook for snippet search with pagination
export function useSnippetSearch(initialOptions: SearchOptions = {}) {
  const [result, setResult] = useState<PaginatedSnippets | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<SearchOptions>(initialOptions);
  const apiService = useRef(SnippetApiService.getInstance());

  const search = useCallback(async (newOptions?: SearchOptions) => {
    const searchOptions = newOptions || options;
    
    try {
      setLoading(true);
      setError(null);
      const searchResult = await apiService.current.searchSnippets(searchOptions);
      setResult(searchResult);
      if (newOptions) {
        setOptions(newOptions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search snippets');
    } finally {
      setLoading(false);
    }
  }, [options]);

  const updateOptions = useCallback((newOptions: Partial<SearchOptions>) => {
    const updatedOptions = { ...options, ...newOptions };
    setOptions(updatedOptions);
    search(updatedOptions);
  }, [options, search]);

  const nextPage = useCallback(() => {
    if (result?.hasNextPage) {
      updateOptions({ page: result.currentPage + 1 });
    }
  }, [result, updateOptions]);

  const previousPage = useCallback(() => {
    if (result?.hasPreviousPage) {
      updateOptions({ page: result.currentPage - 1 });
    }
  }, [result, updateOptions]);

  const goToPage = useCallback((page: number) => {
    updateOptions({ page });
  }, [updateOptions]);

  useEffect(() => {
    if (Object.keys(options).length > 0) {
      search();
    }
  }, []); // Only run on mount

  return {
    result,
    loading,
    error,
    search,
    updateOptions,
    nextPage,
    previousPage,
    goToPage,
    options
  };
}

// Hook for tracking snippet interactions
export function useSnippetInteraction() {
  const apiService = useRef(SnippetApiService.getInstance());

  const trackView = useCallback(async (snippetId: string, metadata?: any) => {
    try {
      await apiService.current.trackInteraction(snippetId, 'view', metadata);
    } catch (error) {
      console.warn('Failed to track view:', error);
    }
  }, []);

  const trackLike = useCallback(async (snippetId: string) => {
    try {
      await apiService.current.trackInteraction(snippetId, 'like');
    } catch (error) {
      console.warn('Failed to track like:', error);
    }
  }, []);

  const trackDownload = useCallback(async (snippetId: string) => {
    try {
      await apiService.current.trackInteraction(snippetId, 'download');
    } catch (error) {
      console.warn('Failed to track download:', error);
    }
  }, []);

  const trackShare = useCallback(async (snippetId: string) => {
    try {
      await apiService.current.trackInteraction(snippetId, 'share');
    } catch (error) {
      console.warn('Failed to track share:', error);
    }
  }, []);

  const trackBookmark = useCallback(async (snippetId: string) => {
    try {
      await apiService.current.trackInteraction(snippetId, 'bookmark');
    } catch (error) {
      console.warn('Failed to track bookmark:', error);
    }
  }, []);

  const trackFork = useCallback(async (snippetId: string) => {
    try {
      await apiService.current.trackInteraction(snippetId, 'fork');
    } catch (error) {
      console.warn('Failed to track fork:', error);
    }
  }, []);

  return {
    trackView,
    trackLike,
    trackDownload,
    trackShare,
    trackBookmark,
    trackFork
  };
}

// Hook for getting platform statistics
export function usePlatformStats(refreshInterval?: number) {
  const [stats, setStats] = useState<{
    totalSnippets: number;
    totalViews: number;
    totalLikes: number;
    totalDownloads: number;
    activeUsers: number;
    topCategories: Array<{ category: string; count: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiService = useRef(SnippetApiService.getInstance());

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.current.getPlatformStats();
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch platform stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    if (refreshInterval) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStats, refreshInterval]);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh };
}

// Hook for getting a single snippet with analytics
export function useSnippetWithAnalytics(snippetId: string | null, autoTrackView: boolean = true) {
  const [snippet, setSnippet] = useState<SnippetWithAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiService = useRef(SnippetApiService.getInstance());
  const { trackView } = useSnippetInteraction();
  const hasTrackedView = useRef(false);

  const fetchSnippet = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.current.getSnippetById(id);
      setSnippet(result);
      
      // Auto-track view if enabled and not already tracked
      if (autoTrackView && result && !hasTrackedView.current) {
        trackView(id);
        hasTrackedView.current = true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch snippet');
    } finally {
      setLoading(false);
    }
  }, [autoTrackView, trackView]);

  useEffect(() => {
    if (snippetId) {
      hasTrackedView.current = false; // Reset tracking flag for new snippet
      fetchSnippet(snippetId);
    } else {
      setSnippet(null);
      setLoading(false);
      setError(null);
    }
  }, [snippetId, fetchSnippet]);

  const refresh = useCallback(() => {
    if (snippetId) {
      fetchSnippet(snippetId);
    }
  }, [snippetId, fetchSnippet]);

  return { snippet, loading, error, refresh };
}

// Hook for real-time statistics updates
export function useRealTimeStats(snippetIds: string[], refreshInterval: number = 30000) {
  const [stats, setStats] = useState<Map<string, any>>(new Map());
  const statisticsService = useRef(SnippetStatisticsService.getInstance());

  const updateStats = useCallback(() => {
    const newStats = new Map();
    
    snippetIds.forEach(id => {
      const analytics = statisticsService.current.getSnippetAnalytics(id);
      if (analytics) {
        newStats.set(id, {
          views: analytics.metrics.views,
          likes: analytics.metrics.likes,
          downloads: analytics.metrics.downloads,
          rankingScore: statisticsService.current.calculateRankingScore(id),
          trendingScore: analytics.metrics.trendingScore
        });
      }
    });
    
    setStats(newStats);
  }, [snippetIds]);

  useEffect(() => {
    updateStats();

    const interval = setInterval(updateStats, refreshInterval);
    return () => clearInterval(interval);
  }, [updateStats, refreshInterval]);

  return stats;
}

// Export utility functions for manual usage
export const snippetApi = SnippetApiService.getInstance();
export const snippetStats = SnippetStatisticsService.getInstance();
