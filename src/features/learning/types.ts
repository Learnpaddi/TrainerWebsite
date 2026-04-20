export interface LearningUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface CourseSummary {
  id: string;
  title: string;
  description: string;
  price: number;
  examAvailable: boolean;
  lessons: Array<{
    title: string;
    duration: string;
  }>;
  exam: {
    title: string;
    timeLimitMinutes: number;
    passingScore: number;
    questionCount: number;
  } | null;
}

export interface ExamAccess {
  allowed: boolean;
  reason: string;
  message: string;
}

export interface EnrollmentSnapshot {
  id: string;
  progress: number;
  completed: boolean;
  paymentStatus: 'not_required' | 'pending' | 'success' | 'failed';
  amountPaid: number;
  enrolledAt: string;
  completedAt: string | null;
  examResult: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    passed: boolean;
    attemptedAt: string;
  } | null;
}

export interface EnrollmentWithCourse extends EnrollmentSnapshot {
  course: CourseSummary;
  examAccess: ExamAccess;
}

export interface ExamQuestion {
  id: string;
  prompt: string;
  options: string[];
}

export interface ExamPayload {
  courseId: string;
  courseTitle: string;
  title: string;
  timeLimitMinutes: number;
  passingScore: number;
  questions: ExamQuestion[];
}
