import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{10,15}$/, {
    message: 'Phone number must be 10-15 digits',
  })
  phone: string;
}
