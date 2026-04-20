import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

export const paymentRouter = Router();

paymentRouter.post('/create-order', requireAuth, createOrder);
paymentRouter.post('/verify-payment', requireAuth, verifyPayment);
