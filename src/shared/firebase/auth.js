// Auth Utils - SHARED
// Place in src/shared/firebase/auth.js

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { app, auth, db } from './config.js';
import { setUserDoc } from './users.js';

export async function register(email, password, name) {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    await setUserDoc(user.uid, { name, email });
    return user;
  } catch (error) {
    throw error;
  }
}

export async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function googleLogin() {
  return await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function logout() {
  await signOut(auth);
  window.location.href = '/login.html';
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
