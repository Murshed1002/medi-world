import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
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
    authUserId: string,
    dto: CreateAppointmentDto,
  ) {
    // Convert date string to Date object
    const appointmentDate = new Date(dto.appointmentDate);
    
    // Convert time strings to DateTime (date part is ignored by TIME column)
    const slotStartTime = new Date(`1970-01-01T${dto.slotStartTime}:00.000Z`);
    const slotEndTime = new Date(`1970-01-01T${dto.slotEndTime}:00.000Z`);

    return this.repo.withTransaction(async (tx) => {
      // Get patient record from auth_user_id
      const patient = await tx.findPatientByAuthUserId(authUserId);
      if (!patient) {
        throw new BadRequestException('Patient profile not found');
      }

      // Check if this patient already has a PAYMENT_PENDING appointment for this exact slot
      const existingPendingAppointment = await tx.findPendingAppointment(
        patient.id,
        dto.doctorId,
        dto.clinicId,
        dto.appointmentDate,
        dto.slotStartTime,
      );

      // If user already has a pending appointment for this slot, reuse it
      if (existingPendingAppointment) {
        // Find the associated payment
        const payment = await tx.findPaymentByAppointmentId(existingPendingAppointment.id);
        
        if (payment) {
          // Return existing appointment and payment (user can retry payment)
          return {
            appointmentId: existingPendingAppointment.id,
            paymentId: payment.id,
            tokenNumber: null, // Will be assigned when payment completes
            queueDate: dto.appointmentDate,
          };
        }
      }

      // Get booking fee from doctor_clinics table
      const fees = await tx.getDoctorClinicFees(dto.doctorId, dto.clinicId);
      if (!fees || !fees.booking_fee) {
        throw new BadRequestException('Doctor clinic configuration not found');
      }

      const bookingFee = fees.booking_fee;

      // 1️⃣ Validate slot availability (LOCKED) - excludes this patient's own pending appointments
      const exists = await tx.isSlotBooked(
        dto.doctorId,
        dto.clinicId,
        dto.appointmentDate,
        dto.slotStartTime,
      );

      if (exists) {
        throw new ConflictException('Slot already booked');
      }

      // 2️⃣ Create appointment using Prisma connect syntax
      const appointment = await tx.createAppointment({
        appointment_date: appointmentDate,
        slot_start_time: slotStartTime,
        slot_end_time: slotEndTime,
        status: AppointmentStatus.PAYMENT_PENDING,
        booking_fee_amount: bookingFee,
        patients: {
          connect: { id: patient.id }
        },
        doctors: {
          connect: { id: dto.doctorId }
        },
        clinics: {
          connect: { id: dto.clinicId }
        }
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
        reference_type: 'APPOINTMENT',
        reference_id: appointment.id,
        patient_id: patient.id,
        amount: bookingFee,
        currency: 'INR',
        payment_type: 'BOOKING_FEE',
        status: 'CREATED',
      });

      return {
        appointmentId: appointment.id,
        paymentId: payment.id,
        tokenNumber, // Return token number to user
        queueDate: dto.appointmentDate,
      };
    });
  }

  async confirmAppointment(appointmentId: string) {
    const appointment = await this.repo.findAppointmentById(appointmentId);
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
    }

    if (appointment.status !== AppointmentStatus.PAYMENT_PENDING) {
      throw new BadRequestException(
        `Appointment is not in payment pending status. Current status: ${appointment.status}`
      );
    }

    // Update appointment status to CONFIRMED
    return this.repo.updateAppointment(appointmentId, {
      status: AppointmentStatus.CONFIRMED,
    });
  }

  async getAppointmentById(appointmentId: string) {
    const appointment = await this.repo.findAppointmentById(appointmentId);
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
    }

    // Fetch payment separately since we removed the direct relation
    const payment = await this.repo.findPaymentByAppointmentId(appointmentId);

    // Transform response to match frontend expectations (singular names and correct field names)
    return {
      id: appointment.id,
      appointmentDate: appointment.appointment_date,
      slotStartTime: appointment.slot_start_time,
      slotEndTime: appointment.slot_end_time,
      status: appointment.status,
      tokenNumber: appointment.queue_token_number,
      doctor: appointment.doctors ? {
        id: appointment.doctors.id,
        name: appointment.doctors.full_name,
        specialization: appointment.doctors.specialization,
      } : null,
      clinic: appointment.clinics ? {
        id: appointment.clinics.id,
        name: appointment.clinics.name,
        address: appointment.clinics.address,
        city: appointment.clinics.city,
      } : null,
      payment: payment ? {
        amount: Number(payment.amount),
        status: payment.status,
      } : null,
    };
  }

  async getAllAppointments() {
    return this.repo.findAllAppointments();
  }
}
