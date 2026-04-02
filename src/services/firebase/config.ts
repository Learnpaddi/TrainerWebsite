import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCPEap7ixlThhtBvPlUJaancN_hPsMNp8Q",
  authDomain: "learnpaddi-1aee9.firebaseapp.com",
  projectId: "learnpaddi-1aee9",
  storageBucket: "learnpaddi-1aee9.firebasestorage.app",
  messagingSenderId: "633908800301",
  appId: "1:633908800301:web:02bda958c51bf6b183c1a4"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const ADMIN_EMAILS = ['thangadurai@learnpaddi.in']; // Expandable

export const googleProvider = new GoogleAuthProvider();

export function isAdmin(email: string | null): boolean {
  return email ? ADMIN_EMAILS.includes(email) : false;
}
