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
  progress?: number; // 0-100
}

export interface Progress {
  id: string;
  userId: string;
  courseId: string;
  currentModule: number;
  currentLesson: number;
  percentage: number;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Extend Course if needed
export interface Course {
  id: string;
  title: string;
  description: string;
  trainerId: string;
  price: number;
  thumbnail?: string;
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
      duration: number;
    }>;
  }>;
  createdAt: string;
}

