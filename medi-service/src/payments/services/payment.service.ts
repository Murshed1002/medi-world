import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PaymentIntentDto } from '../dto/payment-intent.dto';
import { PaymentStatus, PaymentReferenceType } from '../types/payment.types';
import { Payments } from '../../entities/payments.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payments)
    private readonly paymentsRepo: EntityRepository<Payments>,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const payment = this.paymentsRepo.create({
      referenceType: createPaymentDto.referenceType,
      referenceId: createPaymentDto.referenceId,
      patientId: createPaymentDto.patientId,
      amount: createPaymentDto.amount,
      currency: createPaymentDto.currency || 'INR',
      paymentType: createPaymentDto.paymentType,
      status: PaymentStatus.CREATED,
      metadata: createPaymentDto.metadata,
    });

    await this.paymentsRepo.getEntityManager().persistAndFlush(payment);
    return payment;
  }

  async getPaymentById(id: string) {
    const payment = await this.paymentsRepo.findOne({ id });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async getPaymentIntent(paymentId: string): Promise<PaymentIntentDto> {
    const payment = await this.getPaymentById(paymentId);

    // Build context based on reference type and metadata
    const context = await this.buildPaymentContext(
      payment.referenceType,
      payment.referenceId,
      payment.metadata,
      payment.paymentType,
    );

    return {
      id: payment.id,
      purpose: payment.paymentType,
      referenceId: payment.referenceId,
      amount: parseFloat(payment.amount.toString()),
      currency: payment.currency,
      status: payment.status as PaymentStatus,
      context,
    };
  }

  async updatePayment(id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.getPaymentById(id);

    if (updatePaymentDto.status) {
      payment.status = updatePaymentDto.status;
    }

    if (updatePaymentDto.paymentMethod) {
      payment.paymentMethod = updatePaymentDto.paymentMethod;
    }

    if (updatePaymentDto.provider) {
      payment.provider = updatePaymentDto.provider;
    }

    if (updatePaymentDto.providerOrderId) {
      payment.providerOrderId = updatePaymentDto.providerOrderId;
    }

    if (updatePaymentDto.providerPaymentId) {
      payment.providerPaymentId = updatePaymentDto.providerPaymentId;
    }

    await this.paymentsRepo.getEntityManager().flush();
    return payment;
  }

  async getPaymentsByReference(
    referenceType: PaymentReferenceType,
    referenceId: string,
  ) {
    return this.paymentsRepo.find(
      { referenceType, referenceId },
      { orderBy: { createdAt: 'desc' } }
    );
  }

  async getPaymentsByPatient(patientId: string) {
    return this.paymentsRepo.find(
      { patientId },
      { orderBy: { createdAt: 'desc' } }
    );
  }

  async findByProviderOrderId(providerOrderId: string) {
    return this.paymentsRepo.find({ providerOrderId });
  }

  async findByProviderPaymentId(providerPaymentId: string) {
    return this.paymentsRepo.find({ providerPaymentId });
  }

  private async buildPaymentContext(
    referenceType: string,
    referenceId: string,
    metadata: any,
    paymentType: string,
  ) {
    // Build dynamic context based on reference type
    switch (referenceType) {
      case PaymentReferenceType.APPOINTMENT:
        return this.buildAppointmentContext(referenceId, metadata);

      case PaymentReferenceType.MEDICINE_ORDER:
        return this.buildMedicineContext(referenceId, metadata);

      case PaymentReferenceType.LAB_TEST:
        return this.buildLabTestContext(referenceId, metadata);

      default:
        return {
          title: `Payment for ${paymentType}`,
          subtitle: `Reference: ${referenceId}`,
        };
    }
  }

  private async buildAppointmentContext(
    appointmentId: string,
    metadata: any,
  ) {
    // Fetch appointment details using EntityManager knex for raw SQL
    try {
      const em = this.paymentsRepo.getEntityManager();
      const knex = em.getKnex();
      
      const result = await knex.raw(
        `
        SELECT 
          a.id, a.scheduled_at, a.status,
          p.name as patient_name,
          d.name as doctor_name,
          d.specialization
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.id = ?
      `,
        [appointmentId],
      );

      if (!result.rows || result.rows.length === 0) {
        return {
          title: 'Doctor Consultation',
          subtitle: 'Appointment Booking',
          policyTitle: 'Cancellation & Refund Policy',
          policyText:
            'Cancellations made 24 hours prior to the appointment are eligible for a full refund of the booking fee. No refunds for late cancellations.',
        };
      }

      const appointment = result.rows[0];
      const scheduledDate = new Date(appointment.scheduled_at);

      return {
        title: 'Doctor Consultation',
        subtitle: `Dr. ${appointment.doctor_name} · ${appointment.specialization}`,
        meta: [
          {
            label: 'Appointment Time',
            value: scheduledDate.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }),
            icon: 'CalendarMonth',
          },
          {
            label: 'Patient Name',
            value: appointment.patient_name,
            icon: 'Person',
          },
        ],
        policyTitle: 'Cancellation & Refund Policy',
        policyText:
          'Cancellations made 24 hours prior to the appointment are eligible for a full refund of the booking fee. No refunds for late cancellations.',
      };
    } catch (error) {
      console.error('Error fetching appointment context:', error);
      return {
        title: 'Doctor Consultation',
        subtitle: 'Appointment Booking',
      };
    }
  }

  private async buildMedicineContext(orderId: string, metadata: any) {
    return {
      title: 'Medicine Order',
      subtitle: 'Pharmacy Delivery · Home',
      items: metadata?.items || [],
      meta: metadata?.meta || [
        {
          label: 'Delivery Estimate',
          value: 'Tomorrow, 4 PM',
          icon: 'LocalShipping',
        },
      ],
      policyTitle: 'Return Policy',
      policyText:
        'Medicines are non-returnable once the seal is broken. Returns for damaged or incorrect items are accepted within 7 days of delivery.',
    };
  }

  private async buildLabTestContext(testId: string, metadata: any) {
    return {
      title: 'Medical Test Report',
      subtitle: 'Pathology Services',
      items: metadata?.items || [],
      meta: metadata?.meta || [],
      policyTitle: 'Refund Policy',
      policyText:
        'Payment for medical reports is non-refundable once the test sample has been processed. If you believe there is an error in the billing, please contact support before paying.',
    };
  }
}
