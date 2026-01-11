import { Module } from '@nestjs/common';
import { PaymentController } from './controllers/payment.controller';
import { WebhookController } from './controllers/webhook.controller';
import { PaymentService } from './services/payment.service';
import { RazorpayGatewayService } from './services/razorpay-gateway.service';
import { StripeGatewayService } from './services/stripe-gateway.service';
import { WebhookService } from './services/webhook.service';

@Module({
  controllers: [PaymentController, WebhookController],
  providers: [
    PaymentService,
    RazorpayGatewayService,
    StripeGatewayService,
    WebhookService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
