import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod, PaymentProvider, PaymentStatus } from '../types/payment.types';

export class UpdatePaymentDto {
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsEnum(PaymentMethod)
  @IsOptional()
  payment_method?: PaymentMethod;

  @IsEnum(PaymentProvider)
  @IsOptional()
  provider?: PaymentProvider;

  @IsString()
  @IsOptional()
  provider_order_id?: string;

  @IsString()
  @IsOptional()
  provider_payment_id?: string;
}
