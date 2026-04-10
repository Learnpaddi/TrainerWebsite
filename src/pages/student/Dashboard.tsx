import { BookCheck, BookOpen, Clock3, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentWorkspace } from '@/hooks/useStudentWorkspace';
import Chart from '@/components/Chart';
import ReviewCard from '@/components/ReviewCard';
import StatCard from '@/components/StatCard';

const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const { loading, enrolledCourses, averageProgress, completedCourses } = useStudentWorkspace();
  const pendingCourses = Math.max(enrolledCourses.length - completedCourses, 0);

  const progressTrend = enrolledCourses.slice(0, 6).map(({ course, progress }, index) => ({
    name: course.title.length > 14 ? `${course.title.slice(0, 14)}…` : course.title,
    value: progress.percentage || 0,
    order: index + 1,
  }));

  const completionSplit = [
    { name: 'Completed', value: completedCourses, color: '#10B981' },
    { name: 'Pending', value: pendingCourses, color: '#3B82F6' },
  ];

  const learnerReviews = enrolledCourses.slice(0, 3).map(({ course, progress }, index) => ({
    name: `Course update: ${course.title}`,
    role: `Progress • ${progress.percentage || 0}%`,
    rating: 4.4 + index * 0.2,
    comment: (progress.percentage || 0) >= 70
      ? 'Great momentum. Keep the streak going to complete this track.'
      : 'Steady progress. Finish one lesson this week to move forward.',
  }));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Courses Enrolled" value={enrolledCourses.length} icon={BookOpen} tone="blue" hint="Active learning paths" to="/courses" />
        <StatCard title="Completed" value={completedCourses} icon={BookCheck} tone="emerald" hint="Finished tracks" to="/student/examinations" />
        <StatCard title="Pending" value={pendingCourses} icon={Clock3} tone="amber" hint="In-progress courses" to="/courses" />
        <StatCard title="Completion Rate" value={`${averageProgress}%`} icon={TrendingUp} tone="violet" hint="Average progress across courses" to="/analytics" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]" id="analytics">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 xl:col-span-2">
            Loading student analytics...
          </div>
        ) : (
          <>
            <Chart
              variant="line"
              title="Learning Progress Trend"
              subtitle="Track completion level per enrolled course"
              lineData={progressTrend}
              lineXKey="name"
              lineYKey="value"
              lineColor="#2563EB"
            />
            <Chart
              variant="donut"
              title="Completion Split"
              subtitle="Completed vs pending courses"
              donutData={completionSplit}
            />
          </>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md">
          <p className="text-sm font-semibold text-corporate-text">My Activity</p>
          <div className="mt-4 space-y-3">
            {enrolledCourses.slice(0, 4).map(({ course, progress }) => (
              <div key={course.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <p className="text-sm font-semibold text-corporate-text">{course.title}</p>
                <p className="mt-1 text-xs text-corporate-muted">Progress updated to {progress.percentage || 0}%</p>
              </div>
            ))}
            {enrolledCourses.length === 0 && (
              <p className="text-sm text-corporate-muted">Enroll in a course to start tracking activity.</p>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md">
          <p className="text-sm font-semibold text-corporate-text">Reviews & Guidance</p>
          <div className="mt-4 space-y-3">
            {learnerReviews.length > 0 ? learnerReviews.map((review) => (
              <ReviewCard
                key={review.name}
                name={review.name}
                role={review.role}
                comment={review.comment}
                rating={review.rating}
              />
            )) : (
              <p className="text-sm text-corporate-muted">No recent review items yet.</p>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md">
        <p className="text-sm font-semibold text-corporate-text">Enrolled Courses</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {enrolledCourses
            .filter(({ progress }) => (progress.percentage || 0) < 100)
            .map(({ course, progress }) => {
              const lessonCount = (course.modules || []).reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
              return (
                <article key={course.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-corporate-muted">Course</p>
                  <h3 className="mt-1 text-sm font-semibold text-corporate-text">{course.title}</h3>
                  <p className="mt-2 text-xs text-corporate-muted">{lessonCount} lessons</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-corporate-accent" style={{ width: `${progress.percentage || 0}%` }} />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="secondary-cta mt-3 w-full px-3 py-2 text-xs"
                  >
                    Continue Course
                  </button>
                </article>
              );
            })}
          {enrolledCourses.length > 0 && enrolledCourses.every(({ progress }) => (progress.percentage || 0) >= 100) && (
            <p className="text-sm text-corporate-muted">All completed courses have moved to the examination portal.</p>
          )}
          {enrolledCourses.length === 0 && (
            <p className="text-sm text-corporate-muted">No enrolled courses yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default StudentDashboardPage;
