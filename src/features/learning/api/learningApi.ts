import { apiRequest } from '@/features/learning/api/client';
import type {
  CourseSummary,
  EnrollmentSnapshot,
  EnrollmentWithCourse,
  ExamPayload,
  LearningUser,
} from '@/features/learning/types';

export async function registerLearningUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return apiRequest<{ token: string; user: LearningUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export async function loginLearningUser(payload: {
  email: string;
  password: string;
}) {
  return apiRequest<{ token: string; user: LearningUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export async function getLearningMe() {
  return apiRequest<{ user: LearningUser }>('/auth/me');
}

export async function getCourses() {
  return apiRequest<{ courses: CourseSummary[] }>('/courses', { skipAuth: true });
}

export async function getCourse(courseId: string) {
  return apiRequest<{
    course: CourseSummary;
    enrollment: EnrollmentSnapshot | null;
    examAccess: { allowed: boolean; reason: string; message: string };
  }>(`/course/${courseId}`);
}

export async function getMyEnrollments() {
  return apiRequest<{ enrollments: EnrollmentWithCourse[] }>('/me/enrollments');
}

export async function enrollInCourse(courseId: string) {
  return apiRequest<{ enrollment: EnrollmentSnapshot }>('/enroll', {
    method: 'POST',
    body: JSON.stringify({ courseId }),
  });
}

export async function completeCourse(courseId: string, progress = 100) {
  return apiRequest<{ enrollment: EnrollmentSnapshot }>('/complete-course', {
    method: 'POST',
    body: JSON.stringify({ courseId, progress }),
  });
}

export async function createPaymentOrder(courseId: string) {
  return apiRequest<{
    provider: 'mock' | 'razorpay' | 'paid';
    keyId: string | null;
    order: {
      id: string;
      amount: number;
      currency: string;
      receipt: string;
    } | null;
  }>('/create-order', {
    method: 'POST',
    body: JSON.stringify({ courseId }),
  });
}

export async function verifyPayment(payload: Record<string, unknown>) {
  return apiRequest<{ paymentStatus: string }>('/verify-payment', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function canAccessExam(courseId: string) {
  return apiRequest<{ canAccessExam: boolean; reason: string; message: string }>(
    `/can-access-exam?courseId=${encodeURIComponent(courseId)}`,
  );
}

export async function startExam(courseId: string) {
  return apiRequest<{ exam: ExamPayload }>(`/exam/${courseId}`);
}

export async function submitExam(courseId: string, answers: number[]) {
  return apiRequest<{
    result: {
      score: number;
      correctAnswers: number;
      totalQuestions: number;
      passed: boolean;
      attemptedAt: string;
    };
  }>(`/exam/${courseId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}
