import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  serverTimestamp,
  onSnapshot,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import type { DocumentData, QueryConstraint } from 'firebase/firestore';
import { db } from '../config/firebase';

// Firestore collections
export const COLLECTIONS = {
  SNIPPETS: 'snippets',
  USERS: 'users',
  ANALYTICS: 'analytics',
  INTERACTIONS: 'interactions',
  COMMENTS: 'comments',
  COLLECTIONS: 'collections',
  TAGS: 'tags'
} as const;

// Analytics data interface
export interface SnippetAnalytics {
  id: string;
  snippetId: string;
  views: number;
  likes: number;
  downloads: number;
  shares: number;
  bookmarks: number;
  forks: number;
  comments: number;
  uniqueViews: number;
  engagementRate: number;
  createdAt: any;
  updatedAt: any;
  hourlyStats: Record<string, number>;
  dailyStats: Record<string, number>;
  weeklyStats: Record<string, number>;
  monthlyStats: Record<string, number>;
}

// User interaction interface
export interface UserInteraction {
  id: string;
  userId: string;
  snippetId: string;
  type: 'view' | 'like' | 'download' | 'share' | 'bookmark' | 'fork' | 'comment';
  timestamp: any;
  metadata?: Record<string, any>;
}

// Firestore snippet interface
export interface FirestoreSnippet {
  id?: string;
  title: string;
  description: string;
  code: string;
  language: string; // Keep for backward compatibility
  category: {
    id: string;
    label: string;
    mainCategory: {
      id: string;
      name: string;
      color: string;
    };
  };
  tags: string[];
  authorId: string;
  authorName: string;
  isPublic: boolean;
  createdAt: any;
  updatedAt: any;
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

export class FirebaseDbService {
  // Snippets CRUD operations
  static async createSnippet(snippetData: Omit<FirestoreSnippet, 'id' | 'createdAt' | 'updatedAt' | 'analytics'>): Promise<string> {
    try {
      const snippet: Omit<FirestoreSnippet, 'id'> = {
        ...snippetData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        analytics: {
          views: 0,
          likes: 0,
          downloads: 0,
          shares: 0,
          bookmarks: 0,
          forks: 0,
          comments: 0,
          engagementRate: 0
        }
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.SNIPPETS), snippet);
      
      // Create initial analytics document
      await this.createSnippetAnalytics(docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating snippet:', error);
      throw new Error('Failed to create snippet');
    }
  }

  static async getSnippet(id: string): Promise<FirestoreSnippet | null> {
    try {
      const docRef = doc(db, COLLECTIONS.SNIPPETS, id);
      const docSnap = await getDoc(docRef);      if (docSnap.exists()) {
        const rawData = { id: docSnap.id, ...docSnap.data() };
        return this.normalizeCategoryData(rawData);
      }
      return null;
    } catch (error) {
      console.error('Error fetching snippet:', error);
      return null;
    }
  }

  static async getSnippets(queryOptions?: {
    authorId?: string;
    language?: string;
    tags?: string[];
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limitCount?: number;
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
  }): Promise<FirestoreSnippet[]> {
    try {
      const constraints: QueryConstraint[] = [];

      if (queryOptions?.authorId) {
        constraints.push(where('authorId', '==', queryOptions.authorId));
      }

      if (queryOptions?.language) {
        constraints.push(where('language', '==', queryOptions.language));
      }

      if (queryOptions?.tags && queryOptions.tags.length > 0) {
        constraints.push(where('tags', 'array-contains-any', queryOptions.tags));
      }

      if (queryOptions?.orderByField) {
        constraints.push(orderBy(queryOptions.orderByField, queryOptions.orderDirection || 'desc'));
      } else {
        constraints.push(orderBy('createdAt', 'desc'));
      }

      if (queryOptions?.limitCount) {
        constraints.push(limit(queryOptions.limitCount));
      }

      if (queryOptions?.startAfterDoc) {
        constraints.push(startAfter(queryOptions.startAfterDoc));
      }      const q = query(collection(db, COLLECTIONS.SNIPPETS), ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const rawData = { id: doc.id, ...doc.data() };
        return this.normalizeCategoryData(rawData);
      });
    } catch (error) {
      console.error('Error fetching snippets:', error);
      return [];
    }
  }

  static async updateSnippet(id: string, updates: Partial<FirestoreSnippet>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.SNIPPETS, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating snippet:', error);
      throw new Error('Failed to update snippet');
    }
  }

  static async deleteSnippet(id: string): Promise<void> {
    try {
      // Delete snippet
      await deleteDoc(doc(db, COLLECTIONS.SNIPPETS, id));
      
      // Delete analytics
      await deleteDoc(doc(db, COLLECTIONS.ANALYTICS, id));
      
      // Delete related interactions
      const interactionsQuery = query(
        collection(db, COLLECTIONS.INTERACTIONS),
        where('snippetId', '==', id)
      );
      const interactions = await getDocs(interactionsQuery);
      
      const deletePromises = interactions.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting snippet:', error);
      throw new Error('Failed to delete snippet');
    }
  }

  // Analytics operations
  static async createSnippetAnalytics(snippetId: string): Promise<void> {
    try {
      const analytics: Omit<SnippetAnalytics, 'id'> = {
        snippetId,
        views: 0,
        likes: 0,
        downloads: 0,
        shares: 0,
        bookmarks: 0,
        forks: 0,
        comments: 0,
        uniqueViews: 0,
        engagementRate: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        hourlyStats: {},
        dailyStats: {},
        weeklyStats: {},
        monthlyStats: {}
      };

      await addDoc(collection(db, COLLECTIONS.ANALYTICS), analytics);
    } catch (error) {
      console.error('Error creating analytics:', error);
    }
  }

  static async trackInteraction(
    userId: string,
    snippetId: string,
    type: UserInteraction['type'],
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Create interaction record
      const interaction: Omit<UserInteraction, 'id'> = {
        userId,
        snippetId,
        type,
        timestamp: serverTimestamp(),
        metadata
      };

      await addDoc(collection(db, COLLECTIONS.INTERACTIONS), interaction);

      // Update analytics
      await this.updateAnalytics(snippetId, type);

      // Update snippet analytics
      const snippetRef = doc(db, COLLECTIONS.SNIPPETS, snippetId);
      const updateField = `analytics.${type === 'view' ? 'views' : type}s`;
      
      await updateDoc(snippetRef, {
        [updateField]: increment(1),
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }

  private static async updateAnalytics(snippetId: string, type: string): Promise<void> {
    try {
      const analyticsQuery = query(
        collection(db, COLLECTIONS.ANALYTICS),
        where('snippetId', '==', snippetId)
      );
      
      const analyticsSnapshot = await getDocs(analyticsQuery);
      
      if (!analyticsSnapshot.empty) {
        const analyticsDoc = analyticsSnapshot.docs[0];
        const now = new Date();
        const hourKey = now.toISOString().slice(0, 13); // YYYY-MM-DDTHH
        const dayKey = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const weekKey = this.getWeekKey(now);
        const monthKey = now.toISOString().slice(0, 7); // YYYY-MM

        const field = type === 'view' ? 'views' : `${type}s`;
        
        await updateDoc(analyticsDoc.ref, {
          [field]: increment(1),
          [`hourlyStats.${hourKey}`]: increment(1),
          [`dailyStats.${dayKey}`]: increment(1),
          [`weeklyStats.${weekKey}`]: increment(1),
          [`monthlyStats.${monthKey}`]: increment(1),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  }

  // Real-time subscriptions
  static subscribeToSnippets(
    callback: (snippets: FirestoreSnippet[]) => void,
    queryOptions?: Parameters<typeof this.getSnippets>[0]
  ) {
    const constraints: QueryConstraint[] = [];

    if (queryOptions?.authorId) {
      constraints.push(where('authorId', '==', queryOptions.authorId));
    }

    if (queryOptions?.language) {
      constraints.push(where('language', '==', queryOptions.language));
    }

    if (queryOptions?.tags && queryOptions.tags.length > 0) {
      constraints.push(where('tags', 'array-contains-any', queryOptions.tags));
    }

    if (queryOptions?.orderByField) {
      constraints.push(orderBy(queryOptions.orderByField, queryOptions.orderDirection || 'desc'));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    if (queryOptions?.limitCount) {
      constraints.push(limit(queryOptions.limitCount));
    }

    const q = query(collection(db, COLLECTIONS.SNIPPETS), ...constraints);

    return onSnapshot(q, (snapshot) => {
      const snippets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirestoreSnippet));
      callback(snippets);
    });
  }

  static subscribeToSnippetAnalytics(
    snippetId: string,
    callback: (analytics: SnippetAnalytics | null) => void
  ) {
    const q = query(
      collection(db, COLLECTIONS.ANALYTICS),
      where('snippetId', '==', snippetId)
    );

    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        callback({ id: doc.id, ...doc.data() } as SnippetAnalytics);
      } else {
        callback(null);
      }
    });
  }

  // Search functionality
  static async searchSnippets(searchTerm: string, options?: {
    language?: string;
    tags?: string[];
    limit?: number;
  }): Promise<FirestoreSnippet[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // For production, you'd want to use Algolia, Elasticsearch, or Cloud Search
      const constraints: QueryConstraint[] = [];

      if (options?.language) {
        constraints.push(where('language', '==', options.language));
      }

      if (options?.tags && options.tags.length > 0) {
        constraints.push(where('tags', 'array-contains-any', options.tags));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      if (options?.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(collection(db, COLLECTIONS.SNIPPETS), ...constraints);
      const querySnapshot = await getDocs(q);

      // Client-side filtering for search term
      const snippets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirestoreSnippet));

      return snippets.filter(snippet => 
        snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching snippets:', error);
      return [];
    }
  }

  // Helper function to ensure category compatibility
  static normalizeCategoryData(snippet: any): FirestoreSnippet {
    // If the snippet has the old format (only language field), convert it
    if (snippet.language && !snippet.category) {
      // Try to find the category from our current structure
      // This is a fallback for old data
      snippet.category = {
        id: snippet.language,
        label: snippet.language,
        mainCategory: {
          id: 'visual', // Default to visual category
          name: 'Visual & Animation',
          color: 'text-pink-500'
        }
      };
    }
    
    // Ensure all required fields exist
    if (!snippet.category) {
      snippet.category = {
        id: snippet.language || 'animations',
        label: snippet.language || 'Animations',
        mainCategory: {
          id: 'visual',
          name: 'Visual & Animation', 
          color: 'text-pink-500'
        }
      };
    }
    
    return snippet as FirestoreSnippet;
  }

  // Utility methods
  private static getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  // Get platform statistics
  static async getPlatformStats(): Promise<{
    totalSnippets: number;
    totalUsers: number;
    totalViews: number;
    totalLikes: number;
    totalDownloads: number;
    activeUsers: number;
  }> {
    try {
      const [snippetsSnapshot, usersSnapshot, analyticsSnapshot] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.SNIPPETS)),
        getDocs(collection(db, COLLECTIONS.USERS)),
        getDocs(collection(db, COLLECTIONS.ANALYTICS))
      ]);

      const analytics = analyticsSnapshot.docs.map(doc => doc.data() as SnippetAnalytics);
      
      const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
      const totalLikes = analytics.reduce((sum, a) => sum + a.likes, 0);
      const totalDownloads = analytics.reduce((sum, a) => sum + a.downloads, 0);

      // Calculate active users (users who interacted in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentInteractionsQuery = query(
        collection(db, COLLECTIONS.INTERACTIONS),
        where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo))
      );
      
      const recentInteractions = await getDocs(recentInteractionsQuery);
      const activeUsers = new Set(recentInteractions.docs.map(doc => doc.data().userId)).size;

      return {
        totalSnippets: snippetsSnapshot.size,
        totalUsers: usersSnapshot.size,
        totalViews,
        totalLikes,
        totalDownloads,
        activeUsers
      };
    } catch (error) {
      console.error('Error getting platform stats:', error);
      return {
        totalSnippets: 0,
        totalUsers: 0,
        totalViews: 0,
        totalLikes: 0,
        totalDownloads: 0,
        activeUsers: 0
      };
    }
  }
}

export default FirebaseDbService;
