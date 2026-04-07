import { useEffect, useState } from 'react';
import {
  getMarketplaceCategories,
  getMarketplaceCourses,
  getRatingSnapshot,
  type CourseRecord,
} from '@/services/firebase/lmsService';

export interface MarketplaceCourse extends CourseRecord {
  averageRating: number;
  reviewsCount: number;
}

export const useMarketplace = (search: string, category: string) => {
  const [courses, setCourses] = useState<MarketplaceCourse[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const [fetchedCourses, fetchedCategories] = await Promise.all([
        getMarketplaceCourses({ search, category }),
        getMarketplaceCategories(),
      ]);

      const withRatings = await Promise.all(
        fetchedCourses.map(async (course) => {
          const snapshot = await getRatingSnapshot(course.id);
          return {
            ...course,
            averageRating: snapshot.averageRating,
            reviewsCount: snapshot.reviewsCount,
          };
        }),
      );

      if (!mounted) return;
      setCourses(withRatings);
      setCategories(fetchedCategories);
      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [search, category]);

  return { courses, categories, loading };
};
