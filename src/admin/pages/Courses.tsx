import { useTrainerCourses } from '@/hooks/useTrainerCourses';
import { Loader2 } from 'lucide-react';

const CoursesPage = () => {
  const { courses, loading } = useTrainerCourses();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Loading courses...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-xl text-gray-600">Manage all your courses and lessons</p>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-32 h-32 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl text-gray-400">📚</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No courses yet</h2>
          <p className="text-gray-600 mb-8">Create your first course from the dashboard</p>
          <a href="/admin/dashboard" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl hover:shadow-xl transition-all">
            Go to Dashboard
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">{course.title}</h3>
                </div>
              </div>
              <div className="p-8">
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between mb-6">
                  <span className="px-4 py-1 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-full">
                    ${course.price}
                  </span>
                  <span className="text-sm text-gray-500">{course.duration}</span>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all">
                    Manage Lessons
                  </button>
                  <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;

