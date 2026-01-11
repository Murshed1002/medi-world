import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { PaymentProvider } from '../types/payment.types';

export class InitiatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  payment_id: string;

  @IsEnum(PaymentProvider)
  @IsNotEmpty()
  provider: PaymentProvider;
}
