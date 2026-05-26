import { prisma } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { canAccessExam } from '../services/enrollmentAccess.js';

function getPrimaryExam(course) {
  return course.exams?.[0] || null;
}

function toExamAccessCourse(course) {
  const exam = getPrimaryExam(course);

  return {
    id: course.id,
    title: course.title,
    price: course.price,
    examAvailable: course.examAvailable,
    exam: exam
      ? {
          title: exam.title,
          timeLimitMinutes: exam.duration,
          passingScore: exam.passingScore,
          questions: Array.isArray(exam.questions) ? exam.questions : [],
        }
      : null,
  };
}

function toExamAccessEnrollment(enrollment) {
  return enrollment
    ? {
        progress: enrollment.progress ?? 0,
        completed: enrollment.completed ?? false,
        paymentStatus: enrollment.paymentStatus || 'not_required',
      }
    : null;
}

function serializeQuestions(questions = []) {
  return questions.map((question, index) => ({
    id: question.id || `q_${index}`,
    prompt: question.prompt,
    options: question.options || [],
  }));
}

async function getCourseAndEnrollment(userId, courseId) {
  return Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      include: { exams: true },
    }),
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    }),
  ]);
}

export const canAccessCourseExam = asyncHandler(async (req, res) => {
  const { courseId } = req.query;

  if (!courseId || typeof courseId !== 'string') {
    throw new ApiError(400, 'A valid courseId query parameter is required.');
  }

  const [courseRecord, enrollmentRecord] = await getCourseAndEnrollment(req.user.id, courseId);
  if (!courseRecord) {
    throw new ApiError(404, 'Course not found.');
  }

  const access = canAccessExam(
    toExamAccessCourse(courseRecord),
    toExamAccessEnrollment(enrollmentRecord),
  );

  res.json({
    success: true,
    canAccessExam: access.allowed,
    reason: access.reason,
    message: access.message,
  });
});

export const startExam = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!courseId || typeof courseId !== 'string') {
    throw new ApiError(400, 'Invalid course id.');
  }

  const [courseRecord, enrollmentRecord] = await getCourseAndEnrollment(req.user.id, courseId);
  if (!courseRecord) {
    throw new ApiError(404, 'Course not found.');
  }

  const course = toExamAccessCourse(courseRecord);
  const access = canAccessExam(course, toExamAccessEnrollment(enrollmentRecord));
  if (!access.allowed) {
    throw new ApiError(403, access.message);
  }

  res.json({
    success: true,
    exam: {
      courseId: courseRecord.id,
      courseTitle: courseRecord.title,
      title: course.exam.title,
      timeLimitMinutes: course.exam.timeLimitMinutes,
      passingScore: course.exam.passingScore,
      questions: serializeQuestions(course.exam.questions),
    },
  });
});

export const submitExam = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { answers = [] } = req.body;

  if (!courseId || typeof courseId !== 'string') {
    throw new ApiError(400, 'Invalid course id.');
  }

  const [courseRecord, enrollmentRecord] = await getCourseAndEnrollment(req.user.id, courseId);
  if (!courseRecord || !enrollmentRecord) {
    throw new ApiError(404, 'Course enrollment was not found.');
  }

  const course = toExamAccessCourse(courseRecord);
  const access = canAccessExam(course, toExamAccessEnrollment(enrollmentRecord));
  if (!access.allowed) {
    throw new ApiError(403, access.message);
  }

  const questions = course.exam.questions || [];

  if (!Array.isArray(answers) || answers.length !== questions.length) {
    throw new ApiError(400, 'Please submit an answer for every exam question.');
  }

  const correctAnswers = questions.reduce((count, question, index) => {
    return count + (Number(answers[index]) === question.correctOption ? 1 : 0);
  }, 0);

  const totalQuestions = questions.length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = score >= course.exam.passingScore;
  const examResult = {
    score,
    correctAnswers,
    totalQuestions,
    passed,
    attemptedAt: new Date().toISOString(),
  };

  await prisma.enrollment.update({
    where: { id: enrollmentRecord.id },
    data: {
      examResult,
      examAttempted: true,
      passed,
      score,
    },
  });

  await prisma.examAttempt.create({
    data: {
      id: `${req.user.id}_${courseId}_${Date.now()}`,
      userId: req.user.id,
      courseId,
      score,
      passed,
      correctAnswers,
      totalQuestions,
      answers,
    },
  });

  res.json({
    success: true,
    result: examResult,
  });
});
