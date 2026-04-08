import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StarRating from '@/shared/ui/StarRating';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useRole } from '@/hooks/useRole';
import { storePendingCourseIntent } from '@/student/lib/courseIntent';

const ExplorePage = () => {
  const navigate = useNavigate();
  const { profile } = useRole();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const { courses, categories, loading } = useMarketplace(search, category);

  const featured = useMemo(() => courses.filter((course) => course.featured).slice(0, 3), [courses]);

  const handleEnrollNow = (courseId: string) => {
    if (!profile) {
      storePendingCourseIntent(courseId);
      navigate(`/select-role?mode=login&from=${encodeURIComponent(`/course/${courseId}`)}`);
      return;
    }

    navigate(`/course/${courseId}`);
  };

  return (
    <div className="space-y-10">
      <section className="surface-panel px-6 py-8 lg:px-10 lg:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-4 w-4" />
              Public Marketplace
            </p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 lg:text-5xl">Discover premium courses built for real outcomes</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Explore structured video learning, progress-led course paths, verified completion tracking, and trainer-built programs designed like a modern marketplace.
            </p>
          </div>
          <Link to="/select-role?mode=login" className="primary-cta px-6 py-4 text-base">Choose LMS Role</Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr,0.8fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses, categories, or skills"
              className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <SlidersHorizontal className="h-5 w-5 text-slate-400" />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
            >
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {featured.map((course) => (
          <article key={course.id} className="lms-orb-card p-6">
            <img src={course.thumbnail} alt={course.title} className="h-48 w-full rounded-[1.5rem] object-cover" />
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{course.category}</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{course.title}</h2>
              <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{course.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <StarRating rating={Math.round(course.averageRating)} reviews={course.reviewsCount} />
                <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-600">₹{course.price}</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">All Courses</p>
            <h2 className="text-3xl font-black text-slate-950">Marketplace Catalog</h2>
          </div>
          <p className="text-sm font-semibold text-slate-500">{courses.length} programs available</p>
        </div>

        {loading ? (
          <div className="lms-panel p-10 text-center text-slate-500">Loading marketplace...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article key={course.id} className="lms-orb-card p-6">
                <img src={course.thumbnail} alt={course.title} className="h-44 w-full rounded-[1.5rem] object-cover" />
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{course.category}</p>
                    <h3 className="mt-2 text-2xl font-black text-slate-950">{course.title}</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">{course.level}</span>
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">{course.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <StarRating rating={Math.round(course.averageRating)} reviews={course.reviewsCount} />
                  <span className="text-sm font-semibold text-slate-500">{course.duration}</span>
                </div>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Price</p>
                    <p className="text-2xl font-black text-emerald-600">₹{course.price}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEnrollNow(course.id)}
                    className="primary-cta px-5 py-3 text-sm"
                  >
                    Enroll Now
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ExplorePage;
