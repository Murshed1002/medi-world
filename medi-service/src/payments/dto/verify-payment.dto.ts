import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class VerifyPaymentDto {
  @IsOptional()
  @IsUUID()
  paymentId?: string;

  @IsOptional()
  @IsString()
  providerOrderId?: string;

  @IsOptional()
  @IsString()
  providerPaymentId?: string;

  @IsOptional()
  @IsString()
  signature?: string;
}
