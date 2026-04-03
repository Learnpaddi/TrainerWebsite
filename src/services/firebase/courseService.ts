import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './config';

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  thumbnail: string;
  trainerId: string;
  modules?: string[];
  createdAt: string;
}

export const getCourses = async (): Promise<Course[]> => {
  const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};

export const getUserCourses = async (trainerId: string): Promise<Course[]> => {
  const q = query(collection(db, 'courses'), where('trainerId', '==', trainerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};

export const createCourse = async (courseData: Omit<Course, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'courses'), { 
    ...courseData, 
    createdAt: new Date().toISOString() 
  });
  return docRef.id;
};

export const updateCourse = async (id: string, data: Partial<Course>): Promise<void> => {
  await updateDoc(doc(db, 'courses', id), data);
};

export const deleteCourse = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'courses', id));
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  const docSnap = await getDoc(doc(db, 'courses', id));
  return docSnap.exists() ? { ...docSnap.data() as Course, id: docSnap.id } : null;
};
