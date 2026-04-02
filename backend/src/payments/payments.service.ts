import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import { FirebaseService } from '../firebase/firebase.service';

export interface CreateOrderDto {
  courseId: string;
  amount: number; // paise
  currency: string;
}

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay.Instance;

  constructor(private firebase: FirebaseService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(dto: CreateOrderDto, tenantId?: string) {
    const course = await this.firebase.getDocument('courses', dto.courseId, tenantId);
    if (!course) throw new Error('Course not found');

    const order = await this.razorpay.orders.create({
      amount: dto.amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { courseId: dto.courseId, tenantId },
    });

    return order;
  }

  async verifyPayment(signature: string, orderId: string, paymentId: string, tenantId?: string) {
    const isValid = this.razorpay.utility.verifyPaymentSignature({
      order_id: orderId,
      payment_id: paymentId,
      signature,
    });
    return isValid;
  }
}

