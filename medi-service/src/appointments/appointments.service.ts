import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/postgresql';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentStatus } from './types/appointment-status';
import { addMinutes } from 'date-fns';
import { Appointments } from '../entities/appointments.entity';
import { Patients } from '../entities/patients.entity';
import { DoctorClinics } from '../entities/doctor-clinics.entity';
import { ClinicQueues } from '../entities/clinic-queues.entity';
import { QueueEntries } from '../entities/queue-entries.entity';
import { Payments } from '../entities/payments.entity';
import { Clinics } from '../entities/clinics.entity';
import { Doctors } from '../entities/doctors.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointments)
    private readonly appointmentsRepo: EntityRepository<Appointments>,
    @InjectRepository(Patients)
    private readonly patientsRepo: EntityRepository<Patients>,
    @InjectRepository(DoctorClinics)
    private readonly doctorClinicsRepo: EntityRepository<DoctorClinics>,
    @InjectRepository(ClinicQueues)
    private readonly clinicQueuesRepo: EntityRepository<ClinicQueues>,
    @InjectRepository(QueueEntries)
    private readonly queueEntriesRepo: EntityRepository<QueueEntries>,
    @InjectRepository(Payments)
    private readonly paymentsRepo: EntityRepository<Payments>,
    private readonly em: EntityManager,
  ) {}

  async createAppointment(
    authUserId: string,
    dto: CreateAppointmentDto,
  ) {
    // Convert date string to Date object
    const appointmentDate = new Date(dto.appointmentDate);
    
    // Time columns expect HH:MM:SS format as strings
    const slotStartTime = dto.slotStartTime;
    const slotEndTime = dto.slotEndTime;

    return this.em.transactional(async (em) => {
      // Get patient record from auth_user_id
      const patient = await em.findOne(Patients, { authUser: authUserId });
      if (!patient) {
        throw new BadRequestException('Patient profile not found');
      }

      // Check if this patient already has a PAYMENT_PENDING appointment for this exact slot
      const existingPendingAppointment = await em.findOne(Appointments, {
        patient: patient,
        doctor: dto.doctorId,
        clinic: dto.clinicId,
        appointmentDate,
        slotStartTime: dto.slotStartTime,
        status: AppointmentStatus.PAYMENT_PENDING,
      });

      // If user already has a pending appointment for this slot, reuse it
      if (existingPendingAppointment) {
        // Find the associated payment
        const payment = await em.findOne(Payments, {
          referenceType: 'APPOINTMENT',
          referenceId: existingPendingAppointment.id,
        });
        
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
      const doctorClinic = await em.findOne(DoctorClinics, {
        doctor: dto.doctorId,
        clinic: dto.clinicId,
      });
      
      if (!doctorClinic || !doctorClinic.bookingFee) {
        throw new BadRequestException('Doctor clinic configuration not found');
      }

      const bookingFee = doctorClinic.bookingFee;

      // 1️⃣ Validate slot availability - check if slot is already booked by other patients
      const exists = await em.count(Appointments, {
        doctor: dto.doctorId,
        clinic: dto.clinicId,
        appointmentDate,
        slotStartTime: dto.slotStartTime,
        status: { $nin: [AppointmentStatus.CANCELLED_BY_PATIENT, AppointmentStatus.CANCELLED_BY_DOCTOR] },
        patient: { $ne: patient }, // Exclude this patient's appointments
      });

      if (exists > 0) {
        throw new ConflictException('Slot already booked');
      }

      // 2️⃣ Create appointment
      const patientRef = em.getReference(Patients, patient.id);
      const doctorRef = em.getReference(Doctors, dto.doctorId);
      const clinicRef = em.getReference(Clinics, dto.clinicId);
      
      const appointment = em.create(Appointments, {
        patient: patientRef,
        doctor: doctorRef,
        clinic: clinicRef,
        appointmentDate,
        slotStartTime,
        slotEndTime,
        status: AppointmentStatus.PAYMENT_PENDING,
        bookingFeeAmount: bookingFee,
      });
      await em.persistAndFlush(appointment);

      // 3️⃣ Create or get clinic queue for this date
      let clinicQueue = await em.findOne(ClinicQueues, {
        clinic: dto.clinicId,
        doctor: dto.doctorId,
        queueDate: appointmentDate,
      });

      if (!clinicQueue) {
        // Create queue if doesn't exist
        const clinic = await em.getReference(Clinics, dto.clinicId);
        const doctor = await em.getReference(Doctors, dto.doctorId);
        
        clinicQueue = em.create(ClinicQueues, {
          clinic,
          doctor,
          queueDate: appointmentDate,
          status: 'NOT_STARTED',
          currentTokenNumber: 0,
          lastIssuedTokenNumber: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await em.persistAndFlush(clinicQueue);
      }

      // 4️⃣ Assign token number
      const tokenNumber = clinicQueue.lastIssuedTokenNumber + 1;

      // Update last issued token
      clinicQueue.lastIssuedTokenNumber = tokenNumber;
      await em.flush();

      // Create queue entry
      const queueEntry = em.create(QueueEntries, {
        clinicQueueId: clinicQueue.id,
        appointment: appointment,
        tokenNumber,
        status: 'WAITING',
      });
      await em.persistAndFlush(queueEntry);

      // 5️⃣ Create payment intent
      const payment = em.create(Payments, {
        referenceType: 'APPOINTMENT',
        referenceId: appointment.id,
        patientId: patient.id,
        amount: bookingFee,
        currency: 'INR',
        paymentType: 'BOOKING_FEE',
        status: 'CREATED',
      });
      await em.persistAndFlush(payment);

      return {
        appointmentId: appointment.id,
        paymentId: payment.id,
        tokenNumber, // Return token number to user
        queueDate: dto.appointmentDate,
      };
    });
  }

  async confirmAppointment(appointmentId: string) {
    const appointment = await this.appointmentsRepo.findOne({ id: appointmentId });
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
    }

    if (appointment.status !== AppointmentStatus.PAYMENT_PENDING) {
      throw new BadRequestException(
        `Appointment is not in payment pending status. Current status: ${appointment.status}`
      );
    }

    // Update appointment status to CONFIRMED
    appointment.status = AppointmentStatus.CONFIRMED;
    await this.em.flush();
    
    return appointment;
  }

  async getAppointmentById(appointmentId: string) {
    const appointment = await this.appointmentsRepo.findOne(
      { id: appointmentId },
      { populate: ['doctor', 'clinic'] }
    );
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
    }

    // Fetch payment separately
    const payment = await this.paymentsRepo.findOne({
      referenceType: 'APPOINTMENT',
      referenceId: appointmentId,
    });

    // Transform response to match frontend expectations
    return {
      id: appointment.id,
      appointmentDate: appointment.appointmentDate,
      slotStartTime: appointment.slotStartTime,
      slotEndTime: appointment.slotEndTime,
      status: appointment.status,
      tokenNumber: appointment.queueTokenNumber,
      doctor: appointment.doctor ? {
        id: appointment.doctor.id,
        name: appointment.doctor.name,
        specialization: appointment.doctor.specialization,
      } : null,
      clinic: appointment.clinic ? {
        id: appointment.clinic.id,
        name: appointment.clinic.name,
        address: appointment.clinic.address,
      } : null,
      payment: payment ? {
        amount: Number(payment.amount),
        status: payment.status,
      } : null,
    };
  }

  async getAllAppointments() {
    return this.appointmentsRepo.findAll({
      populate: ['patient', 'doctor', 'clinic'],
    });
  }
}
