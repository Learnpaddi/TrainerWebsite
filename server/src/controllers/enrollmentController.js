import { prisma } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const enroll = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  if (!courseId || typeof courseId !== 'string') {
    throw new ApiError(400, 'A valid courseId is required.');
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new ApiError(404, 'Course not found.');
  }

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: req.user.id, courseId } },
    update: {},
    create: {
      userId: req.user.id,
      courseId,
      progress: 0,
      completed: false,
      paymentStatus: course.price > 0 ? 'pending' : 'not_required',
      amountPaid: 0,
      examResult: null,
      courseTitle: course.title,
    },
  });

  res.status(201).json({
    success: true,
    enrollment,
  });
});

export const completeCourse = asyncHandler(async (req, res) => {
  const { courseId, progress = 100 } = req.body;

  if (!courseId || typeof courseId !== 'string') {
    throw new ApiError(400, 'A valid courseId is required.');
  }

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: req.user.id, courseId } },
  });

  if (!existingEnrollment) {
    throw new ApiError(404, 'Enrollment not found for this course.');
  }

  const progressValue = Math.max(0, Math.min(Number(progress) || 0, 100));
  const completed = progressValue >= 100;

  const enrollment = await prisma.enrollment.update({
    where: { id: existingEnrollment.id },
    data: {
      progress: progressValue,
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  res.json({
    success: true,
    enrollment,
  });
});
