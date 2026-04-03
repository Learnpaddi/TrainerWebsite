import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

admin.initializeApp();

const db = admin.firestore();

const razorpay = new Razorpay({
  key_id: functions.config().razorpay.key_id || 'rzp_test_4EXAMPLE_TEST_KEY_ID',
  key_secret: functions.config().razorpay.key_secret || 'EXAMPLE_SECRET',
});

/**
 * Create Razorpay Order
 */
export const createRazorpayOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Auth required');
  }

  const { amount, currency = 'INR', courseId, userId } = data;

  try {
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `course_${courseId}_${userId}`,
    });

    // Create pending enrollment
    await db.collection('enrollments').add({
      userId,
      courseId,
      enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'payment_pending',
      paymentAmount: amount / 100,
      razorpayOrderId: order.id
    });

    return { order, enrollmentCreated: true };
  } catch (error) {
    console.error('Order creation failed:', error);
    throw new functions.https.HttpsError('internal', 'Payment setup failed');
  }
});

/**
 * Verify Razorpay Payment
 */
export const verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  const { orderId, paymentId, signature } = data;

  try {
    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', functions.config().razorpay.key_secret || '')
      .update(orderId + '|' + paymentId)
      .digest('hex');

    if (generated_signature !== signature) {
      throw new Error('Invalid signature');
    }

    // Fetch payment
    const payment = await razorpay.payments.fetch(paymentId);
    if (payment.status !== 'captured') {
      throw new Error('Payment not captured');
    }

    // Update enrollment to paid
    const enrollmentSnapshot = await db.collection('enrollments')
      .where('razorpayOrderId', '==', orderId)
      .limit(1)
      .get();

    if (enrollmentSnapshot.empty) {
      throw new Error('Enrollment not found');
    }

    const enrollmentDoc = enrollmentSnapshot.docs[0];
    await enrollmentDoc.ref.update({
      status: 'paid',
      razorpayPaymentId: paymentId,
      razorpaySignature: signature
    });

    return { success: true, payment };
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw new functions.https.HttpsError('internal', 'Payment verification failed');
  }
});



