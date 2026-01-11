import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentReferenceType, PaymentType } from '../types/payment.types';
import type { PaymentMetadata } from '../types/payment.types';

export class CreatePaymentDto {
  @IsEnum(PaymentReferenceType)
  @IsNotEmpty()
  reference_type: PaymentReferenceType;

  @IsUUID()
  @IsNotEmpty()
  reference_id: string;

  @IsUUID()
  @IsNotEmpty()
  patient_id: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @IsEnum(PaymentType)
  @IsNotEmpty()
  payment_type: PaymentType;

  @IsOptional()
  metadata?: PaymentMetadata;
}
