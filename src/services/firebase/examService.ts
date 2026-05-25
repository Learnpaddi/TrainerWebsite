import { httpsCallable } from 'firebase/functions';
import type { ProctoringEvent } from '@/features/exam/useFaceProctoring';
import { auth, functions, firebaseConfig } from '@/services/firebase/config';

type Unsubscribe = () => void;

interface StoredExamSession {
  attempt: ActiveExamAttempt;
  answers: Record<string, number>;
  violations: number;
}

export interface ExamQuestionView {
  id: string;
  prompt: string;
  options: string[];
}

export interface ExamDashboardItem {
  enrollmentId: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  price: number;
  completed: boolean;
  progress: number;
  paymentStatus: 'pending' | 'success' | 'not_required';
  examAttempted: boolean;
  passed: boolean;
  score: number | null;
  certificateUrl: string | null;
  certificateId: string | null;
  examAvailable: boolean;
  examTitle: string;
  duration: number;
  passingScore: number;
  questionCount: number;
  adminRetakeAllowed: boolean;
}

export interface ActiveExamAttempt {
  attemptId: string;
  courseId: string;
  courseTitle: string;
  examTitle: string;
  durationMinutes: number;
  passingScore: number;
  expiresAt: string;
  warningLimit: number;
  questions: ExamQuestionView[];
}

export interface SubmittedExamResult {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  attemptedAt: string;
  autoSubmitted: boolean;
  certificateId: string | null;
  certificateUrl: string | null;
  answerReview?: SubmittedExamAnswerReviewItem[];
}

export interface SubmittedExamAnswerReviewItem {
  questionId: string;
  prompt: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface CertificateRecord {
  id: string;
  certificateId: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  userName: string;
  score: number;
  completionDate: string;
  certificateUrl: string;
  verificationUrl?: string;
  issuedAt?: string;
}

export interface VerifiedCertificateRecord extends CertificateRecord {
  valid: boolean;
}

interface SubmitCourseExamResponse {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  attemptedAt: string;
  autoSubmitted: boolean;
  certificateId: string | null;
  certificateUrl: string | null;
  answerReview?: SubmittedExamAnswerReviewItem[];
}

interface CreateExamOrderResponse {
  provider: 'razorpay' | 'already_paid';
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  } | null;
  keyId: string | null;
}

interface VerifyCertificateResponse {
  certificate: VerifiedCertificateRecord | null;
}

const submitCourseExamCallable = httpsCallable<{
  courseId: string;
  attemptId: string;
  answers: Record<string, number>;
  violationCount: number;
  submissionReason: 'manual' | 'time_limit' | 'violation_limit' | 'exam_portal_exit';
  autoSubmitted: boolean;
  proctoringEvents?: ProctoringEvent[];
}, SubmitCourseExamResponse>(functions, 'submitCourseExamAttempt');
const createExamOrderCallable = httpsCallable<{ courseId: string }, CreateExamOrderResponse>(functions, 'createExamOrder');
const verifyExamPaymentCallable = httpsCallable<{
  courseId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}, { paymentStatus: 'success' }>(functions, 'verifyExamPayment');
const verifyCertificateCallable = httpsCallable<{ certificateId: string }, VerifyCertificateResponse>(functions, 'verifyCertificate');
const listExamDashboardCallable = httpsCallable<Record<string, never>, { items: ExamDashboardItem[] }>(functions, 'listExamDashboard');
const listCertificatesCallable = httpsCallable<Record<string, never>, { certificates: CertificateRecord[] }>(functions, 'listCertificates');
const completeCourseForExamCallable = httpsCallable<{
  courseId: string;
  progress: number;
}, {
  enrollment: {
    userId: string;
    courseId: string;
    progress: number;
    completed: boolean;
    paymentStatus: string;
    updatedAt: string;
  };
}>(functions, 'completeCourseForExam');
const ACTIVE_ATTEMPT_STORAGE_KEY = 'learnpaddi-active-exam-attempt';

export function subscribeToExamDashboard(
  _userId: string,
  onValue: (items: ExamDashboardItem[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  let active = true;

  const load = async () => {
    try {
      const response = await listExamDashboardCallable({});
      if (active) {
        onValue(response.data.items);
      }
    } catch (error) {
      if (active && error instanceof Error && onError) {
        onError(error);
      }
    }
  };

  void load();
  const intervalId = window.setInterval(() => {
    void load();
  }, 10000);

  return () => {
    active = false;
    window.clearInterval(intervalId);
  };
}

export function loadStoredActiveExamAttempt(userId: string): StoredExamSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(ACTIVE_ATTEMPT_STORAGE_KEY) || 'null') as (StoredExamSession & { userId?: string }) | null;
    if (!parsed?.attempt || parsed.userId !== userId) {
      return null;
    }

    if (new Date(parsed.attempt.expiresAt).getTime() <= Date.now()) {
      window.localStorage.removeItem(ACTIVE_ATTEMPT_STORAGE_KEY);
      return null;
    }

    return {
      attempt: parsed.attempt,
      answers: parsed.answers || {},
      violations: parsed.violations || 0,
    };
  } catch {
    window.localStorage.removeItem(ACTIVE_ATTEMPT_STORAGE_KEY);
    return null;
  }
}

export function storeActiveExamAttempt(userId: string, session: StoredExamSession | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(ACTIVE_ATTEMPT_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(ACTIVE_ATTEMPT_STORAGE_KEY, JSON.stringify({
    userId,
    ...session,
  }));
}

export function subscribeToCertificates(
  _userId: string,
  onValue: (items: CertificateRecord[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  let active = true;

  const load = async () => {
    try {
      const response = await listCertificatesCallable({});
      if (active) {
        onValue(response.data.certificates);
      }
    } catch (error) {
      if (active && error instanceof Error && onError) {
        onError(error);
      }
    }
  };

  void load();
  const intervalId = window.setInterval(() => {
    void load();
  }, 10000);

  return () => {
    active = false;
    window.clearInterval(intervalId);
  };
}

export async function markEnrollmentCompleted(userId: string, courseId: string, progress = 100) {
  void userId;
  await completeCourseForExamCallable({ courseId, progress });
}

export async function startCourseExam(courseId: string): Promise<ActiveExamAttempt> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to start an exam.');
  }

  const token = await user.getIdToken();
  const functionsBaseUrl = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net`;
  const response = await fetch(`${functionsBaseUrl}/startCourseExam`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ courseId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
    throw new Error(errorData.error || 'Unable to start exam. Please try again.');
  }

  const data: ActiveExamAttempt = await response.json();
  return data;
}

export async function submitCourseExamAttempt(payload: {
  courseId: string;
  attemptId: string;
  answers: Record<string, number>;
  violationCount: number;
  submissionReason: 'manual' | 'time_limit' | 'violation_limit' | 'exam_portal_exit';
  autoSubmitted: boolean;
  proctoringEvents?: ProctoringEvent[];
}): Promise<SubmittedExamResult> {
  const response = await submitCourseExamCallable(payload);
  return response.data;
}

export async function createExamOrder(courseId: string) {
  const response = await createExamOrderCallable({ courseId });
  return response.data;
}

export async function verifyExamPayment(payload: {
  courseId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const response = await verifyExamPaymentCallable(payload);
  return response.data;
}

export async function verifyCertificateById(certificateId: string): Promise<VerifiedCertificateRecord | null> {
  const response = await verifyCertificateCallable({ certificateId });
  return response.data.certificate;
}
