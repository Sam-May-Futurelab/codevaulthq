import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// You'll need to replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connect to emulators in development (DISABLED - using production Firebase)
// Uncomment the code below if you want to use Firebase emulators for local development
/*
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  // Only connect to emulators if not already connected
  try {
    // Firestore emulator - check if already connected by trying to use it
    const isEmulatorConnected = () => {
      try {
        return (db as any)._delegate?._databaseId?.projectId?.includes('demo-project') || false;
      } catch {
        return false;
      }
    };

    if (!isEmulatorConnected()) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    
    // Auth emulator
    if (!auth.config.apiKey?.includes('demo')) {    // Emulators might already be connected, ignore connection errors
    console.log('Firebase emulators connection info:', error);
  }
}
*/

export default app;
