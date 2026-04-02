import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from './config';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: 'active' | 'completed';
}

export const createEnrollment = async (userId: string, courseId: string): Promise<string> => {
  const docRef = await addDoc(collection(db, 'enrollments'), {
    userId,
    courseId,
    enrolledAt: new Date().toISOString(),
    status: 'active' as const
  });
  return docRef.id;
};

export const getUserEnrollments = async (userId: string): Promise<Enrollment[]> => {
  const q = query(collection(db, 'enrollments'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
};
