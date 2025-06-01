import { useState, useEffect, useContext, createContext } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import FirebaseAuthService, { type UserProfile } from '../services/FirebaseAuthService';

// Auth context interface
interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt' | 'stats'>>) => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign up function
  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      await FirebaseAuthService.signUpWithEmail(email, password, displayName);
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await FirebaseAuthService.signInWithEmail(email, password);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await FirebaseAuthService.signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  // Sign in with GitHub
  const signInWithGithub = async () => {
    setLoading(true);
    try {
      await FirebaseAuthService.signInWithGithub();
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await FirebaseAuthService.signOut();
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    await FirebaseAuthService.resetPassword(email);
  };

  // Update profile function
  const updateProfile = async (updates: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt' | 'stats'>>) => {
    if (currentUser) {
      await FirebaseAuthService.updateUserProfile(currentUser.uid, updates);
      // Refresh user profile
      const updatedProfile = await FirebaseAuthService.getUserProfile(currentUser.uid);
      setUserProfile(updatedProfile);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = FirebaseAuthService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile
        const profile = await FirebaseAuthService.getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    logout,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for getting current user profile
export const useUserProfile = () => {
  const { userProfile, currentUser } = useAuth();
  return { userProfile, currentUser };
};

// Hook for authentication status
export const useAuthStatus = () => {
  const { currentUser, loading } = useAuth();
  return {
    isAuthenticated: !!currentUser,
    isLoading: loading,
    user: currentUser
  };
};
