// Firebase Config & Utils for LearnPaddi LMS
// Place in /lms/firebase.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  arrayUnion
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCPEap7ixlThhtBvPlUJaancN_hPsMNp8Q",
  authDomain: "learnpaddi-1aee9.firebaseapp.com",
  projectId: "learnpaddi-1aee9",
  storageBucket: "learnpaddi-1aee9.firebasestorage.app",
  messagingSenderId: "633908800301",
  appId: "1:633908800301:web:02bda958c51bf6b183c1a4"
};

// Initialize
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const ADMIN_EMAIL = 'thangadurai@learnpaddi.in';

// Providers
export const googleProvider = new GoogleAuthProvider();

// Auth Utils
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
  return await signInWithPopup(auth, googleProvider);
}

export async function logout() {
  await signOut(auth);
  window.location.href = '/login.html';
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// Firestore Utils
export async function setUserDoc(uid, data) {
  const role = data.email === ADMIN_EMAIL ? 'admin' : 'user';
  await setDoc(doc(db, 'users', uid), {
    ...data,
    role,
    enrolledCourses: [],
    createdAt: serverTimestamp()
  }, { merge: true });
}

export async function getUserRole(uid) {
  const userDoc = await getUserDoc(uid);
  return userDoc?.role || 'user';
}

export async function getUserDoc(uid) {
  const docSnap = await getDoc(doc(db, 'users', uid));
  return docSnap.exists() ? docSnap.data() : null;
}

export async function enrollCourse(userId, courseId) {
  const enrollmentRef = await addDoc(collection(db, 'enrollments'), {
    userId,
    courseId,
    progress: 0,
    completed: false,
    enrolledAt: serverTimestamp()
  });
  // Update user enrolledCourses
  await updateDoc(doc(db, 'users', userId), {
    enrolledCourses: arrayUnion(enrollmentRef.id)
  });
}

export async function updateProgress(enrollmentId, progress) {
  await updateDoc(doc(db, 'enrollments', enrollmentId), { progress });
}

export async function createCourse(courseData) {
  return await addDoc(collection(db, 'courses'), { 
    ...courseData, 
    updatedAt: serverTimestamp() 
  });
}

export async function updateCourse(courseId, courseData) {
  await updateDoc(doc(db, 'courses', courseId), { 
    ...courseData, 
    updatedAt: serverTimestamp() 
  });
}

export async function deleteCourse(courseId) {
  await deleteDoc(doc(db, 'courses', courseId));
}

export async function getCourses() {
  const q = query(collection(db, 'courses'));
  const snapshot = await getDocs(q);
  let courses = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  
  if (courses.length === 0) {
    console.log('No courses found. Auto-seeding samples...');
    const { sampleCourses } = await import('./sample-data.js');
    for (let course of sampleCourses.slice(0, 5)) {
      await addDoc(collection(db, 'courses'), course);
    }
    const newSnapshot = await getDocs(q);
    courses = newSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`Auto-seeded ${courses.length} courses!`);
  }
  return courses;
}

export async function getUserEnrollments(userId) {
  const q = query(collection(db, 'enrollments'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Realtime Listeners
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function onCollectionSnapshot(col, callback) {
  return onSnapshot(collection(db, col), callback);
}

// Storage Utils
export async function uploadFile(path, file) {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}
