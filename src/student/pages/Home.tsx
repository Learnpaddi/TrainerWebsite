import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button'; // Placeholder - add shadcn later
import { Plus, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user, isStudent, isTrainer } = useAuth();
  const { courses, loading } = useCourses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero */}
      <section className="relative py-24 px-6 max-w-7xl mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
            Fueling Today's Mind
            <span className="block text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text">for Tomorrow's Success</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover expert-led courses. Track progress. Earn certificates. Transform your career.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/courses" className="group bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all max-w-sm w-full text-center">
              <span className="flex items-center justify-center gap-3">
                Browse Courses <GraduationCap className="w-5 h-5 group-hover:translate-x-1" />
              </span>
            </Link>
            {user && (
            <Link to="/my-courses" className="px-12 py-6 text-xl font-bold text-gray-700 bg-white/80 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:text-blue-600 hover:shadow-xl transition-all max-w-sm w-full text-center">
                My Learning <Plus className="w-5 h-5 ml-1" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Featured Courses ({courses.length})
            </h2>
            {user ? (
              <p className="text-xl text-gray-600">Continue learning or enroll in new courses</p>
            ) : (
              <p className="text-xl text-gray-600">Sign up free to access all courses</p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-24">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-24 text-gray-500">
              <GraduationCap className="w-24 h-24 mx-auto mb-8 opacity-50" />
              <h3 className="text-2xl font-bold mb-4">No courses available</h3>
              <p>Be the first trainer to create courses</p>
              {isTrainer && (
                <Link to="/admin/courses" className="mt-8 inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl">
                  Create First Course
                </Link>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.slice(0, 6).map(course => (
                <div key={course.id} className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all border border-gray-100 hover:border-blue-200 overflow-hidden">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="text-4xl opacity-50">{course.title[0].toUpperCase()}</div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-emerald-600">
                      ₹{course.price || 'Free'}
                    </div>
                    <Link to={`/course/${course.id}`} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                      View Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8 drop-shadow-2xl">Ready to Start?</h2>
          <p className="text-2xl mb-12 max-w-2xl mx-auto opacity-90 leading-relaxed">
            Join 5K+ students transforming careers with LearnPaddi
          </p>
          {!user ? (
            <div className="space-x-4">
              <Link to="/register" className="inline-block bg-white text-gray-900 font-bold py-6 px-12 rounded-3xl text-xl hover:shadow-2xl hover:-translate-y-2 transition-all shadow-xl">
                Get Started Free
              </Link>
              <Link to="/login" className="inline-block border-2 border-white font-bold py-6 px-12 rounded-3xl text-xl hover:bg-white hover:text-gray-900 transition-all">
                Sign In
              </Link>
            </div>
          ) : (
            <Link to="/my-courses" className="inline-block bg-emerald-500 text-white font-bold py-6 px-12 rounded-3xl text-xl hover:shadow-2xl hover:-translate-y-2 transition-all">
              Continue Learning
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

