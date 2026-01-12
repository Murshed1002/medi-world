import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { GetDoctorsQueryDto } from './dto/get-doctors-query.dto';

@Injectable()
export class DoctorsService {
  private readonly logger = new Logger(DoctorsService.name);
  private readonly DOCTORS_CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
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

    // Build where clause
    const where: any = {
      is_verified: true, // Only show verified doctors
    };

    if (queryDto.search) {
      where.OR = [
        { full_name: { contains: queryDto.search, mode: 'insensitive' } },
        { specialization: { contains: queryDto.search, mode: 'insensitive' } },
      ];
    }

    if (queryDto.specialization) {
      where.specialization = queryDto.specialization;
    }

    if (queryDto.isFemale !== undefined) {
      where.gender = queryDto.isFemale ? 'FEMALE' : 'MALE';
    }

    if (queryDto.supportsVideo !== undefined) {
      where.supports_video = queryDto.supportsVideo;
    }

    // Fetch doctors with their clinics
    const doctors = await this.prisma.doctors.findMany({
      where,
      include: {
        auth_users: {
          select: {
            phone_number: true,
            email: true,
          },
        },
        doctor_clinics: {
          include: {
            clinics: true,
          },
        },
      },
    });

    // Transform data to match frontend expectations
    const transformedDoctors = await Promise.all(
      doctors.map(async (doctor) => {
        const primaryClinic = doctor.doctor_clinics[0]?.clinics;
        const consultationFee =
          doctor.doctor_clinics[0]?.consultation_fee || 0;

        // Check if doctor has appointments today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const hasAppointmentsToday = await this.prisma.appointments.count({
          where: {
            doctor_id: doctor.id,
            appointment_date: {
              gte: today,
              lt: tomorrow,
            },
            status: {
              in: ['CONFIRMED', 'PAYMENT_PENDING'],
            },
          },
        });

        // Get next available slot (simplified - can be enhanced)
        const nextSlot = await this.getNextAvailableSlot(doctor.id);

        return {
          id: doctor.id,
          name: doctor.full_name,
          specialization: doctor.specialization || 'General Physician',
          rating: doctor.rating ? parseFloat(doctor.rating.toString()) : 0,
          reviews: doctor.reviews_count || 0,
          fee: consultationFee ? parseFloat(consultationFee.toString()) : 0,
          availableToday: hasAppointmentsToday > 0,
          nextSlot,
          clinic: primaryClinic
            ? `${primaryClinic.name}, ${primaryClinic.address || ''}, ${primaryClinic.city || ''}`
            : 'Clinic information not available',
          avatarUrl: doctor.profile_image_url || this.getDefaultAvatar(doctor.gender),
          online: hasAppointmentsToday > 0,
          city: primaryClinic?.city || null,
          supportsVideo: doctor.supports_video || false,
          isFemale: doctor.gender === 'FEMALE',
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
    const doctor = await this.prisma.doctors.findUnique({
      where: { id },
      include: {
        auth_users: {
          select: {
            phone_number: true,
            email: true,
          },
        },
        doctor_clinics: {
          include: {
            clinics: true,
          },
        },
        doctor_reviews: {
          take: 10,
          orderBy: {
            created_at: 'desc',
          },
          include: {
            patients: {
              select: {
                full_name: true,
              },
            },
          },
        },
        doctor_slots: {
          orderBy: {
            day_of_week: 'asc',
          },
        },
      },
    });

    if (!doctor) {
      return null;
    }

    const primaryClinic = doctor.doctor_clinics[0]?.clinics;
    const consultationFee = doctor.doctor_clinics[0]?.consultation_fee || 0;
    const bookingFee = doctor.doctor_clinics[0]?.booking_fee || 0;

    // Get total patients treated (count of completed appointments)
    const totalPatients = await this.prisma.appointments.count({
      where: {
        doctor_id: id,
        status: 'COMPLETED',
      },
    });

    // Get today's queue information
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await this.prisma.appointments.findMany({
      where: {
        doctor_id: id,
        appointment_date: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: ['CONFIRMED', 'PAYMENT_PENDING', 'WAITING'],
        },
      },
      orderBy: {
        slot_start_time: 'asc',
      },
    });

    // Calculate queue status
    const currentTime = new Date();
    const waitingInQueue = todayAppointments.filter((apt) => {
      const aptTime = new Date(apt.appointment_date);
      // Convert TIME to string format (HH:MM:SS or HH:MM)
      const timeStr = apt.slot_start_time.toString();
      const [hours, minutes] = timeStr.split(':');
      aptTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return aptTime <= currentTime && apt.status !== 'COMPLETED';
    }).length;

    const avgConsultationTime = 15; // minutes per patient
    const estimatedWaitTime = waitingInQueue * avgConsultationTime;

    // Get next available slot
    const nextAvailableSlot = await this.getNextAvailableSlot(id);

    // Transform reviews
    const reviews = doctor.doctor_reviews.map((review) => ({
      id: review.id,
      patientName: review.is_anonymous
        ? 'Anonymous'
        : review.patients?.full_name || 'Anonymous',
      rating: parseFloat(review.rating.toString()),
      comment: review.review_text || '',
      date: review.created_at,
      isVerified: review.is_verified || false,
      helpfulCount: review.helpful_count || 0,
    }));

    // Transform doctor slots to clinic hours format
    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const clinicHours = doctor.doctor_slots
      .filter(slot => slot.clinic_id === primaryClinic?.id)
      .map(slot => {
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
          day: slot.day_of_week.charAt(0) + slot.day_of_week.slice(1).toLowerCase(),
          value: `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`,
        };
      })
      .sort((a, b) => {
        const aIndex = dayOrder.indexOf(a.day.toUpperCase());
        const bIndex = dayOrder.indexOf(b.day.toUpperCase());
        return aIndex - bIndex;
      });

    return {
      id: doctor.id,
      name: doctor.full_name,
      specialization: doctor.specialization || 'General Physician',
      rating: doctor.rating ? parseFloat(doctor.rating.toString()) : 0,
      reviewsCount: doctor.reviews_count || 0,
      fee: consultationFee ? parseFloat(consultationFee.toString()) : 0,
      bookingFee: bookingFee ? parseFloat(bookingFee.toString()) : 0,
      clinicId: primaryClinic?.id || null, // Add clinic ID
      clinic: primaryClinic
        ? `${primaryClinic.name}, ${primaryClinic.address || ''}, ${primaryClinic.city || ''}`
        : 'Clinic information not available',
      clinicName: primaryClinic?.name || 'Clinic',
      clinicAddress: primaryClinic?.address || '',
      clinicCity: primaryClinic?.city || '',
      clinicLatitude: primaryClinic?.latitude ? parseFloat(primaryClinic.latitude.toString()) : null,
      clinicLongitude: primaryClinic?.longitude ? parseFloat(primaryClinic.longitude.toString()) : null,
      clinicHours,
      avatarUrl: doctor.profile_image_url || this.getDefaultAvatar(doctor.gender),
      city: primaryClinic?.city || null,
      supportsVideo: doctor.supports_video || false,
      isFemale: doctor.gender === 'FEMALE',
      bio: doctor.bio || 'Experienced medical professional dedicated to providing quality care.',
      qualifications: doctor.registration_number || 'MBBS, MD',
      experienceYears: doctor.experience_years || 0,
      totalPatients,
      email: doctor.auth_users?.email,
      phone: doctor.auth_users?.phone_number,
      nextAvailableSlot,
      queueStatus: {
        waiting: waitingInQueue,
        estimatedWaitTime,
      },
      reviews,
    };
  }

  // Removed getOrderBy - sorting applied in-memory after transformation

  async getAvailableSlots(doctorId: string, dateStr: string): Promise<string[]> {
    const selectedDate = new Date(dateStr);
    selectedDate.setHours(0, 0, 0, 0);
    
    const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][selectedDate.getDay()];
    
    // Get doctor's schedule for the selected day
    const doctorSlot = await this.prisma.doctor_slots.findFirst({
      where: {
        doctor_id: doctorId,
        day_of_week: dayOfWeek,
      },
    });

    if (!doctorSlot) {
      return [];
    }

    // Get existing appointments for this day
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const existingAppointments = await this.prisma.appointments.findMany({
      where: {
        doctor_id: doctorId,
        appointment_date: {
          gte: selectedDate,
          lt: nextDay,
        },
        status: {
          in: ['CONFIRMED', 'PAYMENT_PENDING', 'WAITING'],
        },
      },
    });

    // Generate all possible slots based on start_time, end_time, and slot_duration
    const slots: string[] = [];
    const duration = doctorSlot.slot_duration_minutes;

    // Handle TIME type which comes as Date object from Prisma
    const getTimeComponents = (timeValue: any): [number, number] => {
      if (timeValue instanceof Date) {
        // Use UTC methods to avoid timezone conversion issues
        return [timeValue.getUTCHours(), timeValue.getUTCMinutes()];
      }
      const timeStr = timeValue.toString();
      const [hours, minutes] = timeStr.split(':').map(Number);
      return [hours, minutes];
    };

    const [startHours, startMinutes] = getTimeComponents(doctorSlot.start_time);
    const [endHours, endMinutes] = getTimeComponents(doctorSlot.end_time);

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
        const aptTime = apt.slot_start_time.toString();
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
    const nextAppointment = await this.prisma.appointments.findFirst({
      where: {
        doctor_id: doctorId,
        appointment_date: {
          gte: new Date(),
        },
        status: {
          in: ['CONFIRMED', 'PAYMENT_PENDING'],
        },
      },
      orderBy: {
        appointment_date: 'asc',
      },
    });

    if (nextAppointment) {
      const date = new Date(nextAppointment.appointment_date);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = days[date.getDay()];
      const time = nextAppointment.slot_start_time;
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
