import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';
import type { Course } from './courseService';

export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  completedLessons: string[];
  totalLessons: number;
  percentage: number;
  updatedAt: string;
  certificateUrl?: string;
}

const progressDocId = (userId: string, courseId: string) => `${userId}_${courseId}`;

const getTotalLessons = (course: Course | null | undefined): number => {
  if (!course?.modules?.length) return 0;
  return course.modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
};

export const getCourseProgress = async (
  userId: string,
  courseId: string,
  course?: Course | null,
): Promise<CourseProgress> => {
  const id = progressDocId(userId, courseId);
  const snapshot = await getDoc(doc(db, 'progress', id));
  if (snapshot.exists()) {
    return { ...(snapshot.data() as CourseProgress), id };
  }

  return {
    id,
    userId,
    courseId,
    completedLessons: [],
    totalLessons: getTotalLessons(course),
    percentage: 0,
    updatedAt: new Date().toISOString(),
  };
};

export const markLessonComplete = async (
  userId: string,
  course: Course,
  lessonId: string,
): Promise<CourseProgress> => {
  const existing = await getCourseProgress(userId, course.id, course);
  const completedLessons = Array.from(new Set([...existing.completedLessons, lessonId]));
  const totalLessons = getTotalLessons(course) || existing.totalLessons || 1;
  const percentage = Math.min(100, Math.round((completedLessons.length / totalLessons) * 100));

  const progress: CourseProgress = {
    id: progressDocId(userId, course.id),
    userId,
    courseId: course.id,
    completedLessons,
    totalLessons,
    percentage,
    updatedAt: new Date().toISOString(),
    certificateUrl: existing.certificateUrl,
  };

  await setDoc(doc(db, 'progress', progress.id), progress, { merge: true });

  return progress;
};
