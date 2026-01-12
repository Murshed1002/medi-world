import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class VerifyPaymentDto {
  @IsOptional()
  @IsUUID()
  payment_id?: string;

  @IsOptional()
  @IsString()
  provider_order_id?: string;

  @IsOptional()
  @IsString()
  provider_payment_id?: string;

  @IsOptional()
  @IsString()
  signature?: string;
}
