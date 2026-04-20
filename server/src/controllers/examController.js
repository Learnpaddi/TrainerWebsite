import mongoose from 'mongoose';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { canAccessExam } from '../services/enrollmentAccess.js';

function serializeQuestions(questions) {
  return questions.map((question) => ({
    id: question._id,
    prompt: question.prompt,
    options: question.options,
  }));
}

export const canAccessCourseExam = asyncHandler(async (req, res) => {
  const { courseId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, 'A valid courseId query parameter is required.');
  }

  const [course, enrollment] = await Promise.all([
    Course.findById(courseId),
    Enrollment.findOne({ userId: req.user._id, courseId }),
  ]);

  if (!course) {
    throw new ApiError(404, 'Course not found.');
  }

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

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, 'Invalid course id.');
  }

  const [course, enrollment] = await Promise.all([
    Course.findById(courseId),
    Enrollment.findOne({ userId: req.user._id, courseId }),
  ]);

  if (!course) {
    throw new ApiError(404, 'Course not found.');
  }

  const access = canAccessExam(course, enrollment);
  if (!access.allowed) {
    throw new ApiError(403, access.message);
  }

  res.json({
    success: true,
    exam: {
      courseId: course._id,
      courseTitle: course.title,
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

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, 'Invalid course id.');
  }

  const [course, enrollment] = await Promise.all([
    Course.findById(courseId),
    Enrollment.findOne({ userId: req.user._id, courseId }),
  ]);

  if (!course || !enrollment) {
    throw new ApiError(404, 'Course enrollment was not found.');
  }

  const access = canAccessExam(course, enrollment);
  if (!access.allowed) {
    throw new ApiError(403, access.message);
  }

  if (!Array.isArray(answers) || answers.length !== course.exam.questions.length) {
    throw new ApiError(400, 'Please submit an answer for every exam question.');
  }

  const correctAnswers = course.exam.questions.reduce((count, question, index) => {
    return count + (Number(answers[index]) === question.correctOption ? 1 : 0);
  }, 0);

  const totalQuestions = course.exam.questions.length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = score >= course.exam.passingScore;

  enrollment.examResult = {
    score,
    correctAnswers,
    totalQuestions,
    passed,
    attemptedAt: new Date(),
  };
  await enrollment.save();

  res.json({
    success: true,
    result: enrollment.examResult,
  });
});
