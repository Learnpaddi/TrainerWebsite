import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCPEap7ixlThhtBvPlUJaancN_hPsMNp8Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "learnpaddi-1aee9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "learnpaddi-1aee9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "learnpaddi-1aee9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "633908800301",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:633908800301:web:02bda958c51bf6b183c1a4"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Ensure auth state persists across reloads using localStorage
export const authReady = setPersistence(auth, browserLocalPersistence)
  .then(() => auth)
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Firebase auth persistence failed:', err);
    return auth;
  });

export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export const ADMIN_EMAILS = ['thangadurai@learnpaddi.in']; // Expandable

export const googleProvider = new GoogleAuthProvider();

export function isAdmin(email: string | null): boolean {
  return email ? ADMIN_EMAILS.includes(email) : false;
}
