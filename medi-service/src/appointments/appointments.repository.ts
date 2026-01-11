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
}

class AppointmentsRepositoryTx {
  constructor(private readonly prisma) {}

  async isSlotBooked(
    doctorId: string,
    clinicId: string,
    date: string,
    slotStartTime: string,
  ) {
    const count = await this.prisma.appointments.count({
      where: {
        doctorId,
        clinicId,
        appointmentDate: new Date(date),
        slotStartTime,
        status: {
          in: [
            AppointmentStatus.PAYMENT_PENDING,
            AppointmentStatus.CONFIRMED,
          ],
        },
      },
    });

    return count > 0;
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
