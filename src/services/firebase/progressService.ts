import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';
import type { Course } from './courseService';
import type { Progress } from './types';
import { addUserCertificate } from './userService';

export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  completedLessons: string[];
  totalLessons: number;
  percentage: number;
  updatedAt: string;
  certificateUrl?: string;
  examScore?: number;
  examPercentage?: number;
  examPassed?: boolean;
  examSubmittedAt?: string;
  examAnswers?: Record<string, string>;
  certificateIssuedAt?: string;
}

const progressDocId = (userId: string, courseId: string) => `${userId}_${courseId}`;

const getTotalLessons = (course: Course | null | undefined): number => {
  if (!course) return 0;
  if (course.modules?.length) {
    return course.modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
  }
  const directLessons = (course as Course & { lessons?: unknown[] }).lessons;
  return Array.isArray(directLessons) ? directLessons.length : 0;
};

const toEnrollmentProgress = (
  enrollment: Partial<Progress> & { progress?: number } | null,
  userId: string,
  courseId: string,
  course?: Course | null,
): CourseProgress | null => {
  if (!enrollment) {
    return null;
  }

  const completedLessons = enrollment.completedLessons || [];
  const totalLessons = getTotalLessons(course) || enrollment.totalLessons || completedLessons.length || 1;
  const percentage = typeof enrollment.percentage === 'number'
    ? enrollment.percentage
    : typeof enrollment.progress === 'number'
      ? enrollment.progress
    : Math.min(100, Math.round((completedLessons.length / totalLessons) * 100));

  return {
    id: progressDocId(userId, courseId),
    userId,
    courseId,
    completedLessons,
    totalLessons,
    percentage,
    updatedAt: enrollment.updatedAt || new Date().toISOString(),
    certificateUrl: enrollment.certificateUrl,
    examScore: enrollment.examScore,
    examPercentage: enrollment.examPercentage,
    examPassed: enrollment.examPassed,
    examSubmittedAt: enrollment.examSubmittedAt,
    examAnswers: enrollment.examAnswers,
    certificateIssuedAt: enrollment.certificateIssuedAt,
  };
};

export const getCourseProgress = async (
  userId: string,
  courseId: string,
  course?: Course | null,
): Promise<CourseProgress> => {
  const id = progressDocId(userId, courseId);
  const [progressSnapshot, enrollmentSnapshot] = await Promise.all([
    getDoc(doc(db, 'progress', id)),
    getDoc(doc(db, 'enrollments', id)),
  ]);

  const firestoreProgress = progressSnapshot.exists()
    ? { ...(progressSnapshot.data() as CourseProgress), id }
    : null;
  const enrollmentFallback = enrollmentSnapshot.exists()
    ? toEnrollmentProgress(enrollmentSnapshot.data() as Partial<Progress> & { progress?: number }, userId, courseId, course)
    : null;

  if (firestoreProgress && enrollmentFallback) {
    const enrollmentIsNewer = new Date(enrollmentFallback.updatedAt).getTime() > new Date(firestoreProgress.updatedAt).getTime();
    const enrollmentHasMoreProgress = (enrollmentFallback.percentage || 0) > (firestoreProgress.percentage || 0);
    const enrollmentHasMoreLessons = (enrollmentFallback.completedLessons?.length || 0) > (firestoreProgress.completedLessons?.length || 0);

    if (enrollmentIsNewer || enrollmentHasMoreProgress || enrollmentHasMoreLessons) {
      const mergedProgress: CourseProgress = {
        ...firestoreProgress,
        completedLessons: enrollmentFallback.completedLessons,
        totalLessons: enrollmentFallback.totalLessons || firestoreProgress.totalLessons,
        percentage: Math.max(firestoreProgress.percentage || 0, enrollmentFallback.percentage || 0),
        updatedAt: enrollmentFallback.updatedAt || firestoreProgress.updatedAt,
      };

      await setDoc(doc(db, 'progress', id), mergedProgress, { merge: true });
      return mergedProgress;
    }

    return firestoreProgress;
  }

  if (firestoreProgress) {
    return firestoreProgress;
  }

  if (enrollmentFallback) {
    await setDoc(doc(db, 'progress', id), enrollmentFallback, { merge: true });
    return enrollmentFallback;
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
    examScore: existing.examScore,
    examPercentage: existing.examPercentage,
    examPassed: existing.examPassed,
    examSubmittedAt: existing.examSubmittedAt,
    examAnswers: existing.examAnswers,
    certificateIssuedAt: existing.certificateIssuedAt,
  };

  await setDoc(doc(db, 'progress', progress.id), progress, { merge: true });

  return progress;
};

export interface SubmitCourseExamInput {
  userId: string;
  course: Course;
  answers: Record<string, string>;
}

export interface CourseExamAttemptResult extends Progress {
  totalQuestions: number;
}

export const submitCourseExam = async ({
  userId,
  course,
  answers,
}: SubmitCourseExamInput): Promise<CourseExamAttemptResult> => {
  const examQuestions = course.exam?.questions || [];
  if (!examQuestions.length) {
    throw new Error('This course does not have an exam yet.');
  }

  const existing = await getCourseProgress(userId, course.id, course);
  const score = examQuestions.reduce((count, question) => (
    answers[question.id] === question.correctAnswer ? count + 1 : count
  ), 0);
  const totalQuestions = examQuestions.length;
  const examPercentage = Math.round((score / Math.max(totalQuestions, 1)) * 100);
  const passPercentage = course.exam?.passPercentage || 75;
  const passed = examPercentage >= passPercentage;
  const certificateIssuedAt = passed
    ? existing.certificateIssuedAt || new Date().toISOString()
    : existing.certificateIssuedAt;

  const updated: CourseProgress = {
    ...existing,
    id: progressDocId(userId, course.id),
    userId,
    courseId: course.id,
    totalLessons: existing.totalLessons || getTotalLessons(course),
    updatedAt: new Date().toISOString(),
    examScore: score,
    examPercentage,
    examPassed: passed,
    examSubmittedAt: new Date().toISOString(),
    examAnswers: answers,
    certificateIssuedAt,
  };

  await setDoc(doc(db, 'progress', updated.id), updated, { merge: true });
  if (passed) {
    await addUserCertificate(userId, course.id);
  }

  return {
    ...(updated as Progress),
    totalQuestions,
  };
};
