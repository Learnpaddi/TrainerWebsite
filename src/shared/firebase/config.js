// Firebase Config - SHARED
// Place in src/shared/firebase/config.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { 
  getAuth
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { 
  getFirestore
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js';

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

export const ADMIN_EMAIL = 'thangadurai@learnpaddi.in';

export function isAdmin(email) {
  return email === ADMIN_EMAIL;
}

export const googleProvider = new GoogleAuthProvider();
