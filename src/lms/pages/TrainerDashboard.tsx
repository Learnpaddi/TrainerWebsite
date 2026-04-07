import { BarChart3, FolderPlus, GraduationCap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCourses } from '@/hooks/useCourses';

const TrainerDashboard = () => {
  const { courses, loading, error } = useCourses();

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 p-8 text-white shadow-xl lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              Trainer LMS
            </p>
            <h1 className="mb-4 text-4xl font-black lg:text-5xl">Professional Course Control Center</h1>
            <p className="max-w-2xl text-lg leading-8 text-white/80">
              Organize course delivery, review enrollment trends, and prepare your LMS for the next round of student growth.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-base font-bold text-slate-900 shadow-lg">
              <FolderPlus className="h-5 w-5" />
              Upload Course
            </button>
            <Link to="/auth" className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-base font-bold text-white">
              Switch Role
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[1.75rem] bg-white p-6 shadow-lg">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-100 text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-400">Published Courses</p>
          <p className="mt-2 text-4xl font-black text-gray-900">{courses.length}</p>
        </div>
        <div className="rounded-[1.75rem] bg-white p-6 shadow-lg">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
            <Users className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-400">Active Learners</p>
          <p className="mt-2 text-4xl font-black text-gray-900">1.2K</p>
        </div>
        <div className="rounded-[1.75rem] bg-white p-6 shadow-lg">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-purple-100 text-purple-600">
            <BarChart3 className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-400">Completion Rate</p>
          <p className="mt-2 text-4xl font-black text-gray-900">84%</p>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Course List</p>
            <h2 className="text-3xl font-black text-gray-900">Manage Your Programs</h2>
          </div>
          <button type="button" className="primary-cta px-6 py-4 text-base">
            Create New Course
          </button>
        </div>

        {loading ? (
          <p className="text-lg font-medium text-gray-600">Loading trainer data...</p>
        ) : error ? (
          <p className="text-lg font-medium text-red-600">{error}</p>
        ) : (
          <div className="grid gap-4">
            {courses.map((course) => (
              <div key={course.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{course.title}</h3>
                  <p className="mt-2 max-w-3xl text-gray-600">{course.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm">
                    {course.duration || 'Self-paced'}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 shadow-sm">
                    ₹{course.price || 0}
                  </span>
                  <button type="button" className="secondary-cta px-5 py-3 text-sm">
                    View Analytics
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TrainerDashboard;
