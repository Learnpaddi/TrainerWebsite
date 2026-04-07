import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';

export type Role = 'student' | 'trainer';

export interface LessonRecord {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  summary: string;
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
  level: CourseRecord['level'];
  thumbnail: string;
  trainerId: string;
  trainerName: string;
  duration: string;
  modules: CourseModuleRecord[];
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
    modules: [
      {
        id: 'analytics-foundations',
        title: 'Analytics Foundations',
        lessons: [
          { id: 'lesson-analytics-1', title: 'Metrics That Matter', duration: '14 min', videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A', summary: 'Understand north-star metrics and ROI baselines.' },
          { id: 'lesson-analytics-2', title: 'Building Dashboards for Decisions', duration: '18 min', videoUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk', summary: 'Design dashboards executives actually use.' },
        ],
      },
      {
        id: 'analytics-execution',
        title: 'Execution & Communication',
        lessons: [
          { id: 'lesson-analytics-3', title: 'Turning Analysis into Action', duration: '16 min', videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A', summary: 'Move from insights to actions with confidence.' },
          { id: 'lesson-analytics-4', title: 'ROI Narrative for Leadership', duration: '12 min', videoUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk', summary: 'Present financial value in a persuasive way.' },
        ],
      },
    ],
    lessons: [],
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
    modules: [
      {
        id: 'ai-setup',
        title: 'AI Workflow Setup',
        lessons: [
          { id: 'lesson-ai-1', title: 'Prompting Foundations', duration: '10 min', videoUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk', summary: 'Write prompts that produce consistent results.' },
          { id: 'lesson-ai-2', title: 'Building Personal AI Systems', duration: '17 min', videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A', summary: 'Create reusable systems for research and execution.' },
        ],
      },
      {
        id: 'ai-automation',
        title: 'Automation Layer',
        lessons: [
          { id: 'lesson-ai-3', title: 'Agent Handoffs & Workflows', duration: '13 min', videoUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk', summary: 'Chain work across repeatable automations.' },
          { id: 'lesson-ai-4', title: 'Operational QA for AI Outputs', duration: '11 min', videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A', summary: 'Check quality, reduce hallucinations, and ship safely.' },
        ],
      },
    ],
    lessons: [],
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
    modules: [
      {
        id: 'brand-core',
        title: 'Brand Core',
        lessons: [
          { id: 'lesson-brand-1', title: 'Positioning & Audience', duration: '15 min', videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A', summary: 'Define who you serve and why you matter.' },
          { id: 'lesson-brand-2', title: 'Narrative & Messaging', duration: '19 min', videoUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk', summary: 'Turn strategy into memorable language.' },
        ],
      },
      {
        id: 'brand-activation',
        title: 'Activation',
        lessons: [
          { id: 'lesson-brand-3', title: 'Campaign Systems', duration: '14 min', videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A', summary: 'Design a campaign engine across channels.' },
          { id: 'lesson-brand-4', title: 'Measurement & Iteration', duration: '12 min', videoUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk', summary: 'Measure impact and refine over time.' },
        ],
      },
    ],
    lessons: [],
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
  lessons: course.modules.flatMap((module) => module.lessons),
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

const normalizeCourse = (raw: Partial<CourseRecord>, id: string): CourseRecord => {
  const modules = raw.modules || [];
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
    createdAt: raw.createdAt || new Date().toISOString(),
    modules,
    lessons: modules.flatMap((module) => module.lessons || []),
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
  const courses = await getMarketplaceCourses();
  const trainerCourses = courses.filter((course) => course.trainerId === trainerId);
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
  const created: CourseRecord = normalizeCourse({
    ...input,
    createdAt: new Date().toISOString(),
    studentsCount: 0,
    featured: false,
  }, `course-${Date.now()}`);

  const localCourses = getLocalStore<CourseRecord[]>(STORAGE_KEYS.courses, []);
  setLocalStore(STORAGE_KEYS.courses, [created, ...localCourses]);

  try {
    await setDoc(doc(db, 'courses', created.id), created, { merge: true });
  } catch {
    // Local fallback is already persisted.
  }

  return created;
};

export const getTrainerCourses = async (trainerId: string) => {
  const courses = await getMarketplaceCourses();
  return courses.filter((course) => course.trainerId === trainerId);
};

export const updateCourse = async (courseId: string, partial: Partial<CourseRecord>) => {
  const localCourses = getLocalStore<CourseRecord[]>(STORAGE_KEYS.courses, []);
  const existing = localCourses.find((course) => course.id === courseId);
  if (existing) {
    const updated = normalizeCourse({ ...existing, ...partial }, courseId);
    setLocalStore(STORAGE_KEYS.courses, [
      updated,
      ...localCourses.filter((course) => course.id !== courseId),
    ]);
  }

  try {
    await updateDoc(doc(db, 'courses', courseId), partial);
  } catch {
    // Local fallback is already persisted.
  }
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
