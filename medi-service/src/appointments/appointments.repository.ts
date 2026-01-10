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
}
