# Firebase Setup Steps for Code Vault HQ

## Current Status ✅
- [x] Firebase configuration added to `.env`
- [x] Firebase emulator mode disabled
- [x] Development server running without emulator warnings
- [x] DataSeeder service created with sample snippets
- [x] Debug tools added to HomePage

## Next Steps Required 🔧

### 1. Enable Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `code-vault-hq`
3. Navigate to **Firestore Database** in the left sidebar
4. Click **Create database**
5. Choose **Start in test mode** (for development)
6. Select a location closest to your users

### 2. Configure Firestore Security Rules
Once the database is created, update the security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for development
    // ⚠️ WARNING: These rules allow anyone to read/write. 
    // Update for production!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. Enable Authentication (Optional)
If you want to add user authentication:
1. Go to **Authentication** in Firebase Console
2. Click **Get started**
3. Enable **Email/Password** provider
4. Enable **Google** provider (optional)

### 4. Test Firebase Integration
After setting up Firestore:
1. Refresh the Code Vault HQ application
2. Look for the **Development Tools** section at the bottom of the home page
3. Click **"Seed Firebase Data"** to populate the database
4. Click **"Debug Firebase"** to check connection status
5. Check browser console for any error messages

### 5. Verify Data in Firebase Console
1. Go back to Firestore Database in Firebase Console
2. You should see a **snippets** collection with 6 documents
3. Each document should contain: title, description, code, language, tags, etc.

## Troubleshooting 🔍

### Common Issues:
1. **"Missing or insufficient permissions"** 
   - Update Firestore rules to allow read/write access

2. **"Firestore has not been initialized"**
   - Make sure you've created the Firestore database in Firebase Console

3. **"Network error"**
   - Check your internet connection
   - Verify Firebase project ID in `.env` file

### Debug Information:
The HomePage now includes console logging and a Debug Firebase button to help identify issues:
- Check browser developer console for Firebase connection info
- Use the Debug Firebase button to log current state
- Error messages will display in the Development Tools section

## Environment Variables ✅
Your `.env` file should contain:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=code-vault-hq.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=code-vault-hq
VITE_FIREBASE_STORAGE_BUCKET=code-vault-hq.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Next Phase 🚀
Once Firebase is working:
1. Test snippet creation and retrieval
2. Implement real-time updates
3. Add user authentication
4. Deploy to production with proper security rules
