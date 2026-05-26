import {
  createCourse as createLmsCourse,
  deleteCourse as deleteLmsCourse,
  getCourseById as getLmsCourseById,
  getMarketplaceCourses,
  getTrainerCourses,
  updateCourse as updateLmsCourse,
  type CourseRecord,
} from '@/services/database/lmsService';

export interface Course {
  id: string;
  title: string;
  description: string;
  trainerId: string;
  price: number;
  duration?: string;
  thumbnail?: string;
  modules?: CourseModule[];
  lessons?: Array<CourseLesson & { youtubeUrl?: string; videoPath?: string }>;
  createdAt: string;
  exam?: CourseRecord['exam'];
}

export interface CourseLesson {
  id: string;
  title: string;
  duration?: string | number;
  videoUrl?: string;
  youtubeUrl?: string;
  videoPath?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

const toCourse = (course: CourseRecord): Course => ({
  id: course.id,
  title: course.title,
  description: course.description,
  trainerId: course.trainerId,
  price: course.price,
  duration: course.duration,
  thumbnail: course.thumbnail,
  modules: course.modules.map((module) => ({
    ...module,
    lessons: module.lessons.map((lesson) => ({
      ...lesson,
      duration: lesson.duration,
    })),
  })),
  lessons: course.lessons.map((lesson) => ({
    ...lesson,
    duration: lesson.duration,
  })),
  createdAt: course.createdAt,
  exam: course.exam,
});

export const getCourses = async (): Promise<Course[]> => (
  (await getMarketplaceCourses()).map(toCourse)
);

export const getUserCourses = async (trainerId: string): Promise<Course[]> => (
  (await getTrainerCourses(trainerId)).map(toCourse)
);

export const createCourse = async (courseData: Omit<Course, 'id' | 'createdAt'>): Promise<string> => {
  const created = await createLmsCourse({
    title: courseData.title,
    description: courseData.description,
    price: courseData.price,
    category: 'General',
    thumbnail: courseData.thumbnail || '',
    trainerId: courseData.trainerId,
    lessons: (courseData.lessons || courseData.modules?.flatMap((module) => module.lessons) || []).map((lesson) => ({
      title: lesson.title,
      youtubeUrl: lesson.videoUrl || '',
    })),
  });

  return created.id;
};

export const updateCourse = async (id: string, data: Partial<Course>): Promise<void> => {
  await updateLmsCourse(id, data as Partial<CourseRecord>);
};

export const deleteCourse = async (id: string): Promise<void> => {
  await deleteLmsCourse(id);
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  const course = await getLmsCourseById(id);
  return course ? toCourse(course) : null;
};
