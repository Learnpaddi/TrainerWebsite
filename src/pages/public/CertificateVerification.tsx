import { useEffect, useState, type FormEvent } from 'react';
import { ShieldCheck, ShieldX, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/shared/layouts/MainLayout';
import { verifyCertificateById, type VerifiedCertificateRecord } from '@/services/database/examService';

const formatDate = (value?: string) => {
  if (!value) {
    return 'Not available';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function CertificateVerificationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [certificateId, setCertificateId] = useState(searchParams.get('code') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifiedCertificateRecord | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      return;
    }

    const verify = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await verifyCertificateById(code);
        if (!response) {
          setError('Certificate not found. Please check the ID and try again.');
          setResult(null);
          return;
        }
        setResult(response);
      } catch (verificationError) {
        setError(verificationError instanceof Error ? verificationError.message : 'Unable to verify this certificate.');
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    void verify();
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = certificateId.trim().toUpperCase();
    if (!trimmed) {
      setError('Enter a certificate ID to continue.');
      return;
    }

    setSearchParams({ code: trimmed });
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Certificate Verification</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">Verify a LearnPaddi certificate</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Enter the certificate ID printed on the PDF to confirm the learner, course, score, and issue date.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 md:flex-row">
            <input
              value={certificateId}
              onChange={(event) => setCertificateId(event.target.value.toUpperCase())}
              placeholder="LP-ABC12345"
              className="h-14 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-medium uppercase tracking-[0.12em] text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            <button type="submit" className="primary-cta h-14 px-6 text-sm">
              <Search className="h-4 w-4" />
              Verify
            </button>
          </form>
        </section>

        {loading ? (
          <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
            Verifying certificate...
          </section>
        ) : null}

        {error ? (
          <section className="mt-6 rounded-[2rem] border border-red-200 bg-red-50 p-8 shadow-sm">
            <div className="flex items-center gap-3 text-red-700">
              <ShieldX className="h-5 w-5" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          </section>
        ) : null}

        {result ? (
          <section className="mt-6 rounded-[2rem] border border-emerald-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  Verified Certificate
                </div>
                <h2 className="mt-4 text-3xl font-black text-slate-950">{result.courseTitle}</h2>
                <p className="mt-2 text-sm text-slate-600">Certificate ID: {result.certificateId}</p>
              </div>
              <a href={result.certificateUrl} target="_blank" rel="noreferrer" className="secondary-cta px-4 py-3 text-sm">
                Open PDF
              </a>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Learner</p>
                <p className="mt-3 text-xl font-black text-slate-950">{result.userName}</p>
              </article>
              <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Score</p>
                <p className="mt-3 text-xl font-black text-slate-950">{result.score}%</p>
              </article>
              <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Completion Date</p>
                <p className="mt-3 text-xl font-black text-slate-950">{formatDate(result.completionDate)}</p>
              </article>
              <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Issued</p>
                <p className="mt-3 text-xl font-black text-slate-950">{formatDate(result.issuedAt)}</p>
              </article>
            </div>
          </section>
        ) : null}
      </div>
    </MainLayout>
  );
}
