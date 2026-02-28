import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod, PaymentProvider, PaymentStatus } from '../types/payment.types';

export class UpdatePaymentDto {
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsEnum(PaymentProvider)
  @IsOptional()
  provider?: PaymentProvider;

  @IsString()
  @IsOptional()
  providerOrderId?: string;

  @IsString()
  @IsOptional()
  providerPaymentId?: string;
}
