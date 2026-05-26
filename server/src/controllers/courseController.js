import { prisma } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { canAccessExam } from '../services/enrollmentAccess.js';

function serializeCourse(course) {
  const exam = course.exam || course.exams?.[0] || null;
  const questions = Array.isArray(exam?.questions) ? exam.questions : [];

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    price: course.price,
    examAvailable: course.examAvailable,
    lessons: Array.isArray(course.lessons) ? course.lessons : [],
    exam: exam
      ? {
          title: exam.title,
          timeLimitMinutes: exam.timeLimitMinutes || exam.duration,
          passingScore: exam.passingScore,
          questionCount: questions.length,
        }
      : null,
  };
}

function serializeEnrollment(enrollment) {
  if (!enrollment) return null;

  return {
    id: enrollment.id,
    progress: enrollment.progress ?? 0,
    completed: enrollment.completed ?? false,
    paymentStatus: enrollment.paymentStatus || 'not_required',
    amountPaid: enrollment.amountPaid ?? 0,
    enrolledAt: enrollment.createdAt?.toISOString?.() || new Date().toISOString(),
    completedAt: enrollment.completedAt?.toISOString?.() || null,
    examResult: enrollment.examResult || null,
  };
}

export const listCourses = asyncHandler(async (_req, res) => {
  const courses = await prisma.course.findMany({
    include: { exams: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    courses: courses.map(serializeCourse),
  });
});

export const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const courseRecord = await prisma.course.findUnique({
    where: { id },
    include: { exams: true },
  });
  if (!courseRecord) {
    throw new ApiError(404, 'Course not found.');
  }

  const course = serializeCourse(courseRecord);
  const enrollmentRecord = req.user
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.user.id, courseId: id } },
      })
    : null;
  const enrollment = serializeEnrollment(enrollmentRecord);

  res.json({
    success: true,
    course,
    enrollment,
    examAccess: canAccessExam(course, enrollment),
  });
});

export const listMyEnrollments = asyncHandler(async (req, res) => {
  const enrollmentRecords = await prisma.enrollment.findMany({
    where: { userId: req.user.id },
    include: { course: { include: { exams: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const enrollments = enrollmentRecords.map((enrollmentRecord) => {
    const course = enrollmentRecord.course ? serializeCourse(enrollmentRecord.course) : null;
    const enrollment = serializeEnrollment(enrollmentRecord);

    return {
      ...enrollment,
      course,
      examAccess: canAccessExam(course, enrollment),
    };
  });

  res.json({
    success: true,
    enrollments,
  });
});
