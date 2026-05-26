import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getCourseEnrollments, type Enrollment } from '@/services/database/enrollmentService';
import { getCourseById, getUserCourses } from '@/services/database/courseService';
import type { Course } from '@/services/database/courseService';
import { getUserDoc } from '@/services/database/userService';

export interface TrainerEnrollment extends Enrollment {
  course: Course | null;
  studentName?: string;
  studentEmail?: string;
}

export const useTrainerEnrollments = () => {
  const { user, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<TrainerEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid || !user.doc?.trainerId) {
      return;
    }

    const trainerCourseId = user.doc.trainerId || user.uid;
    // Fetch trainer-owned courses and pull enrollments for each.
    getUserCourses(trainerCourseId).then(async (trainerCourses) => {
      const enrollmentsPerCourse = await Promise.all(
        trainerCourses.map((course) => getCourseEnrollments(course.id)),
      );
      const flattened = enrollmentsPerCourse.flat();
      const enriched = await Promise.all(flattened.map(async (enroll) => {
        const [course, student] = await Promise.all([
          getCourseById(enroll.courseId),
          getUserDoc(enroll.userId),
        ]);
        return {
          ...enroll,
          course,
          studentName: student?.name,
          studentEmail: student?.email,
        };
      }));
      setEnrollments(enriched);
      setLoading(false);
    }).catch((err: Error) => {
      setError(err.message);
      setLoading(false);
    });
  }, [user]);

  const hasTrainerWorkspace = Boolean(user?.uid && user.doc?.trainerId);

  return {
    enrollments: hasTrainerWorkspace ? enrollments : [],
    loading: authLoading || (hasTrainerWorkspace && loading),
    error,
  };
};
