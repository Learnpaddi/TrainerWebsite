import { useMemo, useState } from 'react';
import { useCourses } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';
import { useEnrollments } from '@/hooks/useEnrollments';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock3, GraduationCap, Layers3, Loader2, Play, Plus, Sparkles, X } from 'lucide-react';
import type { Course } from '@/services/firebase/courseService';
import { storePendingCourseIntent } from '@/student/lib/courseIntent';

const Landing = () => {
  const { courses, loading, error } = useCourses();
  const { user } = useAuth();
  const { enrollments, enrollInCourse } = useEnrollments();
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const enrolledIds = useMemo(
    () => new Set(enrollments.map((enrollment) => enrollment.courseId)),
    [enrollments],
  );

  const getCourseStats = (course: Course) => {
    const modulesCount = course.modules?.length || 0;
    const lessonsCount = (course.modules || []).reduce((total, module) => total + (module.lessons?.length || 0), 0);

    return {
      modulesCount,
      lessonsCount,
    };
  };

  const openCoursePreview = (course: Course) => {
    setSelectedCourse(course);
  };

  const closeCoursePreview = () => {
    setSelectedCourse(null);
  };

  const handleStartCourse = async (course: Course) => {
    const isEnrolled = enrolledIds.has(course.id);

    if (!user) {
      storePendingCourseIntent(course.id);
      navigate('/register', {
        state: {
          from: `/course/${course.id}`,
          pendingCourseId: course.id,
        },
      });
      return;
    }

    setActionLoading(course.id);
    try {
      if (!isEnrolled) {
        await enrollInCourse(course.id, course.price || 0);
      }

      navigate(`/course/${course.id}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-10 pb-20">
        <div className="section-shell px-6 py-16 md:px-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm mb-6">
              <GraduationCap className="w-4 h-4" />
              LearnPaddi LMS
            </div>
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-primary to-accent bg-clip-text text-transparent mb-6 leading-tight dark:from-gray-100">
              Fueling Today's Mind
              <span className="block text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text">for Tomorrow's Success</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted mb-12 max-w-3xl mx-auto leading-relaxed dark:text-gray-400">
              Discover expert-led courses. Track progress. Earn certificates. Transform your career.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                to="/#lms-courses" 
                className="primary-cta px-10 py-5 text-lg max-w-sm w-full text-center"
              >
                Start LMS Learning <GraduationCap className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/my-courses" 
                className="secondary-cta px-10 py-5 text-lg max-w-sm w-full text-center dark:bg-gray-800/80 dark:border-gray-600 dark:text-gray-200 dark:hover:border-primary dark:hover:bg-gray-700">
                Browse Courses <Plus className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section id="lms-courses" className="py-20 bg-white/80 border-y border-white/60 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent">
              LMS Course Stack ({courses.length})
            </h2>
            <p className="text-xl text-gray-600">Course details are pulled from Firebase and arranged in stacked learning cards.</p>
          </div>

          {loading ? (
            <div className="text-center py-24 rounded-[2rem] border border-white/70 bg-white shadow-xl">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-24 text-gray-500 rounded-[2rem] border border-dashed border-gray-200 bg-white shadow-xl">
              <GraduationCap className="w-24 h-24 mx-auto mb-8 opacity-50" />
              <h3 className="text-2xl font-bold mb-4">No courses yet</h3>
              <p>Start your LMS journey soon!</p>
            </div>
          ) : error ? (
            <div className="text-center py-24 text-gray-500 rounded-[2rem] border border-dashed border-gray-200 bg-white shadow-xl">
              <BookOpen className="w-24 h-24 mx-auto mb-8 opacity-50" />
              <h3 className="text-2xl font-bold mb-4">We could not load courses right now</h3>
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.slice(0, 6).map(course => (
                <article key={course.id} className="metric-card group p-8 overflow-hidden relative">
                  <div className="absolute inset-x-8 top-8 h-40 rounded-[2rem] bg-gradient-to-r from-sky-200/40 via-emerald-200/30 to-cyan-100/40 blur-2xl" />
                  <div className="relative w-full h-48 bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-teal-500/10 rounded-3xl mb-6 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent text-3xl font-black text-white shadow-lg">
                      {course.title[0].toUpperCase()}
                    </div>
                  </div>
                  <div className="relative">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3">{course.description}</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 mb-1">Duration</p>
                      <p className="font-bold text-gray-900">{course.duration || 'Self-paced'}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 mb-1">Price</p>
                      <p className="font-bold text-emerald-600">₹{course.price || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
                      <Layers3 className="w-4 h-4 text-primary" />
                      {getCourseStats(course).modulesCount || 1} modules
                    </div>
                    <button
                      type="button"
                      onClick={() => openCoursePreview(course)}
                      className="primary-cta px-5 py-3 whitespace-nowrap"
                    >
                      View Course <Play className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8 drop-shadow-2xl">Ready to Transform?</h2>
          <p className="text-2xl mb-12 max-w-2xl mx-auto opacity-90 leading-relaxed">
            Click Start LMS Learning and begin your journey with 5K+ students
          </p>
          <Link 
            to="/#lms-courses" 
            className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-5 px-10 rounded-3xl text-lg hover:shadow-2xl hover:-translate-y-2 transition-all shadow-xl group"
          >
            Start LMS Learning Now <GraduationCap className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <button
              type="button"
              onClick={closeCoursePreview}
              className="absolute right-5 top-5 z-10 rounded-full bg-white/90 p-3 text-gray-700 shadow-lg transition hover:bg-slate-100"
              aria-label="Close course preview"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="bg-gradient-to-br from-slate-950 via-sky-900 to-emerald-800 p-8 text-white lg:p-10">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                      <Sparkles className="h-3.5 w-3.5" />
                      Course Preview
                    </p>
                    <h3 className="text-3xl font-black leading-tight">{selectedCourse.title}</h3>
                  </div>
                </div>

                <p className="max-w-xl text-base leading-7 text-white/80">{selectedCourse.description}</p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-white/10 p-4">
                    <Clock3 className="mb-3 h-5 w-5 text-cyan-200" />
                    <p className="text-xs uppercase tracking-[0.16em] text-white/60">Duration</p>
                    <p className="mt-1 font-bold">{selectedCourse.duration || 'Self-paced'}</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-4">
                    <Layers3 className="mb-3 h-5 w-5 text-emerald-200" />
                    <p className="text-xs uppercase tracking-[0.16em] text-white/60">Modules</p>
                    <p className="mt-1 font-bold">{getCourseStats(selectedCourse).modulesCount || 1}</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-4">
                    <BookOpen className="mb-3 h-5 w-5 text-sky-200" />
                    <p className="text-xs uppercase tracking-[0.16em] text-white/60">Lessons</p>
                    <p className="mt-1 font-bold">{getCourseStats(selectedCourse).lessonsCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 lg:p-10">
                <div className="mb-8 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Enroll</p>
                    <h4 className="mt-2 text-2xl font-black text-gray-900">Register and start learning</h4>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Price</p>
                    <p className="text-2xl font-black text-emerald-700">₹{selectedCourse.price || 0}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartCourse(selectedCourse)}
                  disabled={actionLoading === selectedCourse.id}
                  className="mb-8 inline-flex w-full items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-primary to-accent px-6 py-5 text-lg font-black text-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading === selectedCourse.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                  {!user
                    ? 'Register & Start Learning'
                    : enrolledIds.has(selectedCourse.id)
                      ? 'Continue Learning'
                      : 'Enroll & Start Learning'}
                </button>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Inside this course</p>
                    <div className="mt-4 space-y-3">
                      {(selectedCourse.modules && selectedCourse.modules.length > 0 ? selectedCourse.modules : [
                        { id: 'overview', title: 'Course overview', lessons: [] },
                      ]).map((module, index) => (
                        <div key={module.id || index} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{module.title}</p>
                            <p className="text-sm text-gray-500">{module.lessons?.length || 0} lessons</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-gray-500">
                    Selecting the button above will create your learner account if needed, then take you straight into the course workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
