import { Award, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useEnrollments } from '@/hooks/useEnrollments';
import { canGenerateCertificateForCourse } from '@/services/firebase/examUtils';

const Certificates = () => {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { progress } = useEnrollments();

  const completed = Object.entries(progress)
    .filter(([courseId, value]) => {
      const course = courses.find((item) => item.id === courseId);
      return canGenerateCertificateForCourse(course, value);
    })
    .map(([courseId, value]) => ({
      courseId,
      progress: value,
      course: courses.find((course) => course.id === courseId),
    }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
      <section className="section-shell p-8 md:p-10 mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold mb-2">Achievement</p>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Certificates</h1>
        <p className="text-muted">Download certificates for courses you completed and passed their exam.</p>
      </section>

      {completed.length === 0 ? (
        <section className="metric-card p-12 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No certificates yet</h2>
          <p className="text-muted">Complete the course and pass the exam to unlock your certificate.</p>
        </section>
      ) : (
        <section className="grid md:grid-cols-2 gap-6">
          {completed.map((item) => (
            <article key={item.courseId} className="metric-card p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.course?.title || 'Course'}</h3>
              <p className="text-muted mb-2">Completed by {user?.email}</p>
              <p className="mb-6 text-sm text-emerald-700">Certification stored after passing the final exam.</p>
              <div className="flex flex-wrap gap-3">
                <Link to={`/student/certificates/${item.courseId}`} className="primary-cta px-6 py-3">
                  <Eye className="w-4 h-4" />
                  View Certificate
                </Link>
                <Link to={`/student/certificates/${item.courseId}`} className="secondary-cta px-6 py-3">
                  <Award className="w-4 h-4" />
                  Open Certificate
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default Certificates;
