import { ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToCertificates, type CertificateRecord } from '@/services/firebase/examService';

const formatDate = (value?: string) => {
  if (!value) return new Date().toLocaleDateString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toLocaleDateString();
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const CertificateViewPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = subscribeToCertificates(user.uid, (items) => {
      setCertificates(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const isLoading = Boolean(user) && loading;

  const certificateData = useMemo(() => {
    if (!courseId || !user) {
      return null;
    }

    return certificates.find((certificate) => certificate.courseId === courseId) || null;
  }, [certificates, courseId, user]);

  if (isLoading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading certificate...</div>;
  }

  if (!certificateData) {
    return (
      <div className="space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-950">Certificate Not Available</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            This certificate can be viewed only after the student has completed the course and passed the exam.
          </p>
          <Link to="/student/certificates" className="secondary-cta mt-6 inline-flex px-4 py-3 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Certificates
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Certification View</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Certificate</h1>
          <p className="mt-2 text-sm text-slate-600">This page mirrors the backend-generated PDF and links to public verification.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/student/certificates" className="secondary-cta px-4 py-3 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <a href={certificateData.certificateUrl} target="_blank" rel="noreferrer" className="primary-cta px-4 py-3 text-sm">
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        </div>
      </section>

      <div className="rounded-[2rem] border-[12px] border-slate-900 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_30%),white] p-8 shadow-sm lg:p-14">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">LearnPaddi Certification</p>
        <h2 className="mt-4 text-center text-4xl font-black text-slate-950 lg:text-6xl">Certificate of Achievement</h2>
        <p className="mt-4 text-center text-lg text-slate-700">This certifies that</p>

        <div className="mt-6 text-center">
          <p className="text-3xl font-black text-slate-950 lg:text-5xl">{certificateData.userName}</p>
          <p className="mt-3 text-sm text-slate-500">{user?.email || user?.doc?.email || ''}</p>
        </div>

        <p className="mx-auto mt-8 max-w-4xl text-center text-lg leading-8 text-slate-700">
          has successfully completed the course requirements and passed the final examination for
        </p>

        <p className="mt-6 text-center text-2xl font-black text-blue-700 lg:text-4xl">
          {certificateData.courseTitle}
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Exam Score</p>
            <p className="mt-3 text-2xl font-black text-slate-950">{certificateData.score}%</p>
          </article>
          <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Issued On</p>
            <p className="mt-3 text-2xl font-black text-slate-950">{formatDate(certificateData.completionDate)}</p>
          </article>
          <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Certificate No</p>
            <p className="mt-3 text-xl font-black text-slate-950">{certificateData.certificateId}</p>
          </article>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-slate-200 pt-8 md:flex-row md:items-end md:justify-between">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
            Verified after passing the final exam
          </div>
          <Link to={`/verify-certificate?code=${encodeURIComponent(certificateData.certificateId)}`} className="min-w-[220px] border-t-2 border-slate-900 pt-3 text-sm text-slate-600">
            Verify online at LearnPaddi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CertificateViewPage;
