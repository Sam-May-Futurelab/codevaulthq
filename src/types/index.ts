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
