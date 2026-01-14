import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { RedisService } from '../common/redis/redis.service';
import { GetDoctorsQueryDto } from './dto/get-doctors-query.dto';
import { Doctors } from '../entities/doctors.entity';
import { Appointments } from '../entities/appointments.entity';
import { DoctorSlots } from '../entities/doctor-slots.entity';

@Injectable()
export class DoctorsService {
  private readonly logger = new Logger(DoctorsService.name);
  private readonly DOCTORS_CACHE_TTL = 300; // 5 minutes

  constructor(
    @InjectRepository(Doctors)
    private readonly doctorsRepo: EntityRepository<Doctors>,
    @InjectRepository(Appointments)
    private readonly appointmentsRepo: EntityRepository<Appointments>,
    @InjectRepository(DoctorSlots)
    private readonly doctorSlotsRepo: EntityRepository<DoctorSlots>,
    private readonly redis: RedisService,
  ) {}

  async getDoctors(queryDto: GetDoctorsQueryDto) {
    // Generate cache key based on filters
    const cacheKey = `doctors:list:${JSON.stringify(queryDto)}`;

    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.log('Doctors list cache hit');
      return JSON.parse(cached);
    }

    this.logger.log('Doctors list cache miss, fetching from DB');

    // Build where clause for MikroORM
    const where: any = {};

    if (queryDto.search) {
      where.$or = [
        { name: { $ilike: `%${queryDto.search}%` } },
        { specialization: { $ilike: `%${queryDto.search}%` } },
      ];
    }

    if (queryDto.specialization) {
      where.specialization = queryDto.specialization;
    }

    // Fetch doctors with their clinics
    const doctors = await this.doctorsRepo.findAll({
      where,
      populate: ['doctorClinics', 'doctorClinics.clinic'],
    });

    // Transform data to match frontend expectations
    const transformedDoctors = await Promise.all(
      doctors.map(async (doctor) => {
        const primaryClinic = doctor.doctorClinics[0]?.clinic;
        const consultationFee =
          doctor.doctorClinics[0]?.consultationFee || 0;

        // Check if doctor has appointments today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const hasAppointmentsToday = await this.appointmentsRepo.count({
          doctor: doctor,
          appointmentDate: {
            $gte: today,
            $lt: tomorrow,
          },
          status: {
            $in: ['CONFIRMED', 'PAYMENT_PENDING'],
          },
        });

        // Get next available slot (simplified - can be enhanced)
        const nextSlot = await this.getNextAvailableSlot(doctor.id);

        return {
          id: doctor.id,
          name: doctor.name,
          specialization: doctor.specialization || 'General Physician',
          rating: 0,
          reviews: 0,
          fee: consultationFee ? parseFloat(consultationFee.toString()) : 0,
          availableToday: hasAppointmentsToday > 0,
          nextSlot,
          clinic: primaryClinic
            ? `${primaryClinic.name}, ${primaryClinic.address || ''}`
            : 'Clinic information not available',
          avatarUrl: this.getDefaultAvatar(doctor.gender),
          online: hasAppointmentsToday > 0,
          city: null,
          supportsVideo: false,
          isFemale: false,
        };
      }),
    );

    // Apply additional filters that can't be done in SQL
    let filtered = transformedDoctors;

    if (queryDto.city) {
      filtered = filtered.filter((d) => d.city === queryDto.city);
    }

    if (queryDto.availableToday !== undefined) {
      filtered = filtered.filter(
        (d) => d.availableToday === queryDto.availableToday,
      );
    }

    // Apply sorting
    if (queryDto.sortBy === 'rating') {
      filtered.sort((a, b) =>
        queryDto.sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating,
      );
    } else if (queryDto.sortBy === 'fee') {
      filtered.sort((a, b) =>
        queryDto.sortOrder === 'asc' ? a.fee - b.fee : b.fee - a.fee,
      );
    } else if (queryDto.sortBy === 'reviews') {
      filtered.sort((a, b) =>
        queryDto.sortOrder === 'asc' ? a.reviews - b.reviews : b.reviews - a.reviews,
      );
    }

    // Cache the result
    await this.redis.set(
      cacheKey,
      JSON.stringify(filtered),
      this.DOCTORS_CACHE_TTL,
    );

    return filtered;
  }

  async getDoctorById(id: string) {
    const doctor = await this.doctorsRepo.findOne(
      { id },
      { populate: ['doctorClinics', 'doctorClinics.clinic'] }
    );

    if (!doctor) {
      return null;
    }

    const primaryClinic = doctor.doctorClinics[0]?.clinic;
    const consultationFee = doctor.doctorClinics[0]?.consultationFee || 0;
    const bookingFee = doctor.doctorClinics[0]?.bookingFee || 0;

    // Get total patients treated (count of completed appointments)
    const totalPatients = await this.appointmentsRepo.count({
      doctor: doctor,
      status: 'COMPLETED',
    });

    // Get today's queue information
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await this.appointmentsRepo.find(
      {
        doctor: doctor,
        appointmentDate: {
          $gte: today,
          $lt: tomorrow,
        },
        status: {
          $in: ['CONFIRMED', 'PAYMENT_PENDING', 'WAITING'],
        },
      },
      { orderBy: { slotStartTime: 'asc' } }
    );

    // Calculate queue status
    const currentTime = new Date();
    const waitingInQueue = todayAppointments.filter((apt) => {
      const aptTime = new Date(apt.appointmentDate);
      // Convert TIME to string format (HH:MM:SS or HH:MM)
      const timeStr = apt.slotStartTime.toString();
      const [hours, minutes] = timeStr.split(':');
      aptTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return aptTime <= currentTime && apt.status !== 'COMPLETED';
    }).length;

    const avgConsultationTime = 15; // minutes per patient
    const estimatedWaitTime = waitingInQueue * avgConsultationTime;

    // Get next available slot
    const nextAvailableSlot = await this.getNextAvailableSlot(id);

    // Get doctor slots for clinic hours
    const doctorSlots = await this.doctorSlotsRepo.find(
      { doctor: id },
      { orderBy: { dayOfWeek: 'asc' } }
    );

    // Transform doctor slots to clinic hours format
    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const clinicHours = doctorSlots.map(slot => {
        // Convert 24h to 12h format - handles both Date objects and strings
        const formatTime = (time: any) => {
          let hours: number;
          let minutes: string;
          
          if (time instanceof Date) {
            // Use UTC methods to avoid timezone conversion issues
            hours = time.getUTCHours();
            minutes = time.getUTCMinutes().toString().padStart(2, '0');
          } else {
            const timeStr = time.toString();
            const parts = timeStr.split(':');
            if (parts.length < 2) return timeStr;
            hours = parseInt(parts[0]);
            minutes = parts[1];
          }
          
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const h12 = hours % 12 || 12;
          return `${h12}:${minutes} ${ampm}`;
        };

        return {
          day: slot.dayOfWeek.charAt(0) + slot.dayOfWeek.slice(1).toLowerCase(),
          value: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
        };
      })
      .sort((a, b) => {
        const aIndex = dayOrder.indexOf(a.day.toUpperCase());
        const bIndex = dayOrder.indexOf(b.day.toUpperCase());
        return aIndex - bIndex;
      });

    return {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization || 'General Physician',
      rating: 0,
      reviewsCount: 0,
      fee: consultationFee ? parseFloat(consultationFee.toString()) : 0,
      bookingFee: bookingFee ? parseFloat(bookingFee.toString()) : 0,
      clinicId: primaryClinic?.id || null,
      clinic: primaryClinic
        ? `${primaryClinic.name}, ${primaryClinic.address || ''}`
        : 'Clinic information not available',
      clinicName: primaryClinic?.name || 'Clinic',
      clinicAddress: primaryClinic?.address || '',
      clinicCity:   primaryClinic.city || null,
      clinicLatitude: primaryClinic?.latitude || null,
      clinicLongitude: primaryClinic?.longitude || null,
      clinicHours,
      avatarUrl: this.getDefaultAvatar(doctor.gender),
      city: primaryClinic?.city || null,
      supportsVideo: false,
      isFemale: false,
      bio: 'Experienced medical professional dedicated to providing quality care.',
      qualifications: doctor.licenseNumber || 'MBBS, MD',
      experienceYears: doctor.experienceYears || 0,
      totalPatients,
      email: doctor.email,
      phone: doctor.phoneNumber,
      nextAvailableSlot,
      queueStatus: {
        waiting: waitingInQueue,
        estimatedWaitTime,
      },
      reviews: [],
    };
  }

  // Removed getOrderBy - sorting applied in-memory after transformation

  async getAvailableSlots(doctorId: string, dateStr: string): Promise<string[]> {
    const selectedDate = new Date(dateStr);
    selectedDate.setHours(0, 0, 0, 0);
    
    const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][selectedDate.getDay()];
    
    // Get doctor's schedule for the selected day
    const doctorSlot = await this.doctorSlotsRepo.findOne({
      doctor: doctorId,
      dayOfWeek,
    });

    if (!doctorSlot) {
      return [];
    }

    // Check if time values are null
    if (!doctorSlot.startTime || !doctorSlot.endTime) {
      this.logger.warn(`Doctor slot has null time values for doctorId=${doctorId}, dayOfWeek=${dayOfWeek}`);
      return [];
    }

    // Get existing appointments for this day
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const existingAppointments = await this.appointmentsRepo.find({
      doctor: doctorId,
      appointmentDate: {
        $gte: selectedDate,
        $lt: nextDay,
      },
      status: {
        $in: ['CONFIRMED', 'PAYMENT_PENDING', 'WAITING'],
      },
    });

    // Generate all possible slots based on startTime, endTime, and slotDuration
    const slots: string[] = [];
    const duration = doctorSlot.slotDurationMinutes;

    // Handle TIME type which comes as string from MikroORM
    const getTimeComponents = (timeValue: string): [number, number] => {
      const parts = timeValue.split(':');
      if (parts.length < 2) {
        this.logger.error(`Invalid time format: ${timeValue}`);
        return [0, 0];
      }
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        this.logger.error(`Could not parse time: ${timeValue}`);
        return [0, 0];
      }
      
      return [hours, minutes];
    };

    const [startHours, startMinutes] = getTimeComponents(doctorSlot.startTime);
    const [endHours, endMinutes] = getTimeComponents(doctorSlot.endTime);

    let currentMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    while (currentMinutes + duration <= endTotalMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      
      // Format to 12-hour time
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      const timeSlot = `${displayHours}:${displayMinutes} ${ampm}`;

      // Check if this slot is already booked
      const isBooked = existingAppointments.some(apt => {
        const aptTime = apt.slotStartTime.toString();
        const [aptHours, aptMinutes] = aptTime.split(':').map(Number);
        return aptHours === hours && aptMinutes === minutes;
      });

      if (!isBooked) {
        slots.push(timeSlot);
      }

      currentMinutes += duration;
    }

    return slots;
  }

  private async getNextAvailableSlot(doctorId: string): Promise<string | null> {
    // Simplified logic - get next appointment
    const nextAppointment = await this.appointmentsRepo.findOne(
      {
        doctor: doctorId,
        appointmentDate: {
          $gte: new Date(),
        },
        status: {
          $in: ['CONFIRMED', 'PAYMENT_PENDING'],
        },
      },
      { orderBy: { appointmentDate: 'asc' } }
    );

    if (nextAppointment) {
      const date = new Date(nextAppointment.appointmentDate);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = days[date.getDay()];
      const time = nextAppointment.slotStartTime;
      return `${dayName}, ${time}`;
    }

    return null;
  }

  private getDefaultAvatar(gender?: string | null): string {
    // Female avatar
    if (gender === 'FEMALE') {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFLhDweYIPeaWTMZf4XESSyCFmcQRjA7e2bSIeoMY-869jaVRqcjLOJTWPTMikWBOEhTsC5hhPkILz1PIRNoXgZR6ZGKKf0o8Xic2aZR0qXDIeVFYQ-W70O1ZqcJVfVbFRJIqALsnzQ-G5xaQBuO-5fBA1lq8wsBOw-mi82k5FT7e6sh0qNMadyaLolHdgLmCYBWmJv4Dx_5Wyj5MC005rNJgLSuUoRcSN5weM53yY9ne5tjIVHV1rWKy0-Z68Mb11hXlLwKdN1_Q';
    }
    // Male avatar (default)
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZLxHCTeji0h2YcibzURppf4JWscgBwpeIzdm5d7N52ECQ-816Nta3RWeXKh67R2zyRo4C3tniUIAPMOqkD-BGO6jHKZ7-4QZ6tty1GTfQYpzm3-mcvvIIJXTp6J7Xg1rAtg0YfyF-3JWDzu5SDP1W4nqCeZ4cGY5bC59ldtI5v-dUDzOYtnQml4mXGQ5r0A8CPYomltQoIdimIiaFyijYC5fYOjoVpCyabFyGZ4ZVdfx8X0sdMafiARklJ7z-ZvvQq03vkXZYcnk';
  }
}
