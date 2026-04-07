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
  modules?: CourseModule[];
  createdAt: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  duration?: string;
  videoUrl?: string;
  videoPath?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
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
  if (!docSnap.exists()) return null;
  const raw = { ...docSnap.data() as Course, id: docSnap.id };
  if (!raw.modules || raw.modules.length === 0) {
    raw.modules = [
      {
        id: 'module_1',
        title: 'Getting Started',
        lessons: [
          { id: 'lesson_1', title: 'Welcome & Course Overview', duration: '8 min' },
          { id: 'lesson_2', title: 'Setup and Foundations', duration: '14 min' },
        ],
      },
      {
        id: 'module_2',
        title: 'Core Concepts',
        lessons: [
          { id: 'lesson_3', title: 'Hands-on Walkthrough', duration: '20 min' },
          { id: 'lesson_4', title: 'Applied Practice', duration: '18 min' },
        ],
      },
    ];
  }
  return raw;
};
