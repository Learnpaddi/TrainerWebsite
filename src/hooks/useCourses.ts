import { useState, useEffect } from 'react';
import { getCourses, type Course } from '@/services/firebase/courseService';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCourses().then(setCourses).catch(setError).finally(() => setLoading(false));
  }, []);

  return { courses, loading, error, refetch: () => getCourses().then(setCourses).catch(setError).finally(() => setLoading(false)) };
};
