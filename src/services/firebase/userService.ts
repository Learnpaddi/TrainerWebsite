import { httpsCallable } from 'firebase/functions';
import { functions } from './config';
import type { User } from 'firebase/auth';

export interface UserDoc {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'trainer';
  enrolledCourses?: string[];
  certificates?: string[];
  trainerId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const getAuthUserProfileCallable = httpsCallable<Record<string, never>, { user: UserDoc }>(functions, 'getAuthUserProfile');
const upsertAuthUserProfileCallable = httpsCallable<Partial<UserDoc>, { user: UserDoc }>(functions, 'upsertAuthUserProfile');

export const getUserDoc = async (uid: string): Promise<UserDoc | null> => {
  void uid;
  const response = await getAuthUserProfileCallable({});
  return response.data.user;
};

export const setUserDoc = async (uid: string, data: Partial<UserDoc>): Promise<void> => {
  void uid;
  await upsertAuthUserProfileCallable(data);
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
  await setUserDoc(uid, { role, trainerId: role === 'trainer' ? uid : null });
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
  void uid;
  void courseId;
};

export const addUserCertificate = async (uid: string, courseId: string): Promise<void> => {
  void uid;
  void courseId;
};
