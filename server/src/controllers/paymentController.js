import mongoose from 'mongoose';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { createGatewayOrder, verifyGatewayPayment } from '../utils/payment.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, 'A valid courseId is required.');
  }

  const [course, enrollment] = await Promise.all([
    Course.findById(courseId),
    Enrollment.findOne({ userId: req.user._id, courseId }),
  ]);

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
    receipt: `course_${course._id}_user_${req.user._id}`,
    notes: {
      courseId: course._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  enrollment.paymentOrderId = order.id;
  enrollment.paymentStatus = 'pending';
  await enrollment.save();

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

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, 'A valid courseId is required.');
  }

  const [course, enrollment] = await Promise.all([
    Course.findById(courseId),
    Enrollment.findOne({ userId: req.user._id, courseId }),
  ]);

  if (!course || !enrollment) {
    throw new ApiError(404, 'Course enrollment was not found.');
  }

  if (course.price === 0) {
    enrollment.paymentStatus = 'not_required';
    await enrollment.save();
    return res.json({
      success: true,
      paymentStatus: enrollment.paymentStatus,
    });
  }

  const paymentIsValid = mockSuccess && verifyGatewayPayment({
    orderId: orderId || enrollment.paymentOrderId,
    paymentId: paymentId || `mock_payment_${Date.now()}`,
    signature: signature || 'mock_signature',
  });

  enrollment.paymentStatus = paymentIsValid ? 'success' : 'failed';
  enrollment.paymentId = paymentId || `mock_payment_${Date.now()}`;
  enrollment.paymentOrderId = orderId || enrollment.paymentOrderId;
  enrollment.paymentSignature = signature || 'mock_signature';
  enrollment.amountPaid = paymentIsValid ? course.price : 0;
  await enrollment.save();

  if (!paymentIsValid) {
    throw new ApiError(400, 'Payment verification failed.');
  }

  res.json({
    success: true,
    paymentStatus: enrollment.paymentStatus,
  });
});
