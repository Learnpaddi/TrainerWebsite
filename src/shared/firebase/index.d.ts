// TypeScript declarations for shared Firebase
// src/shared/firebase/index.d.ts - For React TS

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
  duration?: string;
  instructor?: string;
  level?: string;
  modules?: Array<{ lessons: string[] }>;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  totalLessons: number;
  completed: boolean;
  quizScore?: number;
}

declare const app: any;
declare const auth: any;
declare const db: any;
declare const storage: any;
declare const ADMIN_EMAIL: string;
declare function isAdmin(email: string): boolean;

// Auth
declare function register(email: string, password: string, name: string): Promise<any>;
declare function login(email: string, password: string): Promise<any>;
declare function googleLogin(): Promise<any>;
declare function logout(): Promise<void>;
declare function resetPassword(email: string): Promise<void>;
declare function onAuthChange(callback: (user: any) => void): () => void;

// Users
declare function setUserDoc(uid: string, data: any): Promise<void>;
declare function getUserDoc(uid: string): Promise<any>;
declare function getUserRole(uid: string): Promise<string>;
declare function getUserEnrollments(userId: string): Promise<Enrollment[]>;
declare function getUserCertificates(userId: string): Promise<any[]>;

// Courses
declare function getCourses(): Promise<Course[]>;
declare function createCourse(courseData: any): Promise<any>;
declare function updateCourse(courseId: string, courseData: any): Promise<void>;
declare function deleteCourse(courseId: string): Promise<void>;
declare function getTotalLessons(courseId: string): Promise<number>;
