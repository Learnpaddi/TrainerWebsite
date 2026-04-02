import { Controller, Post, Body, Req } from '@nestjs/common';
import { PaymentsService, CreateOrderDto } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('order')
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    return this.paymentsService.createOrder(createOrderDto, req.tenantId);
  }

  @Post('verify')
  async verify(@Body() body: { signature: string; orderId: string; paymentId: string }, @Req() req: any) {
    return this.paymentsService.verifyPayment(body.signature, body.orderId, body.paymentId, req.tenantId);
  }

  @Post('webhook')
  async webhook(@Body() body: any, @Req() req: any) {
    // Razorpay webhook verification & enrollment creation
    console.log('Razorpay webhook:', body);
    // TODO: create enrollment with tenantId
    return { status: 'success' };
  }
}

