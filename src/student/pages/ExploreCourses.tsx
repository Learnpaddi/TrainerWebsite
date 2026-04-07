import { Link } from 'react-router-dom';
import { BookOpen, Loader2, Play, Sparkles } from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';
import { useEnrollments } from '@/hooks/useEnrollments';

const ExploreCourses = () => {
  const { courses, loading } = useCourses();
  const { enrollments, enrollInCourse } = useEnrollments();

  const enrolledIds = new Set(enrollments.map((enrollment) => enrollment.courseId));

  if (loading) {
    return (
      <div className="section-shell p-10 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
        <span className="text-gray-700 font-medium">Loading courses...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
      <section className="section-shell p-8 md:p-10 mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] font-semibold text-primary mb-2">Explore</p>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Discover Courses</h1>
            <p className="text-muted">Browse curated programs and enroll instantly.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 font-semibold">
            <Sparkles className="w-4 h-4" />
            {courses.length} courses available
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {courses.map((course) => {
          const enrolled = enrolledIds.has(course.id);
          return (
            <article key={course.id} className="metric-card p-8">
              <div className="w-full h-44 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-black text-2xl flex items-center justify-center shadow-lg">
                  {(course.title || 'C')[0].toUpperCase()}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">{course.title}</h2>
              <p className="text-muted mb-4 line-clamp-3">{course.description}</p>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xl font-bold text-emerald-600">₹{course.price || 0}</span>
                <span className="text-sm text-gray-500">{course.duration || 'Self-paced'}</span>
              </div>
              <div className="flex gap-3">
                {enrolled ? (
                  <Link to={`/course/${course.id}`} className="primary-cta flex-1 py-3">
                    Continue <Play className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    onClick={() => enrollInCourse(course.id, course.price || 0)}
                    className="primary-cta flex-1 py-3"
                  >
                    Enroll Now
                  </button>
                )}
                <Link to={`/course/${course.id}`} className="secondary-cta px-4 py-3">
                  <BookOpen className="w-4 h-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default ExploreCourses;
