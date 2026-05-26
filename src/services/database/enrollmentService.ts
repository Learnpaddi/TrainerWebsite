import {
  enrollInCourse as enrollInLmsCourse,
  getStudentEnrollments,
  type EnrollmentRecord,
} from '@/services/database/lmsService';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'payment_pending' | 'paid';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentAmount: number;
  progress?: number;
}

const toEnrollment = (enrollment: EnrollmentRecord): Enrollment => ({
  id: enrollment.id,
  userId: enrollment.userId,
  courseId: enrollment.courseId,
  enrolledAt: enrollment.enrolledAt,
  status: enrollment.completed ? 'completed' : 'active',
  paymentAmount: 0,
  progress: enrollment.progress,
});

export const createEnrollment = async (
  userId: string,
  courseId: string,
  amount: number,
  razorpayOrderId?: string,
): Promise<string> => {
  const enrollment = await enrollInCourse(userId, courseId, amount);
  return razorpayOrderId ? `${enrollment.id}_${razorpayOrderId}` : enrollment.id;
};

export const getUserEnrollments = async (userId: string): Promise<Enrollment[]> => (
  (await getStudentEnrollments(userId)).map(toEnrollment)
);

export const getEnrollmentByUserAndCourse = async (
  userId: string,
  courseId: string,
): Promise<Enrollment | null> => {
  const enrollments = await getUserEnrollments(userId);
  return enrollments.find((enrollment) => enrollment.courseId === courseId) || null;
};

export const enrollInCourse = async (
  userId: string,
  courseId: string,
  amount = 0,
): Promise<Enrollment> => {
  const enrollment = await enrollInLmsCourse(userId, courseId);
  return { ...toEnrollment(enrollment), paymentAmount: amount };
};

export const getCourseEnrollments = async (courseId: string): Promise<Enrollment[]> => {
  const raw = window.localStorage.getItem('learnpaddi-demo-enrollments');
  const enrollments = raw ? JSON.parse(raw) as EnrollmentRecord[] : [];
  return enrollments.filter((enrollment) => enrollment.courseId === courseId).map(toEnrollment);
};

export const getEnrollmentById = async (enrollmentId: string): Promise<Enrollment | null> => {
  const raw = window.localStorage.getItem('learnpaddi-demo-enrollments');
  const enrollments = raw ? JSON.parse(raw) as EnrollmentRecord[] : [];
  const enrollment = enrollments.find((item) => item.id === enrollmentId);
  return enrollment ? toEnrollment(enrollment) : null;
};
