import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { WebhookService } from '../services/webhook.service';
import { RazorpayGatewayService } from '../services/razorpay-gateway.service';
import { StripeGatewayService } from '../services/stripe-gateway.service';

@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly razorpayGateway: RazorpayGatewayService,
    private readonly stripeGateway: StripeGatewayService,
  ) {}

  @Post('razorpay')
  async handleRazorpayWebhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing webhook signature');
    }

    // Verify webhook signature
    const isValid = await this.razorpayGateway.verifyWebhookSignature(
      JSON.stringify(body),
      signature,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    return this.webhookService.handleRazorpayWebhook(body);
  }

  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing webhook signature');
    }

    try {
      // Stripe requires raw body for signature verification
      const rawBody = req.rawBody;
      if (!rawBody) {
        throw new BadRequestException('Raw body not available');
      }

      const event = this.stripeGateway.constructWebhookEvent(
        rawBody,
        signature,
      );

      return this.webhookService.handleStripeWebhook(event);
    } catch (error) {
      throw new BadRequestException('Webhook signature verification failed');
    }
  }
}
