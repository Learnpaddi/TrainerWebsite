import { useMemo } from 'react';
import { useCourses } from '@/hooks/useCourses';
import { useEnrollments } from '@/hooks/useEnrollments';
import { canGenerateCertificateForCourse } from '@/services/database/examUtils';
import type { Course } from '@/services/database/courseService';
import type { Enrollment, Progress } from '@/services/database/types';

interface StudentWorkspaceState {
  loading: boolean;
  courses: Course[];
  enrollments: Enrollment[];
  enrolledCourses: Array<{ course: Course; enrollment: Enrollment; progress: Progress }>;
  averageProgress: number;
  completedCourses: number;
  certificates: Array<{ course: Course; progress: Progress }>;
}

export const useStudentWorkspace = (): StudentWorkspaceState => {
  const { courses, loading: coursesLoading } = useCourses();
  const { enrollments, progress, enrollLoading } = useEnrollments();

  const enrolledCourses = useMemo(() => enrollments
    .map((enrollment) => {
      const course = courses.find((item) => item.id === enrollment.courseId);
      const courseProgress = progress[enrollment.courseId];
      if (!course || !courseProgress) return null;
      return {
        course,
        enrollment,
        progress: courseProgress,
      };
    })
    .filter(Boolean) as Array<{ course: Course; enrollment: Enrollment; progress: Progress }>, [courses, enrollments, progress]);

  const certificates = useMemo(() => enrolledCourses
    .filter(({ course, progress: courseProgress }) => canGenerateCertificateForCourse(course, courseProgress))
    .map(({ course, progress: courseProgress }) => ({ course, progress: courseProgress })), [enrolledCourses]);

  const completedCourses = enrolledCourses.filter(({ progress: courseProgress }) => (courseProgress.percentage || 0) >= 100).length;
  const averageProgress = enrolledCourses.length
    ? Math.round(enrolledCourses.reduce((sum, item) => sum + (item.progress.percentage || 0), 0) / enrolledCourses.length)
    : 0;

  return {
    loading: coursesLoading || enrollLoading,
    courses,
    enrollments,
    enrolledCourses,
    averageProgress,
    completedCourses,
    certificates,
  };
};
