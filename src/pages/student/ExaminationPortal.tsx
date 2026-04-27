import { AlertTriangle, CheckCircle2, ClipboardList, Expand, Eye, ShieldAlert, TimerReset, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSecureExamSession } from '@/features/exam/useSecureExamSession';
import { loadRazorpayScript } from '@/features/learning/lib/loadRazorpay';
import {
  createExamOrder,
  loadStoredActiveExamAttempt,
  startCourseExam,
  storeActiveExamAttempt,
  submitCourseExamAttempt,
  subscribeToExamDashboard,
  verifyExamPayment,
  type ActiveExamAttempt,
  type ExamDashboardItem,
  type SubmittedExamResult,
} from '@/services/firebase/examService';

const ExaminationPortal = () => {
  const { user } = useAuth();
  const examContainerRef = useRef<HTMLDivElement | null>(null);
  const restoredSessionRef = useRef(false);
  const [items, setItems] = useState<ExamDashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAttempt, setActiveAttempt] = useState<ActiveExamAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [violations, setViolations] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [lastResult, setLastResult] = useState<SubmittedExamResult | null>(null);
  const [fullscreenWarning, setFullscreenWarning] = useState('');
  const [pageError, setPageError] = useState<string | null>(null);
  const [workingCourseId, setWorkingCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      restoredSessionRef.current = false;
      return;
    }

    restoredSessionRef.current = false;
    const restored = loadStoredActiveExamAttempt(user.uid);
    if (restored) {
      setActiveAttempt(restored.attempt);
      setAnswers(restored.answers);
      setViolations(restored.violations);
    }
    restoredSessionRef.current = true;

    const unsubscribe = subscribeToExamDashboard(
      user.uid,
      (nextItems) => {
        setItems(nextItems);
        setLoading(false);
      },
      (error) => {
        setPageError(error.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!restoredSessionRef.current) {
      return;
    }

    storeActiveExamAttempt(
      user.uid,
      activeAttempt ? { attempt: activeAttempt, answers, violations } : null,
    );
  }, [activeAttempt, answers, user, violations]);

  useEffect(() => {
    if (!activeAttempt) {
      setCountdown('');
      return;
    }

    const tick = () => {
      const remainingMs = new Date(activeAttempt.expiresAt).getTime() - Date.now();
      const safeSeconds = Math.max(Math.floor(remainingMs / 1000), 0);
      const minutes = Math.floor(safeSeconds / 60);
      const seconds = safeSeconds % 60;
      setCountdown(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);

      if (safeSeconds === 0 && !submitting) {
        void handleSubmit('time_limit', true);
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [activeAttempt, submitting]);

  const eligibleItems = useMemo(() => items.filter((item) => item.completed), [items]);

  const requestExamFullscreen = async () => {
    if (!examContainerRef.current || document.fullscreenElement) {
      return;
    }

    try {
      await examContainerRef.current.requestFullscreen();
      setFullscreenWarning('');
    } catch {
      setFullscreenWarning('Fullscreen is required. Please enable it before continuing.');
    }
  };

  const closeActiveAttempt = async () => {
    setActiveAttempt(null);
    setAnswers({});
    setActiveQuestionIndex(0);
    setViolations(0);
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
    }
  };

  const handleViolation = (reason: string) => {
    setFullscreenWarning(reason);
    setViolations((current) => {
      const nextValue = current + 1;
      if (activeAttempt && nextValue >= activeAttempt.warningLimit && !submitting) {
        void handleSubmit('violation_limit', true, nextValue);
      }
      return nextValue;
    });
  };

  useSecureExamSession({
    active: Boolean(activeAttempt),
    onViolation: handleViolation,
  });

  const handleStartExam = async (item: ExamDashboardItem) => {
    setWorkingCourseId(item.courseId);
    setPageError(null);
    setLastResult(null);

    try {
      const exam = await startCourseExam(item.courseId);
      setActiveAttempt(exam);
      setAnswers({});
      setViolations(0);
      setActiveQuestionIndex(0);
      window.setTimeout(() => {
        void requestExamFullscreen();
      }, 0);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to submit exam right now.');
    } finally {
      setWorkingCourseId(null);
    }
  };

  const handleSubmit = async (
    submissionReason: 'manual' | 'time_limit' | 'violation_limit' = 'manual',
    autoSubmitted = false,
    forcedViolationCount?: number,
  ) => {
    if (!activeAttempt) {
      return;
    }

    setPageError(null);
    if (submissionReason === 'manual') {
      const unanswered = activeAttempt.questions.some((question) => answers[question.id] === undefined);
      if (unanswered) {
        setPageError('Please answer every question before submitting the exam.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const result = await submitCourseExamAttempt({
        courseId: activeAttempt.courseId,
        attemptId: activeAttempt.attemptId,
        answers,
        violationCount: forcedViolationCount ?? violations,
        submissionReason,
        autoSubmitted,
      });
      setLastResult(result);
      await closeActiveAttempt();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to submit the exam.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (item: ExamDashboardItem) => {
    setWorkingCourseId(item.courseId);
    setPageError(null);
    try {
      const orderResponse = await createExamOrder(item.courseId);

      if (orderResponse.provider === 'already_paid' || !orderResponse.order || !orderResponse.keyId) {
        return;
      }

      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay checkout.');
      }

      const checkout = new window.Razorpay({
        key: orderResponse.keyId,
        order_id: orderResponse.order.id,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: 'LearnPaddi',
        description: `${item.courseTitle} exam payment`,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          await verifyExamPayment({
            courseId: item.courseId,
            ...response,
          });
        },
        theme: {
          color: '#0f6efb',
        },
      });

      checkout.open();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to process exam payment.');
    } finally {
      setWorkingCourseId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Student Assessments</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Examination Portal</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Completed enrollments appear here in real time. Free courses unlock exams immediately, paid courses require successful payment first, and certificates are issued only after a verified pass.
        </p>
      </section>

      {pageError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {pageError}
        </div>
      ) : null}

      {lastResult ? (
        <section className={`rounded-[1.75rem] border p-6 shadow-sm lg:p-8 ${lastResult.passed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Latest Result</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                {lastResult.passed ? 'Exam passed successfully' : 'Exam submitted'}
              </h2>
              <p className="mt-2 text-sm text-slate-700">
                Score {lastResult.score}% • {lastResult.correctAnswers}/{lastResult.totalQuestions} correct
                {lastResult.autoSubmitted ? ' • Auto-submitted by policy enforcement' : ''}
              </p>
            </div>
            {lastResult.certificateUrl ? (
              <a href={lastResult.certificateUrl} target="_blank" rel="noreferrer" className="secondary-cta px-4 py-3 text-sm">
                <Eye className="h-4 w-4" />
                Open Certificate
              </a>
            ) : null}
          </div>
          {lastResult.answerReview?.length ? (
            <div className="mt-5 grid gap-3">
              {lastResult.answerReview.map((item, index) => (
                <article key={item.questionId} className="rounded-2xl border border-white/70 bg-white/70 p-4 text-sm">
                  <p className="font-bold text-slate-900">{index + 1}. {item.prompt}</p>
                  <p className={`mt-2 font-semibold ${item.isCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
                    Your answer: {item.selectedAnswer || 'Not answered'}
                  </p>
                  {!item.isCorrect ? (
                    <p className="mt-1 text-slate-700">Correct answer: {item.correctAnswer}</p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {activeAttempt ? (
        <section ref={examContainerRef} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Secure Exam Session</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{activeAttempt.examTitle}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {activeAttempt.questions.length} questions • Pass mark {activeAttempt.passingScore}% • Randomized per attempt
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Timer</p>
                <p className="mt-2 flex items-center gap-2 text-2xl font-black text-slate-950">
                  <TimerReset className="h-5 w-5 text-blue-600" />
                  {countdown}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Violations</p>
                <p className="mt-2 flex items-center gap-2 text-2xl font-black text-slate-950">
                  <ShieldAlert className="h-5 w-5 text-amber-600" />
                  {violations}/{activeAttempt.warningLimit}
                </p>
              </div>
              <button type="button" onClick={() => void requestExamFullscreen()} className="secondary-cta px-4 py-3 text-sm">
                <Expand className="h-4 w-4" />
                Enter Fullscreen
              </button>
            </div>
          </div>

          {fullscreenWarning ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              {fullscreenWarning}
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Question {activeQuestionIndex + 1} of {activeAttempt.questions.length}
                </p>
                <h3 className="mt-3 text-2xl font-black text-slate-950">
                  {activeAttempt.questions[activeQuestionIndex]?.prompt}
                </h3>
                <div className="mt-5 space-y-3">
                  {activeAttempt.questions[activeQuestionIndex]?.options.map((option, optionIndex) => {
                    const selected = answers[activeAttempt.questions[activeQuestionIndex].id] === optionIndex;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAnswers((current) => ({
                          ...current,
                          [activeAttempt.questions[activeQuestionIndex].id]: optionIndex,
                        }))}
                        className={`w-full rounded-2xl border px-4 py-4 text-left text-sm font-medium transition ${
                          selected
                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </article>
            </div>

            <aside className="space-y-5">
              <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Navigation</p>
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {activeAttempt.questions.map((question, index) => {
                    const answered = answers[question.id] !== undefined;
                    const selected = index === activeQuestionIndex;
                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => setActiveQuestionIndex(index)}
                        className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                          selected
                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                            : answered
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </article>

              <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Rules</p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p>Tab switches, fullscreen exits, copy, paste, right-click, and inspect shortcuts count as violations.</p>
                  <p>Three violations trigger automatic submission.</p>
                  <p>You get one attempt unless LearnPaddi support explicitly unlocks another attempt.</p>
                </div>
              </article>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => void handleSubmit('manual', false)}
                  disabled={submitting}
                  className="primary-cta px-5 py-3 text-sm disabled:opacity-70"
                >
                  <ClipboardList className="h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </button>
                <button type="button" onClick={() => void closeActiveAttempt()} className="secondary-cta px-5 py-3 text-sm">
                  Close Session
                </button>
              </div>
            </aside>
          </div>
        </section>
      ) : null}

      <section className="grid gap-5">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading examination portal...</div>
        ) : eligibleItems.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <ClipboardList className="mx-auto h-14 w-14 text-slate-400" />
            <h2 className="mt-4 text-2xl font-black text-slate-900">No completed courses available for exams</h2>
            <p className="mt-2 text-sm text-slate-600">
              Finish a course fully first. The exam becomes visible here as soon as the enrollment is marked complete.
            </p>
          </div>
        ) : (
          eligibleItems.map((item) => {
            const paymentRequired = item.price > 0;
            const paymentComplete = item.paymentStatus === 'success';
            const canStart = !paymentRequired || paymentComplete;

            return (
              <article key={item.courseId} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Course Exam</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">{item.courseTitle}</h2>
                    <p className="mt-3 text-sm text-slate-600">
                      {item.questionCount} questions • {item.duration} minutes • Pass mark {item.passingScore}%
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">Completed</span>
                      <span className={`rounded-full px-3 py-2 text-sm font-semibold ${paymentRequired ? (paymentComplete ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700') : 'bg-slate-100 text-slate-700'}`}>
                        {paymentRequired ? (paymentComplete ? 'Payment confirmed' : 'Payment pending') : 'Free course'}
                      </span>
                      {typeof item.score === 'number' ? (
                        <span className={`rounded-full px-3 py-2 text-sm font-semibold ${item.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          Latest score: {item.score}%
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Certification rule: the student receives a signed PDF certificate only after passing this exam and backend validation completes.
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {!canStart ? (
                      <button
                        type="button"
                        onClick={() => void handlePayment(item)}
                        disabled={workingCourseId === item.courseId}
                        className="primary-cta px-4 py-3 text-sm disabled:opacity-70"
                      >
                        {workingCourseId === item.courseId ? 'Opening payment...' : 'Pay Now'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleStartExam(item)}
                        disabled={workingCourseId === item.courseId || item.examAttempted && !item.adminRetakeAllowed}
                        className="primary-cta px-4 py-3 text-sm disabled:opacity-70"
                      >
                        <ClipboardList className="h-4 w-4" />
                        {item.examAttempted && !item.adminRetakeAllowed ? 'Attempt Locked' : 'Start Exam'}
                      </button>
                    )}

                    {item.certificateId ? (
                      <Link to={`/student/certificates/${item.courseId}`} className="secondary-cta px-4 py-3 text-sm">
                        <Eye className="h-4 w-4" />
                        View Certificate
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div className={`mt-5 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
                  item.passed
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : typeof item.score === 'number'
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}>
                  {item.passed ? <CheckCircle2 className="h-4 w-4" /> : typeof item.score === 'number' ? <XCircle className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                  {item.passed
                    ? 'Exam passed. Certification is now available.'
                    : typeof item.score === 'number'
                      ? 'This exam has already been submitted. Contact support if an admin-approved retake is needed.'
                      : canStart
                        ? 'Exam ready. Start when you are prepared.'
                        : 'Payment is required before this exam can start.'}
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
