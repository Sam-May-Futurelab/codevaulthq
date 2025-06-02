export interface Snippet {
  id: string;
  title: string;
  description: string;
  code: {
    html: string;
    css: string;
    javascript: string;
  };
  tags: string[];
  category: 'css' | 'javascript' | 'html' | 'canvas' | 'webgl' | 'animation';
  author: User;
  createdAt: string;
  updatedAt: string;
  likes: number;
  views: number;
  downloads: number;
  forks: number;
  isPublic: boolean;
  isPremium: boolean;
  thumbnailUrl?: string;
  previewUrl?: string;
  license: 'MIT' | 'Apache' | 'GPL' | 'Custom' | 'Commercial';
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  github?: string;
  twitter?: string;
  isVerified: boolean;
  isPro: boolean;
  createdAt: string;
  followers: number;
  following: number;
  snippetsCount: number;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  snippets: Snippet[];
  author: User;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  snippetId: string;
  parentId?: string; // for replies
  createdAt: string;
  likes: number;
}

export interface SearchFilters {
  query?: string;
  category?: Snippet['category'][];
  tags?: string[];
  sortBy: 'popular' | 'newest' | 'trending' | 'downloads';
  dateRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  isPremium?: boolean;
}

export interface UploadSnippetData {
  title: string;
  description: string;
  code: {
    html: string;
    css: string;
    javascript: string;
  };
  tags: string[];
  category: Snippet['category'];
  isPublic: boolean;
  license: Snippet['license'];
}

// Firebase-compatible snippet interface
export interface FirebaseSnippet {
  id?: string; // Make optional to match Firestore
  title: string;
  description: string;
  code: string; // Firebase stores as single string
  language: string;
  tags: string[];
  authorId: string;
  authorName: string;
  isPublic: boolean;
  createdAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
  analytics: {
    views: number;
    likes: number;
    downloads: number;
    shares: number;
    bookmarks: number;
    forks: number;
    comments: number;
    engagementRate: number;
  };
}

// Extended snippet with computed metrics for compatibility
export interface SnippetWithMetrics extends Omit<FirebaseSnippet, 'id'> {
  id: string; // Required for display components
  metrics: {
    views: number;
    likes: number;
    downloads: number;
    comments: number;
    shares: number;
  };
  rankingScore?: number;
  trendingScore?: number;
  stats?: {
    views: number;
    likes: number;
    downloads: number;
    comments: number;
    engagementRate: number;
  };
}

// Helper function to convert Firebase snippet to component-compatible format
export const convertFirebaseSnippet = (firebaseSnippet: FirebaseSnippet): SnippetWithMetrics => {
  return {
    ...firebaseSnippet,
    id: firebaseSnippet.id || '', // Ensure id is string
    metrics: {
      views: firebaseSnippet.analytics.views,
      likes: firebaseSnippet.analytics.likes,
      downloads: firebaseSnippet.analytics.downloads,
      comments: firebaseSnippet.analytics.comments,
      shares: firebaseSnippet.analytics.shares,
    },
    stats: {
      views: firebaseSnippet.analytics.views,
      likes: firebaseSnippet.analytics.likes,
      downloads: firebaseSnippet.analytics.downloads,
      comments: firebaseSnippet.analytics.comments,
      engagementRate: firebaseSnippet.analytics.engagementRate,
    },
    rankingScore: firebaseSnippet.analytics.engagementRate,
    trendingScore: firebaseSnippet.analytics.engagementRate,
  };
};

// Enhanced Category Structures
export interface CategoryInfo {
  id: string;
  label: string;
  mainCategory: {
    id: string;
    name: string;
    color: string;
  };
}

export interface MainCategory {
  name: string;
  icon: any; // Lucide React component
  color: string;
  subcategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  label: string;
}

export interface CategoryStructure {
  [key: string]: MainCategory;
}
