import { db } from '../config/firebase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const enroll = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  if (!courseId || typeof courseId !== 'string') {
    throw new ApiError(400, 'A valid courseId is required.');
  }

  const courseDoc = await db.collection('courses').doc(courseId).get();
  if (!courseDoc.exists) {
    throw new ApiError(404, 'Course not found.');
  }

  const courseData = courseDoc.data();
  const enrollmentId = `${req.user.uid}_${courseId}`;
  const enrollmentRef = db.collection('enrollments').doc(enrollmentId);
  const enrollmentDoc = await enrollmentRef.get();

  if (enrollmentDoc.exists) {
    return res.json({
      success: true,
      enrollment: { id: enrollmentDoc.id, ...enrollmentDoc.data() },
    });
  }

  const enrollmentPayload = {
    userId: req.user.uid,
    courseId,
    progress: 0,
    completed: false,
    paymentStatus: courseData.price > 0 ? 'pending' : 'not_required',
    amountPaid: 0,
    enrolledAt: new Date().toISOString(),
    completedAt: null,
    examResult: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await enrollmentRef.set(enrollmentPayload);

  res.status(201).json({
    success: true,
    enrollment: { id: enrollmentId, ...enrollmentPayload },
  });
});

export const completeCourse = asyncHandler(async (req, res) => {
  const { courseId, progress = 100 } = req.body;

  if (!courseId || typeof courseId !== 'string') {
    throw new ApiError(400, 'A valid courseId is required.');
  }

  const enrollmentId = `${req.user.uid}_${courseId}`;
  const enrollmentRef = db.collection('enrollments').doc(enrollmentId);
  const enrollmentDoc = await enrollmentRef.get();

  if (!enrollmentDoc.exists) {
    throw new ApiError(404, 'Enrollment not found for this course.');
  }

  const progressValue = Math.max(0, Math.min(Number(progress) || 0, 100));
  const completed = progressValue >= 100;

  const updatePayload = {
    progress: progressValue,
    completed,
    completedAt: completed ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
  };

  await enrollmentRef.update(updatePayload);

  const updatedDoc = await enrollmentRef.get();

  res.json({
    success: true,
    enrollment: { id: updatedDoc.id, ...updatedDoc.data() },
  });
});

