import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { enrollInCourse, getUserEnrollments } from '../services/firebase/enrollmentService';
import { getCourseById } from '../services/firebase/courseService';
import { getCourseProgress } from '../services/firebase/progressService';
import type { Enrollment, Progress } from '../services/firebase/types';

export const useEnrollments = () => {
  const { user, loading } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [enrollLoading, setEnrollLoading] = useState(false);

  const fetchEnrollments = async () => {
    if (!user) {
      setEnrollments([]);
      setProgress({});
      setEnrollLoading(false);
      return;
    }
    setEnrollLoading(true);
    try {
      const userEnrollments = await getUserEnrollments(user.uid);
      setEnrollments(userEnrollments);

      const progressData: Record<string, Progress> = {};
      for (const enrollment of userEnrollments) {
        const course = await getCourseById(enrollment.courseId);
        const progressDoc = await getCourseProgress(user.uid, enrollment.courseId, course);
        progressData[enrollment.courseId] = progressDoc as Progress;
      }
      setProgress(progressData);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setEnrollLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setEnrollments([]);
      setProgress({});
      return;
    }
    fetchEnrollments();
  }, [user]);

  const enroll = async (courseId: string, amount = 0) => {
    if (!user) return;
    await enrollInCourse(user.uid, courseId, amount);
    await fetchEnrollments();
  };

  return {
    enrollments,
    progress,
    enrollLoading,
    loading: (user ? loading : false) || enrollLoading,
    refetch: fetchEnrollments,
    enrollInCourse: enroll
  };
};
