// User Utils - SHARED
// src/shared/firebase/users.js

import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  arrayUnion,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { db } from './config.js';

export async function setUserDoc(uid, data) {
  const role = data.email === 'thangadurai@learnpaddi.in' ? 'admin' : 'user';
  await setDoc(doc(db, 'users', uid), {
    ...data,
    role,
    enrolledCourses: [],
    createdAt: serverTimestamp()
  }, { merge: true });
}

export async function getUserDoc(uid) {
  const docSnap = await getDoc(doc(db, 'users', uid));
  return docSnap.exists() ? docSnap.data() : null;
}

export async function getUserRole(uid) {
  const userDoc = await getUserDoc(uid);
  return userDoc?.role || 'user';
}

export async function getUserEnrollments(userId) {
  const q = query(collection(db, 'enrollments'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getUserCertificates(userId) {
  const q = query(
    collection(db, 'certificates'), 
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
