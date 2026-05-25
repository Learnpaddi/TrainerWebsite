"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCertificate = exports.submitCourseExamAttempt = exports.startCourseExam = exports.verifyExamPayment = exports.createExamOrder = exports.listCertificates = exports.listExamDashboard = exports.completeCourseForExam = exports.getAuthUserProfile = exports.upsertAuthUserProfile = exports.checkPrismaDatabase = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const razorpay_1 = __importDefault(require("razorpay"));
const prisma_1 = require("./lib/prisma");
admin.initializeApp();
function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
const DEFAULT_WARNING_LIMIT = 3;
const DEFAULT_PASSING_SCORE = 75;
const razorpayConfig = functions.config().razorpay || {};
const razorpay = razorpayConfig.key_id && razorpayConfig.key_secret
    ? new razorpay_1.default({
        key_id: razorpayConfig.key_id,
        key_secret: razorpayConfig.key_secret,
    })
    : null;
function getNowTimestamp() {
    return admin.firestore.Timestamp.now();
}
function shuffle(items) {
    const next = [...items];
    for (let index = next.length - 1; index > 0; index -= 1) {
        const targetIndex = Math.floor(Math.random() * (index + 1));
        [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    }
    return next;
}
function buildCertificateId(userId, courseId) {
    const digest = node_crypto_1.default.createHash('sha256').update(`${userId}:${courseId}`).digest('hex').slice(0, 10).toUpperCase();
    return `LP-${digest}`;
}
function resolveCorrectIndex(rawQuestion, options) {
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
function normalizeQuestion(rawQuestion, index) {
    if (!rawQuestion || typeof rawQuestion !== 'object') {
        return null;
    }
    const question = rawQuestion;
    const options = Array.isArray(question.options)
        ? question.options.filter((option) => typeof option === 'string')
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
function normalizePrismaQuestions(rawQuestions, courseId) {
    if (!Array.isArray(rawQuestions)) {
        return null;
    }
    const questions = rawQuestions
        .map((question, index) => normalizeQuestion(question, index))
        .filter((question) => Boolean(question));
    if (!questions.length) {
        return null;
    }
    return {
        examId: courseId,
        courseId,
        duration: 30,
        passingScore: DEFAULT_PASSING_SCORE,
        questions,
    };
}
async function getPrismaCourseExam(courseId) {
    const exam = await prisma_1.prisma.exam.findFirst({
        where: {
            OR: [
                { courseId },
                { id: courseId },
            ],
        },
    });
    if (!exam) {
        return null;
    }
    const normalized = normalizePrismaQuestions(exam.questions, exam.courseId);
    if (!normalized) {
        return null;
    }
    return {
        ...normalized,
        examId: exam.id,
        duration: exam.duration,
        passingScore: exam.passingScore,
    };
}
async function getCourseExam(courseId) {
    const prismaExam = await getPrismaCourseExam(courseId);
    if (prismaExam) {
        return prismaExam;
    }
    throw new functions.https.HttpsError('not-found', 'Exam configuration was not found for this course.');
}
function buildPublicQuestions(exam, questionOrder) {
    const questionMap = new Map(exam.questions.map((question) => [question.id, question]));
    return questionOrder
        .map((questionId) => questionMap.get(questionId))
        .filter((question) => Boolean(question))
        .map((question) => ({
        id: question.id,
        prompt: question.prompt,
        options: question.options,
    }));
}
function assertSignedIn(context) {
    if (!context.auth?.uid) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be signed in to continue.');
    }
    return context.auth.uid;
}
exports.checkPrismaDatabase = functions.https.onCall(async (_data, context) => {
    assertSignedIn(context);
    await prisma_1.prisma.$queryRaw `SELECT 1`;
    return {
        ok: true,
        checkedAt: new Date().toISOString(),
    };
});
exports.upsertAuthUserProfile = functions.https.onCall(async (data, context) => {
    const userId = assertSignedIn(context);
    const authUser = await admin.auth().getUser(userId);
    const role = data?.role === 'trainer' ? 'trainer' : 'student';
    const name = typeof data?.name === 'string' && data.name.trim()
        ? data.name.trim()
        : authUser.displayName || '';
    const email = authUser.email || (typeof data?.email === 'string' ? data.email : `${userId}@firebase.local`);
    const user = await prisma_1.prisma.user.upsert({
        where: { id: userId },
        create: {
            id: userId,
            email,
            name,
            role,
        },
        update: {
            email,
            name,
            role,
        },
    });
    return {
        user: {
            uid: user.id,
            email: user.email,
            name: user.name || '',
            role: user.role === 'trainer' ? 'trainer' : 'student',
            trainerId: user.role === 'trainer' ? user.id : null,
            enrolledCourses: [],
            certificates: [],
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        },
    };
});
exports.getAuthUserProfile = functions.https.onCall(async (_data, context) => {
    const userId = assertSignedIn(context);
    const authUser = await admin.auth().getUser(userId);
    const user = await prisma_1.prisma.user.upsert({
        where: { id: userId },
        create: {
            id: userId,
            email: authUser.email || `${userId}@firebase.local`,
            name: authUser.displayName || '',
            role: 'student',
        },
        update: {
            email: authUser.email || undefined,
            name: authUser.displayName || undefined,
        },
    });
    return {
        user: {
            uid: user.id,
            email: user.email,
            name: user.name || '',
            role: user.role === 'trainer' ? 'trainer' : 'student',
            trainerId: user.role === 'trainer' ? user.id : null,
            enrolledCourses: [],
            certificates: [],
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        },
    };
});
exports.completeCourseForExam = functions.https.onCall(async (data, context) => {
    const userId = assertSignedIn(context);
    const courseId = typeof data?.courseId === 'string' ? data.courseId : '';
    const progress = typeof data?.progress === 'number' ? Math.max(0, Math.min(100, Math.round(data.progress))) : 100;
    if (!courseId) {
        throw new functions.https.HttpsError('invalid-argument', 'courseId is required.');
    }
    const prismaCourse = await prisma_1.prisma.course.findUnique({ where: { id: courseId } });
    if (!prismaCourse) {
        throw new functions.https.HttpsError('not-found', 'Course not found.');
    }
    const course = {
        title: prismaCourse.title,
        price: prismaCourse.price,
        description: prismaCourse.description,
        examAvailable: prismaCourse.examAvailable,
        lessons: prismaCourse.lessons,
    };
    const paymentStatus = prismaCourse.price > 0 ? 'pending' : 'not_required';
    const completed = progress >= 100;
    const updatedAt = new Date().toISOString();
    await upsertPrismaEnrollment(userId, courseId, course, {
        progress,
        completed,
        status: completed ? 'completed' : 'in_progress',
        paymentStatus,
        courseTitle: prismaCourse.title,
    });
    return {
        enrollment: {
            userId,
            courseId,
            progress,
            completed,
            paymentStatus,
            updatedAt,
        },
    };
});
exports.listExamDashboard = functions.https.onCall(async (_data, context) => {
    const userId = assertSignedIn(context);
    const enrollments = await prisma_1.prisma.enrollment.findMany({
        where: {
            userId,
            OR: [
                { completed: true },
                { progress: { gte: 100 } },
                { status: 'completed' },
            ],
        },
        include: {
            course: {
                include: {
                    exams: true,
                },
            },
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });
    return {
        items: enrollments
            .filter((enrollment) => enrollment.course.examAvailable && enrollment.course.exams.length > 0)
            .map((enrollment) => {
            const exam = enrollment.course.exams[0];
            const questions = Array.isArray(exam.questions) ? exam.questions : [];
            return {
                enrollmentId: enrollment.id,
                userId: enrollment.userId,
                courseId: enrollment.courseId,
                courseTitle: enrollment.course.title,
                price: enrollment.course.price,
                completed: enrollment.completed || enrollment.progress >= 100 || enrollment.status === 'completed',
                progress: enrollment.progress,
                paymentStatus: enrollment.paymentStatus === 'success'
                    ? 'success'
                    : enrollment.paymentStatus === 'pending'
                        ? 'pending'
                        : 'not_required',
                examAttempted: enrollment.examAttempted,
                passed: enrollment.passed,
                score: enrollment.score,
                certificateUrl: enrollment.certificateUrl,
                certificateId: enrollment.certificateId,
                examAvailable: true,
                examTitle: exam.title || `${enrollment.course.title} Final Exam`,
                duration: exam.duration,
                passingScore: exam.passingScore,
                questionCount: questions.length,
                adminRetakeAllowed: enrollment.adminRetakeAllowed,
            };
        }),
    };
});
exports.listCertificates = functions.https.onCall(async (_data, context) => {
    const userId = assertSignedIn(context);
    const certificates = await prisma_1.prisma.certificate.findMany({
        where: { userId },
        orderBy: { issuedAt: 'desc' },
    });
    return {
        certificates: certificates.map((certificate) => ({
            id: certificate.id,
            certificateId: certificate.certificateId,
            userId: certificate.userId,
            courseId: certificate.courseId,
            courseTitle: certificate.courseTitle,
            userName: certificate.userName,
            score: certificate.score,
            completionDate: certificate.completionDate.toISOString(),
            certificateUrl: certificate.certificateUrl,
            verificationUrl: certificate.verificationUrl || undefined,
            issuedAt: certificate.issuedAt.toISOString(),
        })),
    };
});
async function getUserIdFromRequest(req) {
    const authorization = req.headers.authorization || '';
    const [, token] = authorization.split(' ');
    if (!token) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be signed in to continue.');
    }
    try {
        const decoded = await admin.auth().verifyIdToken(token);
        return decoded.uid;
    }
    catch {
        throw new functions.https.HttpsError('unauthenticated', 'Invalid authentication token.');
    }
}
function toFirestoreTimestamp(value) {
    if (!value) {
        return undefined;
    }
    if (value instanceof admin.firestore.Timestamp) {
        return value;
    }
    if (value instanceof Date) {
        return admin.firestore.Timestamp.fromDate(value);
    }
    if (typeof value === 'string') {
        const millis = Date.parse(value);
        return Number.isNaN(millis) ? undefined : admin.firestore.Timestamp.fromMillis(millis);
    }
    if (isRecord(value) && typeof value.seconds === 'number') {
        return new admin.firestore.Timestamp(value.seconds, typeof value.nanoseconds === 'number' ? value.nanoseconds : 0);
    }
    return undefined;
}
function normalizePrismaExamSession(value) {
    if (!isRecord(value)) {
        return undefined;
    }
    const startedAt = toFirestoreTimestamp(value.startedAt);
    const expiresAt = toFirestoreTimestamp(value.expiresAt);
    const questionOrder = Array.isArray(value.questionOrder)
        ? value.questionOrder.filter((questionId) => typeof questionId === 'string')
        : [];
    if (typeof value.attemptId !== 'string'
        || !startedAt
        || !expiresAt
        || !questionOrder.length) {
        return undefined;
    }
    return {
        attemptId: value.attemptId,
        startedAt,
        expiresAt,
        questionOrder,
        warningLimit: typeof value.warningLimit === 'number' ? value.warningLimit : DEFAULT_WARNING_LIMIT,
        submittedAt: toFirestoreTimestamp(value.submittedAt) || null,
    };
}
function normalizePrismaEnrollment(enrollment) {
    if (!enrollment) {
        return null;
    }
    return {
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        progress: enrollment.progress,
        completed: enrollment.completed,
        paymentStatus: enrollment.paymentStatus,
        status: enrollment.status || undefined,
        examAttempted: enrollment.examAttempted,
        adminRetakeAllowed: enrollment.adminRetakeAllowed,
        passed: enrollment.passed,
        score: enrollment.score ?? undefined,
        certificateId: enrollment.certificateId ?? undefined,
        certificateUrl: enrollment.certificateUrl ?? undefined,
        examSession: normalizePrismaExamSession(enrollment.examSession),
        examResult: isRecord(enrollment.examResult) ? enrollment.examResult : undefined,
    };
}
async function ensurePrismaUser(userId) {
    const authUser = await admin.auth().getUser(userId).catch(() => null);
    await prisma_1.prisma.user.upsert({
        where: { id: userId },
        create: {
            id: userId,
            email: authUser?.email || `${userId}@firebase.local`,
            name: authUser?.displayName || null,
            role: 'student',
        },
        update: {
            email: authUser?.email || undefined,
            name: authUser?.displayName || undefined,
        },
    });
}
async function ensurePrismaCourse(courseId, course) {
    await prisma_1.prisma.course.upsert({
        where: { id: courseId },
        create: {
            id: courseId,
            title: typeof course.title === 'string' ? course.title : 'Course',
            description: typeof course.description === 'string' ? course.description : null,
            price: typeof course.price === 'number' ? course.price : 0,
            examAvailable: typeof course.examAvailable === 'boolean' ? course.examAvailable : true,
            lessons: Array.isArray(course.lessons) ? course.lessons : undefined,
        },
        update: {
            title: typeof course.title === 'string' ? course.title : undefined,
            description: typeof course.description === 'string' ? course.description : undefined,
            price: typeof course.price === 'number' ? course.price : undefined,
            examAvailable: typeof course.examAvailable === 'boolean' ? course.examAvailable : undefined,
            lessons: Array.isArray(course.lessons) ? course.lessons : undefined,
        },
    });
}
function serializeExamSession(session) {
    return {
        attemptId: session.attemptId,
        startedAt: session.startedAt.toDate().toISOString(),
        expiresAt: session.expiresAt.toDate().toISOString(),
        questionOrder: session.questionOrder,
        warningLimit: session.warningLimit,
        submittedAt: session.submittedAt ? session.submittedAt.toDate().toISOString() : null,
    };
}
async function upsertPrismaEnrollment(userId, courseId, course, data) {
    await ensurePrismaUser(userId);
    await ensurePrismaCourse(courseId, course);
    await prisma_1.prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: {
            userId,
            courseId,
            progress: typeof data.progress === 'number' ? data.progress : 0,
            completed: typeof data.completed === 'boolean' ? data.completed : false,
            paymentStatus: typeof data.paymentStatus === 'string' ? data.paymentStatus : 'not_required',
            ...data,
        },
        update: data,
    });
}
async function ensureExamAccess(userId, courseId) {
    const [prismaCourse, prismaEnrollment, exam] = await Promise.all([
        prisma_1.prisma.course.findUnique({ where: { id: courseId } }),
        prisma_1.prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } }),
        getCourseExam(courseId),
    ]);
    if (!prismaCourse) {
        throw new functions.https.HttpsError('not-found', 'Course not found.');
    }
    if (!prismaEnrollment) {
        throw new functions.https.HttpsError('failed-precondition', 'Enroll in the course first.');
    }
    const course = {
        title: prismaCourse.title,
        price: prismaCourse.price,
        description: prismaCourse.description,
        examAvailable: prismaCourse.examAvailable,
        lessons: prismaCourse.lessons,
    };
    const enrollment = normalizePrismaEnrollment(prismaEnrollment);
    const completed = enrollment.completed === true
        || enrollment.progress === 100
        || enrollment.status === 'completed';
    if (!completed) {
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
        exam,
    };
}
function scoreAttempt(exam, answers) {
    const correctAnswers = exam.questions.reduce((total, question) => (answers[question.id] === question.correctIndex ? total + 1 : total), 0);
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
async function generateCertificateArtifact(input) {
    void input.userId;
    void input.userName;
    void input.courseId;
    void input.courseTitle;
    void input.score;
    void input.completionDate;
    const certificateUrl = `https://learnpaddi.in/verify-certificate?code=${input.certificateId}`;
    return {
        certificateUrl,
        storagePath: null,
    };
}
exports.createExamOrder = functions.https.onCall(async (data, context) => {
    const userId = assertSignedIn(context);
    const courseId = typeof data?.courseId === 'string' ? data.courseId : '';
    if (!courseId) {
        throw new functions.https.HttpsError('invalid-argument', 'courseId is required.');
    }
    const [prismaCourse, prismaEnrollment] = await Promise.all([
        prisma_1.prisma.course.findUnique({ where: { id: courseId } }),
        prisma_1.prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } }),
    ]);
    if (!prismaCourse || !prismaEnrollment) {
        throw new functions.https.HttpsError('failed-precondition', 'Course enrollment was not found.');
    }
    const course = {
        title: prismaCourse.title,
        price: prismaCourse.price,
        description: prismaCourse.description,
        examAvailable: prismaCourse.examAvailable,
        lessons: prismaCourse.lessons,
    };
    const enrollment = normalizePrismaEnrollment(prismaEnrollment);
    const amount = Math.round(prismaCourse.price * 100);
    const completed = enrollment.completed === true
        || enrollment.progress === 100
        || enrollment.status === 'completed';
    if (!completed) {
        throw new functions.https.HttpsError('failed-precondition', 'Complete the course before paying for the exam.');
    }
    if (amount <= 0 || enrollment.paymentStatus === 'success') {
        return {
            provider: 'already_paid',
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
    await upsertPrismaEnrollment(userId, courseId, course, {
        progress: enrollment.progress ?? 0,
        completed: enrollment.completed ?? false,
        paymentStatus: 'pending',
        razorpayOrderId: order.id,
        courseTitle: typeof course.title === 'string' ? course.title : 'Course',
    });
    return {
        provider: 'razorpay',
        order: {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt || `exam_${courseId}_${userId}`,
        },
        keyId: razorpayConfig.key_id,
    };
});
exports.verifyExamPayment = functions.https.onCall(async (data, context) => {
    const userId = assertSignedIn(context);
    const courseId = typeof data?.courseId === 'string' ? data.courseId : '';
    const orderId = typeof data?.razorpay_order_id === 'string' ? data.razorpay_order_id : '';
    const paymentId = typeof data?.razorpay_payment_id === 'string' ? data.razorpay_payment_id : '';
    const signature = typeof data?.razorpay_signature === 'string' ? data.razorpay_signature : '';
    if (!courseId || !orderId || !paymentId || !signature) {
        throw new functions.https.HttpsError('invalid-argument', 'Payment verification payload is incomplete.');
    }
    const secret = typeof razorpayConfig.key_secret === 'string' ? razorpayConfig.key_secret : '';
    const expectedSignature = node_crypto_1.default.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
    if (expectedSignature !== signature) {
        throw new functions.https.HttpsError('permission-denied', 'Payment signature verification failed.');
    }
    const course = await prisma_1.prisma.course.findUnique({ where: { id: courseId } });
    await upsertPrismaEnrollment(userId, courseId, {
        title: course?.title,
        price: course?.price,
        description: course?.description,
        examAvailable: course?.examAvailable,
        lessons: course?.lessons,
    }, {
        paymentStatus: 'success',
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
    });
    return {
        paymentStatus: 'success',
    };
});
const allowedStartExamOrigins = [
    'https://learnpaddi.in',
    'https://learnpaddi.netlify.app',
    'https://vigilant-giggle-4q9rjjw99j25q7g-3000.app.github.dev',
];
function setCorsHeaders(req, res) {
    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
    if (allowedStartExamOrigins.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
    }
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
function toHttpStatus(error) {
    if (!(error instanceof functions.https.HttpsError)) {
        return 500;
    }
    switch (error.code) {
        case 'invalid-argument':
            return 400;
        case 'unauthenticated':
            return 401;
        case 'permission-denied':
            return 403;
        case 'not-found':
            return 404;
        case 'failed-precondition':
            return 412;
        default:
            return 500;
    }
}
void [DEFAULT_WARNING_LIMIT];
exports.startCourseExam = functions.https.onRequest(async (req, res) => {
    setCorsHeaders(req, res);
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
        const userId = await getUserIdFromRequest(req);
        const body = req.body || {};
        const courseId = typeof body.courseId === 'string' ? body.courseId : '';
        if (!courseId) {
            res.status(400).json({ error: 'courseId is required.' });
            return;
        }
        const { course, enrollment, exam } = await ensureExamAccess(userId, courseId);
        const now = getNowTimestamp();
        const activeSession = enrollment.examSession;
        const activeExpiresAt = activeSession?.expiresAt;
        const canResume = activeSession
            && !activeSession.submittedAt
            && activeExpiresAt
            && activeExpiresAt.toMillis() > now.toMillis();
        const questionOrder = canResume
            ? activeSession.questionOrder.filter((questionId) => exam.questions.some((question) => question.id === questionId))
            : shuffle(exam.questions).map((question) => question.id);
        const attemptId = canResume ? activeSession.attemptId : `attempt_${Date.now()}_${node_crypto_1.default.randomUUID()}`;
        const expiresAt = canResume
            ? activeSession.expiresAt
            : admin.firestore.Timestamp.fromMillis(now.toMillis() + exam.duration * 60 * 1000);
        const warningLimit = canResume ? activeSession.warningLimit : DEFAULT_WARNING_LIMIT;
        if (!canResume) {
            const examSession = {
                attemptId,
                startedAt: now,
                expiresAt,
                questionOrder,
                warningLimit,
                submittedAt: null,
            };
            await upsertPrismaEnrollment(userId, courseId, course, {
                progress: enrollment.progress ?? 0,
                completed: enrollment.completed ?? false,
                paymentStatus: enrollment.paymentStatus || 'not_required',
                status: enrollment.status,
                examSession: serializeExamSession(examSession),
                courseTitle: typeof course.title === 'string' ? course.title : 'Course',
            });
        }
        res.status(200).json({
            attemptId,
            courseId,
            courseTitle: typeof course.title === 'string' ? course.title : 'Course',
            examTitle: typeof course.title === 'string' ? `${course.title} Final Exam` : 'Final Exam',
            durationMinutes: exam.duration,
            passingScore: exam.passingScore,
            expiresAt: expiresAt.toDate().toISOString(),
            warningLimit,
            questions: buildPublicQuestions(exam, questionOrder),
        });
    }
    catch (error) {
        functions.logger.error('startCourseExam error:', error);
        setCorsHeaders(req, res);
        res.status(toHttpStatus(error)).json({
            error: error instanceof functions.https.HttpsError ? error.message : 'Internal Server Error',
        });
    }
});
exports.submitCourseExamAttempt = functions.https.onCall(async (data, context) => {
    const userId = assertSignedIn(context);
    const courseId = typeof data?.courseId === 'string' ? data.courseId : '';
    const attemptId = typeof data?.attemptId === 'string' ? data.attemptId : '';
    const answers = (data?.answers && typeof data.answers === 'object' ? data.answers : {});
    const violationCount = typeof data?.violationCount === 'number' ? data.violationCount : 0;
    const submissionReason = typeof data?.submissionReason === 'string' ? data.submissionReason : 'manual';
    const autoSubmitted = Boolean(data?.autoSubmitted);
    const proctoringEvents = Array.isArray(data?.proctoringEvents)
        ? data.proctoringEvents
            .filter((event) => isRecord(event))
            .map((event) => ({
            type: typeof event.type === 'string' ? event.type : 'unknown',
            message: typeof event.message === 'string' ? event.message : '',
            at: typeof event.at === 'string' ? event.at : new Date().toISOString(),
            faceCount: typeof event.faceCount === 'number' ? event.faceCount : null,
        }))
        : [];
    if (!courseId || !attemptId) {
        throw new functions.https.HttpsError('invalid-argument', 'courseId and attemptId are required.');
    }
    const [prismaCourse, prismaEnrollment, exam] = await Promise.all([
        prisma_1.prisma.course.findUnique({ where: { id: courseId } }),
        prisma_1.prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } }),
        getCourseExam(courseId),
    ]);
    if (!prismaCourse || !prismaEnrollment) {
        throw new functions.https.HttpsError('failed-precondition', 'Exam enrollment could not be found.');
    }
    const course = {
        title: prismaCourse.title,
        price: prismaCourse.price,
        description: prismaCourse.description,
        examAvailable: prismaCourse.examAvailable,
        lessons: prismaCourse.lessons,
    };
    const enrollment = normalizePrismaEnrollment(prismaEnrollment);
    const session = enrollment.examSession;
    if (!session || session.attemptId !== attemptId) {
        throw new functions.https.HttpsError('failed-precondition', 'This exam attempt is not active.');
    }
    if (session.submittedAt) {
        throw new functions.https.HttpsError('failed-precondition', 'This exam attempt has already been submitted.');
    }
    if (session.expiresAt.toMillis() < Date.now() && submissionReason !== 'time_limit') {
        throw new functions.https.HttpsError('deadline-exceeded', 'This exam attempt has expired.');
    }
    const sessionQuestionMap = new Map(exam.questions.map((question) => [question.id, question]));
    const attemptQuestions = session.questionOrder
        .map((questionId) => sessionQuestionMap.get(questionId))
        .filter((question) => Boolean(question));
    const attemptExam = {
        ...exam,
        questions: attemptQuestions.length ? attemptQuestions : exam.questions,
    };
    const sanitizedAnswers = Object.fromEntries(Object.entries(answers).filter(([questionId, answer]) => (typeof answer === 'number'
        && Number.isInteger(answer)
        && attemptExam.questions.some((question) => question.id === questionId && answer >= 0 && answer < question.options.length))));
    const result = scoreAttempt(attemptExam, sanitizedAnswers);
    const attemptedAt = new Date().toISOString();
    const submittedAt = getNowTimestamp();
    const certificateId = result.passed ? buildCertificateId(userId, courseId) : null;
    const answerReview = attemptExam.questions.map((question) => {
        const selectedIndex = sanitizedAnswers[question.id];
        return {
            questionId: question.id,
            prompt: question.prompt,
            selectedAnswer: typeof selectedIndex === 'number' ? question.options[selectedIndex] || null : null,
            correctAnswer: question.options[question.correctIndex],
            isCorrect: selectedIndex === question.correctIndex,
        };
    });
    const completedSession = {
        ...session,
        submittedAt,
    };
    const examResult = {
        score: result.score,
        passed: result.passed,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        attemptedAt,
        violationCount,
        submissionReason,
        autoSubmitted,
        answers: sanitizedAnswers,
        answerReview,
        proctoringEvents,
    };
    await upsertPrismaEnrollment(userId, courseId, course, {
        progress: enrollment.progress ?? 0,
        completed: enrollment.completed ?? false,
        paymentStatus: enrollment.paymentStatus || 'not_required',
        status: enrollment.status,
        examAttempted: true,
        adminRetakeAllowed: false,
        score: result.score,
        passed: result.passed,
        certificateId,
        certificateUrl: typeof enrollment.certificateUrl === 'string' ? enrollment.certificateUrl : undefined,
        examSession: serializeExamSession(completedSession),
        examResult,
        courseTitle: typeof course.title === 'string' ? course.title : 'Course',
    });
    await prisma_1.prisma.examAttempt.upsert({
        where: { id: attemptId },
        create: {
            id: attemptId,
            userId,
            courseId,
            score: result.score,
            passed: result.passed,
            correctAnswers: result.correctAnswers,
            totalQuestions: result.totalQuestions,
            answers: sanitizedAnswers,
            answerReview,
            proctoringEvents,
            violationCount,
            submissionReason,
            autoSubmitted,
            submittedAt: new Date(attemptedAt),
        },
        update: {
            score: result.score,
            passed: result.passed,
            correctAnswers: result.correctAnswers,
            totalQuestions: result.totalQuestions,
            answers: sanitizedAnswers,
            answerReview,
            proctoringEvents,
            violationCount,
            submissionReason,
            autoSubmitted,
            submittedAt: new Date(attemptedAt),
        },
    });
    let certificateUrl = typeof enrollment.certificateUrl === 'string' ? enrollment.certificateUrl : null;
    if (result.passed && certificateId && !certificateUrl) {
        const authUser = await admin.auth().getUser(userId).catch(() => null);
        const completionDate = attemptedAt;
        const artifact = await generateCertificateArtifact({
            certificateId,
            userId,
            userName: authUser?.displayName || authUser?.email || 'LearnPaddi Learner',
            courseId,
            courseTitle: typeof course.title === 'string' ? course.title : 'Course',
            score: result.score,
            completionDate,
        });
        certificateUrl = artifact.certificateUrl;
        await upsertPrismaEnrollment(userId, courseId, course, {
            certificateId,
            certificateUrl,
            passed: true,
            score: result.score,
            courseTitle: typeof course.title === 'string' ? course.title : 'Course',
        });
        await prisma_1.prisma.certificate.upsert({
            where: { certificateId },
            create: {
                certificateId,
                userId,
                courseId,
                userName: authUser?.displayName || authUser?.email || 'LearnPaddi Learner',
                courseTitle: typeof course.title === 'string' ? course.title : 'Course',
                score: result.score,
                completionDate: new Date(completionDate),
                certificateUrl,
                storagePath: artifact.storagePath,
                verificationUrl: `https://learnpaddi.in/verify-certificate?code=${certificateId}`,
                issuedAt: new Date(),
            },
            update: {
                score: result.score,
                completionDate: new Date(completionDate),
                certificateUrl,
                storagePath: artifact.storagePath,
                verificationUrl: `https://learnpaddi.in/verify-certificate?code=${certificateId}`,
                issuedAt: new Date(),
            },
        });
    }
    return {
        score: result.score,
        passed: result.passed,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        attemptedAt,
        autoSubmitted,
        certificateId,
        certificateUrl,
        answerReview,
    };
});
exports.verifyCertificate = functions.https.onCall(async (data) => {
    const certificateId = typeof data?.certificateId === 'string' ? data.certificateId.trim().toUpperCase() : '';
    if (!certificateId) {
        throw new functions.https.HttpsError('invalid-argument', 'certificateId is required.');
    }
    const prismaCertificate = await prisma_1.prisma.certificate.findUnique({ where: { certificateId } });
    if (prismaCertificate) {
        return {
            certificate: {
                id: prismaCertificate.id,
                valid: true,
                certificateId: prismaCertificate.certificateId,
                userId: prismaCertificate.userId,
                courseId: prismaCertificate.courseId,
                userName: prismaCertificate.userName,
                courseTitle: prismaCertificate.courseTitle,
                score: prismaCertificate.score,
                completionDate: prismaCertificate.completionDate.toISOString(),
                certificateUrl: prismaCertificate.certificateUrl,
                verificationUrl: prismaCertificate.verificationUrl,
                issuedAt: prismaCertificate.issuedAt.toISOString(),
            },
        };
    }
    return { certificate: null };
});
//# sourceMappingURL=index.js.map