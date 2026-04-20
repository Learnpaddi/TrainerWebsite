import mongoose from 'mongoose';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { canAccessExam } from '../services/enrollmentAccess.js';

function serializeCourse(course) {
  return {
    id: course._id,
    title: course.title,
    description: course.description,
    price: course.price,
    examAvailable: course.examAvailable,
    lessons: course.lessons,
    exam: course.exam
      ? {
          title: course.exam.title,
          timeLimitMinutes: course.exam.timeLimitMinutes,
          passingScore: course.exam.passingScore,
          questionCount: course.exam.questions.length,
        }
      : null,
  };
}

function serializeEnrollment(enrollment) {
  if (!enrollment) return null;
  return {
    id: enrollment._id,
    progress: enrollment.progress,
    completed: enrollment.completed,
    paymentStatus: enrollment.paymentStatus,
    amountPaid: enrollment.amountPaid,
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completedAt,
    examResult: enrollment.examResult,
  };
}

export const listCourses = asyncHandler(async (_req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.json({
    success: true,
    courses: courses.map(serializeCourse),
  });
});

export const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid course id.');
  }

  const course = await Course.findById(id);
  if (!course) {
    throw new ApiError(404, 'Course not found.');
  }

  const enrollment = req.user
    ? await Enrollment.findOne({
        userId: req.user._id,
        courseId: course._id,
      })
    : null;

  const access = canAccessExam(course, enrollment);

  res.json({
    success: true,
    course: serializeCourse(course),
    enrollment: serializeEnrollment(enrollment),
    examAccess: access,
  });
});

export const listMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ userId: req.user._id })
    .populate('courseId')
    .sort({ createdAt: -1 });

  const data = enrollments.map((enrollment) => ({
    id: enrollment._id,
    progress: enrollment.progress,
    completed: enrollment.completed,
    paymentStatus: enrollment.paymentStatus,
    amountPaid: enrollment.amountPaid,
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completedAt,
    examResult: enrollment.examResult,
    course: serializeCourse(enrollment.courseId),
    examAccess: canAccessExam(enrollment.courseId, enrollment),
  }));

  res.json({
    success: true,
    enrollments: data,
  });
});
