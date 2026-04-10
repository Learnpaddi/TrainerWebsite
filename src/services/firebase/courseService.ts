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
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { auth } from './config';
import type { CourseExam } from './types';

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
  exam?: CourseExam;
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
  const currentUser = auth.currentUser;
  if (!currentUser?.uid) {
    throw new Error('You must be signed in as a trainer to create a course.');
  }

  const trimmedTitle = courseData.title.trim();
  const duplicateSnapshot = await getDocs(
    query(
      collection(db, 'courses'),
      where('trainerId', '==', currentUser.uid),
      where('title', '==', trimmedTitle),
    ),
  );
  if (!duplicateSnapshot.empty) {
    const duplicateError = new Error('Course already exists');
    (duplicateError as Error & { code?: string }).code = 'course/duplicate-title';
    throw duplicateError;
  }

  const docRef = await addDoc(collection(db, 'courses'), { 
    ...courseData,
    title: trimmedTitle,
    trainerId: currentUser.uid,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateCourse = async (id: string, data: Partial<Course>): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser?.uid) {
    throw new Error('You must be signed in to update a course.');
  }

  const existing = await getDoc(doc(db, 'courses', id));
  if (!existing.exists()) {
    throw new Error('Course not found.');
  }

  const existingData = existing.data() as Course;
  if (existingData.trainerId !== currentUser.uid) {
    const forbiddenError = new Error('You can edit only your own courses.');
    (forbiddenError as Error & { code?: string }).code = 'course/forbidden';
    throw forbiddenError;
  }

  await updateDoc(doc(db, 'courses', id), data);
};

export const deleteCourse = async (id: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser?.uid) {
    throw new Error('You must be signed in to delete a course.');
  }

  const existing = await getDoc(doc(db, 'courses', id));
  if (!existing.exists()) {
    return;
  }

  const existingData = existing.data() as Course;
  if (existingData.trainerId !== currentUser.uid) {
    const forbiddenError = new Error('You can delete only your own courses.');
    (forbiddenError as Error & { code?: string }).code = 'course/forbidden';
    throw forbiddenError;
  }

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
