import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserCourses, type Course } from '@/services/database/courseService';

export const useTrainerCourses = () => {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const trainerId = user.doc?.trainerId || user.uid;
    getUserCourses(trainerId).then((data) => {
      setCourses(data);
      setLoading(false);
    }).catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  }, [user]);

  const refetch = () => {
    if (user?.uid) {
      setLoading(true);
      getUserCourses(user.doc?.trainerId || user.uid).then(setCourses).catch(setError).finally(() => setLoading(false));
    }
  };

  return { courses: user?.uid ? courses : [], loading: authLoading || (Boolean(user?.uid) && loading), error, refetch };
};
