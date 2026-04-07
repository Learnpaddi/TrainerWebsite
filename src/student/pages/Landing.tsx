import { useMemo, useState } from 'react';
import { useCourses } from '@/hooks/useCourses';
import { useEnrollments } from '@/hooks/useEnrollments';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock3, GraduationCap, Layers3, Loader2, Play, Plus, Sparkles, X } from 'lucide-react';
import type { Course } from '@/services/firebase/courseService';

const Landing = () => {
  const { courses, loading, error } = useCourses();
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

    setActionLoading(course.id);
    try {
      if (!isEnrolled) {
        await enrollInCourse(course.id, course.price || 0);
      }
      navigate('/lms/student');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="lms-stage">
      {/* Hero */}
      <section className="relative overflow-hidden max-w-7xl mx-auto px-6 pt-10 pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-r from-accent/10 to-emerald-500/10 blur-3xl" />
        </div>
        <div className="lms-panel px-6 py-16 md:px-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="lms-badge px-4 py-2 text-sm shadow-sm mb-6">
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
                to="/auth" 
                className="primary-cta px-10 py-5 text-lg max-w-sm w-full text-center"
              >
                Start LMS Learning <GraduationCap className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/lms/student" 
                className="secondary-cta px-10 py-5 text-lg max-w-sm w-full text-center dark:bg-gray-800/80 dark:border-gray-600 dark:text-gray-200 dark:hover:border-primary dark:hover:bg-gray-700">
                Browse Courses <Plus className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section id="lms-courses" className="py-20 bg-gradient-to-b from-gray-50 to-white scroll-mt-28">
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
              {courses.map(course => (
                <article key={course.id} className="lms-orb-card group p-10 overflow-hidden relative">
                  <div className="relative w-full h-48 rounded-3xl mb-6 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent text-3xl font-black text-white shadow-lg">
                      {course.title[0].toUpperCase()}
                    </div>
                  </div>
                  <div className="relative">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3">{course.description}</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="rounded-2xl bg-gray-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 mb-1">Duration</p>
                      <p className="font-bold text-gray-900">{course.duration || 'Self-paced'}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3">
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
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8 bg-gradient-to-r from-gray-900 to-primary bg-clip-text text-transparent">Ready to Transform?</h2>
          <p className="text-2xl mb-12 max-w-2xl mx-auto text-gray-600 leading-relaxed">
            Click Start LMS Learning and begin your journey with 5K+ students
          </p>
          <Link 
            to="/auth" 
            className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-5 px-10 rounded-3xl text-lg hover:shadow-2xl hover:-translate-y-2 transition-all shadow-xl group"
          >
            Start LMS Learning Now <GraduationCap className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 px-4 pb-6 pt-28 backdrop-blur-sm">
          <div className="relative w-full max-w-6xl max-h-[calc(100vh-8rem)] overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <button
              type="button"
              onClick={closeCoursePreview}
              className="absolute right-5 top-5 z-10 rounded-full bg-white/90 p-3 text-gray-700 shadow-lg transition hover:bg-slate-100"
              aria-label="Close course preview"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid max-h-[calc(100vh-8rem)] overflow-y-auto lg:grid-cols-[1.2fr_0.8fr]">
              <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6 text-gray-900 lg:p-8">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                      Course Preview
                    </p>
                    <h3 className="text-3xl font-black leading-tight">{selectedCourse.title}</h3>
                  </div>
                </div>

                <p className="max-w-xl text-base leading-7 text-gray-600">{selectedCourse.description}</p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-white p-4 shadow-lg">
                    <Clock3 className="mb-3 h-5 w-5 text-primary" />
                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Duration</p>
                    <p className="mt-1 font-bold">{selectedCourse.duration || 'Self-paced'}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-lg">
                    <Layers3 className="mb-3 h-5 w-5 text-emerald-500" />
                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Modules</p>
                    <p className="mt-1 font-bold">{getCourseStats(selectedCourse).modulesCount || 1}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-lg">
                    <BookOpen className="mb-3 h-5 w-5 text-accent" />
                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Lessons</p>
                    <p className="mt-1 font-bold">{getCourseStats(selectedCourse).lessonsCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
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
                  className="mb-6 inline-flex w-full items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-primary to-accent px-6 py-4 text-lg font-black text-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading === selectedCourse.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                  {enrolledIds.has(selectedCourse.id) ? 'Continue Learning' : 'Enter Student LMS'}
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
                    Selecting the button above will take you directly into the student LMS where the full course dashboard is available.
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
