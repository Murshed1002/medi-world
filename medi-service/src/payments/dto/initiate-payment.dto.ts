import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { PaymentProvider } from '../types/payment.types';

export class InitiatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @IsEnum(PaymentProvider)
  @IsNotEmpty()
  provider: PaymentProvider;
}
