import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
    const key = import.meta.env.VITE_FIREBASE_API_KEY;
    return key && key !== 'your_firebase_api_key' && key.length > 10;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firebaseReady, setFirebaseReady] = useState(false);

    useEffect(() => {
        if (!isFirebaseConfigured()) {
            console.log('[Auth] Firebase not configured — running in demo mode');
            setLoading(false);
            return;
        }

        // Dynamically import Firebase only when configured
        import('../services/firebase').then(({ auth }) => {
            import('firebase/auth').then(({ onAuthStateChanged }) => {
                setFirebaseReady(true);
                const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
                    setUser(firebaseUser);
                    setLoading(false);
                });
                return () => unsubscribe();
            });
        }).catch(err => {
            console.warn('[Auth] Firebase init failed:', err);
            setLoading(false);
        });
    }, []);

    const loginWithGoogle = async () => {
        if (!firebaseReady) {
            alert('Firebase is not configured. Add your Firebase keys to the .env file to enable sign-in.');
            return null;
        }
        try {
            const { auth, googleProvider } = await import('../services/firebase');
            const { signInWithPopup } = await import('firebase/auth');
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (err) {
            console.error('[Auth] Google sign-in error:', err);
            throw err;
        }
    };

    const logout = async () => {
        if (!firebaseReady) return;
        try {
            const { auth } = await import('../services/firebase');
            const { signOut } = await import('firebase/auth');
            await signOut(auth);
        } catch (err) {
            console.error('[Auth] Sign-out error:', err);
        }
    };

    const value = {
        user,
        loading,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
        isFirebaseConfigured: firebaseReady,
    };

    if (loading) return null; // Brief flash while checking config

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

