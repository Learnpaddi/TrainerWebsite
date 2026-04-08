import { collection } from 'firebase/firestore';
import { db } from './config';

export const collections = {
  users: collection(db, 'users'),
  students: collection(db, 'students'),
  trainers: collection(db, 'trainers'),
  courses: collection(db, 'courses'),
  enrollments: collection(db, 'enrollments'),
  progress: collection(db, 'progress'),
};

export const progressDocId = (userId: string, courseId: string) => `${userId}_${courseId}`;
export const enrollmentDocId = (userId: string, courseId: string) => `${userId}_${courseId}`;
