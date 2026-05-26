import {
  createPaymentOrder,
  getMyEnrollments,
  startExam,
  submitExam,
  verifyPayment,
} from '@/features/learning/api/learningApi';

export interface ExamQuestionView {
  id: string;
  prompt: string;
  options: string[];
}

export interface ExamDashboardItem {
  courseId: string;
  courseTitle: string;
  completed: boolean;
  price: number;
  paymentStatus: string;
  questionCount: number;
  duration: number;
  passingScore: number;
  examAttempted?: boolean;
  adminRetakeAllowed?: boolean;
  score?: number;
  passed?: boolean;
  certificateId?: string;
}

export interface ActiveExamAttempt {
  attemptId: string;
  courseId: string;
  courseTitle: string;
  examTitle: string;
  expiresAt: string;
  warningLimit: number;
  passingScore: number;
  questions: ExamQuestionView[];
}

export interface SubmittedExamAnswerReviewItem {
  questionId: string;
  prompt: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface SubmittedExamResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  autoSubmitted?: boolean;
  certificateUrl?: string;
  answerReview?: SubmittedExamAnswerReviewItem[];
}

export interface CertificateRecord {
  id: string;
  certificateId: string;
  userId: string;
  courseId: string;
  userName: string;
  courseTitle: string;
  score: number;
  completionDate: string;
  certificateUrl: string;
  issuedAt: string;
}

export interface VerifiedCertificateRecord extends CertificateRecord {
  verified: boolean;
}

interface StoredExamSession {
  attempt: ActiveExamAttempt;
  answers: Record<string, number>;
  violations: number;
}

const activeAttemptKey = (userId: string) => `learnpaddi-active-exam-${userId}`;
const certificatesKey = 'learnpaddi-demo-exam-certificates';

const readCertificates = (): CertificateRecord[] => {
  const raw = window.localStorage.getItem(certificatesKey);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CertificateRecord[];
  } catch {
    return [];
  }
};

export function subscribeToExamDashboard(
  _userId: string,
  onNext: (items: ExamDashboardItem[]) => void,
  onError?: (error: Error) => void,
) {
  getMyEnrollments()
    .then(({ enrollments }) => {
      onNext(enrollments.map((enrollment) => ({
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        completed: enrollment.completed,
        price: enrollment.course.price,
        paymentStatus: enrollment.paymentStatus,
        questionCount: enrollment.course.exam?.questionCount || 0,
        duration: enrollment.course.exam?.timeLimitMinutes || 0,
        passingScore: enrollment.course.exam?.passingScore || 70,
        examAttempted: Boolean(enrollment.examResult),
        score: enrollment.examResult?.score,
        passed: enrollment.examResult?.passed,
        certificateId: undefined,
      })));
    })
    .catch((error) => onError?.(error instanceof Error ? error : new Error('Unable to load exams.')));

  return () => {};
}

export function loadStoredActiveExamAttempt(userId: string): StoredExamSession | null {
  const raw = window.localStorage.getItem(activeAttemptKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredExamSession;
  } catch {
    return null;
  }
}

export function storeActiveExamAttempt(userId: string, session: StoredExamSession | null) {
  if (!session) {
    window.localStorage.removeItem(activeAttemptKey(userId));
    return;
  }
  window.localStorage.setItem(activeAttemptKey(userId), JSON.stringify(session));
}

export function subscribeToCertificates(
  userId: string,
  onNext: (items: CertificateRecord[]) => void,
) {
  onNext(readCertificates().filter((certificate) => certificate.userId === userId));
  return () => {};
}

export async function markEnrollmentCompleted(_userId: string, _courseId: string, _progress = 100) {
  void _userId;
  void _courseId;
  void _progress;
}

export async function startCourseExam(courseId: string): Promise<ActiveExamAttempt> {
  const { exam } = await startExam(courseId);
  const now = Date.now();
  return {
    attemptId: `${courseId}-${now}`,
    courseId,
    courseTitle: exam.courseTitle,
    examTitle: exam.title,
    expiresAt: new Date(now + exam.timeLimitMinutes * 60 * 1000).toISOString(),
    warningLimit: 3,
    passingScore: exam.passingScore,
    questions: exam.questions,
  };
}

export async function submitCourseExamAttempt(payload: {
  courseId: string;
  answers: Record<string, number>;
  attemptId?: string;
  submissionReason?: string;
  proctoringEvents?: unknown[];
  violationCount?: number;
  autoSubmitted?: boolean;
}) {
  const orderedAnswers = Object.values(payload.answers);
  const { result } = await submitExam(payload.courseId, orderedAnswers);
  return {
    ...result,
    autoSubmitted: payload.autoSubmitted,
    answerReview: [],
  };
}

export async function createExamOrder(courseId: string) {
  const response = await createPaymentOrder(courseId);
  return {
    ...response,
    provider: response.provider === 'paid' ? 'already_paid' : response.provider,
  } as Omit<typeof response, 'provider'> & { provider: 'mock' | 'razorpay' | 'already_paid' };
}

export async function verifyExamPayment(payload: Record<string, unknown>) {
  return verifyPayment(payload);
}

export async function verifyCertificateById(certificateId: string): Promise<VerifiedCertificateRecord | null> {
  const certificate = readCertificates().find((item) => item.certificateId === certificateId);
  return certificate ? { ...certificate, verified: true } : null;
}
