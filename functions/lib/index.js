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
exports.api = exports.sendWelcomeEmail = exports.calculateRevenue = exports.generateCertificate = exports.verifyRazorpayPayment = exports.createRazorpayOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// Razorpay 
const razorpay_1 = __importDefault(require("razorpay"));
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || functions.config().razorpay?.key_id || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || functions.config().razorpay?.key_secret || '',
});
// ===== PAYMENTS =====
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in.');
    }
    const { courseId, amount } = data;
    const courseSnap = await db.collection('courses').doc(courseId).get();
    if (!courseSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Course not found.');
    }
    const order = await razorpay.orders.create({
        amount: amount * 100, // paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: { courseId }
    });
    return { orderId: order.id, amount: order.amount };
});
exports.verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = data;
    // Verify signature
    const crypto = require('crypto');
    const expectedSignature = crypto
        .createHmac('sha256', functions.config().razorpay.key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
    if (expectedSignature !== razorpay_signature) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid signature');
    }
    // Fetch order & verify status
    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (order.status !== 'paid') {
        throw new functions.https.HttpsError('failed-precondition', 'Payment not completed.');
    }
    // Create enrollment (use context.auth.uid if available)
    const paymentRef = await db.collection('payments').add({
        razorpay_order_id,
        razorpay_payment_id,
        courseId,
        amount: order.amount / 100,
        currency: order.currency,
        status: 'completed',
        userId: context.auth?.uid, // from client context
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    if (context.auth?.uid) {
        // Add to user enrolledCourses
        await db.collection('users').doc(context.auth.uid).update({
            [`enrolledCourses.${courseId}`]: {
                enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'active'
            }
        });
        // Create enrollment doc
        await db.collection('enrollments').doc(`${context.auth.uid}_${courseId}`).set({
            userId: context.auth.uid,
            courseId,
            paymentId: paymentRef.id,
            status: 'active',
            enrolledAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    return { success: true, paymentId: paymentRef.id };
});
// ===== CERTIFICATES ===== 
exports.generateCertificate = functions.firestore
    .document('user_progress/{userId}_{courseId}_final')
    .onCreate(async (snap) => {
    const data = snap.data();
    if (data.completed !== true)
        return;
    // PDF generation logic here (pdf-lib)
    // Email certificate
});
// ===== ADMIN ANALYTICS =====
exports.calculateRevenue = functions.pubsub.schedule('every 24 hours').onRun(async () => {
    const payments = await db.collection('payments')
        .where('status', '==', 'completed')
        .get();
    let totalRevenue = 0;
    payments.forEach(doc => {
        totalRevenue += doc.data().amount;
    });
    // Update analytics doc
    await db.collection('analytics').doc('global').set({
        totalRevenue,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
});
// ===== USER CREATED =====
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
    // Send welcome email (nodemailer)
});
exports.api = functions.https.onRequest((req, res) => {
    cors()(req, res, () => {
        // Razorpay webhook endpoint
        if (req.path === '/razorpay-webhook') {
            // Verify webhook signature & update payment
        }
        res.status(200).send('OK');
    });
});
//# sourceMappingURL=index.js.map