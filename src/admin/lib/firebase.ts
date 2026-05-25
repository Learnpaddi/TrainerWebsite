import { auth, db, storage, functions } from '@/services/firebase/config';
import { 
  collection, 
  query, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Re-export core Firebase instances for admin
export { auth, db, storage, functions };

type AdminCourseInput = {
  title: string;
  description: string;
  price: number;
  duration?: string;
  thumbnail?: string;
  trainerId?: string;
};

// Admin-specific queries
export const getUsers = async () => {
  const q = query(collection(db, 'users'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getEnrollments = async () => {
  const q = query(collection(db, 'enrollments'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateUserRole = async (uid: string, role: 'student' | 'trainer') => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role, updatedAt: serverTimestamp() });
};

export const deleteEnrollment = async (id: string) => {
  await deleteDoc(doc(db, 'enrollments', id));
};

export const getCourses = async () => {
  const q = query(collection(db, 'courses'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createCourse = async (courseData: AdminCourseInput) => {
  return await addDoc(collection(db, 'courses'), courseData);
};

export type AdminUser = {
  id: string;
  email: string;
  role: 'student' | 'trainer';
  name: string;
};

export type AdminEnrollment = {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  paymentAmount: number;
};
