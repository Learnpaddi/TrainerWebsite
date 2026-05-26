import { prisma } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { createGatewayOrder, verifyGatewayPayment } from '../utils/payment.js';

async function getCourseEnrollment(userId, courseId) {
  return Promise.all([
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    }),
  ]);
}

export const createOrder = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  if (!courseId || typeof courseId !== 'string') {
    throw new ApiError(400, 'A valid courseId is required.');
  }

  const [course, enrollment] = await getCourseEnrollment(req.user.id, courseId);
  if (!course) {
    throw new ApiError(404, 'Course not found.');
  }

  if (!enrollment) {
    throw new ApiError(404, 'Enroll in the course before creating a payment order.');
  }

  if (course.price === 0) {
    throw new ApiError(400, 'This is a free course and does not require payment.');
  }

  if (enrollment.paymentStatus === 'success') {
    return res.json({
      success: true,
      provider: 'paid',
      order: null,
      message: 'Payment already completed for this course.',
    });
  }

  const order = await createGatewayOrder({
    amount: course.price * 100,
    receipt: `course_${courseId}_user_${req.user.id}`,
    notes: {
      courseId,
      userId: req.user.id,
    },
  });

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      paymentOrderId: order.id,
      razorpayOrderId: order.id,
      paymentStatus: 'pending',
    },
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

  const [course, enrollment] = await getCourseEnrollment(req.user.id, courseId);
  if (!course || !enrollment) {
    throw new ApiError(404, 'Course enrollment was not found.');
  }

  if (course.price === 0) {
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { paymentStatus: 'not_required' },
    });
    return res.json({
      success: true,
      paymentStatus: 'not_required',
    });
  }

  const paymentIsValid = mockSuccess && verifyGatewayPayment({
    orderId: orderId || enrollment.paymentOrderId,
    paymentId: paymentId || `mock_payment_${Date.now()}`,
    signature: signature || 'mock_signature',
  });

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      paymentStatus: paymentIsValid ? 'success' : 'failed',
      paymentId: paymentId || `mock_payment_${Date.now()}`,
      paymentOrderId: orderId || enrollment.paymentOrderId,
      paymentSignature: signature || 'mock_signature',
      razorpayPaymentId: paymentId || `mock_payment_${Date.now()}`,
      razorpayOrderId: orderId || enrollment.paymentOrderId,
      razorpaySignature: signature || 'mock_signature',
      amountPaid: paymentIsValid ? course.price : 0,
    },
  });

  if (!paymentIsValid) {
    throw new ApiError(400, 'Payment verification failed.');
  }

  res.json({
    success: true,
    paymentStatus: 'success',
  });
});
