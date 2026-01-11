import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeGatewayService {
  private stripe: Stripe | null = null;

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      console.warn('⚠️  Stripe credentials not found. Stripe gateway disabled.');
      return;
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-12-15.clover',
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    metadata?: Record<string, string>,
  ) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Amount in smallest currency unit
        currency: currency.toLowerCase(),
        metadata: metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        payment_intent_id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Failed to retrieve payment intent:', error);
      throw new BadRequestException('Failed to retrieve payment intent');
    }
  }

  async confirmPaymentIntent(paymentIntentId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      return await this.stripe.paymentIntents.confirm(paymentIntentId);
    } catch (error) {
      console.error('Failed to confirm payment intent:', error);
      throw new BadRequestException('Failed to confirm payment');
    }
  }

  async cancelPaymentIntent(paymentIntentId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      return await this.stripe.paymentIntents.cancel(paymentIntentId);
    } catch (error) {
      console.error('Failed to cancel payment intent:', error);
      throw new BadRequestException('Failed to cancel payment');
    }
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer',
  ) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      if (reason) {
        refundData.reason = reason;
      }

      const refund = await this.stripe.refunds.create(refundData);

      return {
        refund_id: refund.id,
        payment_intent_id: refund.payment_intent as string,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        created: refund.created,
      };
    } catch (error) {
      console.error('Stripe refund failed:', error);
      throw new BadRequestException('Failed to process refund');
    }
  }

  async retrieveRefund(refundId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      return await this.stripe.refunds.retrieve(refundId);
    } catch (error) {
      console.error('Failed to retrieve refund:', error);
      throw new BadRequestException('Failed to retrieve refund details');
    }
  }

  constructWebhookEvent(payload: string | Buffer, signature: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }
}
