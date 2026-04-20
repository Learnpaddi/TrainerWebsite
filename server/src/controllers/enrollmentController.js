import mongoose from 'mongoose';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const enroll = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, 'A valid courseId is required.');
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, 'Course not found.');
  }

  const existing = await Enrollment.findOne({
    userId: req.user._id,
    courseId,
  });

  if (existing) {
    return res.json({
      success: true,
      enrollment: existing,
    });
  }

  const enrollment = await Enrollment.create({
    userId: req.user._id,
    courseId,
    progress: 0,
    completed: false,
    paymentStatus: course.price > 0 ? 'pending' : 'not_required',
  });

  res.status(201).json({
    success: true,
    enrollment,
  });
});

export const completeCourse = asyncHandler(async (req, res) => {
  const { courseId, progress = 100 } = req.body;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, 'A valid courseId is required.');
  }

  const enrollment = await Enrollment.findOne({
    userId: req.user._id,
    courseId,
  });

  if (!enrollment) {
    throw new ApiError(404, 'Enrollment not found for this course.');
  }

  enrollment.progress = Math.max(0, Math.min(Number(progress) || 0, 100));
  enrollment.completed = enrollment.progress >= 100;
  enrollment.completedAt = enrollment.completed ? new Date() : null;
  await enrollment.save();

  res.json({
    success: true,
    enrollment,
  });
});
