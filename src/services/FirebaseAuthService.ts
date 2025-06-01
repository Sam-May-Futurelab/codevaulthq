import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import type { User, UserCredential } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  website?: string;
  location?: string;
  createdAt: any;
  updatedAt: any;
  stats: {
    snippetsCount: number;
    totalViews: number;
    totalLikes: number;
    totalDownloads: number;
    followerCount: number;
    followingCount: number;
  };
}

// Auth providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Add scopes for additional user information
googleProvider.addScope('profile');
googleProvider.addScope('email');
githubProvider.addScope('user:email');

export class FirebaseAuthService {
  // Sign up with email and password
  static async signUpWithEmail(
    email: string,
    password: string,
    displayName: string
  ): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(userCredential.user, { displayName });
      
      // Create user profile in Firestore
      await this.createUserProfile(userCredential.user, { displayName });
      
      return userCredential;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with email and password
  static async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with Google
  static async signInWithGoogle(): Promise<UserCredential> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Create or update user profile
      await this.createUserProfile(result.user);
      
      return result;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Sign in with GitHub
  static async signInWithGithub(): Promise<UserCredential> {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      
      // Create or update user profile
      await this.createUserProfile(result.user);
      
      return result;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Send password reset email
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Create user profile in Firestore
  static async createUserProfile(
    user: User,
    additionalData?: { displayName?: string }
  ): Promise<void> {
    const userDoc = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = serverTimestamp();

      const userProfile: Omit<UserProfile, 'uid'> = {
        email: email || '',
        displayName: additionalData?.displayName || displayName || '',
        photoURL: photoURL || undefined,
        createdAt,
        updatedAt: createdAt,
        stats: {
          snippetsCount: 0,
          totalViews: 0,
          totalLikes: 0,
          totalDownloads: 0,
          followerCount: 0,
          followingCount: 0,
        },
      };

      await setDoc(userDoc, userProfile);
    }
  }

  // Get user profile from Firestore
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = doc(db, 'users', uid);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        return { uid, ...userSnapshot.data() } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(
    uid: string,
    updates: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt' | 'stats'>>
  ): Promise<void> {
    try {
      const userDoc = doc(db, 'users', uid);
      await updateDoc(userDoc, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Update user stats
  static async updateUserStats(uid: string, stats: Partial<UserProfile['stats']>): Promise<void> {
    try {
      const userDoc = doc(db, 'users', uid);
      const updates: any = { updatedAt: serverTimestamp() };
      
      Object.entries(stats).forEach(([key, value]) => {
        updates[`stats.${key}`] = value;
      });

      await updateDoc(userDoc, updates);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Subscribe to auth state changes
  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get current user
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Handle authentication errors
  private static handleAuthError(error: any): Error {
    let message = 'An authentication error occurred';

    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No user found with this email address';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Sign-in popup was closed';
        break;
      case 'auth/cancelled-popup-request':
        message = 'Sign-in was cancelled';
        break;
      default:
        message = error.message || message;
    }

    return new Error(message);
  }
}

export default FirebaseAuthService;
