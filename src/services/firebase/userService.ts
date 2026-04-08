import { Timestamp, deleteDoc, doc, getDoc, setDoc, updateDoc, type DocumentData } from 'firebase/firestore';
import { db } from './config';
import type { User } from 'firebase/auth';

export interface UserDoc extends DocumentData {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'trainer';
  enrolledCourses?: string[];
  certificates?: string[];
  trainerId?: string | null;
  createdAt?: string | Timestamp;
  updatedAt?: string | Timestamp;
}

const roleCollectionMap: Record<'student' | 'trainer', 'students' | 'trainers'> = {
  student: 'students',
  trainer: 'trainers',
};

const getRoleCollection = (role: 'student' | 'trainer'): 'students' | 'trainers' => roleCollectionMap[role];

const buildRoleSpecificDoc = (uid: string, data: Partial<UserDoc>) => ({
  uid,
  name: data.name || '',
  email: data.email || '',
  role: data.role || 'student',
  enrolledCourses: data.enrolledCourses || [],
  certificates: data.certificates || [],
  trainerId: data.trainerId || (data.role === 'trainer' ? uid : null),
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const getUserDoc = async (uid: string): Promise<UserDoc | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { ...userSnap.data() as UserDoc, uid } : null;
};

export const setUserDoc = async (uid: string, data: Partial<UserDoc>): Promise<void> => {
  const role = data.role || 'student';
  const payload = buildRoleSpecificDoc(uid, { ...data, role });

  await setDoc(
    doc(db, 'users', uid),
    payload,
    { merge: true },
  );

  await setDoc(doc(db, getRoleCollection(role), uid), payload, { merge: true });
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
  const userDoc = await getUserDoc(uid);
  if (!userDoc) {
    return;
  }

  const updatedDoc: Partial<UserDoc> = {
    ...userDoc,
    role,
    trainerId: role === 'trainer' ? uid : null,
    updatedAt: new Date().toISOString(),
  };

  await setUserDoc(uid, updatedDoc);
  const staleRole = role === 'trainer' ? 'students' : 'trainers';
  await deleteDoc(doc(db, staleRole, uid));
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
  const roleCollection = getRoleCollection(user?.role || 'student');
  const updatePayload = { enrolledCourses, updatedAt: new Date().toISOString() };
  await Promise.all([
    updateDoc(doc(db, 'users', uid), updatePayload),
    updateDoc(doc(db, roleCollection, uid), updatePayload),
  ]);
};

export const addUserCertificate = async (uid: string, courseId: string): Promise<void> => {
  const user = await getUserDoc(uid);
  const certificates = Array.from(new Set([...(user?.certificates || []), courseId]));
  const roleCollection = getRoleCollection(user?.role || 'student');
  const updatePayload = { certificates, updatedAt: new Date().toISOString() };
  await Promise.all([
    updateDoc(doc(db, 'users', uid), updatePayload),
    updateDoc(doc(db, roleCollection, uid), updatePayload),
  ]);
};
