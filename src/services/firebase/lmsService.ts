import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { auth } from '@/services/firebase/config';

export type Role = 'student' | 'trainer';

export interface LessonRecord {
  id: string;
  title: string;
  youtubeUrl: string;
  duration?: string;
  videoUrl?: string;
  summary?: string;
}

export interface CourseModuleRecord {
  id: string;
  title: string;
  lessons: LessonRecord[];
}

export interface CourseRecord {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail: string;
  trainerId: string;
  trainerName: string;
  duration: string;
  studentsCount: number;
  featured?: boolean;
  lessons: LessonRecord[];
  modules: CourseModuleRecord[];
  createdAt: string;
}

export interface EnrollmentRecord {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedLessons: string[];
  currentLessonId?: string;
  completedAt?: string;
  enrolledAt: string;
  status: 'active' | 'completed';
}

export interface ReviewRecord {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CertificateRecord {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  issuedAt: string;
  certificateNumber: string;
}

export interface MarketplaceFilters {
  search?: string;
  category?: string;
}

export interface CreateCourseInput {
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  trainerId?: string;
  lessons: Array<Pick<LessonRecord, 'title' | 'youtubeUrl'>>;
}

type LmsServiceErrorCode = 'course/duplicate-title' | 'course/forbidden' | 'course/unauthenticated';

class LmsServiceError extends Error {
  code: LmsServiceErrorCode;

  constructor(code: LmsServiceErrorCode, message: string) {
    super(message);
    this.name = 'LmsServiceError';
    this.code = code;
  }
}

const STORAGE_KEYS = {
  courses: 'learnpaddi-demo-courses',
  enrollments: 'learnpaddi-demo-enrollments',
  reviews: 'learnpaddi-demo-reviews',
  certificates: 'learnpaddi-demo-certificates',
};

const fallbackCourses: CourseRecord[] = [
  {
    id: 'course-analytics-roi',
    title: 'Analytics & ROI Leadership',
    description: 'Master modern analytics storytelling, ROI modeling, dashboards, and high-trust business decision frameworks.',
    price: 0,
    category: 'Analytics',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    trainerId: 'demo-trainer',
    trainerName: 'Meera Trainer',
    duration: '7h 20m',
    studentsCount: 1842,
    featured: true,
    createdAt: '2026-01-08T09:00:00.000Z',
    modules: [],
    lessons: [
      { id: 'lesson-analytics-1', title: 'Metrics That Matter', youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A' },
      { id: 'lesson-analytics-2', title: 'Building Dashboards for Decisions', youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
      { id: 'lesson-analytics-3', title: 'Turning Analysis into Action', youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A' },
      { id: 'lesson-analytics-4', title: 'ROI Narrative for Leadership', youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
    ],
  },
  {
    id: 'course-ai-productivity',
    title: 'AI Productivity Systems',
    description: 'Use AI agents, workflows, and prompting systems to build a repeatable high-output operating model.',
    price: 1499,
    category: 'AI',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    trainerId: 'demo-trainer',
    trainerName: 'Meera Trainer',
    duration: '5h 40m',
    studentsCount: 2631,
    featured: true,
    createdAt: '2026-02-10T09:00:00.000Z',
    modules: [],
    lessons: [
      { id: 'lesson-ai-1', title: 'Prompting Foundations', youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
      { id: 'lesson-ai-2', title: 'Building Personal AI Systems', youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A' },
      { id: 'lesson-ai-3', title: 'Agent Handoffs & Workflows', youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
      { id: 'lesson-ai-4', title: 'Operational QA for AI Outputs', youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A' },
    ],
  },
  {
    id: 'course-brand-strategy',
    title: 'Brand Strategy Accelerator',
    description: 'Build a practical brand system with positioning, messaging, category design, and campaign architecture.',
    price: 999,
    category: 'Marketing',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    trainerId: 'demo-trainer',
    trainerName: 'Meera Trainer',
    duration: '6h 05m',
    studentsCount: 968,
    createdAt: '2026-03-12T09:00:00.000Z',
    modules: [],
    lessons: [
      { id: 'lesson-brand-1', title: 'Positioning & Audience', youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A' },
      { id: 'lesson-brand-2', title: 'Narrative & Messaging', youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
      { id: 'lesson-brand-3', title: 'Campaign Systems', youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A' },
      { id: 'lesson-brand-4', title: 'Measurement & Iteration', youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
    ],
  },
];

const fallbackReviews: ReviewRecord[] = [
  {
    id: 'review-1',
    courseId: 'course-analytics-roi',
    userId: 'demo-student',
    userName: 'Aarav Learner',
    rating: 5,
    comment: 'The ROI breakdowns were practical and immediately usable for stakeholder updates.',
    createdAt: '2026-03-18T11:30:00.000Z',
  },
  {
    id: 'review-2',
    courseId: 'course-ai-productivity',
    userId: 'student-2',
    userName: 'Priya Sharma',
    rating: 4,
    comment: 'Clear workflows and strong templates. I would love even more real-world automation examples.',
    createdAt: '2026-03-22T15:30:00.000Z',
  },
];

const withDerivedLessons = (course: CourseRecord): CourseRecord => ({
  ...course,
  lessons: course.lessons.length ? course.lessons : course.modules.flatMap((module) => module.lessons),
});

const fallbackCatalog = fallbackCourses.map(withDerivedLessons);

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const getLocalStore = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  return safeParse(window.localStorage.getItem(key), fallback);
};

const setLocalStore = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const formatCreatedAt = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as Timestamp).toDate === 'function') {
    return (value as Timestamp).toDate().toISOString();
  }
  return new Date().toISOString();
};

const normalizeLesson = (rawLesson: Partial<LessonRecord>, index: number): LessonRecord => {
  const youtubeUrl = rawLesson.youtubeUrl || rawLesson.videoUrl || '';
  return {
    id: rawLesson.id || `lesson-${Date.now()}-${index}`,
    title: rawLesson.title || `Lesson ${index + 1}`,
    youtubeUrl,
    videoUrl: youtubeUrl,
    duration: rawLesson.duration,
    summary: rawLesson.summary,
  };
};

const normalizeCourse = (raw: Partial<CourseRecord>, id: string): CourseRecord => {
  const legacyModules = raw.modules || [];
  const directLessons = (raw.lessons || []).map((lesson, index) => normalizeLesson(lesson, index));
  const moduleLessons = legacyModules.flatMap((module) => (module.lessons || []).map((lesson, index) => normalizeLesson(lesson, index)));
  const lessons = (directLessons.length ? directLessons : moduleLessons).map((lesson, index) => ({
    ...lesson,
    id: lesson.id || `lesson-${index + 1}`,
  }));
  const course: CourseRecord = {
    id,
    title: raw.title || 'Untitled Course',
    description: raw.description || 'Course description coming soon.',
    price: raw.price || 0,
    category: raw.category || 'General',
    level: raw.level || 'Beginner',
    thumbnail: raw.thumbnail || '',
    trainerId: raw.trainerId || 'demo-trainer',
    trainerName: raw.trainerName || 'LearnPaddi Trainer',
    duration: raw.duration || 'Self-paced',
    studentsCount: raw.studentsCount || 0,
    featured: raw.featured || false,
    createdAt: formatCreatedAt(raw.createdAt),
    modules: legacyModules,
    lessons,
  };
  return course;
};

const getAverageRating = (reviews: ReviewRecord[]) => {
  if (!reviews.length) return 0;
  return Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1));
};

const sortNewest = <T extends { createdAt?: string; enrolledAt?: string; issuedAt?: string }>(items: T[]) =>
  [...items].sort((a, b) => {
    const left = new Date(a.createdAt || a.enrolledAt || a.issuedAt || 0).getTime();
    const right = new Date(b.createdAt || b.enrolledAt || b.issuedAt || 0).getTime();
    return right - left;
  });

export const getMarketplaceCourses = async (filters?: MarketplaceFilters): Promise<CourseRecord[]> => {
  const localCourses = getLocalStore<CourseRecord[]>(STORAGE_KEYS.courses, []);

  try {
    const snapshot = await getDocs(query(collection(db, 'courses'), orderBy('createdAt', 'desc')));
    const firestoreCourses = snapshot.docs.map((courseDoc) => normalizeCourse(courseDoc.data() as Partial<CourseRecord>, courseDoc.id));
    const merged = sortNewest([...localCourses, ...firestoreCourses, ...fallbackCatalog].filter(
      (course, index, array) => array.findIndex((item) => item.id === course.id) === index,
    ));

    return filterCourses(merged, filters);
  } catch {
    return filterCourses(sortNewest([...localCourses, ...fallbackCatalog]), filters);
  }
};

const filterCourses = (courses: CourseRecord[], filters?: MarketplaceFilters) => {
  return courses.filter((course) => {
    const searchMatch = !filters?.search || `${course.title} ${course.description} ${course.category}`.toLowerCase().includes(filters.search.toLowerCase());
    const categoryMatch = !filters?.category || filters.category === 'All' || course.category === filters.category;
    return searchMatch && categoryMatch;
  });
};

export const getMarketplaceCategories = async () => {
  const courses = await getMarketplaceCourses();
  return ['All', ...Array.from(new Set(courses.map((course) => course.category)))];
};

export const getCourseById = async (courseId: string) => {
  try {
    const snapshot = await getDoc(doc(db, 'courses', courseId));
    if (snapshot.exists()) {
      return normalizeCourse(snapshot.data() as Partial<CourseRecord>, snapshot.id);
    }
  } catch {
    // Fall back to merged catalog below.
  }

  const courses = await getMarketplaceCourses();
  return courses.find((course) => course.id === courseId) || null;
};

export const getCourseReviews = async (courseId: string): Promise<ReviewRecord[]> => {
  const localReviews = getLocalStore<ReviewRecord[]>(STORAGE_KEYS.reviews, fallbackReviews);

  try {
    const snapshot = await getDocs(query(collection(db, 'reviews'), where('courseId', '==', courseId), orderBy('createdAt', 'desc')));
    const firestoreReviews = snapshot.docs.map((reviewDoc) => ({ id: reviewDoc.id, ...(reviewDoc.data() as Omit<ReviewRecord, 'id'>) }));
    return sortNewest([...localReviews, ...firestoreReviews].filter((review) => review.courseId === courseId));
  } catch {
    return sortNewest(localReviews.filter((review) => review.courseId === courseId));
  }
};

export const submitCourseReview = async (input: Omit<ReviewRecord, 'id' | 'createdAt'>) => {
  const review: ReviewRecord = {
    ...input,
    id: `review-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const localReviews = getLocalStore<ReviewRecord[]>(STORAGE_KEYS.reviews, fallbackReviews);
  setLocalStore(STORAGE_KEYS.reviews, [review, ...localReviews]);

  try {
    await addDoc(collection(db, 'reviews'), review);
  } catch {
    // Local fallback is already persisted.
  }

  return review;
};

export const getStudentEnrollments = async (userId: string): Promise<EnrollmentRecord[]> => {
  const localEnrollments = getLocalStore<EnrollmentRecord[]>(STORAGE_KEYS.enrollments, []);

  try {
    const snapshot = await getDocs(query(collection(db, 'enrollments'), where('userId', '==', userId), orderBy('enrolledAt', 'desc')));
    const firestoreEnrollments = snapshot.docs.map((enrollmentDoc) => ({ id: enrollmentDoc.id, ...(enrollmentDoc.data() as Omit<EnrollmentRecord, 'id'>) }));
    return sortNewest([...localEnrollments, ...firestoreEnrollments].filter(
      (item, index, array) => item.userId === userId && array.findIndex((entry) => entry.id === item.id) === index,
    ));
  } catch {
    return sortNewest(localEnrollments.filter((enrollment) => enrollment.userId === userId));
  }
};

export const enrollInCourse = async (userId: string, courseId: string): Promise<EnrollmentRecord> => {
  const localEnrollments = getLocalStore<EnrollmentRecord[]>(STORAGE_KEYS.enrollments, []);
  const existing = localEnrollments.find((enrollment) => enrollment.userId === userId && enrollment.courseId === courseId);
  if (existing) return existing;

  const enrollment: EnrollmentRecord = {
    id: `${userId}_${courseId}`,
    userId,
    courseId,
    progress: 0,
    completedLessons: [],
    enrolledAt: new Date().toISOString(),
    status: 'active',
  };

  setLocalStore(STORAGE_KEYS.enrollments, [enrollment, ...localEnrollments]);

  try {
    await setDoc(doc(db, 'enrollments', enrollment.id), enrollment, { merge: true });
  } catch {
    // Local fallback is already persisted.
  }

  return enrollment;
};

export const markLessonCompleted = async (userId: string, courseId: string, lessonId: string) => {
  const course = await getCourseById(courseId);
  if (!course) return null;

  const localEnrollments = getLocalStore<EnrollmentRecord[]>(STORAGE_KEYS.enrollments, []);
  const current = localEnrollments.find((enrollment) => enrollment.userId === userId && enrollment.courseId === courseId)
    || await enrollInCourse(userId, courseId);

  const completedLessons = Array.from(new Set([...(current.completedLessons || []), lessonId]));
  const totalLessons = Math.max(course.lessons.length, 1);
  const progress = Math.round((completedLessons.length / totalLessons) * 100);
  const updated: EnrollmentRecord = {
    ...current,
    completedLessons,
    currentLessonId: lessonId,
    progress,
    status: progress === 100 ? 'completed' : 'active',
    completedAt: progress === 100 ? new Date().toISOString() : current.completedAt,
  };

  setLocalStore(STORAGE_KEYS.enrollments, [
    updated,
    ...localEnrollments.filter((item) => item.id !== updated.id),
  ]);

  try {
    await setDoc(doc(db, 'enrollments', updated.id), updated, { merge: true });
  } catch {
    // Local fallback is already persisted.
  }

  if (updated.progress === 100) {
    await issueCertificate({
      userId,
      courseId,
      userName: userId === 'demo-student' ? 'Aarav Learner' : 'LearnPaddi Student',
    });
  }

  return updated;
};

export const getStudentDashboardData = async (userId: string) => {
  const [courses, enrollments] = await Promise.all([
    getMarketplaceCourses(),
    getStudentEnrollments(userId),
  ]);

  const enrolledCourses = enrollments.map((enrollment) => {
    const course = courses.find((item) => item.id === enrollment.courseId);
    return course ? { course, enrollment } : null;
  }).filter(Boolean) as Array<{ course: CourseRecord; enrollment: EnrollmentRecord }>;

  return {
    courses,
    enrollments,
    enrolledCourses,
    averageProgress: enrolledCourses.length
      ? Math.round(enrolledCourses.reduce((sum, item) => sum + item.enrollment.progress, 0) / enrolledCourses.length)
      : 0,
    completedCourses: enrolledCourses.filter((item) => item.enrollment.progress === 100).length,
  };
};

export const getTrainerDashboardData = async (trainerId: string) => {
  const trainerCourses = await getTrainerCourses(trainerId);
  const enrollments = getLocalStore<EnrollmentRecord[]>(STORAGE_KEYS.enrollments, []);

  const totalLearners = trainerCourses.reduce((sum, course) => (
    sum + enrollments.filter((enrollment) => enrollment.courseId === course.id).length
  ), 0);

  return {
    courses: trainerCourses,
    totalLearners,
    totalRevenue: trainerCourses.reduce((sum, course) => sum + course.price, 0),
    averageCompletion: trainerCourses.length
      ? Math.round(trainerCourses.reduce((sum, course) => {
        const courseEnrollments = enrollments.filter((enrollment) => enrollment.courseId === course.id);
        if (!courseEnrollments.length) return sum;
        const avg = courseEnrollments.reduce((courseSum, enrollment) => courseSum + enrollment.progress, 0) / courseEnrollments.length;
        return sum + avg;
      }, 0) / trainerCourses.length)
      : 0,
  };
};

export const createCourse = async (input: CreateCourseInput) => {
  const currentUser = auth.currentUser;
  if (!currentUser?.uid) {
    throw new LmsServiceError('course/unauthenticated', 'You must be signed in as a trainer to create a course.');
  }

  const normalizedTitle = input.title.trim();
  const duplicateSnapshot = await getDocs(
    query(
      collection(db, 'courses'),
      where('trainerId', '==', currentUser.uid),
      where('title', '==', normalizedTitle),
    ),
  );

  if (!duplicateSnapshot.empty) {
    throw new LmsServiceError('course/duplicate-title', 'Course already exists');
  }

  const firestorePayload = {
    title: normalizedTitle,
    description: input.description.trim(),
    category: input.category.trim() || 'General',
    thumbnail: input.thumbnail.trim(),
    price: input.price,
    trainerId: currentUser.uid,
    lessons: input.lessons.map((lesson, index) => ({
      id: `lesson-${Date.now()}-${index}`,
      title: lesson.title.trim(),
      youtubeUrl: lesson.youtubeUrl.trim(),
      videoUrl: lesson.youtubeUrl.trim(),
    })),
    createdAt: serverTimestamp(),
    level: 'Beginner' as const,
    trainerName: 'LearnPaddi Trainer',
    duration: 'Self-paced',
    studentsCount: 0,
    featured: false,
    modules: [],
  };

  const docRef = await addDoc(collection(db, 'courses'), firestorePayload);
  const created = normalizeCourse(firestorePayload as unknown as Partial<CourseRecord>, docRef.id);

  const localCourses = getLocalStore<CourseRecord[]>(STORAGE_KEYS.courses, []);
  setLocalStore(STORAGE_KEYS.courses, [created, ...localCourses]);

  return created;
};

export const getTrainerCourses = async (trainerId: string) => {
  const ownedCoursesSnapshot = await getDocs(
    query(collection(db, 'courses'), where('trainerId', '==', trainerId)),
  );

  const firestoreCourses = ownedCoursesSnapshot.docs.map((courseDoc) =>
    normalizeCourse(courseDoc.data() as Partial<CourseRecord>, courseDoc.id),
  );
  const localCourses = getLocalStore<CourseRecord[]>(STORAGE_KEYS.courses, []);
  const filteredLocal = localCourses.filter((course) => course.trainerId === trainerId);

  return sortNewest([...firestoreCourses, ...filteredLocal].filter(
    (course, index, arr) => arr.findIndex((entry) => entry.id === course.id) === index,
  ));
};

export const updateCourse = async (courseId: string, partial: Partial<CourseRecord>) => {
  const currentUser = auth.currentUser;
  if (!currentUser?.uid) {
    throw new LmsServiceError('course/unauthenticated', 'You must be signed in to update this course.');
  }

  const existingCourseDoc = await getDoc(doc(db, 'courses', courseId));
  if (!existingCourseDoc.exists()) {
    throw new Error('Course not found.');
  }

  const existingCourse = existingCourseDoc.data() as Partial<CourseRecord>;
  if (existingCourse.trainerId !== currentUser.uid) {
    throw new LmsServiceError('course/forbidden', 'You can edit only your own courses.');
  }

  const localCourses = getLocalStore<CourseRecord[]>(STORAGE_KEYS.courses, []);
  const existing = localCourses.find((course) => course.id === courseId);
  if (existing) {
    const updated = normalizeCourse({ ...existing, ...partial }, courseId);
    setLocalStore(STORAGE_KEYS.courses, [
      updated,
      ...localCourses.filter((course) => course.id !== courseId),
    ]);
  }

  await updateDoc(doc(db, 'courses', courseId), partial);
};

export const deleteCourse = async (courseId: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser?.uid) {
    throw new LmsServiceError('course/unauthenticated', 'You must be signed in to delete this course.');
  }

  const existingCourseDoc = await getDoc(doc(db, 'courses', courseId));
  if (!existingCourseDoc.exists()) {
    return;
  }

  const existingCourse = existingCourseDoc.data() as Partial<CourseRecord>;
  if (existingCourse.trainerId !== currentUser.uid) {
    throw new LmsServiceError('course/forbidden', 'You can delete only your own courses.');
  }

  const localCourses = getLocalStore<CourseRecord[]>(STORAGE_KEYS.courses, []);
  setLocalStore(STORAGE_KEYS.courses, localCourses.filter((course) => course.id !== courseId));
  await deleteDoc(doc(db, 'courses', courseId));
};

export const getCertificateRecords = async (userId: string): Promise<CertificateRecord[]> => {
  const localCertificates = getLocalStore<CertificateRecord[]>(STORAGE_KEYS.certificates, []);
  return sortNewest(localCertificates.filter((certificate) => certificate.userId === userId));
};

export const issueCertificate = async (input: Pick<CertificateRecord, 'courseId' | 'userId' | 'userName'>) => {
  const certificates = getLocalStore<CertificateRecord[]>(STORAGE_KEYS.certificates, []);
  const existing = certificates.find((certificate) => certificate.userId === input.userId && certificate.courseId === input.courseId);
  if (existing) return existing;

  const certificate: CertificateRecord = {
    id: `certificate-${Date.now()}`,
    certificateNumber: `LP-${Math.floor(Math.random() * 900000 + 100000)}`,
    issuedAt: new Date().toISOString(),
    ...input,
  };

  setLocalStore(STORAGE_KEYS.certificates, [certificate, ...certificates]);

  try {
    await setDoc(doc(db, 'certificates', certificate.id), certificate, { merge: true });
  } catch {
    // Local fallback is already persisted.
  }

  return certificate;
};

export const getCourseInsights = async (courseId: string) => {
  const [reviews, allEnrollments] = await Promise.all([
    getCourseReviews(courseId),
    getLocalStore<EnrollmentRecord[]>(STORAGE_KEYS.enrollments, []),
  ]);
  const courseEnrollments = allEnrollments.filter((enrollment) => enrollment.courseId === courseId);

  return {
    totalEnrollments: courseEnrollments.length,
    averageProgress: courseEnrollments.length
      ? Math.round(courseEnrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / courseEnrollments.length)
      : 0,
    averageRating: getAverageRating(reviews),
    reviewCount: reviews.length,
  };
};

export const openCertificatePrintView = async (certificate: CertificateRecord, course: CourseRecord) => {
  if (typeof window === 'undefined') return;

  const certificateWindow = window.open('', '_blank', 'noopener,noreferrer,width=1100,height=800');
  if (!certificateWindow) return;

  certificateWindow.document.write(`
    <html>
      <head>
        <title>LearnPaddi Certificate</title>
        <style>
          body { font-family: Inter, Arial, sans-serif; margin: 0; background: #eef4ff; color: #0f172a; }
          .sheet { width: 980px; margin: 40px auto; background: white; border-radius: 24px; padding: 56px; box-shadow: 0 30px 80px rgba(15,23,42,.18); border: 12px solid #dbeafe; }
          .badge { display: inline-block; padding: 10px 16px; border-radius: 999px; background: linear-gradient(135deg,#2563eb,#06b6d4); color: white; font-weight: 700; letter-spacing: .14em; font-size: 12px; text-transform: uppercase; }
          h1 { font-size: 52px; margin: 20px 0 8px; }
          h2 { font-size: 34px; margin: 18px 0; }
          p { font-size: 18px; line-height: 1.7; color: #475569; }
          .meta { display: flex; justify-content: space-between; margin-top: 42px; font-size: 15px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="badge">LearnPaddi Certificate</div>
          <h1>Certificate of Completion</h1>
          <p>This certifies that</p>
          <h2>${certificate.userName}</h2>
          <p>has successfully completed the course <strong>${course.title}</strong> and demonstrated progress across every lesson in the program.</p>
          <div class="meta">
            <div>
              <strong>Certificate No.</strong><br />
              ${certificate.certificateNumber}
            </div>
            <div>
              <strong>Issued On</strong><br />
              ${new Date(certificate.issuedAt).toLocaleDateString()}
            </div>
            <div>
              <strong>Issued By</strong><br />
              LearnPaddi LMS
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
  certificateWindow.document.close();
  certificateWindow.focus();
  certificateWindow.print();
};

export const getRatingSnapshot = async (courseId: string) => {
  const reviews = await getCourseReviews(courseId);
  return {
    averageRating: getAverageRating(reviews),
    reviewsCount: reviews.length,
  };
};
