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
      },
    });

    if (!doctor) {
      return null;
    }

    const primaryClinic = doctor.doctor_clinics[0]?.clinics;
    const consultationFee = doctor.doctor_clinics[0]?.consultation_fee || 0;

    return {
      id: doctor.id,
      name: doctor.full_name,
      specialization: doctor.specialization || 'General Physician',
      rating: doctor.rating ? parseFloat(doctor.rating.toString()) : 0,
      reviews: doctor.reviews_count || 0,
      fee: consultationFee ? parseFloat(consultationFee.toString()) : 0,
      clinic: primaryClinic
        ? `${primaryClinic.name}, ${primaryClinic.address || ''}, ${primaryClinic.city || ''}`
        : 'Clinic information not available',
      avatarUrl: doctor.profile_image_url || this.getDefaultAvatar(doctor.gender),
      city: primaryClinic?.city || null,
      supportsVideo: doctor.supports_video || false,
      isFemale: doctor.gender === 'FEMALE',
      bio: doctor.bio || 'Experienced medical professional dedicated to providing quality care.',
      qualifications: doctor.registration_number || 'MBBS, MD',
      experience_years: doctor.experience_years || 0,
      email: doctor.auth_users?.email,
      phone: doctor.auth_users?.phone_number,
    };
  }

  // Removed getOrderBy - sorting applied in-memory after transformation

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
