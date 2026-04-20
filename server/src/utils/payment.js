import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';

export const hasRazorpayCredentials = Boolean(env.razorpayKeyId && env.razorpayKeySecret);

const razorpay = hasRazorpayCredentials
  ? new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret,
    })
  : null;

export async function createGatewayOrder({ amount, receipt, notes }) {
  if (env.mockPayment || !razorpay) {
    return {
      provider: 'mock',
      id: `mock_order_${crypto.randomBytes(8).toString('hex')}`,
      amount,
      currency: 'INR',
      receipt,
      notes,
    };
  }

  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt,
    notes,
  });

  return {
    provider: 'razorpay',
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    notes: order.notes,
    keyId: env.razorpayKeyId,
  };
}

export function verifyGatewayPayment({ orderId, paymentId, signature }) {
  if (env.mockPayment || !hasRazorpayCredentials) {
    return true;
  }

  const digest = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return digest === signature;
}
