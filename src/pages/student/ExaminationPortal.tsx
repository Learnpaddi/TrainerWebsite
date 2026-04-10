import { CheckCircle2, Circle, ClipboardList, Eye, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useEnrollments } from '@/hooks/useEnrollments';
import { canAccessCourseExam, canGenerateCertificateForCourse, hasPassedCourseExam } from '@/services/firebase/examUtils';
import { submitCourseExam } from '@/services/firebase/progressService';
import type { Course } from '@/services/firebase/courseService';

const ExaminationPortal = () => {
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useCourses();
  const { enrollments, progress, enrollLoading, refetch } = useEnrollments();
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittingCourseId, setSubmittingCourseId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const eligibleCourses = useMemo(() => enrollments
    .map((enrollment) => {
      const course = courses.find((item) => item.id === enrollment.courseId);
      const courseProgress = progress[enrollment.courseId];
      return course ? { course, courseProgress } : null;
    })
    .filter(Boolean)
    .filter((entry): entry is { course: Course; courseProgress: typeof progress[string] } => Boolean(entry && canAccessCourseExam(entry.course, entry.courseProgress))),
  [courses, enrollments, progress]);

  const activeCourse = activeCourseId ? eligibleCourses.find((entry) => entry.course.id === activeCourseId)?.course || null : null;
  const loading = coursesLoading || enrollLoading;

  const openExam = (course: Course) => {
    setPageError(null);
    setActiveCourseId(course.id);
    setAnswers({});
  };

  const handleSubmitExam = async () => {
    if (!user || !activeCourse) return;
    setPageError(null);

    const questions = activeCourse.exam?.questions || [];
    const unanswered = questions.some((question) => !answers[question.id]);
    if (unanswered) {
      setPageError('Please answer every question before submitting the exam.');
      return;
    }

    setSubmittingCourseId(activeCourse.id);
    try {
      await submitCourseExam({
        userId: user.uid,
        course: activeCourse,
        answers,
      });
      await refetch();
      setActiveCourseId(null);
      setAnswers({});
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to submit exam right now.');
    } finally {
      setSubmittingCourseId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Student Assessments</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Examination Portal</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          When a student completes a course, that course exam appears here. Review the exam details, click Write Exam, and pass at least 75% of the questions to obtain certification.
        </p>
      </section>

      {pageError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {pageError}
        </div>
      ) : null}

      {activeCourse ? (
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Live Exam</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{activeCourse.exam?.title || `${activeCourse.title} Examination`}</h2>
              <p className="mt-2 text-sm text-slate-600">{activeCourse.exam?.questions.length || 0} questions • Pass mark {activeCourse.exam?.passPercentage || 75}%</p>
            </div>
            <button type="button" onClick={() => setActiveCourseId(null)} className="secondary-cta px-4 py-3 text-sm">
              Close Exam
            </button>
          </div>

          <div className="mt-6 space-y-5">
            {(activeCourse.exam?.questions || []).map((question, index) => (
              <article key={question.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-black text-slate-900">Question {index + 1}</h3>
                <p className="mt-2 text-sm font-medium text-slate-700">{question.question}</p>
                <div className="mt-4 space-y-3">
                  {question.options.map((option) => {
                    const selected = answers[question.id] === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                          selected
                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {selected ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        {option}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmitExam}
            disabled={submittingCourseId === activeCourse.id}
            className="primary-cta mt-6 px-6 py-3 text-sm disabled:opacity-70"
          >
            <ClipboardList className="h-4 w-4" />
            {submittingCourseId === activeCourse.id ? 'Submitting...' : 'Submit Exam'}
          </button>
        </section>
      ) : null}

      <section className="grid gap-5">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading examination portal...</div>
        ) : eligibleCourses.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <ClipboardList className="mx-auto h-14 w-14 text-slate-400" />
            <h2 className="mt-4 text-2xl font-black text-slate-900">No exams available yet</h2>
            <p className="mt-2 text-sm text-slate-600">
              Finish a course fully first. Once a trainer has attached an exam, it will appear here.
            </p>
          </div>
        ) : (
          eligibleCourses.map(({ course, courseProgress }) => {
            const certificateReady = canGenerateCertificateForCourse(course, courseProgress);
            const passed = hasPassedCourseExam(courseProgress);

            return (
              <article key={course.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Course Exam</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">{course.title}</h2>
                    <p className="mt-3 text-sm text-slate-600">
                      {course.exam?.title || `${course.title} Examination`} • {course.exam?.questions.length || 0} questions
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">Course completion: {courseProgress?.percentage || 0}%</span>
                      <span className="rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">Pass mark: {course.exam?.passPercentage || 75}%</span>
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Questions asked: {course.exam?.questions.length || 0}</span>
                      {typeof courseProgress?.examPercentage === 'number' ? (
                        <span className={`rounded-full px-3 py-2 text-sm font-semibold ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          Latest score: {courseProgress.examPercentage}%
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Certification rule: the student receives certification only after passing this exam with at least {course.exam?.passPercentage || 75}%.
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => openExam(course)} className="primary-cta px-4 py-3 text-sm">
                      <ClipboardList className="h-4 w-4" />
                      {typeof courseProgress?.examPercentage === 'number' ? 'Write Exam Again' : 'Write Exam'}
                    </button>

                    {certificateReady ? (
                      <Link to={`/student/certificates/${course.id}`} className="secondary-cta px-4 py-3 text-sm">
                        <Eye className="h-4 w-4" />
                        View Certificate
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div className={`mt-5 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
                  passed
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : typeof courseProgress?.examPercentage === 'number'
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}>
                  {passed ? <CheckCircle2 className="h-4 w-4" /> : typeof courseProgress?.examPercentage === 'number' ? <XCircle className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                  {passed
                    ? 'Exam passed. Certification is now available.'
                    : typeof courseProgress?.examPercentage === 'number'
                      ? 'Exam attempted but not passed yet. Retake the exam to reach the qualifying score.'
                      : 'Exam ready. Start when you are prepared.'}
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
};

export default ExaminationPortal;
