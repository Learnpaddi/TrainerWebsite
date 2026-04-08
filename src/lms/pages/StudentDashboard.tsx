import { BookOpen, ChartNoAxesColumn, Clock3, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCourses } from '@/hooks/useCourses';

const StudentDashboard = () => {
  const { courses, loading, error } = useCourses();

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-indigo-50 via-blue-50 to-white p-8 shadow-xl lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-4 w-4" />
              Student LMS
            </p>
            <h1 className="mb-4 text-4xl font-black text-gray-900 lg:text-5xl">Welcome to Your Learning Hub</h1>
            <p className="max-w-2xl text-lg leading-8 text-gray-600">
              Browse featured programs, keep an eye on your learning momentum, and jump back into the courses that matter most.
            </p>
          </div>
          <Link to="/select-role?mode=login" className="primary-cta px-6 py-4 text-base">
            Switch Role
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[1.75rem] bg-white p-6 shadow-lg">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-100 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-400">Available Courses</p>
          <p className="mt-2 text-4xl font-black text-gray-900">{courses.length}</p>
        </div>
        <div className="rounded-[1.75rem] bg-white p-6 shadow-lg">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
            <ChartNoAxesColumn className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-400">Average Progress</p>
          <p className="mt-2 text-4xl font-black text-gray-900">68%</p>
        </div>
        <div className="rounded-[1.75rem] bg-white p-6 shadow-lg">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-100 text-orange-500">
            <Clock3 className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-400">Weekly Goal</p>
          <p className="mt-2 text-4xl font-black text-gray-900">7 hrs</p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Course Library</p>
            <h2 className="text-3xl font-black text-gray-900">Discover Courses</h2>
          </div>
          <Link to="/" className="secondary-cta px-6 py-4 text-base">Back to Homepage</Link>
        </div>

        {loading ? (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-lg">
            <p className="text-lg font-medium text-gray-600">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-lg">
            <p className="text-lg font-medium text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <article key={course.id} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r from-primary to-accent text-2xl font-black text-white shadow-lg">
                  {course.title?.[0]?.toUpperCase() || index + 1}
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900 line-clamp-2">{course.title}</h3>
                <p className="mb-6 text-gray-600 line-clamp-3">{course.description}</p>
                <div className="mb-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Duration</p>
                    <p className="mt-2 text-lg font-bold text-gray-900">{course.duration || 'Self-paced'}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500">Price</p>
                    <p className="mt-2 text-lg font-bold text-emerald-600">₹{course.price || 0}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">{course.modules?.length || 0} modules</span>
                  <button type="button" className="primary-cta px-5 py-3 text-sm">
                    Start Course
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

export default StudentDashboard;
