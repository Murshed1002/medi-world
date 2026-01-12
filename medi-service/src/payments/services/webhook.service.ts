import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaymentService } from './payment.service';
import { PaymentStatus, PaymentProvider } from '../types/payment.types';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
  ) {}

  private async checkAndRecordWebhookEvent(
    provider: string,
    eventId: string,
    eventType: string,
    payload: any,
  ): Promise<boolean> {
    try {
      // Try to insert the webhook event - will fail if duplicate due to unique constraint
      await this.prisma.$executeRaw`
        INSERT INTO webhook_events (provider, event_id, event_type, payload, processed)
        VALUES (${provider}, ${eventId}, ${eventType}, ${JSON.stringify(payload)}::jsonb, false)
      `;
      
      return true;
    } catch (error: any) {
      // Check if it's a unique constraint violation
      if (error.code === '23505' || error.message?.includes('unique constraint')) {
        this.logger.warn(`Duplicate webhook event detected: ${provider}:${eventId}`);
        return false;
      }
      
      this.logger.error('Error checking webhook event:', error);
      // In case of other errors, allow processing (fail open)
      return true;
    }
  }

  private async markWebhookProcessed(provider: string, eventId: string) {
    try {
      await this.prisma.$executeRaw`
        UPDATE webhook_events
        SET processed = true, processed_at = NOW()
        WHERE provider = ${provider} AND event_id = ${eventId}
      `;
    } catch (error) {
      this.logger.error('Error marking webhook as processed:', error);
    }
  }

  async handleRazorpayWebhook(event: any) {
    this.logger.log(`Received Razorpay webhook: ${event.event}`);

    // Extract event ID for idempotency
    const eventId = event.id || event.payload?.payment?.entity?.id || `unknown_${Date.now()}`;

    // Check if this event was already processed
    const isNew = await this.checkAndRecordWebhookEvent(
      'RAZORPAY',
      eventId,
      event.event,
      event,
    );

    if (!isNew) {
      this.logger.log(`Skipping duplicate Razorpay webhook: ${eventId}`);
      return { success: true, duplicate: true };
    }

    try {
      switch (event.event) {
        case 'payment.authorized':
          await this.handlePaymentAuthorized(event.payload.payment.entity);
          break;

        case 'payment.captured':
          await this.handlePaymentCaptured(event.payload.payment.entity);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(event.payload.payment.entity);
          break;

        case 'refund.created':
          await this.handleRefundCreated(event.payload.refund.entity);
          break;

        case 'refund.processed':
          await this.handleRefundProcessed(event.payload.refund.entity);
          break;

        default:
          this.logger.warn(`Unhandled Razorpay event: ${event.event}`);
      }

      // Mark as processed
      await this.markWebhookProcessed('RAZORPAY', eventId);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing Razorpay webhook:`, error);
      throw error;
    }
  }

  async handleStripeWebhook(event: any) {
    this.logger.log(`Received Stripe webhook: ${event.type}`);

    // Stripe events have an 'id' field
    const eventId = event.id;

    // Check if this event was already processed
    const isNew = await this.checkAndRecordWebhookEvent(
      'STRIPE',
      eventId,
      event.type,
      event,
    );

    if (!isNew) {
      this.logger.log(`Skipping duplicate Stripe webhook: ${eventId}`);
      return { success: true, duplicate: true };
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handleStripePaymentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handleStripePaymentFailed(event.data.object);
          break;

        case 'payment_intent.canceled':
          await this.handleStripePaymentCanceled(event.data.object);
          break;

        case 'charge.refunded':
          await this.handleStripeRefunded(event.data.object);
          break;

        default:
          this.logger.warn(`Unhandled Stripe event: ${event.type}`);
      }

      // Mark as processed
      await this.markWebhookProcessed('STRIPE', eventId);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing Stripe webhook:`, error);
      throw error;
    }
  }

  private async handlePaymentAuthorized(payment: any) {
    this.logger.log(`Payment authorized: ${payment.id}`);
    
    // Find payment by provider_order_id
    const payments = await this.paymentService.findByProviderOrderId(
      payment.order_id,
    );

    if (payments.length === 0) {
      this.logger.warn(`Payment not found for order: ${payment.order_id}`);
      return;
    }

    const paymentRecord = payments[0];
    await this.paymentService.updatePayment(paymentRecord.id, {
      status: PaymentStatus.PENDING,
      provider_payment_id: payment.id,
      payment_method: payment.method?.toUpperCase(),
    });
  }

  private async handlePaymentCaptured(payment: any) {
    this.logger.log(`Payment captured: ${payment.id}`);

    const payments = await this.paymentService.findByProviderPaymentId(
      payment.id,
    );

    if (payments.length === 0) {
      this.logger.warn(`Payment not found: ${payment.id}`);
      return;
    }

    const paymentRecord = payments[0];
    await this.paymentService.updatePayment(paymentRecord.id, {
      status: PaymentStatus.SUCCESS,
      payment_method: payment.method?.toUpperCase(),
    });

    this.logger.log(`Payment ${paymentRecord.id} marked as SUCCESS`);
  }

  private async handlePaymentFailed(payment: any) {
    this.logger.log(`Payment failed: ${payment.id}`);

    const payments = await this.paymentService.findByProviderPaymentId(
      payment.id,
    );

    if (payments.length === 0) {
      this.logger.warn(`Payment not found: ${payment.id}`);
      return;
    }

    const paymentRecord = payments[0];
    await this.paymentService.updatePayment(paymentRecord.id, {
      status: PaymentStatus.FAILED,
    });

    this.logger.log(`Payment ${paymentRecord.id} marked as FAILED`);
  }

  private async handleRefundCreated(refund: any) {
    this.logger.log(`Refund created: ${refund.id} for payment ${refund.payment_id}`);
  }

  private async handleRefundProcessed(refund: any) {
    this.logger.log(`Refund processed: ${refund.id}`);

    const payments = await this.paymentService.findByProviderPaymentId(
      refund.payment_id,
    );

    if (payments.length === 0) {
      this.logger.warn(`Payment not found for refund: ${refund.payment_id}`);
      return;
    }

    const paymentRecord = payments[0];
    await this.paymentService.updatePayment(paymentRecord.id, {
      status: PaymentStatus.REFUNDED,
    });

    this.logger.log(`Payment ${paymentRecord.id} marked as REFUNDED`);
  }

  private async handleStripePaymentSucceeded(paymentIntent: any) {
    this.logger.log(`Stripe payment succeeded: ${paymentIntent.id}`);

    const payments = await this.paymentService.findByProviderPaymentId(
      paymentIntent.id,
    );

    if (payments.length === 0) {
      this.logger.warn(`Payment not found: ${paymentIntent.id}`);
      return;
    }

    const paymentRecord = payments[0];
    await this.paymentService.updatePayment(paymentRecord.id, {
      status: PaymentStatus.SUCCESS,
      payment_method: paymentIntent.payment_method_types?.[0]?.toUpperCase(),
    });

    this.logger.log(`Payment ${paymentRecord.id} marked as SUCCESS`);
  }

  private async handleStripePaymentFailed(paymentIntent: any) {
    this.logger.log(`Stripe payment failed: ${paymentIntent.id}`);

    const payments = await this.paymentService.findByProviderPaymentId(
      paymentIntent.id,
    );

    if (payments.length === 0) {
      this.logger.warn(`Payment not found: ${paymentIntent.id}`);
      return;
    }

    const paymentRecord = payments[0];
    await this.paymentService.updatePayment(paymentRecord.id, {
      status: PaymentStatus.FAILED,
    });

    this.logger.log(`Payment ${paymentRecord.id} marked as FAILED`);
  }

  private async handleStripePaymentCanceled(paymentIntent: any) {
    this.logger.log(`Stripe payment canceled: ${paymentIntent.id}`);

    const payments = await this.paymentService.findByProviderPaymentId(
      paymentIntent.id,
    );

    if (payments.length === 0) {
      this.logger.warn(`Payment not found: ${paymentIntent.id}`);
      return;
    }

    const paymentRecord = payments[0];
    await this.paymentService.updatePayment(paymentRecord.id, {
      status: PaymentStatus.FAILED,
    });
  }

  private async handleStripeRefunded(charge: any) {
    this.logger.log(`Stripe charge refunded: ${charge.id}`);

    // Find payment by provider_payment_id (charge is linked to payment intent)
    const payments = await this.paymentService.findByProviderPaymentId(
      charge.payment_intent,
    );

    if (payments.length === 0) {
      this.logger.warn(`Payment not found for charge: ${charge.id}`);
      return;
    }

    const paymentRecord = payments[0];
    await this.paymentService.updatePayment(paymentRecord.id, {
      status: PaymentStatus.REFUNDED,
    });

    this.logger.log(`Payment ${paymentRecord.id} marked as REFUNDED`);
  }
}
