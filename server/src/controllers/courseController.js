import { db } from '../config/firebase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { canAccessExam } from '../services/enrollmentAccess.js';

function serializeCourse(courseDoc) {
  const data = courseDoc.data ? courseDoc.data() : courseDoc;
  const id = courseDoc.id || data.id;
  return {
    id,
    title: data.title,
    description: data.description,
    price: data.price,
    examAvailable: data.examAvailable,
    lessons: data.lessons || [],
    exam: data.exam
      ? {
          title: data.exam.title,
          timeLimitMinutes: data.exam.timeLimitMinutes,
          passingScore: data.exam.passingScore,
          questionCount: (data.exam.questions || []).length,
        }
      : null,
  };
}

function serializeEnrollment(enrollmentDoc) {
  if (!enrollmentDoc) return null;
  const data = enrollmentDoc.data ? enrollmentDoc.data() : enrollmentDoc;
  const id = enrollmentDoc.id || data.id;
  return {
    id,
    progress: data.progress ?? 0,
    completed: data.completed ?? false,
    paymentStatus: data.paymentStatus || 'not_required',
    amountPaid: data.amountPaid ?? 0,
    enrolledAt: data.enrolledAt || data.createdAt || new Date().toISOString(),
    completedAt: data.completedAt || null,
    examResult: data.examResult || null,
  };
}

export const listCourses = asyncHandler(async (_req, res) => {
  const snapshot = await db.collection('courses').orderBy('createdAt', 'desc').get();
  const courses = snapshot.docs.map(serializeCourse);

  res.json({
    success: true,
    courses,
  });
});

export const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const courseDoc = await db.collection('courses').doc(id).get();
  if (!courseDoc.exists) {
    throw new ApiError(404, 'Course not found.');
  }

  const course = serializeCourse(courseDoc);

  let enrollment = null;
  if (req.user) {
    const enrollmentId = `${req.user.uid}_${id}`;
    const enrollmentDoc = await db.collection('enrollments').doc(enrollmentId).get();
    if (enrollmentDoc.exists) {
      enrollment = serializeEnrollment(enrollmentDoc);
    }
  }

  const access = canAccessExam(course, enrollment);

  res.json({
    success: true,
    course,
    enrollment,
    examAccess: access,
  });
});

export const listMyEnrollments = asyncHandler(async (req, res) => {
  const snapshot = await db
    .collection('enrollments')
    .where('userId', '==', req.user.uid)
    .orderBy('createdAt', 'desc')
    .get();

  const enrollments = [];
  for (const enrollmentDoc of snapshot.docs) {
    const enrollmentData = enrollmentDoc.data();
    const courseDoc = await db.collection('courses').doc(enrollmentData.courseId).get();
    const course = courseDoc.exists ? serializeCourse(courseDoc) : null;

    const enrollment = serializeEnrollment(enrollmentDoc);
    enrollments.push({
      ...enrollment,
      course,
      examAccess: canAccessExam(course, enrollment),
    });
  }

  res.json({
    success: true,
    enrollments,
  });
});

