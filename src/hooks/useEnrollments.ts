import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserEnrollments } from '../services/firebase/enrollmentService';
import type { Enrollment, Progress } from '../services/firebase/types';

export const useEnrollments = () => {
  const { user, loading } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [enrollLoading, setEnrollLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setEnrollments([]);
      setProgress({});
      return;
    }

    const fetchEnrollments = async () => {
      setEnrollLoading(true);
      try {
        const userEnrollments = await getUserEnrollments(user.uid);
        setEnrollments(userEnrollments);

        // Fetch progress for each enrollment
        const progressData: Record<string, Progress> = {};
        for (const enrollment of userEnrollments) {
        // TODO: Implement getEnrollmentProgress in enrollmentService
        progressData[enrollment.courseId] = { id: '', userId: user.uid, courseId: enrollment.courseId, currentModule: 0, currentLesson: 0, percentage: 0, updatedAt: new Date().toISOString() } as Progress;
        }
        setProgress(progressData);
      } catch (error) {
        console.error('Failed to fetch enrollments:', error);
      } finally {
        setEnrollLoading(false);
      }
    };

    fetchEnrollments();
  }, [user]);

  const enrollInCourse = async (courseId: string) => {
    if (!user) return;
    // TODO: Implement enrollmentService.enroll(user.uid, courseId)
    console.log('Enroll in course:', courseId);
    // refetch();
  };

  return {
    enrollments,
    progress,
    enrollLoading,
    loading: loading || enrollLoading,
    refetch: () => {/* implement refetch logic */},
    enrollInCourse
  };
};

