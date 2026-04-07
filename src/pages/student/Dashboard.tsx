import { Award, BookOpen, PlayCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStudentWorkspace } from '@/hooks/useStudentWorkspace';

const StudentDashboardPage = () => {
  const { loading, enrolledCourses, averageProgress, completedCourses, certificates } = useStudentWorkspace();

  return (
    <div className="space-y-8">
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Enrolled Courses', value: enrolledCourses.length, icon: BookOpen, tone: 'bg-blue-100 text-primary' },
          { label: 'Average Progress', value: `${averageProgress}%`, icon: TrendingUp, tone: 'bg-emerald-100 text-emerald-600' },
          { label: 'Certificates', value: certificates.length, icon: Award, tone: 'bg-amber-100 text-amber-600' },
          { label: 'Completed Tracks', value: completedCourses, icon: PlayCircle, tone: 'bg-violet-100 text-violet-600' },
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Continue Learning</p>
            <h2 className="text-3xl font-black text-slate-950">Your active programs</h2>
          </div>
          <Link to="/explore" className="secondary-cta px-5 py-3 text-sm">Explore More Courses</Link>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading your workspace...</p>
        ) : enrolledCourses.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <h3 className="text-2xl font-black text-slate-950">No courses enrolled yet</h3>
            <p className="mt-3 text-slate-600">Browse the public marketplace and enroll into your first learning path.</p>
            <Link to="/explore" className="primary-cta mt-6 px-5 py-3 text-sm">Open Marketplace</Link>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {enrolledCourses.map(({ course, enrollment }) => (
              <article key={course.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row">
                  <img src={course.thumbnail} alt={course.title} className="h-40 w-full rounded-[1.5rem] object-cover lg:w-56" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{course.category}</p>
                    <h3 className="mt-2 text-2xl font-black text-slate-950">{course.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{course.description}</p>
                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100">
                        <div className="h-3 rounded-full bg-gradient-to-r from-primary to-cyan-400" style={{ width: `${enrollment.progress}%` }} />
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link to={`/student/course/${course.id}`} className="primary-cta px-5 py-3 text-sm">
                        Continue Learning
                      </Link>
                      <span className="secondary-cta px-4 py-3 text-sm">{course.lessons.length} lessons</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="lms-panel p-6 lg:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Certificates</p>
          <h2 className="text-3xl font-black text-slate-950">Completion rewards</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {certificates.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Finish a course to unlock your first certificate.
            </div>
          ) : certificates.map((certificate) => (
            <article key={certificate.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">Verified Certificate</p>
              <h3 className="mt-3 text-xl font-black text-slate-950">{certificate.certificateNumber}</h3>
              <p className="mt-2 text-sm text-slate-600">Issued on {new Date(certificate.issuedAt).toLocaleDateString()}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StudentDashboardPage;
