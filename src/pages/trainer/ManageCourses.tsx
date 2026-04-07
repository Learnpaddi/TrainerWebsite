import { BarChart3, PencilLine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRole } from '@/hooks/useRole';
import { getCourseInsights, getTrainerCourses, type CourseRecord } from '@/services/firebase/lmsService';

interface CourseInsightState {
  totalEnrollments: number;
  averageProgress: number;
  averageRating: number;
  reviewCount: number;
}

const TrainerManageCoursesPage = () => {
  const { profile } = useRole();
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [insights, setInsights] = useState<Record<string, CourseInsightState>>({});

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!profile) return;
      const trainerCourses = await getTrainerCourses(profile.id);
      const insightEntries = await Promise.all(
        trainerCourses.map(async (course) => [course.id, await getCourseInsights(course.id)] as const),
      );

      if (!mounted) return;
      setCourses(trainerCourses);
      setInsights(Object.fromEntries(insightEntries));
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [profile]);

  return (
    <div className="space-y-6">
      {courses.map((course) => {
        const courseInsight = insights[course.id];

        return (
          <article key={course.id} className="lms-panel p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-col gap-5 lg:flex-row">
                <img src={course.thumbnail} alt={course.title} className="h-44 w-full rounded-[1.5rem] object-cover lg:w-64" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{course.category}</p>
                  <h2 className="mt-2 text-3xl font-black text-slate-950">{course.title}</h2>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{course.description}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">{course.lessons.length} lessons</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-600">₹{course.price}</span>
                    <span className="rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-primary">{course.level}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" className="secondary-cta px-4 py-3 text-sm">
                  <PencilLine className="h-4 w-4" />
                  Edit Course
                </button>
                <button type="button" className="primary-cta px-4 py-3 text-sm">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {[
                ['Enrollments', courseInsight?.totalEnrollments || 0],
                ['Avg Progress', `${courseInsight?.averageProgress || 0}%`],
                ['Avg Rating', courseInsight?.averageRating || 0],
                ['Reviews', courseInsight?.reviewCount || 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default TrainerManageCoursesPage;
