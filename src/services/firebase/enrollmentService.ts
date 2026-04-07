import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  setDoc,
  orderBy
} from 'firebase/firestore';
import { db } from './config';
import { addUserEnrollment } from './userService';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'payment_pending' | 'paid';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentAmount: number;
}

export const createEnrollment = async (userId: string, courseId: string, amount: number, razorpayOrderId?: string): Promise<string> => {
  const docRef = await addDoc(collection(db, 'enrollments'), {
    userId,
    courseId,
    enrolledAt: new Date().toISOString(),
    status: razorpayOrderId ? 'payment_pending' : 'active' as const,
    paymentAmount: amount,
    razorpayOrderId
  });
  return docRef.id;
};

export const getUserEnrollments = async (userId: string): Promise<Enrollment[]> => {
  const q = query(collection(db, 'enrollments'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
};

export const getEnrollmentByUserAndCourse = async (userId: string, courseId: string): Promise<Enrollment | null> => {
  const q = query(
    collection(db, 'enrollments'),
    where('userId', '==', userId),
    where('courseId', '==', courseId),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const first = snapshot.docs[0];
  return { ...(first.data() as Enrollment), id: first.id };
};

export const enrollInCourse = async (userId: string, courseId: string, amount = 0): Promise<Enrollment> => {
  const existing = await getEnrollmentByUserAndCourse(userId, courseId);
  if (existing) return existing;

  const id = `${userId}_${courseId}`;
  const enrollment: Omit<Enrollment, 'id'> = {
    userId,
    courseId,
    enrolledAt: new Date().toISOString(),
    status: 'active',
    paymentAmount: amount,
  };

  await setDoc(doc(db, 'enrollments', id), enrollment, { merge: true });
  await addUserEnrollment(userId, courseId);
  return { id, ...enrollment };
};

export const getCourseEnrollments = async (courseId: string): Promise<Enrollment[]> => {
  const q = query(collection(db, 'enrollments'), where('courseId', '==', courseId), orderBy('enrolledAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((courseEnrollDoc) => ({ id: courseEnrollDoc.id, ...courseEnrollDoc.data() } as Enrollment));
};

export const getEnrollmentById = async (enrollmentId: string): Promise<Enrollment | null> => {
  const snapshot = await getDoc(doc(db, 'enrollments', enrollmentId));
  if (!snapshot.exists()) return null;
  return { ...(snapshot.data() as Enrollment), id: snapshot.id };
};
