import { useState, useEffect, useCallback } from 'react';
import type { SnippetWithMetrics } from '../types';
import { convertFirebaseSnippet } from '../types';
import FirebaseDbService from '../services/FirebaseDbService';
import { useAuth } from './useAuth.tsx';

// Hook for managing snippets with Firebase
export const useFirebaseSnippets = (options?: {
  authorId?: string;
  language?: string;
  tags?: string[];
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
  realtime?: boolean;
}) => {
  const [snippets, setSnippets] = useState<SnippetWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchSnippets = async () => {
      try {
        setLoading(true);
        setError(null);

        if (options?.realtime) {
          // Real-time subscription
          unsubscribe = FirebaseDbService.subscribeToSnippets(
            (updatedSnippets) => {
              const convertedSnippets = updatedSnippets
                .filter(snippet => snippet.id) // Filter out snippets without ID
                .map(snippet => convertFirebaseSnippet(snippet as any));
              setSnippets(convertedSnippets);
              setLoading(false);
            },
            options
          );
        } else {
          // One-time fetch
          const fetchedSnippets = await FirebaseDbService.getSnippets(options);
          const convertedSnippets = fetchedSnippets
            .filter(snippet => snippet.id)
            .map(snippet => convertFirebaseSnippet(snippet as any));
          setSnippets(convertedSnippets);
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch snippets');
        setLoading(false);
      }
    };

    fetchSnippets();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [options?.authorId, options?.language, options?.limitCount, options?.realtime]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSnippets = await FirebaseDbService.getSnippets(options);
      const convertedSnippets = fetchedSnippets
        .filter(snippet => snippet.id)
        .map(snippet => convertFirebaseSnippet(snippet as any));
      setSnippets(convertedSnippets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refetch snippets');
    } finally {
      setLoading(false);
    }
  }, [options]);

  return { snippets, loading, error, refetch };
};

// Hook for creating snippets
export const useCreateSnippet = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const createSnippet = useCallback(async (snippetData: {
    title: string;
    description: string;
    code: string;
    language: string;
    category?: {
      id: string;
      label: string;
      mainCategory: {
        id: string;
        name: string;
        color: string;
      };
    };
    tags: string[];
    isPublic: boolean;
  }) => {
    if (!currentUser) {
      throw new Error('User must be authenticated to create snippets');
    }

    try {
      setLoading(true);
      setError(null);

      // Create default category if not provided (for backward compatibility)
      const category = snippetData.category || {
        id: snippetData.language || 'animations',
        label: snippetData.language || 'Animations',
        mainCategory: {
          id: 'visual',
          name: 'Visual & Animation',
          color: 'text-pink-500'
        }
      };

      const snippetId = await FirebaseDbService.createSnippet({
        ...snippetData,
        category,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'Anonymous'
      });

      return snippetId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create snippet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  return { createSnippet, loading, error };
};

// Hook for deleting snippets
export const useDeleteSnippet = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const deleteSnippet = useCallback(async (snippetId: string) => {
    if (!currentUser) {
      throw new Error('User must be authenticated to delete snippets');
    }

    try {
      setLoading(true);
      setError(null);
      await FirebaseDbService.deleteSnippet(snippetId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete snippet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  return { deleteSnippet, loading, error };
};

// Hook for snippet interactions
export const useSnippetInteraction = (snippetId: string) => {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const trackInteraction = useCallback(async (
    type: 'view' | 'like' | 'download' | 'share' | 'bookmark' | 'fork' | 'comment',
    metadata?: Record<string, any>
  ) => {
    if (!currentUser) {
      console.warn('User must be authenticated to track interactions');
      return;
    }

    try {
      setLoading(true);
      await FirebaseDbService.trackInteraction(currentUser.uid, snippetId, type, metadata);
    } catch (error) {
      console.error('Failed to track interaction:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, snippetId]);

  return { trackInteraction, loading };
};

// Hook for snippet analytics
export const useSnippetAnalytics = (snippetId: string, realtime = false) => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!snippetId) return;

    let unsubscribe: (() => void) | undefined;

    if (realtime) {
      // Real-time subscription
      unsubscribe = FirebaseDbService.subscribeToSnippetAnalytics(
        snippetId,
        (updatedAnalytics) => {
          setAnalytics(updatedAnalytics);
          setLoading(false);
        }
      );
    } else {
      // One-time fetch would require a separate method
      // For now, we'll use real-time subscription
      unsubscribe = FirebaseDbService.subscribeToSnippetAnalytics(
        snippetId,
        (updatedAnalytics) => {
          setAnalytics(updatedAnalytics);
          setLoading(false);
        }
      );
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }    };
  }, [snippetId, realtime]);

  return { analytics, loading };
};

// Hook for searching snippets
export const useSnippetSearch = () => {
  const [results, setResults] = useState<SnippetWithMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (
    searchTerm: string,
    options?: {
      language?: string;
      tags?: string[];
      limit?: number;
    }
  ) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const searchResults = await FirebaseDbService.searchSnippets(searchTerm, options);
      const convertedResults = searchResults
        .filter(snippet => snippet.id)
        .map(snippet => convertFirebaseSnippet(snippet as any));
      setResults(convertedResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, clearResults };
};

// Hook for platform statistics
export const usePlatformStats = () => {
  const [stats, setStats] = useState({
    totalSnippets: 0,
    totalUsers: 0,
    totalViews: 0,
    totalLikes: 0,
    totalDownloads: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const platformStats = await FirebaseDbService.getPlatformStats();
        setStats(platformStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch platform stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const platformStats = await FirebaseDbService.getPlatformStats();
      setStats(platformStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refetch platform stats');
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, error, refetch };
};

// Hook for top ranked snippets
export const useTopRankedSnippets = (limit = 10) => {
  return useFirebaseSnippets({
    orderByField: 'analytics.engagementRate',
    orderDirection: 'desc',
    limitCount: limit,
    realtime: true
  });
};

// Hook for trending snippets (based on recent activity)
export const useTrendingSnippets = (limit = 10) => {
  return useFirebaseSnippets({
    orderByField: 'analytics.views',
    orderDirection: 'desc',
    limitCount: limit,
    realtime: true
  });
};

// Hook for user's snippets
export const useUserSnippets = (userId?: string) => {
  const { currentUser } = useAuth();
  const targetUserId = userId || currentUser?.uid;

  return useFirebaseSnippets({
    authorId: targetUserId,
    orderByField: 'createdAt',
    orderDirection: 'desc',
    realtime: true
  });
};