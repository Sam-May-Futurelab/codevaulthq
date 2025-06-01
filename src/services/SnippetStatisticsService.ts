/**
 * Snippet Statistics Service
 * Handles real-time tracking of snippet engagement metrics and ranking calculations
 */

export interface EngagementMetrics {
  views: number;
  likes: number;
  downloads: number;
  comments: number;
  shares: number;
  bookmarks: number;
  forks: number;
  // Time-based metrics
  dailyViews: number;
  weeklyViews: number;
  monthlyViews: number;
  // Engagement quality metrics
  averageTimeSpent: number; // in seconds
  bounceRate: number; // percentage
  interactionRate: number; // percentage
  // Community engagement
  communityScore: number; // calculated score
  trendingScore: number; // trending algorithm score
  viralityIndex: number; // viral spread metric
}

export interface RankingFactors {
  recency: number; // How recent the snippet is
  engagement: number; // Overall engagement score
  quality: number; // Code quality and usefulness
  creativity: number; // Uniqueness and innovation
  popularity: number; // Community response
  authorReputation: number; // Author's standing in community
}

export interface TimeBasedStats {
  hourly: { [hour: string]: number };
  daily: { [date: string]: number };
  weekly: { [week: string]: number };
  monthly: { [month: string]: number };
}

export interface SnippetAnalytics {
  id: string;
  metrics: EngagementMetrics;
  ranking: RankingFactors;
  timeStats: TimeBasedStats;
  demographics: {
    countries: { [country: string]: number };
    devices: { [device: string]: number };
    referrers: { [source: string]: number };
  };
  lastUpdated: string;
}

class SnippetStatisticsService {
  private static instance: SnippetStatisticsService;
  private analyticsData: Map<string, SnippetAnalytics> = new Map();
  private updateQueue: Set<string> = new Set();
  private isUpdating: boolean = false;

  private constructor() {
    // Initialize with mock data for demo
    this.initializeMockData();
    
    // Start periodic updates
    this.startPeriodicUpdates();
  }

  public static getInstance(): SnippetStatisticsService {
    if (!SnippetStatisticsService.instance) {
      SnippetStatisticsService.instance = new SnippetStatisticsService();
    }
    return SnippetStatisticsService.instance;
  }

  /**
   * Track a view event for a snippet
   */
  public async trackView(snippetId: string, metadata?: {
    userAgent?: string;
    referrer?: string;
    country?: string;
    timeSpent?: number;
  }): Promise<void> {
    const analytics = this.getOrCreateAnalytics(snippetId);
    
    // Update view counts
    analytics.metrics.views++;
    analytics.metrics.dailyViews++;
    analytics.metrics.weeklyViews++;
    analytics.metrics.monthlyViews++;
    
    // Update time-based stats
    const now = new Date();
    const hour = now.getHours().toString();
    const date = now.toISOString().split('T')[0];
    
    analytics.timeStats.hourly[hour] = (analytics.timeStats.hourly[hour] || 0) + 1;
    analytics.timeStats.daily[date] = (analytics.timeStats.daily[date] || 0) + 1;
    
    // Update demographics if provided
    if (metadata) {
      if (metadata.country) {
        analytics.demographics.countries[metadata.country] = 
          (analytics.demographics.countries[metadata.country] || 0) + 1;
      }
      if (metadata.referrer) {
        analytics.demographics.referrers[metadata.referrer] = 
          (analytics.demographics.referrers[metadata.referrer] || 0) + 1;
      }
      if (metadata.timeSpent) {
        analytics.metrics.averageTimeSpent = 
          (analytics.metrics.averageTimeSpent + metadata.timeSpent) / 2;
      }
    }
    
    analytics.lastUpdated = now.toISOString();
    this.queueForUpdate(snippetId);
  }

  /**
   * Track engagement events (like, download, share, etc.)
   */
  public async trackEngagement(snippetId: string, type: 'like' | 'download' | 'share' | 'bookmark' | 'fork', delta: number = 1): Promise<void> {
    const analytics = this.getOrCreateAnalytics(snippetId);
    
    switch (type) {
      case 'like':
        analytics.metrics.likes += delta;
        break;
      case 'download':
        analytics.metrics.downloads += delta;
        break;
      case 'share':
        analytics.metrics.shares += delta;
        break;
      case 'bookmark':
        analytics.metrics.bookmarks += delta;
        break;
      case 'fork':
        analytics.metrics.forks += delta;
        break;
    }
    
    // Recalculate engagement rate
    this.calculateEngagementRate(analytics);
    
    analytics.lastUpdated = new Date().toISOString();
    this.queueForUpdate(snippetId);
  }

  /**
   * Calculate dynamic ranking score for a snippet
   */
  public calculateRankingScore(snippetId: string): number {
    const analytics = this.analyticsData.get(snippetId);
    if (!analytics) return 0;

    const { metrics, ranking } = analytics;
    
    // Weight factors for ranking algorithm
    const weights = {
      views: 0.15,
      likes: 0.25,
      downloads: 0.20,
      shares: 0.15,
      recency: 0.10,
      engagement: 0.10,
      quality: 0.05
    };

    // Normalize metrics (0-1 scale)
    const maxViews = 10000;
    const maxLikes = 1000;
    const maxDownloads = 500;
    const maxShares = 100;

    const normalizedViews = Math.min(metrics.views / maxViews, 1);
    const normalizedLikes = Math.min(metrics.likes / maxLikes, 1);
    const normalizedDownloads = Math.min(metrics.downloads / maxDownloads, 1);
    const normalizedShares = Math.min(metrics.shares / maxShares, 1);

    // Calculate final score
    const score = 
      (normalizedViews * weights.views) +
      (normalizedLikes * weights.likes) +
      (normalizedDownloads * weights.downloads) +
      (normalizedShares * weights.shares) +
      (ranking.recency * weights.recency) +
      (ranking.engagement * weights.engagement) +
      (ranking.quality * weights.quality);

    return Math.round(score * 1000); // Scale to 0-1000
  }

  /**
   * Get top ranked snippets with caching
   */
  public getTopRankedSnippets(limit: number = 10, _category?: string): Array<{
    snippetId: string;
    score: number;
    analytics: SnippetAnalytics;
  }> {
    const rankings: Array<{
      snippetId: string;
      score: number;
      analytics: SnippetAnalytics;
    }> = [];

    for (const [snippetId, analytics] of this.analyticsData.entries()) {
      const score = this.calculateRankingScore(snippetId);
      rankings.push({ snippetId, score, analytics });
    }

    // Sort by score (descending)
    rankings.sort((a, b) => b.score - a.score);

    return rankings.slice(0, limit);
  }

  /**
   * Get trending snippets based on recent engagement velocity
   */
  public getTrendingSnippets(limit: number = 10, timeframe: 'hour' | 'day' | 'week' = 'day'): Array<{
    snippetId: string;
    trendingScore: number;
    analytics: SnippetAnalytics;
  }> {
    const trending: Array<{
      snippetId: string;
      trendingScore: number;
      analytics: SnippetAnalytics;
    }> = [];

    for (const [snippetId, analytics] of this.analyticsData.entries()) {
      const trendingScore = this.calculateTrendingScore(analytics, timeframe);
      trending.push({ snippetId, trendingScore, analytics });
    }

    // Sort by trending score (descending)
    trending.sort((a, b) => b.trendingScore - a.trendingScore);

    return trending.slice(0, limit);
  }

  /**
   * Get analytics for a specific snippet
   */
  public getSnippetAnalytics(snippetId: string): SnippetAnalytics | null {
    return this.analyticsData.get(snippetId) || null;
  }

  /**
   * Get all analytics data (for admin/dashboard)
   */
  public getAllAnalytics(): Map<string, SnippetAnalytics> {
    return new Map(this.analyticsData);
  }

  /**
   * Bulk update snippet statistics
   */
  public async bulkUpdateStats(updates: Array<{
    snippetId: string;
    metrics: Partial<EngagementMetrics>;
  }>): Promise<void> {
    for (const update of updates) {
      const analytics = this.getOrCreateAnalytics(update.snippetId);
      Object.assign(analytics.metrics, update.metrics);
      this.calculateEngagementRate(analytics);
    }
  }

  // Private helper methods

  private getOrCreateAnalytics(snippetId: string): SnippetAnalytics {
    if (!this.analyticsData.has(snippetId)) {
      this.analyticsData.set(snippetId, this.createDefaultAnalytics(snippetId));
    }
    return this.analyticsData.get(snippetId)!;
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

  private calculateEngagementRate(analytics: SnippetAnalytics): void {
    const { metrics } = analytics;
    const totalInteractions = metrics.likes + metrics.downloads + metrics.shares + metrics.comments;
    const engagementRate = metrics.views > 0 ? (totalInteractions / metrics.views) * 100 : 0;
    metrics.interactionRate = Math.min(engagementRate, 100);
  }
  private calculateTrendingScore(analytics: SnippetAnalytics, timeframe: 'hour' | 'day' | 'week'): number {
    const { metrics } = analytics;
    
    let recentViews = 0;
    let baseViews = metrics.views;

    switch (timeframe) {
      case 'hour':
        recentViews = metrics.dailyViews;
        break;
      case 'day':
        recentViews = metrics.dailyViews;
        break;
      case 'week':
        recentViews = metrics.weeklyViews;
        break;
    }

    // Calculate velocity (recent engagement vs total)
    const velocity = baseViews > 0 ? (recentViews / baseViews) : 0;
    
    // Factor in absolute numbers
    const absoluteScore = recentViews * 0.1;
    
    // Combine velocity and absolute score
    return (velocity * 70) + (absoluteScore * 30);
  }

  private queueForUpdate(snippetId: string): void {
    this.updateQueue.add(snippetId);
    this.processUpdateQueue();
  }

  private async processUpdateQueue(): Promise<void> {
    if (this.isUpdating || this.updateQueue.size === 0) return;

    this.isUpdating = true;
    
    try {
      // In a real implementation, this would sync with backend/database
      // For now, we'll just simulate the update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      for (const snippetId of this.updateQueue) {
        // Simulate backend sync
        console.log(`Synced analytics for snippet ${snippetId}`);
      }
      
      this.updateQueue.clear();
    } catch (error) {
      console.error('Failed to process analytics updates:', error);
    } finally {
      this.isUpdating = false;
    }
  }
  private startPeriodicUpdates(): void {
    // Update trending scores every 5 minutes
    setInterval(() => {
      for (const [, analytics] of this.analyticsData.entries()) {
        analytics.metrics.trendingScore = this.calculateTrendingScore(analytics, 'day');
      }
    }, 5 * 60 * 1000);

    // Reset daily counters at midnight
    setInterval(() => {
      for (const analytics of this.analyticsData.values()) {
        analytics.metrics.dailyViews = 0;
      }
    }, 24 * 60 * 60 * 1000);
  }

  private initializeMockData(): void {
    // Initialize with some mock data for demo purposes
    const mockSnippetIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    
    mockSnippetIds.forEach((id, index) => {
      const analytics = this.createDefaultAnalytics(id);
      
      // Add some realistic mock data
      analytics.metrics.views = Math.floor(Math.random() * 5000) + 100;
      analytics.metrics.likes = Math.floor(Math.random() * 500) + 10;
      analytics.metrics.downloads = Math.floor(Math.random() * 200) + 5;
      analytics.metrics.shares = Math.floor(Math.random() * 50) + 1;
      analytics.metrics.comments = Math.floor(Math.random() * 20) + 1;
      analytics.metrics.dailyViews = Math.floor(Math.random() * 100) + 10;
      analytics.metrics.weeklyViews = Math.floor(Math.random() * 500) + 50;
      analytics.metrics.monthlyViews = Math.floor(Math.random() * 2000) + 200;
      
      analytics.ranking.engagement = Math.random();
      analytics.ranking.quality = Math.random();
      analytics.ranking.creativity = Math.random();
      analytics.ranking.popularity = Math.random();
      analytics.ranking.authorReputation = Math.random();
      analytics.ranking.recency = Math.max(0, 1 - (index * 0.1)); // Newer ones get higher recency
      
      this.calculateEngagementRate(analytics);
      this.analyticsData.set(id, analytics);
    });
  }
}

export default SnippetStatisticsService;
