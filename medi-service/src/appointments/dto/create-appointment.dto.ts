import { IsUUID, IsDateString, IsString, IsOptional, IsIn, IsNumber } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  doctorId: string;

  @IsUUID()
  clinicId: string;

  @IsDateString()
  appointmentDate: string; // yyyy-mm-dd

  @IsString()
  slotStartTime: string; // HH:mm

  @IsString()
  slotEndTime: string; // HH:mm

  @IsString()
  patientFullName: string;

  @IsNumber()
  patientAge: number;

  @IsString()
  patientGender: string;

  @IsString()
  patientPhone: string;

  @IsOptional()
  @IsString()
  guardianName?: string;

  @IsOptional()
  @IsString()
  guardianPhone?: string;

  @IsOptional()
  @IsString()
  @IsIn(['father', 'mother', 'spouse', 'sibling', 'child', 'other'])
  guardianRelation?: string;
}
