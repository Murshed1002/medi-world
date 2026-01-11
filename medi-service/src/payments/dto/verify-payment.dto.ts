import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifyPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  payment_id: string;

  @IsString()
  @IsNotEmpty()
  provider_order_id: string;

  @IsString()
  @IsNotEmpty()
  provider_payment_id: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}
