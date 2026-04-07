import { FolderPlus, GraduationCap, IndianRupee, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTrainerWorkspace } from '@/hooks/useTrainerWorkspace';

const TrainerDashboardPage = () => {
  const { loading, courses, totalLearners, totalRevenue, averageCompletion } = useTrainerWorkspace();

  return (
    <div className="space-y-8">
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Published Courses', value: courses.length, icon: GraduationCap, tone: 'bg-blue-100 text-primary' },
          { label: 'Active Learners', value: totalLearners, icon: Users, tone: 'bg-emerald-100 text-emerald-600' },
          { label: 'Catalog Value', value: `₹${totalRevenue}`, icon: IndianRupee, tone: 'bg-amber-100 text-amber-600' },
          { label: 'Avg Completion', value: `${averageCompletion}%`, icon: FolderPlus, tone: 'bg-violet-100 text-violet-600' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="metric-card p-6">
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-3xl ${item.tone}`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
              <p className="mt-2 text-4xl font-black text-slate-950">{item.value}</p>
            </article>
          );
        })}
      </section>

      <section className="lms-panel p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Trainer Control Center</p>
            <h2 className="text-3xl font-black text-slate-950">Course operations snapshot</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/trainer/create-course" className="primary-cta px-5 py-3 text-sm">Create Course</Link>
            <Link to="/trainer/manage-courses" className="secondary-cta px-5 py-3 text-sm">Manage Library</Link>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading trainer workspace...</p>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {courses.map((course) => (
              <article key={course.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row">
                  <img src={course.thumbnail} alt={course.title} className="h-36 w-full rounded-[1.5rem] object-cover lg:w-48" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{course.category}</p>
                    <h3 className="mt-2 text-2xl font-black text-slate-950">{course.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{course.description}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">{course.lessons.length} lessons</span>
                      <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-600">₹{course.price}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TrainerDashboardPage;
