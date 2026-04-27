import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions, firebaseConfig } from '@/services/firebase/config';

export interface ExamCatalogItem {
  id: string;
  courseId: string;
  duration: number;
  passingScore: number;
  questions: ExamQuestionCatalogItem[];
}

interface ExamQuestionCatalogItem {
  id: string;
  question?: string;
  prompt?: string;
  options: string[];
  correctAnswer?: string;
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
  submissionReason: 'manual' | 'time_limit' | 'violation_limit';
  autoSubmitted: boolean;
}, SubmitCourseExamResponse>(functions, 'submitCourseExamAttempt');
const createExamOrderCallable = httpsCallable<{ courseId: string }, CreateExamOrderResponse>(functions, 'createExamOrder');
const verifyExamPaymentCallable = httpsCallable<{
  courseId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}, { paymentStatus: 'success' }>(functions, 'verifyExamPayment');
const verifyCertificateCallable = httpsCallable<{ certificateId: string }, VerifyCertificateResponse>(functions, 'verifyCertificate');

const mapExamDoc = (courseId: string, raw: Record<string, unknown> | undefined): ExamCatalogItem | null => {
  if (!raw) {
    return null;
  }

  const questions = Array.isArray(raw.questions) ? raw.questions : [];
  return {
    id: typeof raw.examId === 'string' ? raw.examId : courseId,
    courseId,
    duration: typeof raw.duration === 'number' ? raw.duration : 0,
    passingScore: typeof raw.passingScore === 'number' ? raw.passingScore : 0,
    questions: questions
      .map((question, index) => {
        if (!question || typeof question !== 'object') {
          return null;
        }
        const record = question as Record<string, unknown>;
        const normalizedQuestion: ExamQuestionCatalogItem = {
          id: typeof record.id === 'string' ? record.id : `question-${index + 1}`,
          question: typeof record.question === 'string' ? record.question : undefined,
          prompt: typeof record.prompt === 'string' ? record.prompt : undefined,
          options: Array.isArray(record.options)
            ? record.options.filter((option): option is string => typeof option === 'string')
            : [],
          correctAnswer: typeof record.correctAnswer === 'string' ? record.correctAnswer : undefined,
        };
        return normalizedQuestion;
      })
      .filter((question): question is ExamQuestionCatalogItem => Boolean(question)),
  };
};

const getExamDocForCourse = async (courseId: string): Promise<ExamCatalogItem | null> => {
  const courseSnapshot = await getDoc(doc(db, 'courses', courseId));
  if (courseSnapshot.exists()) {
    const courseData = courseSnapshot.data() as Record<string, unknown>;
    const embeddedExam = courseData.exam;
    if (embeddedExam && typeof embeddedExam === 'object') {
      const mappedEmbeddedExam = mapExamDoc(courseId, embeddedExam as Record<string, unknown>);
      if (mappedEmbeddedExam?.questions.length) {
        return mappedEmbeddedExam;
      }
    }
  }

  const directExamSnapshot = await getDoc(doc(db, 'exams', courseId));
  if (directExamSnapshot.exists()) {
    return mapExamDoc(courseId, directExamSnapshot.data() as Record<string, unknown>);
  }

  const examQuery = query(collection(db, 'exams'), where('courseId', '==', courseId));
  const examSnapshot = await getDocs(examQuery);
  if (examSnapshot.empty) {
    return null;
  }

  return mapExamDoc(courseId, examSnapshot.docs[0].data() as Record<string, unknown>);
};

const isEnrollmentCompleted = (rawEnrollment: Record<string, unknown>) => (
  rawEnrollment.completed === true
  || rawEnrollment.status === 'completed'
  || (typeof rawEnrollment.progress === 'number' && rawEnrollment.progress >= 100)
);

const buildDashboardItem = async (
  enrollmentId: string,
  rawEnrollment: Record<string, unknown>,
): Promise<ExamDashboardItem | null> => {
  const courseId = typeof rawEnrollment.courseId === 'string' ? rawEnrollment.courseId : '';
  if (!courseId) {
    return null;
  }

  const [courseSnapshot, exam] = await Promise.all([
    getDoc(doc(db, 'courses', courseId)),
    getExamDocForCourse(courseId),
  ]);

  if (!courseSnapshot.exists()) {
    return null;
  }

  const course = courseSnapshot.data() as Record<string, unknown>;
  const courseExam = course.exam && typeof course.exam === 'object'
    ? (course.exam as Record<string, unknown>)
    : null;
  const examAvailable = Boolean(exam?.questions.length)
    || Boolean(Array.isArray(courseExam?.questions) && courseExam.questions.length);
  const completed = isEnrollmentCompleted(rawEnrollment);

  return {
    enrollmentId,
    userId: typeof rawEnrollment.userId === 'string' ? rawEnrollment.userId : '',
    courseId,
    courseTitle: typeof course.title === 'string' ? course.title : 'Course',
    price: typeof course.price === 'number' ? course.price : 0,
    completed,
    progress: typeof rawEnrollment.progress === 'number' ? rawEnrollment.progress : 0,
    paymentStatus: rawEnrollment.paymentStatus === 'success'
      ? 'success'
      : rawEnrollment.paymentStatus === 'pending'
        ? 'pending'
        : 'not_required',
    examAttempted: Boolean(rawEnrollment.examAttempted),
    passed: Boolean(rawEnrollment.passed),
    score: typeof rawEnrollment.score === 'number' ? rawEnrollment.score : null,
    certificateUrl: typeof rawEnrollment.certificateUrl === 'string' ? rawEnrollment.certificateUrl : null,
    certificateId: typeof rawEnrollment.certificateId === 'string' ? rawEnrollment.certificateId : null,
    examAvailable,
    examTitle: typeof course.title === 'string' ? `${course.title} Final Exam` : 'Final Exam',
    duration: exam?.duration || 0,
    passingScore: exam?.passingScore || 0,
    questionCount: exam?.questions.length || 0,
    adminRetakeAllowed: Boolean(rawEnrollment.adminRetakeAllowed),
  };
};

export function subscribeToExamDashboard(
  userId: string,
  onValue: (items: ExamDashboardItem[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const enrollmentsQuery = query(collection(db, 'enrollments'), where('userId', '==', userId));

  return onSnapshot(
    enrollmentsQuery,
    async (snapshot) => {
      try {
        const items = await Promise.all(
          snapshot.docs
            .filter((enrollmentDoc) => isEnrollmentCompleted(enrollmentDoc.data() as Record<string, unknown>))
            .map((enrollmentDoc) => buildDashboardItem(enrollmentDoc.id, enrollmentDoc.data() as Record<string, unknown>)),
        );

        const visibleItems = items
          .filter((item): item is ExamDashboardItem => Boolean(item))
          .filter((item) => item.examAvailable)
          .sort((left, right) => left.courseTitle.localeCompare(right.courseTitle));

        onValue(visibleItems);
      } catch (subscriptionError) {
        if (subscriptionError instanceof Error && onError) {
          onError(subscriptionError);
        }
      }
    },
    (snapshotError) => {
      if (onError) {
        onError(snapshotError);
      }
    },
  );
}

export function subscribeToCertificates(
  userId: string,
  onValue: (items: CertificateRecord[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const certificatesQuery = query(collection(db, 'certificates'), where('userId', '==', userId));

  return onSnapshot(
    certificatesQuery,
    (snapshot) => {
      const items = snapshot.docs
        .map((certificateDoc) => {
          const data = certificateDoc.data() as Record<string, unknown>;
          if (typeof data.certificateUrl !== 'string' || typeof data.certificateId !== 'string') {
            return null;
          }

          const item: CertificateRecord = {
            id: certificateDoc.id,
            certificateId: data.certificateId,
            userId: typeof data.userId === 'string' ? data.userId : userId,
            courseId: typeof data.courseId === 'string' ? data.courseId : '',
            courseTitle: typeof data.courseTitle === 'string' ? data.courseTitle : 'Course',
            userName: typeof data.userName === 'string' ? data.userName : 'Learner',
            score: typeof data.score === 'number' ? data.score : 0,
            completionDate: typeof data.completionDate === 'string' ? data.completionDate : '',
            certificateUrl: data.certificateUrl,
            verificationUrl: typeof data.verificationUrl === 'string' ? data.verificationUrl : undefined,
            issuedAt: typeof data.issuedAt === 'string' ? data.issuedAt : undefined,
          };
          return item;
        })
        .filter((item): item is CertificateRecord => Boolean(item))
        .sort((left, right) => right.completionDate.localeCompare(left.completionDate));

      onValue(items);
    },
    (snapshotError) => {
      if (onError) {
        onError(snapshotError);
      }
    },
  );
}

export async function markEnrollmentCompleted(userId: string, courseId: string, progress = 100) {
  const enrollmentId = `${userId}_${courseId}`;
  await setDoc(
    doc(db, 'enrollments', enrollmentId),
    {
      userId,
      courseId,
      progress,
      completed: progress >= 100,
      completedAt: progress >= 100 ? new Date().toISOString() : null,
      paymentStatus: 'not_required',
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
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
  submissionReason: 'manual' | 'time_limit' | 'violation_limit';
  autoSubmitted: boolean;
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
