import { useState, useEffect } from 'react';
import { getCourses, type Course } from '@/services/database/courseService';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const nextCourses = await getCourses();
      setCourses(nextCourses);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load courses right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCourses();
  }, []);

  return { courses, loading, error, refetch: fetchCourses };
};
