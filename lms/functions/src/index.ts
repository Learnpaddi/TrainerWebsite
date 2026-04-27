import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';

admin.initializeApp();

const db = admin.firestore();
const bucket = admin.storage().bucket();

type ExamQuestionRecord = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

type ExamDocumentRecord = {
  examId: string;
  courseId: string;
  duration: number;
  passingScore: number;
  questions: ExamQuestionRecord[];
};

type EnrollmentRecord = {
  userId: string;
  courseId: string;
  progress?: number;
  completed?: boolean;
  paymentStatus?: 'pending' | 'success' | 'not_required';
  examAttempted?: boolean;
  adminRetakeAllowed?: boolean;
  passed?: boolean;
  score?: number;
  certificateId?: string;
  certificateUrl?: string;
  examSession?: {
    attemptId: string;
    startedAt: admin.firestore.Timestamp;
    expiresAt: admin.firestore.Timestamp;
    questionOrder: string[];
    warningLimit: number;
    submittedAt?: admin.firestore.Timestamp | null;
  };
  examResult?: {
    score?: number;
    passed?: boolean;
    correctAnswers?: number;
    totalQuestions?: number;
    attemptedAt?: string;
    violationCount?: number;
    submissionReason?: string;
    autoSubmitted?: boolean;
  };
};

const DEFAULT_WARNING_LIMIT = 3;
const DEFAULT_PASSING_SCORE = 75;

const razorpayConfig = functions.config().razorpay || {};
const smtpConfig = functions.config().smtp || {};

const razorpay = razorpayConfig.key_id && razorpayConfig.key_secret
  ? new Razorpay({
      key_id: razorpayConfig.key_id,
      key_secret: razorpayConfig.key_secret,
    })
  : null;

function getEnrollmentRef(userId: string, courseId: string) {
  return db.collection('enrollments').doc(`${userId}_${courseId}`);
}

function getNowTimestamp() {
  return admin.firestore.Timestamp.now();
}

function toISOString(value: admin.firestore.Timestamp | string | undefined | null) {
  if (!value) {
    return new Date().toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.toDate().toISOString();
}

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  }
  return next;
}

function buildCertificateId(userId: string, courseId: string) {
  const digest = crypto.createHash('sha256').update(`${userId}:${courseId}`).digest('hex').slice(0, 10).toUpperCase();
  return `LP-${digest}`;
}

function resolveCorrectIndex(rawQuestion: Record<string, unknown>, options: string[]) {
  if (typeof rawQuestion.correctAnswerIndex === 'number') {
    return rawQuestion.correctAnswerIndex;
  }

  if (typeof rawQuestion.correctAnswer === 'number') {
    return rawQuestion.correctAnswer;
  }

  if (typeof rawQuestion.correctAnswer === 'string') {
    return options.findIndex((option) => option === rawQuestion.correctAnswer);
  }

  return -1;
}

function normalizeQuestion(rawQuestion: unknown, index: number): ExamQuestionRecord | null {
  if (!rawQuestion || typeof rawQuestion !== 'object') {
    return null;
  }

  const question = rawQuestion as Record<string, unknown>;
  const options = Array.isArray(question.options)
    ? question.options.filter((option): option is string => typeof option === 'string')
    : [];

  const correctIndex = resolveCorrectIndex(question, options);
  if (options.length < 2 || correctIndex < 0 || correctIndex >= options.length) {
    return null;
  }

  return {
    id: typeof question.id === 'string' ? question.id : `question-${index + 1}`,
    prompt: typeof question.prompt === 'string'
      ? question.prompt
      : typeof question.question === 'string'
        ? question.question
        : `Question ${index + 1}`,
    options,
    correctIndex,
  };
}

async function getCourseExam(courseId: string): Promise<ExamDocumentRecord> {
  const directExamSnapshot = await db.collection('exams').doc(courseId).get();
  let examSource: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | null = directExamSnapshot;

  if (!directExamSnapshot.exists) {
    const lookup = await db.collection('exams').where('courseId', '==', courseId).limit(1).get();
    examSource = lookup.empty ? null : lookup.docs[0];
  }

  if (!examSource?.exists) {
    throw new functions.https.HttpsError('not-found', 'Exam configuration was not found for this course.');
  }

  const examData = examSource.data() || {};
  const questions = Array.isArray(examData.questions)
    ? examData.questions
        .map((question, index) => normalizeQuestion(question, index))
        .filter((question): question is ExamQuestionRecord => Boolean(question))
    : [];

  if (!questions.length) {
    throw new functions.https.HttpsError('failed-precondition', 'This exam has no valid questions configured.');
  }

  return {
    examId: examSource.id,
    courseId,
    duration: typeof examData.duration === 'number' ? examData.duration : 30,
    passingScore: typeof examData.passingScore === 'number' ? examData.passingScore : DEFAULT_PASSING_SCORE,
    questions,
  };
}

function buildPublicQuestions(exam: ExamDocumentRecord, questionOrder: string[]) {
  const questionMap = new Map(exam.questions.map((question) => [question.id, question]));

  return questionOrder
    .map((questionId) => questionMap.get(questionId))
    .filter((question): question is ExamQuestionRecord => Boolean(question))
    .map((question) => ({
      id: question.id,
      prompt: question.prompt,
      options: question.options,
    }));
}

function assertSignedIn(context: functions.https.CallableContext) {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be signed in to continue.');
  }

  return context.auth.uid;
}

async function getUserIdFromRequest(req: functions.https.Request): Promise<string> {
  const authorization = req.headers.authorization || '';
  const [, token] = authorization.split(' ');

  if (!token) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be signed in to continue.');
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    throw new functions.https.HttpsError('unauthenticated', 'Invalid authentication token.');
  }
}

async function ensureExamAccess(userId: string, courseId: string) {
  const [courseSnapshot, enrollmentSnapshot, exam] = await Promise.all([
    db.collection('courses').doc(courseId).get(),
    getEnrollmentRef(userId, courseId).get(),
    getCourseExam(courseId),
  ]);

  if (!courseSnapshot.exists) {
    throw new functions.https.HttpsError('not-found', 'Course not found.');
  }

  if (!enrollmentSnapshot.exists) {
    throw new functions.https.HttpsError('failed-precondition', 'Enroll in the course first.');
  }

  const course = courseSnapshot.data() || {};
  const enrollment = enrollmentSnapshot.data() as EnrollmentRecord;

  if (!enrollment.completed) {
    throw new functions.https.HttpsError('failed-precondition', 'Complete the course before attempting the exam.');
  }

  const coursePrice = typeof course.price === 'number' ? course.price : 0;
  if (coursePrice > 0 && enrollment.paymentStatus !== 'success') {
    throw new functions.https.HttpsError('failed-precondition', 'Payment is required before the exam can begin.');
  }

  if ((enrollment.examAttempted && !enrollment.adminRetakeAllowed) || enrollment.passed) {
    throw new functions.https.HttpsError('failed-precondition', 'This exam already has a locked attempt on record.');
  }

  return {
    course,
    enrollment,
    enrollmentRef: enrollmentSnapshot.ref,
    exam,
  };
}

function scoreAttempt(exam: ExamDocumentRecord, answers: Record<string, number>) {
  const correctAnswers = exam.questions.reduce((total, question) => (
    answers[question.id] === question.correctIndex ? total + 1 : total
  ), 0);

  const totalQuestions = exam.questions.length;
  const score = Math.round((correctAnswers / Math.max(totalQuestions, 1)) * 100);
  const passed = score >= exam.passingScore;

  return {
    correctAnswers,
    totalQuestions,
    score,
    passed,
  };
}

async function sendCertificateEmail(input: {
  recipient: string;
  userName: string;
  courseTitle: string;
  certificateUrl: string;
  certificateId: string;
}) {
  if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
    functions.logger.info('Skipping certificate email because SMTP is not configured.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: Number(smtpConfig.port || 587),
    secure: String(smtpConfig.secure || 'false') === 'true',
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });

  await transporter.sendMail({
    from: smtpConfig.from || smtpConfig.user,
    to: input.recipient,
    subject: 'Your Certificate is Ready 🎉',
    html: `
      <p>Hi ${input.userName},</p>
      <p>Your LearnPaddi certificate for <strong>${input.courseTitle}</strong> is ready.</p>
      <p><a href="${input.certificateUrl}">Download your certificate</a></p>
      <p>Certificate ID: <strong>${input.certificateId}</strong></p>
    `,
  });
}

async function generateCertificateArtifact(input: {
  certificateId: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  score: number;
  completionDate: string;
}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const headingFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: rgb(0.98, 0.99, 1) });
  page.drawRectangle({
    x: 28,
    y: 28,
    width: pageWidth - 56,
    height: pageHeight - 56,
    borderColor: rgb(0.12, 0.29, 0.7),
    borderWidth: 2,
  });

  page.drawText('LEARNPADDI CERTIFIED', {
    x: 250,
    y: 510,
    size: 16,
    font: headingFont,
    color: rgb(0.12, 0.29, 0.7),
  });
  page.drawText('Certificate of Achievement', {
    x: 180,
    y: 455,
    size: 34,
    font: headingFont,
    color: rgb(0.08, 0.14, 0.22),
  });
  page.drawText('This certificate is proudly awarded to', {
    x: 292,
    y: 410,
    size: 15,
    font: bodyFont,
    color: rgb(0.28, 0.34, 0.41),
  });
  page.drawText(input.userName, {
    x: 130,
    y: 360,
    size: 36,
    font: headingFont,
    color: rgb(0.05, 0.12, 0.2),
  });
  page.drawText('for successfully completing and passing the final assessment for', {
    x: 185,
    y: 318,
    size: 15,
    font: bodyFont,
    color: rgb(0.28, 0.34, 0.41),
  });
  page.drawText(input.courseTitle, {
    x: 110,
    y: 270,
    size: 28,
    font: headingFont,
    color: rgb(0.01, 0.5, 0.53),
  });

  page.drawText(`Score: ${input.score}%`, {
    x: 96,
    y: 188,
    size: 15,
    font: bodyFont,
    color: rgb(0.2, 0.25, 0.32),
  });
  page.drawText(`Completion Date: ${input.completionDate}`, {
    x: 300,
    y: 188,
    size: 15,
    font: bodyFont,
    color: rgb(0.2, 0.25, 0.32),
  });
  page.drawText(`Certificate ID: ${input.certificateId}`, {
    x: 96,
    y: 156,
    size: 14,
    font: bodyFont,
    color: rgb(0.2, 0.25, 0.32),
  });
  page.drawText(`Verify at learnpaddi.in/verify-certificate?code=${input.certificateId}`, {
    x: 96,
    y: 128,
    size: 12,
    font: bodyFont,
    color: rgb(0.25, 0.35, 0.55),
  });
  page.drawText('LEARNPADDI VERIFIED', {
    x: 205,
    y: 280,
    size: 44,
    font: headingFont,
    color: rgb(0.92, 0.94, 0.97),
    rotate: degrees(26),
  });
  page.drawText('LearnPaddi Academic Office', {
    x: 545,
    y: 90,
    size: 14,
    font: headingFont,
    color: rgb(0.12, 0.29, 0.7),
  });

  const bytes = await pdf.save();
  const storagePath = `certificates/${input.userId}/${input.certificateId}.pdf`;
  const file = bucket.file(storagePath);

  await file.save(Buffer.from(bytes), {
    resumable: false,
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        certificateId: input.certificateId,
        userId: input.userId,
        courseId: input.courseId,
      },
    },
  });

  const [certificateUrl] = await file.getSignedUrl({
    action: 'read',
    expires: '2100-01-01',
  });

  return {
    certificateUrl,
    storagePath,
  };
}

export const createExamOrder = functions.https.onCall(async (data, context) => {
  const userId = assertSignedIn(context);
  const courseId = typeof data?.courseId === 'string' ? data.courseId : '';
  if (!courseId) {
    throw new functions.https.HttpsError('invalid-argument', 'courseId is required.');
  }

  const [courseSnapshot, enrollmentSnapshot] = await Promise.all([
    db.collection('courses').doc(courseId).get(),
    getEnrollmentRef(userId, courseId).get(),
  ]);

  if (!courseSnapshot.exists || !enrollmentSnapshot.exists) {
    throw new functions.https.HttpsError('failed-precondition', 'Course enrollment was not found.');
  }

  const course = courseSnapshot.data() || {};
  const enrollment = enrollmentSnapshot.data() as EnrollmentRecord;
  const amount = Math.round((typeof course.price === 'number' ? course.price : 0) * 100);

  if (!enrollment.completed) {
    throw new functions.https.HttpsError('failed-precondition', 'Complete the course before paying for the exam.');
  }

  if (amount <= 0 || enrollment.paymentStatus === 'success') {
    return {
      provider: 'already_paid' as const,
      order: null,
      keyId: null,
    };
  }

  if (!razorpay || !razorpayConfig.key_id) {
    throw new functions.https.HttpsError('failed-precondition', 'Razorpay is not configured for this project.');
  }

  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `exam_${courseId}_${userId}`,
  });

  await enrollmentSnapshot.ref.set({
    paymentStatus: 'pending',
    razorpayOrderId: order.id,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return {
    provider: 'razorpay' as const,
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt || `exam_${courseId}_${userId}`,
    },
    keyId: razorpayConfig.key_id as string,
  };
});

export const verifyExamPayment = functions.https.onCall(async (data, context) => {
  const userId = assertSignedIn(context);
  const courseId = typeof data?.courseId === 'string' ? data.courseId : '';
  const orderId = typeof data?.razorpay_order_id === 'string' ? data.razorpay_order_id : '';
  const paymentId = typeof data?.razorpay_payment_id === 'string' ? data.razorpay_payment_id : '';
  const signature = typeof data?.razorpay_signature === 'string' ? data.razorpay_signature : '';

  if (!courseId || !orderId || !paymentId || !signature) {
    throw new functions.https.HttpsError('invalid-argument', 'Payment verification payload is incomplete.');
  }

  const secret = typeof razorpayConfig.key_secret === 'string' ? razorpayConfig.key_secret : '';
  const expectedSignature = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');

  if (expectedSignature !== signature) {
    throw new functions.https.HttpsError('permission-denied', 'Payment signature verification failed.');
  }

  await getEnrollmentRef(userId, courseId).set({
    paymentStatus: 'success',
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: signature,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return {
    paymentStatus: 'success' as const,
  };
});

function setCorsHeaders(res: functions.Response) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

void [DEFAULT_WARNING_LIMIT, shuffle, buildPublicQuestions, getUserIdFromRequest, ensureExamAccess];

export const startCourseExam = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);

  functions.logger.info('startCourseExam request received', {
    method: req.method,
    origin: req.headers.origin,
    requestHeaders: req.headers['access-control-request-headers'],
  });

  if (req.method === 'OPTIONS') {
    functions.logger.info('startCourseExam preflight handled', {
      method: req.method,
      status: 204,
    });
    res.status(204).send('');
    return;
  }

  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const body = req.body || {};
    const courseId = typeof body.courseId === 'string' ? body.courseId : '';
    const userId = typeof body.userId === 'string' ? body.userId : '';

    if (!courseId || !userId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Exam started successfully',
    });
  } catch (error) {
    functions.logger.error('FUNCTION ERROR:', error);
    setCorsHeaders(res);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export const submitCourseExamAttempt = functions.https.onCall(async (data, context) => {
  const userId = assertSignedIn(context);
  const courseId = typeof data?.courseId === 'string' ? data.courseId : '';
  const attemptId = typeof data?.attemptId === 'string' ? data.attemptId : '';
  const answers = (data?.answers && typeof data.answers === 'object' ? data.answers : {}) as Record<string, number>;
  const violationCount = typeof data?.violationCount === 'number' ? data.violationCount : 0;
  const submissionReason = typeof data?.submissionReason === 'string' ? data.submissionReason : 'manual';
  const autoSubmitted = Boolean(data?.autoSubmitted);

  if (!courseId || !attemptId) {
    throw new functions.https.HttpsError('invalid-argument', 'courseId and attemptId are required.');
  }

  const [courseSnapshot, enrollmentSnapshot, exam] = await Promise.all([
    db.collection('courses').doc(courseId).get(),
    getEnrollmentRef(userId, courseId).get(),
    getCourseExam(courseId),
  ]);

  if (!courseSnapshot.exists || !enrollmentSnapshot.exists) {
    throw new functions.https.HttpsError('failed-precondition', 'Exam enrollment could not be found.');
  }

  const course = courseSnapshot.data() || {};
  const enrollment = enrollmentSnapshot.data() as EnrollmentRecord;
  const session = enrollment.examSession;

  if (!session || session.attemptId !== attemptId) {
    throw new functions.https.HttpsError('failed-precondition', 'This exam attempt is not active.');
  }

  if (session.submittedAt) {
    throw new functions.https.HttpsError('failed-precondition', 'This exam attempt has already been submitted.');
  }

  const result = scoreAttempt(exam, answers);
  const attemptedAt = new Date().toISOString();
  const certificateId = result.passed ? buildCertificateId(userId, courseId) : null;

  await enrollmentSnapshot.ref.set({
    examAttempted: true,
    adminRetakeAllowed: false,
    score: result.score,
    passed: result.passed,
    certificateId,
    examSession: {
      ...session,
      submittedAt: getNowTimestamp(),
    },
    examResult: {
      score: result.score,
      passed: result.passed,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      attemptedAt,
      violationCount,
      submissionReason,
      autoSubmitted,
    },
    updatedAt: attemptedAt,
    courseTitle: typeof course.title === 'string' ? course.title : 'Course',
  }, { merge: true });

  return {
    score: result.score,
    passed: result.passed,
    correctAnswers: result.correctAnswers,
    totalQuestions: result.totalQuestions,
    attemptedAt,
    autoSubmitted,
    certificateId,
    certificateUrl: typeof enrollment.certificateUrl === 'string' ? enrollment.certificateUrl : null,
  };
});

export const issueCertificateOnPass = functions.firestore
  .document('enrollments/{enrollmentId}')
  .onWrite(async (change) => {
    const before = change.before.exists ? change.before.data() as EnrollmentRecord : null;
    const after = change.after.exists ? change.after.data() as EnrollmentRecord : null;

    if (!after?.passed || after.certificateUrl) {
      return;
    }

    if (before?.passed === true && before.certificateUrl) {
      return;
    }

    const userId = after.userId;
    const courseId = after.courseId;
    if (!userId || !courseId) {
      return;
    }

    const [userSnapshot, courseSnapshot] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('courses').doc(courseId).get(),
    ]);

    const user = userSnapshot.data() || {};
    const course = courseSnapshot.data() || {};
    const certificateId = after.certificateId || buildCertificateId(userId, courseId);
    const completionDate = toISOString(after.examResult?.attemptedAt as string | undefined);
    const artifact = await generateCertificateArtifact({
      certificateId,
      userId,
      userName: typeof user.name === 'string' ? user.name : 'LearnPaddi Learner',
      courseId,
      courseTitle: typeof course.title === 'string' ? course.title : 'Course',
      score: typeof after.score === 'number' ? after.score : 0,
      completionDate,
    });

    const certificateRecord = {
      certificateId,
      userId,
      courseId,
      userName: typeof user.name === 'string' ? user.name : 'LearnPaddi Learner',
      courseTitle: typeof course.title === 'string' ? course.title : 'Course',
      score: typeof after.score === 'number' ? after.score : 0,
      completionDate,
      certificateUrl: artifact.certificateUrl,
      storagePath: artifact.storagePath,
      verificationUrl: `https://learnpaddi.in/verify-certificate?code=${certificateId}`,
      issuedAt: new Date().toISOString(),
    };

    await Promise.all([
      change.after.ref.set({
        certificateId,
        certificateUrl: artifact.certificateUrl,
        certificateIssuedAt: new Date().toISOString(),
      }, { merge: true }),
      db.collection('certificates').doc(certificateId).set(certificateRecord, { merge: true }),
      db.collection('users').doc(userId).set({
        certificates: admin.firestore.FieldValue.arrayUnion(certificateId),
        updatedAt: new Date().toISOString(),
      }, { merge: true }),
    ]);

    if (typeof user.email === 'string' && user.email) {
      await sendCertificateEmail({
        recipient: user.email,
        userName: certificateRecord.userName,
        courseTitle: certificateRecord.courseTitle,
        certificateUrl: artifact.certificateUrl,
        certificateId,
      });
    }
  });

export const verifyCertificate = functions.https.onCall(async (data) => {
  const certificateId = typeof data?.certificateId === 'string' ? data.certificateId.trim().toUpperCase() : '';
  if (!certificateId) {
    throw new functions.https.HttpsError('invalid-argument', 'certificateId is required.');
  }

  const snapshot = await db.collection('certificates').doc(certificateId).get();
  if (!snapshot.exists) {
    return { certificate: null };
  }

  return {
    certificate: {
      id: snapshot.id,
      valid: true,
      ...snapshot.data(),
    },
  };
});
