import { Award, Download, Eye, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToCertificates, type CertificateRecord } from '@/services/firebase/examService';

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCertificates([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToCertificates(user.uid, (items) => {
      setCertificates(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
      <section className="section-shell p-8 md:p-10 mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold mb-2">Achievement</p>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Certificates</h1>
        <p className="text-muted">Certificates appear here automatically when the backend validates a passing score and finishes PDF generation.</p>
      </section>

      {loading ? (
        <section className="metric-card p-12 text-center text-gray-600">
          Loading certificates...
        </section>
      ) : certificates.length === 0 ? (
        <section className="metric-card p-12 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No certificates yet</h2>
          <p className="text-muted">Complete the course and pass the exam to unlock your certificate.</p>
        </section>
      ) : (
        <section className="grid md:grid-cols-2 gap-6">
          {certificates.map((certificate) => (
            <article key={certificate.id} className="metric-card p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
                Verified certificate
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 mb-2">{certificate.courseTitle}</h3>
              <p className="text-muted mb-2">Issued to {certificate.userName}</p>
              <p className="mb-2 text-sm text-gray-600">Certificate ID: {certificate.certificateId}</p>
              <p className="mb-6 text-sm text-emerald-700">Final score: {certificate.score}%</p>
              <div className="flex flex-wrap gap-3">
                <Link to={`/student/certificates/${certificate.courseId}`} className="primary-cta px-6 py-3">
                  <Eye className="w-4 h-4" />
                  View Certificate
                </Link>
                <a href={certificate.certificateUrl} target="_blank" rel="noreferrer" className="secondary-cta px-6 py-3">
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default Certificates;
