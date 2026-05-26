import {
  markLessonCompleted,
  getStudentEnrollments,
} from '@/services/database/lmsService';
import type { Progress } from '@/services/database/types';

export interface CourseProgress {
  completedLessons: string[];
  totalLessons: number;
  percentage: number;
  updatedAt: string;
}

export const getCourseProgress = async (
  userId: string,
  courseId: string,
  _course?: unknown,
): Promise<Progress | null> => {
  void _course;
  const enrollment = (await getStudentEnrollments(userId)).find((item) => item.courseId === courseId);
  if (!enrollment) return null;

  return {
    id: enrollment.id,
    userId,
    courseId,
    completedLessons: enrollment.completedLessons,
    percentage: enrollment.progress,
    updatedAt: enrollment.updatedAt || enrollment.enrolledAt,
  };
};

export const markLessonComplete = async (
  userId: string,
  courseIdOrCourse: string | { id: string },
  lessonId: string,
): Promise<Progress | null> => {
  const courseId = typeof courseIdOrCourse === 'string' ? courseIdOrCourse : courseIdOrCourse.id;
  const enrollment = await markLessonCompleted(userId, courseId, lessonId);
  if (!enrollment) return null;

  return {
    id: enrollment.id,
    userId,
    courseId,
    completedLessons: enrollment.completedLessons,
    percentage: enrollment.progress,
    updatedAt: enrollment.updatedAt || new Date().toISOString(),
  };
};

export interface SubmitCourseExamInput {
  userId: string;
  courseId: string;
  answers: Record<string, string>;
}

export interface CourseExamAttemptResult extends Progress {
  examScore?: number;
  examPercentage?: number;
  examPassed?: boolean;
}

export const submitCourseExam = async ({
  userId,
  courseId,
  answers,
}: SubmitCourseExamInput): Promise<CourseExamAttemptResult> => ({
  id: `${userId}_${courseId}`,
  userId,
  courseId,
  completedLessons: [],
  percentage: 100,
  updatedAt: new Date().toISOString(),
  examAnswers: answers,
  examScore: Object.keys(answers).length,
  examPercentage: 100,
  examPassed: true,
  examSubmittedAt: new Date().toISOString(),
});
