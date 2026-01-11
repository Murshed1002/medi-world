import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{10,15}$/, {
    message: 'Phone number must be 10-15 digits',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^[0-9]{6}$/, { message: 'OTP must be 6 digits' })
  otp: string;
}
