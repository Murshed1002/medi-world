import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { VerifyPaymentDto } from '../dto/verify-payment.dto';
import { RefundPaymentDto } from '../dto/refund-payment.dto';
import { PaymentReferenceType, PaymentProvider } from '../types/payment.types';
import { RazorpayGatewayService } from '../services/razorpay-gateway.service';
import { StripeGatewayService } from '../services/stripe-gateway.service';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly razorpayGateway: RazorpayGatewayService,
    private readonly stripeGateway: StripeGatewayService,
  ) {}

  @Post()
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Get(':id')
  async getPayment(@Param('id') id: string) {
    return this.paymentService.getPaymentById(id);
  }

  @Get(':id/intent')
  async getPaymentIntent(@Param('id') id: string) {
    return this.paymentService.getPaymentIntent(id);
  }

  @Patch(':id')
  async updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentService.updatePayment(id, updatePaymentDto);
  }

  @Get('reference/:referenceType/:referenceId')
  async getPaymentsByReference(
    @Param('referenceType') referenceType: PaymentReferenceType,
    @Param('referenceId') referenceId: string,
  ) {
    return this.paymentService.getPaymentsByReference(
      referenceType,
      referenceId,
    );
  }

  @Get('patient/:patientId')
  async getPaymentsByPatient(@Param('patientId') patientId: string) {
    return this.paymentService.getPaymentsByPatient(patientId);
  }

  @Post('initiate')
  async initiatePayment(@Body() initiatePaymentDto: InitiatePaymentDto) {
    const payment = await this.paymentService.getPaymentById(
      initiatePaymentDto.payment_id,
    );

    if (initiatePaymentDto.provider === PaymentProvider.RAZORPAY) {
      const order = await this.razorpayGateway.createOrder(
        parseFloat(payment.amount),
        payment.currency,
        payment.id,
      );

      await this.paymentService.updatePayment(payment.id, {
        provider: PaymentProvider.RAZORPAY,
        provider_order_id: order.order_id,
      });

      return {
        success: true,
        provider: PaymentProvider.RAZORPAY,
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      };
    }

    if (initiatePaymentDto.provider === PaymentProvider.STRIPE) {
      const paymentIntent = await this.stripeGateway.createPaymentIntent(
        parseFloat(payment.amount),
        payment.currency,
        {
          payment_id: payment.id,
          reference_type: payment.reference_type,
          reference_id: payment.reference_id,
        },
      );

      await this.paymentService.updatePayment(payment.id, {
        provider: PaymentProvider.STRIPE,
        provider_payment_id: paymentIntent.payment_intent_id,
      });

      return {
        success: true,
        provider: PaymentProvider.STRIPE,
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.payment_intent_id,
      };
    }

    throw new BadRequestException('Unsupported payment provider');
  }

  @Post('verify')
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    const payment = await this.paymentService.getPaymentById(
      verifyPaymentDto.payment_id,
    );

    if (payment.provider === PaymentProvider.RAZORPAY) {
      const isValid = await this.razorpayGateway.verifyPaymentSignature(
        verifyPaymentDto.provider_order_id,
        verifyPaymentDto.provider_payment_id,
        verifyPaymentDto.signature,
      );

      if (!isValid) {
        throw new BadRequestException('Invalid payment signature');
      }

      await this.paymentService.updatePayment(payment.id, {
        status: 'SUCCESS' as any,
        provider_payment_id: verifyPaymentDto.provider_payment_id,
      });

      return {
        success: true,
        message: 'Payment verified successfully',
      };
    }

    throw new BadRequestException('Verification not supported for this provider');
  }

  @Post(':id/refund')
  async refundPayment(
    @Param('id') id: string,
    @Body() refundPaymentDto: RefundPaymentDto,
  ) {
    const payment = await this.paymentService.getPaymentById(id);

    if (payment.status !== 'SUCCESS') {
      throw new BadRequestException(
        'Only successful payments can be refunded',
      );
    }

    if (!payment.provider_payment_id) {
      throw new BadRequestException('Payment ID not found for refund');
    }

    let refund;

    if (payment.provider === PaymentProvider.RAZORPAY) {
      refund = await this.razorpayGateway.refundPayment(
        payment.provider_payment_id,
        refundPaymentDto.amount,
        refundPaymentDto.notes,
      );
    } else if (payment.provider === PaymentProvider.STRIPE) {
      refund = await this.stripeGateway.createRefund(
        payment.provider_payment_id,
        refundPaymentDto.amount,
        'requested_by_customer',
      );
    } else {
      throw new BadRequestException('Refund not supported for this provider');
    }

    await this.paymentService.updatePayment(id, {
      status: 'REFUNDED' as any,
    });

    return {
      success: true,
      message: 'Refund initiated successfully',
      refund,
    };
  }
}

