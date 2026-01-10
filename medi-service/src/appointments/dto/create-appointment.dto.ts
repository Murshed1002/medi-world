import { IsUUID, IsDateString, IsString } from 'class-validator';

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
}
