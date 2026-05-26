import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  authTokenSecret: process.env.AUTH_TOKEN_SECRET || process.env.JWT_SECRET || 'learnpaddi-local-dev-secret',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  mockPayment: String(process.env.MOCK_PAYMENT || 'true') === 'true',
};
