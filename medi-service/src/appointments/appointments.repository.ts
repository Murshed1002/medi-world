import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AppointmentStatus } from './types/appointment-status';

@Injectable()
export class AppointmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async withTransaction<T>(fn: (tx: AppointmentsRepositoryTx) => Promise<T>) {
    return this.prisma.$transaction(async (prismaTx) => {
      const tx = new AppointmentsRepositoryTx(prismaTx);
      return fn(tx);
    });
  }

  async findAllAppointments() {
    return this.prisma.appointments.findMany();
  }

  async findAppointmentById(id: string) {
    return this.prisma.appointments.findUnique({
      where: { id },
      include: {
        doctors: true,
        clinics: true,
        patients: true,
      },
    });
  }

  async updateAppointment(id: string, data: Partial<{ status: AppointmentStatus }>) {
    return this.prisma.appointments.update({
      where: { id },
      data,
    });
  }

  async findPaymentByAppointmentId(appointmentId: string) {
    return this.prisma.payments.findFirst({
      where: {
        reference_type: 'APPOINTMENT',
        reference_id: appointmentId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}

class AppointmentsRepositoryTx {
  constructor(private readonly prisma) {}

  async findPatientByAuthUserId(authUserId: string) {
    return this.prisma.patients.findUnique({
      where: { auth_user_id: authUserId }
    });
  }

  async getDoctorClinicFees(doctorId: string, clinicId: string) {
    return this.prisma.doctor_clinics.findUnique({
      where: {
        doctor_id_clinic_id: {
          doctor_id: doctorId,
          clinic_id: clinicId
        }
      },
      select: {
        booking_fee: true,
        consultation_fee: true
      }
    });
  }

  async isSlotBooked(
    doctorId: string,
    clinicId: string,
    date: string,
    slotStartTime: string,
  ) {
    // Convert time string (HH:mm) to DateTime (date part is ignored by TIME column)
    const timeAsDateTime = new Date(`1970-01-01T${slotStartTime}:00.000Z`);
    
    // Calculate expiry time for pending payments (15 minutes ago)
    const paymentExpiryTime = new Date();
    paymentExpiryTime.setMinutes(paymentExpiryTime.getMinutes() - 15);
    
    const count = await this.prisma.appointments.count({
      where: {
        doctor_id: doctorId,
        clinic_id: clinicId,
        appointment_date: new Date(date),
        slot_start_time: timeAsDateTime,
        OR: [
          {
            // Confirmed appointments always block the slot
            status: AppointmentStatus.CONFIRMED,
          },
          {
            // Payment pending appointments only block if created within last 15 minutes
            status: AppointmentStatus.PAYMENT_PENDING,
            created_at: {
              gte: paymentExpiryTime,
            },
          },
        ],
      },
    });

    return count > 0;
  }

  async findPendingAppointment(
    patientId: string,
    doctorId: string,
    clinicId: string,
    date: string,
    slotStartTime: string,
  ) {
    const timeAsDateTime = new Date(`1970-01-01T${slotStartTime}:00.000Z`);
    
    return this.prisma.appointments.findFirst({
      where: {
        patient_id: patientId,
        doctor_id: doctorId,
        clinic_id: clinicId,
        appointment_date: new Date(date),
        slot_start_time: timeAsDateTime,
        status: AppointmentStatus.PAYMENT_PENDING,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findPaymentByAppointmentId(appointmentId: string) {
    return this.prisma.payments.findFirst({
      where: {
        reference_type: 'APPOINTMENT',
        reference_id: appointmentId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async createAppointment(data) {
    return this.prisma.appointments.create({ data });
  }

  async createPayment(data) {
    return this.prisma.payments.create({ data });
  }

  async findClinicQueue(clinicId: string, doctorId: string, queueDate: Date) {
    return this.prisma.clinic_queues.findFirst({
      where: {
        clinic_id: clinicId,
        doctor_id: doctorId,
        queue_date: queueDate,
      },
    });
  }

  async createClinicQueue(data: {
    clinic_id: string;
    doctor_id: string;
    queue_date: Date;
    status: string;
    current_token_number: number;
    last_issued_token_number: number;
  }) {
    return this.prisma.clinic_queues.create({ data });
  }

  async updateClinicQueue(id: string, data: { last_issued_token_number: number }) {
    return this.prisma.clinic_queues.update({
      where: { id },
      data,
    });
  }

  async createQueueEntry(data: {
    clinic_queue_id: string;
    appointment_id: string;
    token_number: number;
    status: string;
    check_in_time: Date;
  }) {
    return this.prisma.queue_entries.create({ data });
  }
}
