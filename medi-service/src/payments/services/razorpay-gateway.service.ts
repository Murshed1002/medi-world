import { Injectable, BadRequestException } from '@nestjs/common';
import Razorpay from 'razorpay';
import crypto from 'crypto';

@Injectable()
export class RazorpayGatewayService {
  private razorpay: Razorpay;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn('⚠️  Razorpay credentials not found. Payment gateway disabled.');
      return;
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(amount: number, currency: string = 'INR', receipt: string) {
    if (!this.razorpay) {
      throw new BadRequestException('Payment gateway not configured');
    }

    try {
      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100), // Amount in paise
        currency,
        receipt,
      });

      return {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      };
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      throw new BadRequestException('Failed to create payment order');
    }
  }

  async verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): Promise<boolean> {
    if (!this.razorpay) {
      throw new BadRequestException('Payment gateway not configured');
    }

    try {
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  async verifyWebhookSignature(body: string, signature: string): Promise<boolean> {
    if (!this.razorpay) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
        .update(body)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  async fetchPayment(paymentId: string) {
    if (!this.razorpay) {
      throw new BadRequestException('Payment gateway not configured');
    }

    try {
      return await this.razorpay.payments.fetch(paymentId);
    } catch (error) {
      console.error('Failed to fetch payment:', error);
      throw new BadRequestException('Failed to fetch payment details');
    }
  }

  async refundPayment(
    paymentId: string,
    amount?: number,
    notes?: Record<string, string>,
  ) {
    if (!this.razorpay) {
      throw new BadRequestException('Payment gateway not configured');
    }

    try {
      const refundData: any = {
        payment_id: paymentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Amount in paise
      }

      if (notes) {
        refundData.notes = notes;
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundData);

      return {
        refund_id: refund.id,
        payment_id: refund.payment_id,
        amount: refund.amount ? refund.amount / 100 : 0,
        currency: refund.currency,
        status: refund.status,
        created_at: refund.created_at,
      };
    } catch (error) {
      console.error('Razorpay refund failed:', error);
      throw new BadRequestException('Failed to process refund');
    }
  }

  async fetchRefund(paymentId: string, refundId: string) {
    if (!this.razorpay) {
      throw new BadRequestException('Payment gateway not configured');
    }

    try {
      return await this.razorpay.payments.fetchRefund(paymentId, refundId);
    } catch (error) {
      console.error('Failed to fetch refund:', error);
      throw new BadRequestException('Failed to fetch refund details');
    }
  }
}
