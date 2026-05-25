import { db } from '../config/firebase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { canAccessExam } from '../services/enrollmentAccess.js';

function serializeQuestions(questions = []) {
  return questions.map((question, index) => ({
    id: question.id || `q_${index}`,
    prompt: question.prompt,
    options: question.options || [],
  }));
}

export const canAccessCourseExam = asyncHandler(async (req, res) => {
  const { courseId } = req.query;

  if (!courseId || typeof courseId !== 'string') {
    throw new ApiError(400, 'A valid courseId query parameter is required.');
  }

  const [courseDoc, enrollmentDoc] = await Promise.all([
    db.collection('courses').doc(courseId).get(),
    db.collection('enrollments').doc(`${req.user.uid}_${courseId}`).get(),
  ]);

  if (!courseDoc.exists) {
    throw new ApiError(404, 'Course not found.');
  }

  const courseData = courseDoc.data();
  const course = {
    id: courseDoc.id,
    title: courseData.title,
    price: courseData.price,
    examAvailable: courseData.examAvailable,
    exam: courseData.exam || null,
  };

  const enrollmentData = enrollmentDoc.exists ? enrollmentDoc.data() : null;
  const enrollment = enrollmentData
    ? {
        progress: enrollmentData.progress ?? 0,
        completed: enrollmentData.completed ?? false,
        paymentStatus: enrollmentData.paymentStatus || 'not_required',
      }
    : null;

  const access = canAccessExam(course, enrollment);

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

  const [courseDoc, enrollmentDoc] = await Promise.all([
    db.collection('courses').doc(courseId).get(),
    db.collection('enrollments').doc(`${req.user.uid}_${courseId}`).get(),
  ]);

  if (!courseDoc.exists) {
    throw new ApiError(404, 'Course not found.');
  }

  const courseData = courseDoc.data();
  const enrollmentData = enrollmentDoc.exists ? enrollmentDoc.data() : null;

  const course = {
    id: courseDoc.id,
    title: courseData.title,
    price: courseData.price,
    examAvailable: courseData.examAvailable,
    exam: courseData.exam || null,
  };

  const enrollment = enrollmentData
    ? {
        progress: enrollmentData.progress ?? 0,
        completed: enrollmentData.completed ?? false,
        paymentStatus: enrollmentData.paymentStatus || 'not_required',
      }
    : null;

  const access = canAccessExam(course, enrollment);
  if (!access.allowed) {
    throw new ApiError(403, access.message);
  }

  res.json({
    success: true,
    exam: {
      courseId: courseDoc.id,
      courseTitle: courseData.title,
      title: courseData.exam.title,
      timeLimitMinutes: courseData.exam.timeLimitMinutes,
      passingScore: courseData.exam.passingScore,
      questions: serializeQuestions(courseData.exam.questions),
    },
  });
});

export const submitExam = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { answers = [] } = req.body;

  if (!courseId || typeof courseId !== 'string') {
    throw new ApiError(400, 'Invalid course id.');
  }

  const [courseDoc, enrollmentDoc] = await Promise.all([
    db.collection('courses').doc(courseId).get(),
    db.collection('enrollments').doc(`${req.user.uid}_${courseId}`).get(),
  ]);

  if (!courseDoc.exists || !enrollmentDoc.exists) {
    throw new ApiError(404, 'Course enrollment was not found.');
  }

  const courseData = courseDoc.data();
  const enrollmentData = enrollmentDoc.data();

  const course = {
    id: courseDoc.id,
    title: courseData.title,
    price: courseData.price,
    examAvailable: courseData.examAvailable,
    exam: courseData.exam || null,
  };

  const enrollment = {
    progress: enrollmentData.progress ?? 0,
    completed: enrollmentData.completed ?? false,
    paymentStatus: enrollmentData.paymentStatus || 'not_required',
  };

  const access = canAccessExam(course, enrollment);
  if (!access.allowed) {
    throw new ApiError(403, access.message);
  }

  const questions = courseData.exam.questions || [];

  if (!Array.isArray(answers) || answers.length !== questions.length) {
    throw new ApiError(400, 'Please submit an answer for every exam question.');
  }

  const correctAnswers = questions.reduce((count, question, index) => {
    return count + (Number(answers[index]) === question.correctOption ? 1 : 0);
  }, 0);

  const totalQuestions = questions.length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = score >= courseData.exam.passingScore;

  const examResult = {
    score,
    correctAnswers,
    totalQuestions,
    passed,
    attemptedAt: new Date().toISOString(),
  };

  await db.collection('enrollments').doc(`${req.user.uid}_${courseId}`).update({
    examResult,
    updatedAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    result: examResult,
  });
});

