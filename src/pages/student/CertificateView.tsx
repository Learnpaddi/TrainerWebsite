import { ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useEnrollments } from '@/hooks/useEnrollments';
import { canGenerateCertificateForCourse } from '@/services/firebase/examUtils';

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

const buildCertificateNumber = (userId: string, courseId: string) =>
  `LP-${courseId.slice(0, 6).toUpperCase()}-${userId.slice(0, 6).toUpperCase()}`;

const CertificateViewPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useCourses();
  const { progress, enrollLoading } = useEnrollments();
  const certificateRef = useRef<HTMLDivElement | null>(null);

  const certificateData = useMemo(() => {
    if (!courseId || !user) return null;
    const course = courses.find((item) => item.id === courseId);
    const courseProgress = progress[courseId];
    if (!course || !canGenerateCertificateForCourse(course, courseProgress)) {
      return null;
    }

    return {
      course,
      courseProgress,
      studentName: user.doc?.name || user.displayName || user.email || 'LearnPaddi Student',
      studentEmail: user.email || user.doc?.email || '',
      issueDate: formatDate(courseProgress?.examSubmittedAt),
      certificateNumber: buildCertificateNumber(user.uid, courseId),
    };
  }, [courseId, courses, progress, user]);

  const handleExportPdf = () => {
    if (!certificateRef.current || !certificateData) return;

    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (!printWindow) return;

    const printableHtml = `
      <html>
        <head>
          <title>${certificateData.course.title} Certificate</title>
          <style>
            body {
              margin: 0;
              font-family: Georgia, "Times New Roman", serif;
              background: #f8fafc;
              color: #0f172a;
            }
            .page {
              padding: 32px;
            }
            .certificate {
              border: 12px solid #0f172a;
              background:
                radial-gradient(circle at top right, rgba(37, 99, 235, 0.10), transparent 28%),
                radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.10), transparent 30%),
                #fff;
              padding: 56px;
              min-height: 700px;
              box-sizing: border-box;
            }
            .eyebrow {
              text-transform: uppercase;
              letter-spacing: 0.28em;
              font-size: 12px;
              color: #475569;
              text-align: center;
            }
            .title {
              text-align: center;
              font-size: 54px;
              font-weight: 700;
              margin: 18px 0 8px;
            }
            .subtitle {
              text-align: center;
              font-size: 20px;
              color: #334155;
              margin: 0 0 34px;
            }
            .name {
              text-align: center;
              font-size: 42px;
              font-weight: 700;
              margin: 22px 0;
            }
            .course {
              text-align: center;
              font-size: 28px;
              font-weight: 700;
              color: #2563eb;
              margin-top: 18px;
            }
            .meta {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 18px;
              margin-top: 52px;
            }
            .meta-card {
              border: 1px solid #cbd5e1;
              border-radius: 18px;
              padding: 18px;
              background: rgba(248, 250, 252, 0.95);
            }
            .meta-label {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.18em;
              color: #64748b;
            }
            .meta-value {
              margin-top: 10px;
              font-size: 20px;
              font-weight: 700;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: end;
              gap: 24px;
              margin-top: 58px;
            }
            .signature {
              border-top: 2px solid #0f172a;
              padding-top: 12px;
              min-width: 220px;
              font-size: 14px;
              color: #334155;
            }
            @media print {
              body {
                background: #fff;
              }
              .page {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            ${certificateRef.current.outerHTML}
          </div>
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printableHtml);
    printWindow.document.close();
  };

  if (coursesLoading || enrollLoading) {
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
          <p className="mt-2 text-sm text-slate-600">View the earned certificate and export it in PDF format.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/student/certificates" className="secondary-cta px-4 py-3 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <button type="button" onClick={handleExportPdf} className="primary-cta px-4 py-3 text-sm">
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </section>

      <div
        ref={certificateRef}
        className="rounded-[2rem] border-[12px] border-slate-900 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.10),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_30%),white] p-8 shadow-sm lg:p-14"
      >
        <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">LearnPaddi Certification</p>
        <h2 className="mt-4 text-center text-4xl font-black text-slate-950 lg:text-6xl">Certificate of Achievement</h2>
        <p className="mt-4 text-center text-lg text-slate-700">This certifies that</p>

        <div className="mt-6 text-center">
          <p className="text-3xl font-black text-slate-950 lg:text-5xl">{certificateData.studentName}</p>
          <p className="mt-3 text-sm text-slate-500">{certificateData.studentEmail}</p>
        </div>

        <p className="mx-auto mt-8 max-w-4xl text-center text-lg leading-8 text-slate-700">
          has successfully completed the course requirements and passed the final examination for
        </p>

        <p className="mt-6 text-center text-2xl font-black text-blue-700 lg:text-4xl">
          {certificateData.course.title}
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Exam Score</p>
            <p className="mt-3 text-2xl font-black text-slate-950">{certificateData.courseProgress.examPercentage}%</p>
          </article>
          <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Issued On</p>
            <p className="mt-3 text-2xl font-black text-slate-950">{certificateData.issueDate}</p>
          </article>
          <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Certificate No</p>
            <p className="mt-3 text-xl font-black text-slate-950">{certificateData.certificateNumber}</p>
          </article>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-slate-200 pt-8 md:flex-row md:items-end md:justify-between">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
            Verified after passing the final exam
          </div>
          <div className="min-w-[220px] border-t-2 border-slate-900 pt-3 text-sm text-slate-600">
            LearnPaddi Academic Office
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateViewPage;
