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
import { DoctorsService } from 'src/doctors/doctors.service';

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
    private doctorService: DoctorsService,
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
        patientFullName: dto.patientFullName,
        patientAge: dto.patientAge,
        patientGender: dto.patientGender,
        patientPhone: dto.patientPhone,
        guardianName: dto.guardianName,
        guardianPhone: dto.guardianPhone,
        guardianRelation: dto.guardianRelation,
        status: AppointmentStatus.PAYMENT_PENDING,
        bookingFeeAmount: bookingFee,
      });
      em.persist(appointment);
      await em.flush();

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
        em.persist(clinicQueue);
        await em.flush();
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
      em.persist(queueEntry);
      await em.flush();

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
      em.persist(payment);
      await em.flush();

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
      { populate: ['doctor', 'clinic', 'patient'] }
    );
    const doctorClinic = await this.doctorClinicsRepo.findOne({
      doctor: appointment?.doctor,
      clinic: appointment?.clinic,
    });
    
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
      bookingFeeAmount: appointment.bookingFeeAmount,
      consultationFeeAmount: doctorClinic?.consultationFee,
      patientFullName: appointment.patientFullName,
      patientAge: appointment.patientAge,
      patientGender: appointment.patientGender,
      guardianName: appointment.guardianName,
      guardianPhone: appointment.guardianPhone,
      guardianRelation: appointment.guardianRelation,
      doctor: appointment.doctor ? {
        id: appointment.doctor.id,
        name: appointment.doctor.name,
        specialization: appointment.doctor.specialization,
        avatarUrl: this.doctorService.getDefaultAvatar(appointment.doctor.gender),
        qualifications: appointment.doctor.qualifications,
      } : null,
      clinic: appointment.clinic ? {
        id: appointment.clinic.id,
        name: appointment.clinic.name,
        address: appointment.clinic.address,
        latitude: appointment.clinic.latitude,
        longitude: appointment.clinic.longitude,
        city: appointment.clinic.city,
      } : null,
      payment: payment ? {
        amount: Number(payment.amount),
        status: payment.status,
      } : null,
      patient: appointment.patient ? {
        id: appointment.patient.id,
        name: appointment.patient.name,
        email: appointment.patient.email,
        phoneNumber: appointment.patient.phoneNumber,
        gender: appointment.patient.gender,
        age: appointment.patient.dateOfBirth ? Math.floor((new Date().getTime() - new Date(appointment.patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : null,
        guardianName: appointment.patient.emergencyContactName,
        guardianPhoneNumber: appointment.patient.emergencyContactPhone,
        guardianRelationship: appointment.patient.emergencyContactRelation,
      } : null,
    };
  }

  async getAllAppointments(authUserId: string) {
    const patient = await this.patientsRepo.findOne({ authUser: authUserId });
    if (!patient) {
      throw new BadRequestException('Patient profile not found');
    }
    return this.appointmentsRepo.findAll({
      populate: ['patient', 'doctor', 'clinic'],
      where: { patient },
    });
  }

  async getAllAppointmentsByUser(authUserId: string) {
    const patient = await this.patientsRepo.findOne({ authUser: authUserId });
    if (!patient) {
      throw new BadRequestException('Patient profile not found');
    }
    const appointments = await this.appointmentsRepo.findAll({
      populate: ['patient', 'doctor', 'clinic'],
      where: { patient, status: { $nin: [AppointmentStatus.CANCELLED_BY_PATIENT, AppointmentStatus.CANCELLED_BY_DOCTOR, AppointmentStatus.PAYMENT_PENDING] } },
      orderBy: { appointmentDate: 'DESC' },
    });

    // Transform appointments to include payment info
    return appointments.map(appointment => ({
      id: appointment.id,
      patientFullName: appointment.patientFullName,
      appointmentDate: appointment.appointmentDate,
      slotStartTime: appointment.slotStartTime,
      slotEndTime: appointment.slotEndTime,
      status: appointment.status,
      tokenNumber: appointment.queueTokenNumber,
      doctor: appointment.doctor ? {
        id: appointment.doctor.id,
        name: appointment.doctor.name,
        gender: appointment.doctor.gender,
        specialization: appointment.doctor.specialization,
        avatarUrl: this.doctorService.getDefaultAvatar(appointment.doctor.gender), // Assuming this method exists in DoctorsService
      } : null,
      clinic: appointment.clinic ? {
        id: appointment.clinic.id,
        name: appointment.clinic.name,
        address: appointment.clinic.address,
      } : null,
    }));
  }
}
