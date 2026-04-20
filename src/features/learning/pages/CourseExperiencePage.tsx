import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  canAccessExam,
  completeCourse,
  createPaymentOrder,
  enrollInCourse,
  getCourse,
  verifyPayment,
} from '@/features/learning/api/learningApi';
import { FeatureShell } from '@/features/learning/components/FeatureShell';
import { loadRazorpayScript } from '@/features/learning/lib/loadRazorpay';
import type { CourseSummary, EnrollmentSnapshot } from '@/features/learning/types';

export default function CourseExperiencePage() {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentSnapshot | null>(null);
  const [examState, setExamState] = useState({ canAccessExam: false, reason: '', message: '' });
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');

  const refresh = async () => {
    const [courseResponse, accessResponse] = await Promise.all([getCourse(courseId), canAccessExam(courseId)]);
    setCourse(courseResponse.course);
    setEnrollment(courseResponse.enrollment);
    setExamState(accessResponse);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        await refresh();
      } catch (loadError) {
        setAlertMessage(loadError instanceof Error ? loadError.message : 'Unable to load this course.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [courseId]);

  const handleEnroll = async () => {
    setWorking('enroll');
    setAlertMessage('');

    try {
      const response = await enrollInCourse(courseId);
      setEnrollment(response.enrollment);
      await refresh();
    } catch (enrollError) {
      setAlertMessage(enrollError instanceof Error ? enrollError.message : 'Unable to enroll right now.');
    } finally {
      setWorking('');
    }
  };

  const handleCompleteCourse = async () => {
    setWorking('complete');
    setAlertMessage('');

    try {
      const response = await completeCourse(courseId, 100);
      setEnrollment(response.enrollment);
      await refresh();
    } catch (completeError) {
      setAlertMessage(completeError instanceof Error ? completeError.message : 'Unable to update course completion.');
    } finally {
      setWorking('');
    }
  };

  const handlePayment = async () => {
    if (!course) return;

    setWorking('payment');
    setAlertMessage('');

    try {
      const orderResponse = await createPaymentOrder(courseId);

      if (orderResponse.provider === 'paid') {
        await refresh();
        return;
      }

      if (orderResponse.provider === 'mock') {
        await verifyPayment({
          courseId,
          razorpay_order_id: orderResponse.order?.id,
          razorpay_payment_id: `mock_payment_${Date.now()}`,
          razorpay_signature: 'mock_signature',
          mockSuccess: true,
        });
        await refresh();
        setAlertMessage('Mock payment completed successfully. Exam is now unlocked.');
        return;
      }

      const razorpayReady = await loadRazorpayScript();
      if (!razorpayReady || !orderResponse.order || !orderResponse.keyId) {
        throw new Error('Unable to initialize Razorpay checkout.');
      }

      const RazorpayCheckout = window.Razorpay;
      if (!RazorpayCheckout) {
        throw new Error('Razorpay checkout is unavailable in this browser session.');
      }

      const razorpay = new RazorpayCheckout({
        key: orderResponse.keyId,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: 'LearnPaddi',
        description: course.title,
        order_id: orderResponse.order.id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          await verifyPayment({
            courseId,
            ...response,
          });
          await refresh();
          setAlertMessage('Payment verified successfully. You can start the exam now.');
        },
        theme: {
          color: '#0f6efb',
        },
      });

      razorpay.open();
    } catch (paymentError) {
      setAlertMessage(paymentError instanceof Error ? paymentError.message : 'Unable to complete payment.');
    } finally {
      setWorking('');
    }
  };

  const handleExamAction = () => {
    if (!enrollment?.completed) {
      setAlertMessage('Complete course to unlock exam.');
      return;
    }

    if (course && course.price > 0 && enrollment.paymentStatus !== 'success') {
      setAlertMessage('Payment required to access exam.');
      return;
    }

    navigate(`/learn/exam/${courseId}`);
  };

  const ctaLabel = !enrollment?.completed
    ? 'Take Exam'
    : course?.price === 0
      ? 'Start Exam'
      : enrollment.paymentStatus === 'success'
        ? 'Start Exam'
        : 'Pay to Unlock Exam';

  return (
    <FeatureShell
      title={course?.title || 'Course Experience'}
      subtitle="Enroll the learner, track completion, and enforce the exact exam access rules for free and paid programs."
    >
      {alertMessage ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
          {alertMessage}
        </div>
      ) : null}

      {loading || !course ? (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading course...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${course.price === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {course.price === 0 ? 'Free learning path' : `INR ${course.price}`}
                </span>
                <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                  {course.exam?.title || 'Exam ready'}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{course.description}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Progress</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{enrollment?.progress || 0}%</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Completion</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{enrollment?.completed ? 'Done' : 'In progress'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Payment</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{enrollment?.paymentStatus || 'not enrolled'}</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                  <span>Course progress</span>
                  <span>{enrollment?.progress || 0}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{ width: `${enrollment?.progress || 0}%` }}
                  />
                </div>
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Course content</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">Lesson outline</h2>
                </div>
                {enrollment ? (
                  <button type="button" onClick={handleCompleteCourse} disabled={working === 'complete'} className="primary-cta px-4 py-3 text-sm disabled:opacity-70">
                    {working === 'complete' ? 'Updating...' : 'Mark Course Complete'}
                  </button>
                ) : (
                  <button type="button" onClick={handleEnroll} disabled={working === 'enroll'} className="primary-cta px-4 py-3 text-sm disabled:opacity-70">
                    {working === 'enroll' ? 'Enrolling...' : 'Enroll'}
                  </button>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {course.lessons.map((lesson, index) => (
                  <div key={`${lesson.title}-${index}`} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-sm font-bold text-slate-900">{index + 1}. {lesson.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{lesson.duration}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <aside className="space-y-6">
            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Exam access logic</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{course.exam?.title || 'Final assessment'}</h2>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <p>Completion required: <span className="font-semibold text-slate-900">Yes</span></p>
                <p>Payment required: <span className="font-semibold text-slate-900">{course.price > 0 ? 'Yes, for paid course access' : 'No, this is a free course'}</span></p>
                <p>Timer: <span className="font-semibold text-slate-900">{course.exam?.timeLimitMinutes || 0} minutes</span></p>
                <p>Pass mark: <span className="font-semibold text-slate-900">{course.exam?.passingScore || 0}%</span></p>
              </div>

              <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-medium ${examState.canAccessExam ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                {examState.message}
              </div>

              {enrollment?.examResult ? (
                <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${enrollment.examResult.passed ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                  Latest attempt: {enrollment.examResult.score}% ({enrollment.examResult.correctAnswers}/{enrollment.examResult.totalQuestions})
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={course.price > 0 && enrollment?.completed && enrollment.paymentStatus !== 'success' ? handlePayment : handleExamAction}
                  disabled={!enrollment || working === 'payment'}
                  className="primary-cta w-full px-5 py-3 text-sm disabled:opacity-70"
                >
                  {working === 'payment' ? 'Processing...' : ctaLabel}
                </button>

                {!enrollment?.completed ? (
                  <button type="button" onClick={handleExamAction} className="secondary-cta w-full px-5 py-3 text-sm">
                    Show why exam is locked
                  </button>
                ) : null}
              </div>
            </article>
          </aside>
        </div>
      )}
    </FeatureShell>
  );
}
