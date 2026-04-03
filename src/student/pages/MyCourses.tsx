import { useAuth } from '@/hooks/useAuth';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useCourses } from '@/hooks/useCourses';
import { Link } from 'react-router-dom';
import { Loader2, BookOpen, Clock, CheckCircle, Play } from 'lucide-react';

const MyCourses = () => {
  const { user } = useAuth();
  const { enrollments, progress, enrollLoading } = useEnrollments();
  const { courses, loading: coursesLoading } = useCourses();
  const loading = enrollLoading || coursesLoading;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center p-8">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h1>
          <Link to="/login" className="text-blue-600 hover:underline">Go to login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
        <span>Loading your courses...</span>
      </div>
    );
  }

  const enrolledCourses = enrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.courseId);
    const prog = progress[enrollment.courseId] || { percentage: 0 };
    return { enrollment, course, progress: prog };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            My Learning
          </h2>
          <p className="text-lg text-gray-600">
            Continue your enrolled courses and track your progress
          </p>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-32 bg-white/50 rounded-3xl backdrop-blur-sm border border-white/30 shadow-2xl">
            <BookOpen className="w-24 h-24 text-gray-400 mx-auto mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No enrolled courses yet</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Browse courses and start your learning journey today.
            </p>
            <Link 
              to="/courses" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              Browse Courses
              <Play className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8">
            {enrolledCourses.map(({ enrollment, course, progress }) => (
              <div key={enrollment.id} className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all border border-white/50 hover:border-blue-200">
                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
                  {/* Course Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {course?.title?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {course?.title || 'Course Title'}
                        </h3>
                        <p className="text-sm text-gray-500">Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-8 line-clamp-3 pr-4">
                      {course?.description}
                    </p>

                    {/* Progress */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">Progress</span>
                        <span className="text-sm font-medium text-emerald-600">
                          {Math.round(progress.percentage || 0)}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all"
                          style={{ width: `${progress.percentage || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 text-sm">
                      {progress.percentage === 100 ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <span className="font-semibold text-emerald-600">Completed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5 text-blue-500" />
                          <span className="font-semibold text-blue-600">In Progress</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/course/${enrollment.courseId}`}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3 whitespace-nowrap"
                  >
                    <Play className="w-5 h-5" />
                    Continue Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;

