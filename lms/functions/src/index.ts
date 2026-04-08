import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

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

/**
 * Generate a completion certificate PDF and upload to Storage.
 * Requires:
 * 1) authenticated user
 * 2) enrollment exists
 * 3) progress >= 100
 */
export const generateCertificate = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Auth required');
  }

  const uid = context.auth.uid;
  const courseId = (data?.courseId || '').toString();

  if (!courseId) {
    throw new functions.https.HttpsError('invalid-argument', 'courseId is required');
  }

  try {
    const [userSnap, courseSnap, progressSnap, enrollmentSnap] = await Promise.all([
      db.collection('users').doc(uid).get(),
      db.collection('courses').doc(courseId).get(),
      db.collection('progress').doc(`${uid}_${courseId}`).get(),
      db.collection('enrollments').doc(`${uid}_${courseId}`).get(),
    ]);

    if (!courseSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Course not found');
    }

    if (!enrollmentSnap.exists) {
      throw new functions.https.HttpsError('failed-precondition', 'User is not enrolled in this course');
    }

    const progressData = progressSnap.data() || {};
    const percentage = Number(progressData.percentage || 0);
    if (percentage < 100) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Course must be 100% completed before generating certificate',
      );
    }

    const userData = userSnap.data() || {};
    const courseData = courseSnap.data() || {};
    const studentName = (userData.name || context.auth.token.email || 'Learner').toString();
    const courseTitle = (courseData.title || 'Course').toString();

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    const { width, height } = page.getSize();
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.98, 0.99, 1) });
    page.drawRectangle({ x: 26, y: 26, width: width - 52, height: height - 52, borderWidth: 2, borderColor: rgb(0.15, 0.39, 0.92) });
    page.drawText('CERTIFICATE OF COMPLETION', {
      x: 190,
      y: 500,
      size: 34,
      font: titleFont,
      color: rgb(0.12, 0.2, 0.45),
    });
    page.drawText('This is proudly awarded to', {
      x: 322,
      y: 430,
      size: 14,
      font: bodyFont,
      color: rgb(0.24, 0.3, 0.4),
    });
    page.drawText(studentName, {
      x: 140,
      y: 385,
      size: 40,
      font: titleFont,
      color: rgb(0.08, 0.14, 0.22),
    });
    page.drawText('for successfully completing', {
      x: 320,
      y: 338,
      size: 14,
      font: bodyFont,
      color: rgb(0.24, 0.3, 0.4),
    });
    page.drawText(courseTitle, {
      x: 135,
      y: 290,
      size: 30,
      font: titleFont,
      color: rgb(0.02, 0.55, 0.56),
    });
    page.drawText(`Issued on ${new Date().toDateString()}`, {
      x: 330,
      y: 220,
      size: 13,
      font: bodyFont,
      color: rgb(0.32, 0.38, 0.46),
    });
    page.drawText('LearnPaddi LMS', {
      x: 340,
      y: 108,
      size: 16,
      font: titleFont,
      color: rgb(0.15, 0.39, 0.92),
    });

    const pdfBytes = await pdfDoc.save();
    const storagePath = `certificates/${uid}/${courseId}.pdf`;
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);
    await file.save(Buffer.from(pdfBytes), {
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          uid,
          courseId,
          source: 'cloud-function',
        },
      },
      resumable: false,
    });

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '2100-01-01',
    });

    const certificateDocId = `${uid}_${courseId}`;
    await Promise.all([
      db.collection('certificates').doc(certificateDocId).set({
        id: certificateDocId,
        userId: uid,
        courseId,
        studentName,
        courseTitle,
        certificateUrl: signedUrl,
        storagePath,
        issuedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true }),
      db.collection('progress').doc(`${uid}_${courseId}`).set({
        certificateUrl: signedUrl,
        updatedAt: new Date().toISOString(),
      }, { merge: true }),
      db.collection('users').doc(uid).set({
        certificates: admin.firestore.FieldValue.arrayUnion(courseId),
        updatedAt: new Date().toISOString(),
      }, { merge: true }),
    ]);

    return {
      success: true,
      certificateUrl: signedUrl,
      storagePath,
    };
  } catch (error) {
    console.error('Certificate generation failed:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Certificate generation failed');
  }
});

