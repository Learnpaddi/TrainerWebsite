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

const LMSDashboard = () => {
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useCourses();
  const { enrollments, progress, enrollLoading } = useEnrollments();
  const loading = coursesLoading || enrollLoading;

  if (!user) {
    return null; // Protected by route
  }

  const enrolledCourses = enrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.courseId);
    const prog = progress[enrollment.courseId] || { percentage: 0, completedLessons: 0, totalLessons: 1 };
    return { enrollment, course, progress: prog };
  }).filter(item => item.course); // Only show with course data

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">LMS Dashboard</h1>
          <p className="text-xl text-gray-600">Welcome back, {user?.doc?.email?.split('@')[0] || 'Learner'}</p>
        </div>
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/70 backdrop-blur rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-900">{enrolledCourses.filter(c => c.progress.percentage === 100).length}</h3>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-900">
                  {enrolledCourses.length}
                </h3>
                <p className="text-gray-600">Active Courses</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-gray-900">{enrolledCourses.reduce((sum, c) => sum + (c.progress.percentage || 0), 0) / Math.max(1, enrolledCourses.length)}%</h3>
                <p className="text-gray-600">Avg Progress</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mr-4" />
            <span className="text-xl text-gray-600">Loading your dashboard...</span>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center py-32 bg-white/50 rounded-4xl backdrop-blur border border-white/30 shadow-2xl">
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
                    className="group bg-white/70 backdrop-blur rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all border border-white/50 hover:border-indigo-200 overflow-hidden"
                  >
                    <div className="w-full h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <div className="text-4xl opacity-75 font-bold text-white">{course?.title?.[0]}</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
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
              <div className="bg-white/70 backdrop-blur rounded-3xl p-8 shadow-xl border border-white/50">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  Learning Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Lessons Completed:</span>
(c.progress as any).completedLessons || 0
                  </div>
                  <div className="flex justify-between">
                    <span>Certificates Earned:</span>
                    <span className="font-bold text-emerald-600">{enrolledCourses.filter(c => c.progress.percentage === 100).length}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur rounded-3xl p-8 shadow-xl border border-indigo-200/50">
                <h3 className="text-xl font-bold text-indigo-900 mb-6">Recommendations</h3>
                <p className="text-indigo-800 mb-6">Courses similar to your progress (coming soon)</p>
                <Link to="/" className="text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-2">
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

