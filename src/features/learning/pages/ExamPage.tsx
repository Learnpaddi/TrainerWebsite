import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { startExam, submitExam } from '@/features/learning/api/learningApi';
import { FeatureShell } from '@/features/learning/components/FeatureShell';
import type { ExamPayload } from '@/features/learning/types';

function formatRemainingTime(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function ExamPage() {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamPayload | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    passed: boolean;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await startExam(courseId);
        setExam(response.exam);
        setRemainingSeconds(response.exam.timeLimitMinutes * 60);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to start the exam.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [courseId]);

  useEffect(() => {
    if (!exam || result || remainingSeconds <= 0) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => current - 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [exam, remainingSeconds, result]);

  const answerCount = useMemo(() => Object.keys(answers).length, [answers]);

  const handleSubmit = async () => {
    if (!exam) return;

    if (answerCount !== exam.questions.length) {
      setError('Please answer every question before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await submitExam(
        courseId,
        exam.questions.map((_, index) => answers[index]),
      );
      setResult(response.result);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit exam.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (remainingSeconds === 0 && exam && !result && !submitting) {
      void handleSubmit();
    }
  }, [exam, remainingSeconds, result, submitting]);

  return (
    <FeatureShell
      title={exam?.courseTitle || 'Timed Exam'}
      subtitle="A protected MCQ assessment with timer support and server-side score calculation."
    >
      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading || !exam ? (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading exam...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-5">
            {exam.questions.map((question, questionIndex) => (
              <article key={question.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Question {questionIndex + 1}</p>
                <h2 className="mt-3 text-xl font-black text-slate-950">{question.prompt}</h2>
                <div className="mt-5 space-y-3">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[questionIndex] === optionIndex;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))}
                        className={`w-full rounded-2xl border px-4 py-4 text-left text-sm font-medium transition ${
                          selected
                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </section>

          <aside className="space-y-6">
            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Exam summary</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{exam.title}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Timer</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{formatRemainingTime(remainingSeconds)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Answered</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{answerCount}/{exam.questions.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Passing score</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{exam.passingScore}%</p>
                </div>
              </div>

              {result ? (
                <div className={`mt-5 rounded-2xl border px-5 py-4 text-sm font-medium ${result.passed ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                  Score: {result.score}% • {result.correctAnswers}/{result.totalQuestions} correct • {result.passed ? 'Passed' : 'Please try again'}
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3">
                <button type="button" onClick={handleSubmit} disabled={submitting || Boolean(result)} className="primary-cta w-full px-5 py-3 text-sm disabled:opacity-70">
                  {submitting ? 'Submitting...' : result ? 'Submitted' : 'Submit Exam'}
                </button>
                <button type="button" onClick={() => navigate(`/learn/course/${courseId}`)} className="secondary-cta w-full px-5 py-3 text-sm">
                  Back to Course
                </button>
              </div>
            </article>
          </aside>
        </div>
      )}
    </FeatureShell>
  );
}
