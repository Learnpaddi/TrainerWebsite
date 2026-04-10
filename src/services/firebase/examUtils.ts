import type { Course, Progress } from './types';

export const hasCourseExam = (course: Pick<Course, 'exam'> | null | undefined) =>
  Boolean(course?.exam?.questions?.length);

export const canAccessCourseExam = (
  course: Pick<Course, 'exam'> | null | undefined,
  progress: Pick<Progress, 'percentage'> | null | undefined,
) => hasCourseExam(course) && (progress?.percentage || 0) >= 100;

export const hasPassedCourseExam = (progress: Pick<Progress, 'examPassed'> | null | undefined) =>
  Boolean(progress?.examPassed);

export const canGenerateCertificateForCourse = (
  course: Pick<Course, 'exam'> | null | undefined,
  progress: Pick<Progress, 'percentage' | 'examPassed'> | null | undefined,
) => {
  if ((progress?.percentage || 0) < 100) return false;
  if (!hasCourseExam(course)) return false;
  return hasPassedCourseExam(progress);
};
