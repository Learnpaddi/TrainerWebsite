import { doc, getDoc, setDoc, updateDoc, type DocumentData } from 'firebase/firestore';
import { db } from './config';
import type { User } from 'firebase/auth';

export interface UserDoc extends DocumentData {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'trainer';
  enrolledCourses?: string[];
  certificates?: string[];
  trainerId?: string;
  createdAt?: string;
}

export const getUserDoc = async (uid: string): Promise<UserDoc | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { ...userSnap.data() as UserDoc, uid } : null;
};

export const setUserDoc = async (uid: string, data: Partial<UserDoc>): Promise<void> => {
  await setDoc(
    doc(db, 'users', uid),
    {
      uid,
      name: data.name || '',
      email: data.email || '',
      role: data.role || 'student',
      enrolledCourses: data.enrolledCourses || [],
      certificates: data.certificates || [],
      trainerId: data.trainerId || (data.role === 'trainer' ? uid : undefined),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    },
    { merge: true },
  );
};

const buildDefaultUserDoc = (user: User): UserDoc => ({
  uid: user.uid,
  email: user.email || '',
  name: user.displayName || '',
  role: 'student',
  enrolledCourses: [],
  certificates: [],
  createdAt: new Date().toISOString(),
});

export const ensureUserDoc = async (user: User): Promise<UserDoc> => {
  const existingUserDoc = await getUserDoc(user.uid);
  if (existingUserDoc) {
    return existingUserDoc;
  }

  const defaultUserDoc = buildDefaultUserDoc(user);
  await setUserDoc(user.uid, defaultUserDoc);
  return (await getUserDoc(user.uid)) || defaultUserDoc;
};

export const updateUserRole = async (uid: string, role: 'student' | 'trainer'): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), { role, updatedAt: new Date().toISOString() });
};

export const syncUserRole = async (user: User): Promise<'student' | 'trainer'> => {
  const userDoc = await ensureUserDoc(user);
  return userDoc.role;
};

export const getPostLoginPath = async (user: User): Promise<'/dashboard' | '/admin'> => {
  const userDoc = await ensureUserDoc(user);
  return userDoc.role === 'trainer' ? '/admin' : '/dashboard';
};

export const addUserEnrollment = async (uid: string, courseId: string): Promise<void> => {
  const user = await getUserDoc(uid);
  const enrolledCourses = Array.from(new Set([...(user?.enrolledCourses || []), courseId]));
  await updateDoc(doc(db, 'users', uid), {
    enrolledCourses,
    updatedAt: new Date().toISOString(),
  });
};

export const addUserCertificate = async (uid: string, courseId: string): Promise<void> => {
  const user = await getUserDoc(uid);
  const certificates = Array.from(new Set([...(user?.certificates || []), courseId]));
  await updateDoc(doc(db, 'users', uid), {
    certificates,
    updatedAt: new Date().toISOString(),
  });
};
