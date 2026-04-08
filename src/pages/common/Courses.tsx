import { BookOpen, GraduationCap, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useStudentWorkspace } from '@/hooks/useStudentWorkspace';
import { useTrainerWorkspace } from '@/hooks/useTrainerWorkspace';
import { storePendingCourseIntent } from '@/student/lib/courseIntent';
import StatCard from '@/components/StatCard';

const CoursesPage = () => {
  const navigate = useNavigate();
  const { role, profile } = useRole();
  const isTrainer = role === 'trainer';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const { courses: marketplaceCourses, categories, loading: marketplaceLoading } = useMarketplace(search, category);
  const studentData = useStudentWorkspace();
  const trainerData = useTrainerWorkspace();

  const filteredTrainerCourses = useMemo(
    () => trainerData.courses.filter((course) => course.title.toLowerCase().includes(search.toLowerCase())),
    [trainerData.courses, search],
  );

  const handleEnrollNow = (courseId: string) => {
    if (!isTrainer && !profile) {
      storePendingCourseIntent(courseId);
      navigate(`/select-role?mode=login&from=${encodeURIComponent(`/course/${courseId}`)}`);
      return;
    }

    navigate(`/course/${courseId}`);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isTrainer ? (
          <>
            <StatCard title="Published Courses" value={trainerData.courses.length} icon={GraduationCap} tone="blue" hint="Live in catalog" />
            <StatCard title="Total Learners" value={trainerData.totalLearners} icon={BookOpen} tone="emerald" hint="Across all courses" />
            <StatCard title="Catalog Value" value={`₹${trainerData.totalRevenue}`} icon={Sparkles} tone="amber" hint="Current pricing value" />
            <StatCard title="Avg Completion" value={`${trainerData.averageCompletion}%`} icon={Sparkles} tone="violet" hint="Learner progress quality" />
          </>
        ) : (
          <>
            <StatCard title="Enrolled Courses" value={studentData.enrolledCourses.length} icon={BookOpen} tone="blue" hint="Courses in progress" />
            <StatCard title="Completed" value={studentData.completedCourses} icon={Sparkles} tone="emerald" hint="Tracks completed" />
            <StatCard title="Certificates" value={studentData.certificates.length} icon={GraduationCap} tone="amber" hint="Issued rewards" />
            <StatCard title="Average Progress" value={`${studentData.averageProgress}%`} icon={Sparkles} tone="violet" hint="Across enrolled courses" />
          </>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={isTrainer ? 'Search your courses...' : 'Search marketplace courses...'}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-corporate-text outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {!isTrainer && (
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-corporate-text outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            >
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          )}
        </div>
      </section>

      {isTrainer ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTrainerCourses.map((course) => (
            <article key={course.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              <img src={course.thumbnail} alt={course.title} className="h-36 w-full rounded-xl object-cover" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-corporate-muted">{course.category}</p>
              <h3 className="mt-1 text-lg font-semibold text-corporate-text">{course.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-corporate-muted">{course.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-corporate-success">₹{course.price}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-corporate-muted">{course.lessons.length} lessons</span>
              </div>
            </article>
          ))}
          {filteredTrainerCourses.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-corporate-muted">No trainer courses found.</p>}
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {marketplaceLoading ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-corporate-muted">Loading courses...</p>
          ) : marketplaceCourses.map((course) => (
            <article key={course.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              <img src={course.thumbnail} alt={course.title} className="h-36 w-full rounded-xl object-cover" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-corporate-muted">{course.category}</p>
              <h3 className="mt-1 text-lg font-semibold text-corporate-text">{course.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-corporate-muted">{course.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-corporate-success">₹{course.price}</span>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-corporate-accent">{course.averageRating.toFixed(1)} ⭐</span>
              </div>
              <button
                type="button"
                onClick={() => handleEnrollNow(course.id)}
                className="primary-cta mt-4 w-full px-4 py-2.5 text-sm"
              >
                Enroll Now
              </button>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default CoursesPage;
