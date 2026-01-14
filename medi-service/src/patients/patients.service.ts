import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { RedisService } from '../common/redis/redis.service';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patients } from '../entities/patients.entity';
import { AuthUsers } from '../entities/auth-users.entity';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);
  private readonly PROFILE_CACHE_TTL = 300; // 5 minutes

  constructor(
    @InjectRepository(Patients)
    private readonly patientsRepo: EntityRepository<Patients>,
    @InjectRepository(AuthUsers)
    private readonly authUsersRepo: EntityRepository<AuthUsers>,
    private readonly redis: RedisService,
  ) {}

  async getPatientProfile(userId: string) {
    // Try to get from cache first
    const cachedProfile = await this.redis.getUserProfile(userId);
    if (cachedProfile) {
      this.logger.log(`Profile cache hit for user ${userId}`);
      return cachedProfile;
    }

    this.logger.log(`Profile cache miss for user ${userId}, fetching from DB`);

    // Fetch from database
    const user = await this.authUsersRepo.findOne(
      { id: userId },
      { populate: ['patient'] }
    );

    if (!user) {
      throw new NotFoundException('Patient not found');
    }

    const patient = user.patient;

    const profile = {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      fullName: patient?.name || 'Patient',
      gender: patient?.gender,
      dob: patient?.dateOfBirth,
      emergencyContactName: patient?.emergencyContactName,
      emergencyContactRelation: patient?.emergencyContactRelation,
      emergencyContactPhone: patient?.emergencyContactPhone,
    };

    // Cache the profile
    await this.redis.setUserProfile(userId, profile, this.PROFILE_CACHE_TTL);

    return profile;
  }

  async updatePatientProfile(userId: string, updateDto: UpdatePatientDto) {
    // Check if user exists
    const user = await this.authUsersRepo.findOne(
      { id: userId },
      { populate: ['patient'] }
    );

    if (!user) {
      throw new NotFoundException('Patient not found');
    }

    // Update email in auth_users if provided
    if (updateDto.email) {
      user.email = updateDto.email;
      await this.authUsersRepo.getEntityManager().flush();
    }

    // Create or update patient record
    const patientData: any = {};
    if (updateDto.fullName) patientData.name = updateDto.fullName;
    if (updateDto.gender) patientData.gender = updateDto.gender;
    if (updateDto.dob) patientData.date_of_birth = new Date(updateDto.dob);
    if (updateDto.emergencyContactName) patientData.emergencyContactName = updateDto.emergencyContactName;
    if (updateDto.emergencyContactRelation) patientData.emergencyContactRelation = updateDto.emergencyContactRelation;
    if (updateDto.emergencyContactPhone) patientData.emergencyContactPhone = updateDto.emergencyContactPhone;

    if (user.patient) {
      // Update existing patient record
      Object.assign(user.patient, patientData);
      await this.patientsRepo.getEntityManager().flush();
    } else {
      // Create new patient record
      const patient = this.patientsRepo.create({
        authUser: user,
        name: updateDto.fullName || 'Patient',
        ...patientData,
      });
      await this.patientsRepo.getEntityManager().persistAndFlush(patient);
    }

    // Invalidate cache after update
    await this.redis.deleteUserProfile(userId);
    this.logger.log(`Profile cache invalidated for user ${userId}`);

    return this.getPatientProfile(userId);
  }
}
