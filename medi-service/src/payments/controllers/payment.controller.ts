import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  BadRequestException,
  Inject,
  forwardRef,
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
import { AppointmentsService } from '../../appointments/appointments.service';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly razorpayGateway: RazorpayGatewayService,
    private readonly stripeGateway: StripeGatewayService,
    @Inject(forwardRef(() => AppointmentsService))
    private readonly appointmentsService: AppointmentsService,
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
      initiatePaymentDto.paymentId,
    );

    if (initiatePaymentDto.provider === PaymentProvider.RAZORPAY) {
      const order = await this.razorpayGateway.createOrder(
        Number(payment.amount),
        payment.currency,
        payment.id,
      );

      await this.paymentService.updatePayment(payment.id, {
        provider: PaymentProvider.RAZORPAY,
        providerOrderId: order.order_id,
      });

      return {
        success: true,
        provider: PaymentProvider.RAZORPAY,
        orderId: order.order_id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      };
    }

    if (initiatePaymentDto.provider === PaymentProvider.STRIPE) {
      const paymentIntent = await this.stripeGateway.createPaymentIntent(
        Number(payment.amount),
        payment.currency,
        {
          paymentId: payment.id,
          referenceType: payment.referenceType,
          referenceId: payment.referenceId,
        },
      );

      await this.paymentService.updatePayment(payment.id, {
        provider: PaymentProvider.STRIPE,
        providerPaymentId: paymentIntent.payment_intent_id,
      });

      return {
        success: true,
        provider: PaymentProvider.STRIPE,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.payment_intent_id,
      };
    }

    throw new BadRequestException('Unsupported payment provider');
  }

  @Post(':id/verify')
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto, @Param('id') id: string) {
    const payment = await this.paymentService.getPaymentById(
      id,
    );

    // Check if we're in development mode (backend determines this, not frontend)
    const isDevelopment = process.env.NODE_ENV === 'dev';

    // In development mode, bypass actual verification but still process the payment
    if (isDevelopment) {
      await this.paymentService.updatePayment(id, {
        status: 'SUCCESS' as any,
        provider: (payment.provider || PaymentProvider.RAZORPAY) as any,
        providerPaymentId: verifyPaymentDto.providerPaymentId || `dev_bypass_${Date.now()}`,
      });

      // Confirm the appointment if it's an appointment payment
      if (payment.referenceType === 'APPOINTMENT') {
        await this.appointmentsService.confirmAppointment(payment.referenceId);
      }

      return {
        success: true,
        message: 'Payment verified successfully (development mode)',
      };
    }

    // Production: Validate required fields
    if (!verifyPaymentDto.providerOrderId || !verifyPaymentDto.providerPaymentId || !verifyPaymentDto.signature) {
      throw new BadRequestException('Missing required payment verification data');
    }

    if (payment.provider === PaymentProvider.RAZORPAY) {
      const isValid = await this.razorpayGateway.verifyPaymentSignature(
        verifyPaymentDto.providerOrderId,
        verifyPaymentDto.providerPaymentId,
        verifyPaymentDto.signature,
      );

      if (!isValid) {
        throw new BadRequestException('Invalid payment signature');
      }

      await this.paymentService.updatePayment(payment.id, {
        status: 'SUCCESS' as any,
        providerPaymentId: verifyPaymentDto.providerPaymentId,
      });

      // Confirm the appointment if it's an appointment payment
      if (payment.referenceType === 'APPOINTMENT') {
        await this.appointmentsService.confirmAppointment(payment.referenceId);
      }

      return {
        success: true,
        message: 'Payment verified successfully',
      };
    }

    throw new BadRequestException('Verification not supported for this provider');
  }

  @Post(':id/create-order')
  async createOrder(@Param('id') id: string) {
    const payment = await this.paymentService.getPaymentById(id);

    if (payment.status !== 'CREATED') {
      throw new BadRequestException('Payment is not in CREATED status');
    }

    // Create Razorpay order
    const order = await this.razorpayGateway.createOrder(
      Number(payment.amount),
      payment.currency,
      payment.id,
    );

    // Update payment with provider order ID
    await this.paymentService.updatePayment(payment.id, {
      provider: PaymentProvider.RAZORPAY,
      providerOrderId: order.order_id,
    });

    return {
      success: true,
      providerOrderId: order.order_id,
      amount: Number(payment.amount),
      currency: payment.currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
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

    if (!payment.providerPaymentId) {
      throw new BadRequestException('Payment ID not found for refund');
    }

    let refund;

    if (payment.provider === PaymentProvider.RAZORPAY) {
      refund = await this.razorpayGateway.refundPayment(
        payment.providerPaymentId,
        refundPaymentDto.amount,
        refundPaymentDto.notes,
      );
    } else if (payment.provider === PaymentProvider.STRIPE) {
      refund = await this.stripeGateway.createRefund(
        payment.providerPaymentId,
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

