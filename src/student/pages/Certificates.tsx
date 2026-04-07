import { Award, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useEnrollments } from '@/hooks/useEnrollments';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/services/firebase/config';
import { useState } from 'react';

const Certificates = () => {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { progress, refetch } = useEnrollments();
  const [generating, setGenerating] = useState<string | null>(null);

  const completed = Object.entries(progress)
    .filter(([, value]) => (value.percentage || 0) >= 100)
    .map(([courseId, value]) => ({
      courseId,
      progress: value,
      course: courses.find((course) => course.id === courseId),
    }));

  const onGenerate = async (courseId: string) => {
    setGenerating(courseId);
    try {
      const generateCertificate = httpsCallable(functions, 'generateCertificate');
      await generateCertificate({ courseId });
      await refetch();
    } catch (error) {
      console.error('Certificate generation failed', error);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
      <section className="section-shell p-8 md:p-10 mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold mb-2">Achievement</p>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Certificates</h1>
        <p className="text-muted">Download certificates for completed courses.</p>
      </section>

      {completed.length === 0 ? (
        <section className="metric-card p-12 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No certificates yet</h2>
          <p className="text-muted">Complete a course to unlock your certificate.</p>
        </section>
      ) : (
        <section className="grid md:grid-cols-2 gap-6">
          {completed.map((item) => (
            <article key={item.courseId} className="metric-card p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.course?.title || 'Course'}</h3>
              <p className="text-muted mb-6">Completed by {user?.email}</p>
              {item.progress.certificateUrl ? (
                <a
                  href={item.progress.certificateUrl}
                  className="primary-cta px-6 py-3"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download className="w-4 h-4" />
                  Download Certificate
                </a>
              ) : (
                <button
                  onClick={() => onGenerate(item.courseId)}
                  disabled={generating === item.courseId}
                  className="primary-cta px-6 py-3 disabled:opacity-70"
                >
                  <Award className="w-4 h-4" />
                  {generating === item.courseId ? 'Generating...' : 'Generate Certificate'}
                </button>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default Certificates;
