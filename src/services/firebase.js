import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is actually configured
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_firebase_api_key' && firebaseConfig.apiKey.length > 10;

let app;
let auth;
let db;
let googleProvider;

if (isConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();
    } catch (err) {
        console.error('[Firebase] Initialization error:', err);
    }
} else {
    console.log('[Firebase] Not configured. Using dummy services for demo mode.');
    // Dummy objects to prevent top-level import crashes
    app = {};
    auth = {};
    db = {};
    googleProvider = {};
}

export { auth, db, googleProvider };
export default app;

