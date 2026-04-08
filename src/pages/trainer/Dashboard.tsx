import { BadgeIndianRupee, ChartLine, GraduationCap, Users, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTrainerWorkspace } from '@/hooks/useTrainerWorkspace';
import Chart from '@/components/Chart';
import ReviewCard from '@/components/ReviewCard';
import StatCard from '@/components/StatCard';

const TrainerDashboardPage = () => {
  const { loading, courses, totalLearners, totalRevenue, averageCompletion } = useTrainerWorkspace();
  const lineData = courses.slice(0, 6).map((course) => ({
    name: course.title.length > 14 ? `${course.title.slice(0, 14)}…` : course.title,
    value: course.price,
  }));

  const engagementData = [
    { name: 'High Engagement', value: Math.max(Math.round(averageCompletion / 10), 1), color: '#10B981' },
    { name: 'Medium Engagement', value: 5, color: '#2563EB' },
    { name: 'Needs Attention', value: 10 - Math.min(Math.round(averageCompletion / 10), 9), color: '#F59E0B' },
  ];

  const topCourses = [...courses]
    .sort((left, right) => right.price - left.price)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-corporate-muted">Trainer Intelligence Layer</p>
        <h2 className="mt-2 text-2xl font-semibold text-corporate-text">Your premium analytics command center</h2>
        <p className="mt-2 max-w-2xl text-sm text-corporate-muted">
          Monitor revenue flow, student engagement, and course performance from a single operational workspace.
        </p>
        <div className="mt-5">
          <Link to="/trainer/add-course" className="primary-cta px-5 py-3 text-sm">
            + Create Course
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Courses" value={courses.length} icon={GraduationCap} tone="blue" hint="Published and active catalog" />
        <StatCard title="Revenue" value={`₹${totalRevenue}`} icon={Wallet} tone="emerald" hint="Combined course value" />
        <StatCard title="Active Users" value={totalLearners} icon={Users} tone="amber" hint="Learners currently enrolled" />
        <StatCard title="Completion Rate" value={`${averageCompletion}%`} icon={ChartLine} tone="violet" hint="Average learner completion" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]" id="analytics">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 xl:col-span-2">
            Loading trainer analytics...
          </div>
        ) : (
          <>
            <Chart
              variant="line"
              title="Earnings by Course"
              subtitle="Revenue potential across your top course catalog"
              lineData={lineData}
              lineXKey="name"
              lineYKey="value"
              lineColor="#06B6D4"
            />
            <Chart
              variant="donut"
              title="Student Engagement"
              subtitle="Engagement quality mix"
              donutData={engagementData}
            />
          </>
        )}
      </section>

      {!loading && courses.length === 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">No courses created yet</h2>
          <p className="mt-2 text-sm text-slate-600">Create your first course to see trainer analytics and engagement insights.</p>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md">
          <p className="text-sm font-semibold text-corporate-text">Top Performing Courses</p>
          <div className="mt-4 space-y-3">
            {topCourses.map((course) => (
              <div key={course.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-corporate-text">{course.title}</p>
                    <p className="text-xs text-corporate-muted">{course.lessons.length} lessons · {course.category}</p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-corporate-success">
                    <BadgeIndianRupee className="h-3.5 w-3.5" />
                    {course.price}
                  </div>
                </div>
              </div>
            ))}
            {topCourses.length === 0 && <p className="text-sm text-corporate-muted">No courses available yet.</p>}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md">
          <p className="text-sm font-semibold text-corporate-text">Recent Learner Reviews</p>
          <div className="mt-4 space-y-3">
            {courses.slice(0, 3).map((course, index) => (
              <ReviewCard
                key={course.id}
                name={`${course.title} feedback`}
                role="Learner review"
                rating={4.2 + index * 0.25}
                comment="Strong delivery and practical modules. Students are engaging deeply with assignments."
              />
            ))}
            {courses.length === 0 && <p className="text-sm text-corporate-muted">No reviews yet.</p>}
          </div>
        </article>
      </section>
    </div>
  );
};

export default TrainerDashboardPage;
