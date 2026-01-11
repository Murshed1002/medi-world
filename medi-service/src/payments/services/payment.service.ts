import { Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PaymentIntentDto } from '../dto/payment-intent.dto';
import { PaymentStatus, PaymentReferenceType } from '../types/payment.types';

@Injectable()
export class PaymentService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || process.env.HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || process.env.PORT || '5432'),
      user: process.env.DB_USER || process.env.USER || 'postgres',
      password: process.env.DB_PASSWORD || process.env.PASS || '',
      database: process.env.DB_NAME || process.env.DB || 'postgres',
    });
  }

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const {
      reference_type,
      reference_id,
      patient_id,
      amount,
      currency = 'INR',
      payment_type,
      metadata,
    } = createPaymentDto;

    const result = await this.pool.query(
      `
      INSERT INTO payments (
        reference_type, reference_id, patient_id, 
        amount, currency, payment_type, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        reference_type,
        reference_id,
        patient_id,
        amount,
        currency,
        payment_type,
        PaymentStatus.CREATED,
        metadata ? JSON.stringify(metadata) : null,
      ],
    );

    return result.rows[0];
  }

  async getPaymentById(id: string) {
    const result = await this.pool.query(
      'SELECT * FROM payments WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    const payment = result.rows[0];
    if (payment.metadata) {
      payment.metadata = JSON.parse(payment.metadata);
    }

    return payment;
  }

  async getPaymentIntent(paymentId: string): Promise<PaymentIntentDto> {
    const payment = await this.getPaymentById(paymentId);

    // Build context based on reference type and metadata
    const context = await this.buildPaymentContext(
      payment.reference_type,
      payment.reference_id,
      payment.metadata,
      payment.payment_type,
    );

    return {
      id: payment.id,
      purpose: payment.payment_type,
      reference_id: payment.reference_id,
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      status: payment.status,
      context,
    };
  }

  async updatePayment(id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.getPaymentById(id);

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updatePaymentDto.status) {
      setClauses.push(`status = $${paramIndex}`);
      values.push(updatePaymentDto.status);
      paramIndex++;
    }

    if (updatePaymentDto.payment_method) {
      setClauses.push(`payment_method = $${paramIndex}`);
      values.push(updatePaymentDto.payment_method);
      paramIndex++;
    }

    if (updatePaymentDto.provider) {
      setClauses.push(`provider = $${paramIndex}`);
      values.push(updatePaymentDto.provider);
      paramIndex++;
    }

    if (updatePaymentDto.provider_order_id) {
      setClauses.push(`provider_order_id = $${paramIndex}`);
      values.push(updatePaymentDto.provider_order_id);
      paramIndex++;
    }

    if (updatePaymentDto.provider_payment_id) {
      setClauses.push(`provider_payment_id = $${paramIndex}`);
      values.push(updatePaymentDto.provider_payment_id);
      paramIndex++;
    }

    setClauses.push(`updated_at = NOW()`);

    values.push(id);

    const result = await this.pool.query(
      `UPDATE payments SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );

    return result.rows[0];
  }

  async getPaymentsByReference(
    referenceType: PaymentReferenceType,
    referenceId: string,
  ) {
    const result = await this.pool.query(
      'SELECT * FROM payments WHERE reference_type = $1 AND reference_id = $2 ORDER BY created_at DESC',
      [referenceType, referenceId],
    );

    return result.rows.map((payment) => {
      if (payment.metadata) {
        payment.metadata = JSON.parse(payment.metadata);
      }
      return payment;
    });
  }

  async getPaymentsByPatient(patientId: string) {
    const result = await this.pool.query(
      'SELECT * FROM payments WHERE patient_id = $1 ORDER BY created_at DESC',
      [patientId],
    );

    return result.rows.map((payment) => {
      if (payment.metadata) {
        payment.metadata = JSON.parse(payment.metadata);
      }
      return payment;
    });
  }

  async findByProviderOrderId(providerOrderId: string) {
    const result = await this.pool.query(
      'SELECT * FROM payments WHERE provider_order_id = $1',
      [providerOrderId],
    );

    return result.rows.map((payment) => {
      if (payment.metadata) {
        payment.metadata = JSON.parse(payment.metadata);
      }
      return payment;
    });
  }

  async findByProviderPaymentId(providerPaymentId: string) {
    const result = await this.pool.query(
      'SELECT * FROM payments WHERE provider_payment_id = $1',
      [providerPaymentId],
    );

    return result.rows.map((payment) => {
      if (payment.metadata) {
        payment.metadata = JSON.parse(payment.metadata);
      }
      return payment;
    });
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
    // Fetch appointment details
    try {
      const result = await this.pool.query(
        `
        SELECT 
          a.id, a.scheduled_at, a.status,
          p.name as patient_name,
          d.name as doctor_name,
          d.specialization
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.id = $1
      `,
        [appointmentId],
      );

      if (result.rows.length === 0) {
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
