import { db } from '../config/firebase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { createGatewayOrder, verifyGatewayPayment } from '../utils/payment.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  if (!courseId || typeof courseId !== 'string') {
    throw new ApiError(400, 'A valid courseId is required.');
  }

  const [courseDoc, enrollmentDoc] = await Promise.all([
    db.collection('courses').doc(courseId).get(),
    db.collection('enrollments').doc(`${req.user.uid}_${courseId}`).get(),
  ]);

  if (!courseDoc.exists) {
    throw new ApiError(404, 'Course not found.');
  }

  if (!enrollmentDoc.exists) {
    throw new ApiError(404, 'Enroll in the course before creating a payment order.');
  }

  const courseData = courseDoc.data();
  const enrollmentData = enrollmentDoc.data();

  if (courseData.price === 0) {
    throw new ApiError(400, 'This is a free course and does not require payment.');
  }

  if (enrollmentData.paymentStatus === 'success') {
    return res.json({
      success: true,
      provider: 'paid',
      order: null,
      message: 'Payment already completed for this course.',
    });
  }

  const order = await createGatewayOrder({
    amount: courseData.price * 100,
    receipt: `course_${courseId}_user_${req.user.uid}`,
    notes: {
      courseId,
      userId: req.user.uid,
    },
  });

  await db.collection('enrollments').doc(`${req.user.uid}_${courseId}`).update({
    paymentOrderId: order.id,
    paymentStatus: 'pending',
    updatedAt: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    provider: order.provider,
    keyId: order.keyId || null,
    order,
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    courseId,
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
    mockSuccess = true,
  } = req.body;

  if (!courseId || typeof courseId !== 'string') {
    throw new ApiError(400, 'A valid courseId is required.');
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
  const enrollmentRef = db.collection('enrollments').doc(`${req.user.uid}_${courseId}`);

  if (courseData.price === 0) {
    await enrollmentRef.update({
      paymentStatus: 'not_required',
      updatedAt: new Date().toISOString(),
    });
    return res.json({
      success: true,
      paymentStatus: 'not_required',
    });
  }

  const paymentIsValid = mockSuccess && verifyGatewayPayment({
    orderId: orderId || enrollmentData.paymentOrderId,
    paymentId: paymentId || `mock_payment_${Date.now()}`,
    signature: signature || 'mock_signature',
  });

  const updatePayload = {
    paymentStatus: paymentIsValid ? 'success' : 'failed',
    paymentId: paymentId || `mock_payment_${Date.now()}`,
    paymentOrderId: orderId || enrollmentData.paymentOrderId,
    paymentSignature: signature || 'mock_signature',
    amountPaid: paymentIsValid ? courseData.price : 0,
    updatedAt: new Date().toISOString(),
  };

  await enrollmentRef.update(updatePayload);

  if (!paymentIsValid) {
    throw new ApiError(400, 'Payment verification failed.');
  }

  res.json({
    success: true,
    paymentStatus: 'success',
  });
});

