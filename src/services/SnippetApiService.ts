/**
 * API Service for Snippet Data Management
 * Handles communication with backend services and caching
 */

import type { SnippetData } from '../data/snippets';
import SnippetStatisticsService from './SnippetStatisticsService';
import type { SnippetAnalytics } from './SnippetStatisticsService';

export interface SnippetWithAnalytics extends SnippetData {
  analytics: SnippetAnalytics;
  rankingScore: number;
  trendingScore: number;
}

export interface PaginatedSnippets {
  snippets: SnippetWithAnalytics[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SnippetFilters {
  category?: string;
  tags?: string[];
  author?: string;
  minViews?: number;
  minLikes?: number;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'recent' | 'popular' | 'trending' | 'views' | 'likes' | 'downloads';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchOptions {
  query?: string;
  filters?: SnippetFilters;
  page?: number;
  limit?: number;
}

class SnippetApiService {
  private static instance: SnippetApiService;
  private statisticsService: SnippetStatisticsService;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes default TTL

  private constructor() {
    this.statisticsService = SnippetStatisticsService.getInstance();
  }

  public static getInstance(): SnippetApiService {
    if (!SnippetApiService.instance) {
      SnippetApiService.instance = new SnippetApiService();
    }
    return SnippetApiService.instance;
  }

  /**
   * Get top ranked snippets with real-time analytics
   */
  public async getTopRankedSnippets(limit: number = 10, useCache: boolean = true): Promise<SnippetWithAnalytics[]> {
    const cacheKey = `top_ranked_${limit}`;
    
    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }

    try {
      // In production, this would be an API call
      // For now, simulate with a delay and use our statistics service
      await this.simulateApiDelay();

      const topRanked = this.statisticsService.getTopRankedSnippets(limit);
      const result: SnippetWithAnalytics[] = [];

      // Import snippetsData dynamically to avoid circular dependency
      const { snippetsData } = await import('../data/snippets');

      for (const ranked of topRanked) {
        const snippetData = snippetsData[ranked.snippetId];
        if (snippetData) {
          result.push({
            ...snippetData,
            analytics: ranked.analytics,
            rankingScore: ranked.score,
            trendingScore: ranked.analytics.metrics.trendingScore
          });
        }
      }

      this.setCache(cacheKey, result, this.CACHE_TTL);
      return result;

    } catch (error) {
      console.error('Failed to fetch top ranked snippets:', error);
      throw new Error('Unable to fetch top ranked snippets');
    }
  }

  /**
   * Get trending snippets based on recent engagement
   */
  public async getTrendingSnippets(limit: number = 10, timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<SnippetWithAnalytics[]> {
    const cacheKey = `trending_${timeframe}_${limit}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      await this.simulateApiDelay();

      const trending = this.statisticsService.getTrendingSnippets(limit, timeframe);
      const result: SnippetWithAnalytics[] = [];

      const { snippetsData } = await import('../data/snippets');

      for (const trend of trending) {
        const snippetData = snippetsData[trend.snippetId];
        if (snippetData) {
          result.push({
            ...snippetData,
            analytics: trend.analytics,
            rankingScore: this.statisticsService.calculateRankingScore(trend.snippetId),
            trendingScore: trend.trendingScore
          });
        }
      }

      this.setCache(cacheKey, result, 2 * 60 * 1000); // 2 minutes TTL for trending
      return result;

    } catch (error) {
      console.error('Failed to fetch trending snippets:', error);
      throw new Error('Unable to fetch trending snippets');
    }
  }

  /**
   * Search snippets with advanced filtering and sorting
   */
  public async searchSnippets(options: SearchOptions): Promise<PaginatedSnippets> {
    const { query, filters, page = 1, limit = 20 } = options;
    const cacheKey = `search_${JSON.stringify(options)}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      await this.simulateApiDelay();

      const { snippetsData } = await import('../data/snippets');
      let allSnippets = Object.values(snippetsData);

      // Apply filters
      if (filters) {
        allSnippets = this.applyFilters(allSnippets, filters);
      }

      // Apply search query
      if (query) {
        allSnippets = this.applySearch(allSnippets, query);
      }

      // Enhance with analytics
      const enhancedSnippets: SnippetWithAnalytics[] = allSnippets.map(snippet => {
        const analytics = this.statisticsService.getSnippetAnalytics(snippet.id);
        return {
          ...snippet,
          analytics: analytics || this.createDefaultAnalytics(snippet.id),
          rankingScore: this.statisticsService.calculateRankingScore(snippet.id),
          trendingScore: analytics?.metrics.trendingScore || 0
        };
      });

      // Apply sorting
      const sortedSnippets = this.applySorting(enhancedSnippets, filters?.sortBy, filters?.sortOrder);

      // Apply pagination
      const totalCount = sortedSnippets.length;
      const totalPages = Math.ceil(totalCount / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedSnippets = sortedSnippets.slice(startIndex, endIndex);

      const result: PaginatedSnippets = {
        snippets: paginatedSnippets,
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      };

      this.setCache(cacheKey, result, this.CACHE_TTL);
      return result;

    } catch (error) {
      console.error('Failed to search snippets:', error);
      throw new Error('Unable to search snippets');
    }
  }

  /**
   * Get snippet by ID with analytics
   */
  public async getSnippetById(id: string): Promise<SnippetWithAnalytics | null> {
    const cacheKey = `snippet_${id}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      await this.simulateApiDelay();

      const { snippetsData } = await import('../data/snippets');
      const snippetData = snippetsData[id];

      if (!snippetData) return null;

      const analytics = this.statisticsService.getSnippetAnalytics(id);
      
      const result: SnippetWithAnalytics = {
        ...snippetData,
        analytics: analytics || this.createDefaultAnalytics(id),
        rankingScore: this.statisticsService.calculateRankingScore(id),
        trendingScore: analytics?.metrics.trendingScore || 0
      };

      this.setCache(cacheKey, result, this.CACHE_TTL);
      return result;

    } catch (error) {
      console.error(`Failed to fetch snippet ${id}:`, error);
      throw new Error('Unable to fetch snippet');
    }
  }

  /**
   * Track user interaction with a snippet
   */
  public async trackInteraction(snippetId: string, type: 'view' | 'like' | 'download' | 'share' | 'bookmark' | 'fork', metadata?: any): Promise<void> {
    try {
      if (type === 'view') {
        await this.statisticsService.trackView(snippetId, metadata);
      } else {
        await this.statisticsService.trackEngagement(snippetId, type as any);
      }

      // Invalidate related caches
      this.invalidateSnippetCaches(snippetId);

      // In production, this would also send to backend
      await this.sendInteractionToBackend(snippetId, type, metadata);

    } catch (error) {
      console.error(`Failed to track ${type} for snippet ${snippetId}:`, error);
      // Don't throw - tracking failures shouldn't break user experience
    }
  }

  /**
   * Get snippet analytics for dashboard/admin
   */
  public async getSnippetAnalytics(snippetId: string): Promise<SnippetAnalytics | null> {
    return this.statisticsService.getSnippetAnalytics(snippetId);
  }

  /**
   * Get platform-wide statistics
   */
  public async getPlatformStats(): Promise<{
    totalSnippets: number;
    totalViews: number;
    totalLikes: number;
    totalDownloads: number;
    activeUsers: number;
    topCategories: Array<{ category: string; count: number }>;
  }> {
    const cacheKey = 'platform_stats';
    
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      await this.simulateApiDelay();

      const allAnalytics = this.statisticsService.getAllAnalytics();
      const { snippetsData } = await import('../data/snippets');

      let totalViews = 0;
      let totalLikes = 0;
      let totalDownloads = 0;
      const categoryCount: { [key: string]: number } = {};

      // Aggregate from analytics
      for (const analytics of allAnalytics.values()) {
        totalViews += analytics.metrics.views;
        totalLikes += analytics.metrics.likes;
        totalDownloads += analytics.metrics.downloads;
      }      // Count categories and unique authors
      for (const snippet of Object.values(snippetsData)) {
        categoryCount[snippet.category] = (categoryCount[snippet.category] || 0) + 1;
      }

      // Get unique authors count for accurate activeUsers
      const uniqueAuthors = new Set(Object.values(snippetsData).map(snippet => snippet.author.username)).size;

      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      const result = {
        totalSnippets: Object.keys(snippetsData).length,
        totalViews,
        totalLikes,
        totalDownloads,
        activeUsers: uniqueAuthors, // Use actual count of unique authors
        topCategories
      };

      this.setCache(cacheKey, result, 10 * 60 * 1000); // 10 minutes TTL
      return result;

    } catch (error) {
      console.error('Failed to fetch platform stats:', error);
      throw new Error('Unable to fetch platform statistics');
    }
  }

  /**
   * Clear all cached data - useful for forcing fresh data calculations
   */
  public clearCache(): void {
    this.cache.clear();
  }

  // Private helper methods

  private applyFilters(snippets: SnippetData[], filters: SnippetFilters): SnippetData[] {
    return snippets.filter(snippet => {
      if (filters.category && snippet.category !== filters.category) return false;
      if (filters.author && snippet.author.username !== filters.author) return false;
      if (filters.tags && !filters.tags.some(tag => snippet.tags.includes(tag))) return false;
      if (filters.minViews) {
        const analytics = this.statisticsService.getSnippetAnalytics(snippet.id);
        if (!analytics || analytics.metrics.views < filters.minViews) return false;
      }
      if (filters.minLikes) {
        const analytics = this.statisticsService.getSnippetAnalytics(snippet.id);
        if (!analytics || analytics.metrics.likes < filters.minLikes) return false;
      }
      return true;
    });
  }

  private applySearch(snippets: SnippetData[], query: string): SnippetData[] {
    const lowercaseQuery = query.toLowerCase();
    return snippets.filter(snippet => 
      snippet.title.toLowerCase().includes(lowercaseQuery) ||
      snippet.description.toLowerCase().includes(lowercaseQuery) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      snippet.author.displayName.toLowerCase().includes(lowercaseQuery)
    );
  }

  private applySorting(snippets: SnippetWithAnalytics[], sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): SnippetWithAnalytics[] {
    const sorted = [...snippets].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'popular':
        case 'likes':
          comparison = a.analytics.metrics.likes - b.analytics.metrics.likes;
          break;
        case 'views':
          comparison = a.analytics.metrics.views - b.analytics.metrics.views;
          break;
        case 'downloads':
          comparison = a.analytics.metrics.downloads - b.analytics.metrics.downloads;
          break;
        case 'trending':
          comparison = a.trendingScore - b.trendingScore;
          break;
        case 'recent':
        default:
          comparison = a.rankingScore - b.rankingScore;
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }

  private createDefaultAnalytics(snippetId: string): SnippetAnalytics {
    return {
      id: snippetId,
      metrics: {
        views: 0,
        likes: 0,
        downloads: 0,
        comments: 0,
        shares: 0,
        bookmarks: 0,
        forks: 0,
        dailyViews: 0,
        weeklyViews: 0,
        monthlyViews: 0,
        averageTimeSpent: 0,
        bounceRate: 0,
        interactionRate: 0,
        communityScore: 0,
        trendingScore: 0,
        viralityIndex: 0
      },
      ranking: {
        recency: 1,
        engagement: 0,
        quality: 0.5,
        creativity: 0.5,
        popularity: 0,
        authorReputation: 0.5
      },
      timeStats: {
        hourly: {},
        daily: {},
        weekly: {},
        monthly: {}
      },
      demographics: {
        countries: {},
        devices: {},
        referrers: {}
      },
      lastUpdated: new Date().toISOString()
    };
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private invalidateSnippetCaches(snippetId: string): void {
    // Remove specific snippet cache
    this.cache.delete(`snippet_${snippetId}`);
    
    // Remove list caches that might include this snippet
    for (const key of this.cache.keys()) {
      if (key.startsWith('top_ranked_') || 
          key.startsWith('trending_') || 
          key.startsWith('search_') ||
          key === 'platform_stats') {
        this.cache.delete(key);
      }
    }
  }

  private async simulateApiDelay(): Promise<void> {
    // Simulate realistic API response times
    const delay = Math.random() * 200 + 100; // 100-300ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private async sendInteractionToBackend(snippetId: string, type: string, metadata?: any): Promise<void> {
    // In production, this would send to your backend API
    // For now, just log it
    console.log(`Backend API: ${type} tracked for snippet ${snippetId}`, metadata);
    
    // Simulate API call
    await this.simulateApiDelay();
  }
}

export default SnippetApiService;
