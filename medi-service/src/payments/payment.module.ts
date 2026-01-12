import { Module, forwardRef } from '@nestjs/common';
import { PaymentController } from './controllers/payment.controller';
import { WebhookController } from './controllers/webhook.controller';
import { PaymentService } from './services/payment.service';
import { RazorpayGatewayService } from './services/razorpay-gateway.service';
import { StripeGatewayService } from './services/stripe-gateway.service';
import { WebhookService } from './services/webhook.service';
import { AppointmentsModule } from '../appointments/appointments.module';
import { PrismaService } from '../common/prisma/prisma.service';

@Module({
  imports: [forwardRef(() => AppointmentsModule)],
  controllers: [PaymentController, WebhookController],
  providers: [
    PaymentService,
    RazorpayGatewayService,
    StripeGatewayService,
    WebhookService,
    PrismaService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
