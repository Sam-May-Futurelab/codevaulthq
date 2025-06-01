# Firebase Integration Guide for Code Vault HQ

This guide covers the complete setup process for Firebase in the Code Vault HQ application, enabling real-time database functionality and user authentication.

## 1. Firebase Project Setup

### Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Name your project (e.g., "codevault-hq")
4. Configure Google Analytics (optional but recommended)
5. Create the project

### Register Your Web App

1. From the project dashboard, click the web icon (</>) to add a web app
2. Register your app with a nickname (e.g., "codevault-web")
3. Check "Set up Firebase Hosting" if you plan to deploy with Firebase
4. Click "Register app"
5. Copy the Firebase configuration object - you'll need this later

## 2. Configure Environment Variables

Create a `.env` file in the project root by copying the template:

```bash
cp .env.example .env
```

Update the `.env` file with your Firebase configuration values:

```
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 3. Enable Authentication Methods

1. In the Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable the authentication methods:
   - Email/Password
   - Google
   - GitHub (requires GitHub OAuth setup)
3. For GitHub authentication:
   - Go to GitHub Developer Settings → OAuth Apps → New OAuth App
   - Set Authorization callback URL to: `https://your-project-id.firebaseapp.com/__/auth/handler`
   - Copy the Client ID and Client Secret to Firebase GitHub provider

## 4. Set Up Firestore Database

1. Go to "Firestore Database" in the Firebase Console
2. Click "Create database"
3. Start in production mode or test mode (you can change this later)
4. Choose a database location closest to your users
5. Click "Enable"

### Set Up Security Rules

Go to the "Rules" tab in Firestore and update with these basic rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles accessible by anyone, but only the owner can write
    match /users/{userId} {
      allow read;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Snippets readable by anyone, writeable by authenticated users
    match /snippets/{snippetId} {
      allow read;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.authorId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
    }
    
    // Analytics and interactions
    match /analytics/{docId} {
      allow read;
      allow write: if request.auth != null;
    }
    
    match /interactions/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## 5. Deploy Firebase Functions (Optional for Advanced Features)

For features like search, notifications, or scheduled tasks:

1. Initialize Firebase Functions:

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

2. Create necessary functions in the `functions` directory

## 6. Set Up Firebase Storage (For Snippet Thumbnails and Assets)

1. Go to "Storage" in the Firebase Console
2. Click "Get started"
3. Choose security rules (start with default)
4. Select a location for your storage bucket

## 7. Local Development with Firebase Emulators

For local development without affecting production data:

1. Install Firebase CLI and start emulators:

```bash
npm install -g firebase-tools
firebase login
firebase init emulators
firebase emulators:start
```

2. Connect your app to emulators by updating the Firebase config file:

```typescript
// In config/firebase.ts
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

## 8. Data Migration

To migrate existing data to Firebase:

1. Export current data to JSON format
2. Use Firebase Admin SDK to import data:

```typescript
// Example migration script
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as serviceAccount from './service-account-key.json';
import snippetsData from './snippets-data.json';

initializeApp({
  credential: cert(serviceAccount as any)
});

const db = getFirestore();
const batch = db.batch();

// Import snippets
Object.entries(snippetsData).forEach(([id, snippet]) => {
  const docRef = db.collection('snippets').doc(id);
  batch.set(docRef, {
    // Transform data to Firebase format
    title: snippet.title,
    description: snippet.description,
    code: typeof snippet.code === 'object' ? JSON.stringify(snippet.code) : snippet.code,
    language: snippet.category || 'javascript',
    tags: snippet.tags,
    authorId: snippet.author.id,
    authorName: snippet.author.displayName,
    isPublic: snippet.isPublic,
    createdAt: new Date(snippet.createdAt),
    updatedAt: new Date(snippet.updatedAt),
    analytics: {
      views: snippet.views || 0,
      likes: snippet.likes || 0,
      downloads: snippet.downloads || 0,
      shares: 0,
      bookmarks: 0,
      forks: snippet.forks || 0,
      comments: 0,
      engagementRate: 0
    }
  });
});

batch.commit()
  .then(() => console.log('Migration complete'))
  .catch(err => console.error('Migration failed:', err));
```

## 9. Testing Your Firebase Integration

1. Verify Authentication:
   - Test user registration and login
   - Test social authentication providers

2. Verify Database Operations:
   - Create, read, update, and delete snippets
   - Check real-time updates

3. Verify User Profile Management:
   - Create and update user profiles
   - Test permission rules

## 10. Performance Monitoring and Analytics

1. Enable Firebase Performance Monitoring:
   - Add the performance module to your app
   - Set up custom traces for critical paths

2. Configure Google Analytics:
   - Set up custom events
   - Create audience segments

3. Set up Firebase Crashlytics:
   - Monitor for errors and crashes
   - Set up alerts for critical issues

## Troubleshooting

- **Authentication Issues**: Check Firebase console for auth errors
- **CORS Errors**: Verify your Firebase Security Rules
- **Emulator Connection**: Make sure emulators are running
- **Quota Issues**: Check Firebase usage in console

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase JavaScript SDK Reference](https://firebase.google.com/docs/reference/js)
- [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
