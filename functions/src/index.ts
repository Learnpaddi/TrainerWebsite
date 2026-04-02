import * as functions from 'firebase-functions';
import * as https from 'firebase-functions/v1/https';
import * as admin from 'firebase-admin';
import cors from 'cors';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

admin.initializeApp();

const db = admin.firestore();

const razorpay = new Razorpay({
  key_id: functions.config().razorpay.key_id,
  key_secret: functions.config().razorpay.key_secret,
});

/**
 * Create Razorpay Order (Frontend callable)
 */
export const createRazorpayOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https
