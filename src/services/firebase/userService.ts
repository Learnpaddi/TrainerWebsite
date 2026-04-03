import { doc, getDoc, setDoc, updateDoc, type DocumentData } from 'firebase/firestore';
import { db } from './config';
import type { User } from 'firebase/auth';

export interface UserDoc extends DocumentData {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'trainer';
  createdAt?: string;
}

export const getUserDoc = async (uid: string): Promise<UserDoc | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { ...userSnap.data() as UserDoc, uid } : null;
};

export const setUserDoc = async (uid: string, data: Partial<UserDoc>): Promise<void> => {
  await setDoc(doc(db, 'users', uid), { ...data, uid, updatedAt: new Date().toISOString() }, { merge: true });
};

export const updateUserRole = async (uid: string, role: 'student' | 'trainer'): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), { role, updatedAt: new Date().toISOString() });
};

export const syncUserRole = async (user: User): Promise<'student' | 'trainer'> => {
  let userDoc = await getUserDoc(user.uid);
  if (!userDoc) {
    userDoc = await getUserDoc(user.uid) || { uid: user.uid, email: user.email || '', name: user.displayName || '', role: 'student' as const };
    await setUserDoc(user.uid, userDoc);
  }
  return userDoc.role;
};
