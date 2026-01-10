import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AppointmentsRepository } from './appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentStatus } from './types/appointment-status';
import { addMinutes } from 'date-fns';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly repo: AppointmentsRepository,
  ) {}

  async createAppointment(
    patientId: string,
    dto: CreateAppointmentDto,
  ) {
    const expiresAt = addMinutes(new Date(), 15);

    return this.repo.withTransaction(async (tx) => {
      // 1️⃣ Validate slot availability (LOCKED)
      const exists = await tx.isSlotBooked(
        dto.doctorId,
        dto.clinicId,
        dto.appointmentDate,
        dto.slotStartTime,
      );

      if (exists) {
        throw new ConflictException('Slot already booked');
      }

      // 2️⃣ Create appointment
      const appointment = await tx.createAppointment({
        patientId,
        doctorId: dto.doctorId,
        clinicId: dto.clinicId,
        appointmentDate: new Date(dto.appointmentDate),
        slotStartTime: dto.slotStartTime,
        slotEndTime: dto.slotEndTime,
        status: AppointmentStatus.PAYMENT_PENDING,
        expiresAt,
        bookingFee: 200, // always from backend
      });

      // 3️⃣ Create payment intent (delegated later)
      const payment = await tx.createPayment({
        appointmentId: appointment.id,
        amount: appointment.bookingFee,
        status: 'CREATED',
      });

      return {
        appointmentId: appointment.id,
        paymentId: payment.id,
        expiresAt,
      };
    });
  }
  async getAllAppointments() {
    return this.repo.findAllAppointments();
  }
}
