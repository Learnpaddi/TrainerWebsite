import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses, getMyEnrollments } from '@/features/learning/api/learningApi';
import { FeatureShell } from '@/features/learning/components/FeatureShell';
import type { CourseSummary, EnrollmentWithCourse } from '@/features/learning/types';

export default function LearningDashboardPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [courseResponse, enrollmentResponse] = await Promise.all([getCourses(), getMyEnrollments()]);
        setCourses(courseResponse.courses);
        setEnrollments(enrollmentResponse.enrollments);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load learning dashboard.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const enrollmentMap = new Map(enrollments.map((enrollment) => [enrollment.course.id, enrollment]));

  return (
    <FeatureShell
      title="Course Enrollment Workspace"
      subtitle="Students can enroll, track progress, pay for premium courses, and access exams only when the rules are satisfied."
    >
      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {loading ? (
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading courses...</div>
        ) : (
          courses.map((course) => {
            const enrollment = enrollmentMap.get(course.id);
            const isFree = course.price === 0;

            return (
              <article key={course.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_right,rgba(18,179,168,0.12),transparent_22%),linear-gradient(135deg,#ffffff,#f3f8ff)] p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${isFree ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {isFree ? 'Free course' : `Paid course • INR ${course.price}`}
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                      {course.examAvailable ? `${course.exam?.questionCount || 0} exam questions` : 'No exam'}
                    </span>
                  </div>
                  <h2 className="mt-4 text-2xl font-black text-slate-950">{course.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{course.description}</p>
                </div>

                <div className="space-y-5 p-6">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Lessons</p>
                      <p className="mt-2 text-xl font-black text-slate-900">{course.lessons.length}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Progress</p>
                      <p className="mt-2 text-xl font-black text-slate-900">{enrollment?.progress || 0}%</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Payment</p>
                      <p className="mt-2 text-xl font-black text-slate-900">{enrollment?.paymentStatus || 'n/a'}</p>
                    </div>
                  </div>

                  {enrollment?.examResult ? (
                    <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${enrollment.examResult.passed ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                      Latest exam score: {enrollment.examResult.score}% {enrollment.examResult.passed ? '• Passed' : '• Not passed yet'}
                    </div>
                  ) : null}

                  <Link to={`/learn/course/${course.id}`} className="primary-cta w-full px-5 py-3 text-sm">
                    {enrollment ? 'Continue Course' : 'View Course'}
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </div>
    </FeatureShell>
  );
}
