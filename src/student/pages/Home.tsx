import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useEnrollments } from '@/hooks/useEnrollments';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Play, 
  GraduationCap, 
  Users, 
  Award,
  LayoutDashboard 
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import type { Progress } from '@/services/database/types';

type EnrollmentProgress = Progress & {
  completedLessons?: number;
};

const LMSDashboard = () => {
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useCourses();
  const { enrollments, progress, enrollLoading } = useEnrollments();
  const loading = coursesLoading || enrollLoading;

  const enrolledCourses = enrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.courseId);
    const prog = progress[enrollment.courseId] || { percentage: 0, completedLessons: 0, totalLessons: 1 };
    return { enrollment, course, progress: prog };
  }).filter(item => item.course); // Only show with course data

  return (
    <div className="lms-stage">
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
        <section className="lms-panel px-6 py-10 md:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Student Workspace</p>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">LMS Dashboard</h1>
              <p className="text-lg text-gray-600">Welcome back, {user?.doc?.email?.split('@')[0] || 'Learner'}</p>
            </div>
            <Link
              to="/my-courses"
              className="primary-cta px-6 py-4 text-base"
            >
              <BookOpen className="w-5 h-5" />
              View My Courses
            </Link>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-6 mt-10 mb-12">
          <div className="lms-feature-card p-8 bg-gradient-to-br from-indigo-50 to-blue-50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Completed</p>
                <h3 className="font-black text-3xl text-gray-900">{enrolledCourses.filter(c => c.progress.percentage === 100).length}</h3>
              </div>
            </div>
            <p className="text-gray-600">Courses you have fully completed.</p>
          </div>

          <div className="lms-feature-card p-8 bg-gradient-to-br from-purple-50 to-indigo-50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Active</p>
                <h3 className="font-black text-3xl text-gray-900">{enrolledCourses.length}</h3>
              </div>
            </div>
            <p className="text-gray-600">Courses currently in your learning queue.</p>
          </div>

          <div className="lms-feature-card p-8 bg-gradient-to-br from-cyan-50 to-blue-50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Average Progress</p>
                <h3 className="font-black text-3xl text-gray-900">{Math.round(enrolledCourses.reduce((sum, c) => sum + (c.progress.percentage || 0), 0) / Math.max(1, enrolledCourses.length))}%</h3>
              </div>
            </div>
            <p className="text-gray-600">Your average completion rate across courses.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-[2rem] border border-white/70 bg-white/80 py-24 shadow-xl">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mr-4" />
            <span className="text-xl text-gray-600">Loading your dashboard...</span>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center py-24 px-8 bg-white/80 rounded-[2rem] backdrop-blur border border-white/50 shadow-2xl">
            <LayoutDashboard className="w-28 h-28 text-gray-400 mx-auto mb-8" />
            <h2 className="text-4xl font-black text-gray-900 mb-6">Welcome to LMS!</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              No enrolled courses yet. Browse from landing and start your learning journey.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-5 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all"
            >
              <GraduationCap className="w-6 h-6" />
              Browse Courses & Enroll
            </Link>
          </div>
        ) : (
          <>
            {/* Continue Learning Section */}
            <section className="mb-16">
              <div className="flex items-center gap-4 mb-8">
                <BookOpen className="w-8 h-8 text-indigo-600" />
                <h2 className="text-3xl font-black text-gray-900">Continue Learning</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {enrolledCourses.slice(0, 6).map(({ enrollment, course, progress }) => (
                  <Link 
                    key={enrollment.id} 
                    to={`/course/${enrollment.courseId}`}
                    className="lms-orb-card group p-8 overflow-hidden"
                  >
                    <div className="w-full h-40 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl mb-6 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent text-3xl font-black text-white shadow-lg">
                        {course?.title?.[0]}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {course?.title}
                    </h3>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 text-lg">Progress</span>
                        <span className="text-sm font-bold text-emerald-600">
                          {Math.round(progress.percentage || 0)}% 
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all shadow-sm"
                          style={{ width: `${progress.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {progress.percentage === 100 ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-blue-500" />
                            In Progress
                          </>
                        )}
                      </div>
                      <div className="font-bold text-indigo-600 group-hover:text-indigo-700">
                        Continue <Play className="w-4 h-4 inline ml-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Quick Stats */}
            <section className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="lms-panel p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  Learning Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Lessons Completed:</span>
                    <span className="font-bold text-gray-900">
                      {enrolledCourses.reduce(
                        (sum, currentCourse) => sum + ((currentCourse.progress as EnrollmentProgress).completedLessons || 0),
                        0,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificates Earned:</span>
                    <span className="font-bold text-emerald-600">{enrolledCourses.filter(c => c.progress.percentage === 100).length}</span>
                  </div>
                </div>
              </div>
              
              <div className="lms-feature-card p-8 bg-gradient-to-br from-emerald-50 to-cyan-50">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recommendations</h3>
                <p className="text-gray-600 mb-6">Courses similar to your progress (coming soon)</p>
                <Link to="/" className="text-primary hover:text-blue-700 font-semibold flex items-center gap-2">
                  Browse More Courses <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </section>

            {enrolledCourses.length > 6 && (
              <div className="text-center">
                <Link 
                  to="/my-courses"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-5 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all"
                >
                  <BookOpen className="w-6 h-6" />
                  View All Courses
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LMSDashboard;
