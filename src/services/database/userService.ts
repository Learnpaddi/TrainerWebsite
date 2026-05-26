import { getCurrentUser, type DatabaseUser } from '@/services/database/authState';

export interface UserDoc {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'trainer';
  enrolledCourses?: string[];
  certificates?: string[];
  trainerId?: string | null;
}

const toUserDoc = (user: DatabaseUser): UserDoc => ({
  uid: user.id,
  name: user.name,
  email: user.email,
  role: user.role === 'trainer' ? 'trainer' : 'student',
  enrolledCourses: [],
  certificates: [],
  trainerId: user.role === 'trainer' ? user.id : null,
});

export const getUserDoc = async (uid: string): Promise<UserDoc | null> => {
  const user = getCurrentUser();
  return user && user.id === uid ? toUserDoc(user) : null;
};

export const setUserDoc = async (_uid: string, _data: Partial<UserDoc>): Promise<void> => {
  void _uid;
  void _data;
};

export const ensureUserDoc = async (user: DatabaseUser): Promise<UserDoc> => toUserDoc(user);

export const updateUserRole = async (_uid: string, _role: 'student' | 'trainer'): Promise<void> => {
  void _uid;
  void _role;
};

export const syncUserRole = async (user: DatabaseUser): Promise<'student' | 'trainer'> => (
  user.role === 'trainer' ? 'trainer' : 'student'
);

export const getPostLoginPath = async (user: DatabaseUser): Promise<'/dashboard' | '/admin'> => (
  user.role === 'trainer' ? '/admin' : '/dashboard'
);

export const addUserEnrollment = async (_uid: string, _courseId: string): Promise<void> => {
  void _uid;
  void _courseId;
};

export const addUserCertificate = async (_uid: string, _courseId: string): Promise<void> => {
  void _uid;
  void _courseId;
};
