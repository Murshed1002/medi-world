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

      // 3️⃣ Create or get clinic queue for this date
      let clinicQueue = await tx.findClinicQueue(
        dto.clinicId,
        dto.doctorId,
        new Date(dto.appointmentDate),
      );

      if (!clinicQueue) {
        // Create queue if doesn't exist
        clinicQueue = await tx.createClinicQueue({
          clinic_id: dto.clinicId,
          doctor_id: dto.doctorId,
          queue_date: new Date(dto.appointmentDate),
          status: 'NOT_STARTED',
          current_token_number: 0,
          last_issued_token_number: 0,
        });
      }

      // 4️⃣ Assign token number
      const tokenNumber = clinicQueue.last_issued_token_number + 1;

      // Update last issued token
      await tx.updateClinicQueue(clinicQueue.id, {
        last_issued_token_number: tokenNumber,
      });

      // Create queue entry
      await tx.createQueueEntry({
        clinic_queue_id: clinicQueue.id,
        appointment_id: appointment.id,
        token_number: tokenNumber,
        status: 'WAITING',
        check_in_time: new Date(), // Already checked in
      });

      // 5️⃣ Create payment intent
      const payment = await tx.createPayment({
        appointmentId: appointment.id,
        amount: appointment.bookingFee,
        status: 'CREATED',
      });

      return {
        appointmentId: appointment.id,
        paymentId: payment.id,
        tokenNumber, // Return token number to user
        queueDate: dto.appointmentDate,
        expiresAt,
      };
    });
  }
  async getAllAppointments() {
    return this.repo.findAllAppointments();
  }
}
