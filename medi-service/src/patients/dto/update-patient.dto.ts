import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  emergency_contact_name?: string;

  @IsOptional()
  @IsString()
  emergency_contact_relation?: string;

  @IsOptional()
  @IsString()
  emergency_contact_phone?: string;
}
