import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserEnrollments, type Enrollment } from '@/services/firebase/enrollmentService';
import { getCourseById } from '@/services/firebase/courseService';
import type { Course } from '@/services/firebase/courseService';

export interface TrainerEnrollment extends Enrollment {
  course: Course | null;
}

export const useTrainerEnrollments = () => {
  const { user, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<TrainerEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid || !user.doc?.trainerId) {
      setLoading(false);
      return;
    }

    // Note: This uses user enrollments as proxy; production would query trainer's course enrollments
    getUserEnrollments(user.uid).then(async (data) => {
      const enriched = await Promise.all(data.map(async (enroll) => ({
        ...enroll,
        course: await getCourseById(enroll.courseId)
      })));
      setEnrollments(enriched);
      setLoading(false);
    }).catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  }, [user]);

  return { enrollments, loading: authLoading || loading, error };
};

