import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPatientProfile(userId: string) {
    const user = await this.prisma.auth_users.findUnique({
      where: { id: userId },
      include: {
        patients: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Patient not found');
    }

    const patient = user.patients;

    return {
      id: user.id,
      phone_number: user.phone_number,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      full_name: patient?.full_name || 'Patient',
      gender: patient?.gender,
      dob: patient?.dob,
      emergency_contact_name: patient?.emergency_contact_name,
      emergency_contact_relation: patient?.emergency_contact_relation,
      emergency_contact_phone: patient?.emergency_contact_phone,
    };
  }

  async updatePatientProfile(userId: string, updateDto: UpdatePatientDto) {
    // Check if user exists
    const user = await this.prisma.auth_users.findUnique({
      where: { id: userId },
      include: { patients: true },
    });

    if (!user) {
      throw new NotFoundException('Patient not found');
    }

    // Update email in auth_users if provided
    if (updateDto.email) {
      await this.prisma.auth_users.update({
        where: { id: userId },
        data: { email: updateDto.email },
      });
    }

    // Create or update patient record
    const patientData = {
      full_name: updateDto.full_name,
      gender: updateDto.gender,
      dob: updateDto.dob ? new Date(updateDto.dob) : undefined,
      emergency_contact_name: updateDto.emergency_contact_name,
      emergency_contact_relation: updateDto.emergency_contact_relation,
      emergency_contact_phone: updateDto.emergency_contact_phone,
    };

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(patientData).filter(([_, v]) => v !== undefined),
    );

    if (user.patients) {
      // Update existing patient record
      await this.prisma.patients.update({
        where: { auth_user_id: userId },
        data: cleanedData,
      });
    } else {
      // Create new patient record
      await this.prisma.patients.create({
        data: {
          auth_user_id: userId,
          ...cleanedData,
        },
      });
    }

    return this.getPatientProfile(userId);
  }
}
