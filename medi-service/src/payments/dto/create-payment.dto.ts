import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentReferenceType, PaymentType } from '../types/payment.types';
import type { PaymentMetadata } from '../types/payment.types';

export class CreatePaymentDto {
  @IsEnum(PaymentReferenceType)
  @IsNotEmpty()
  referenceType: PaymentReferenceType;

  @IsUUID()
  @IsNotEmpty()
  referenceId: string;

  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @IsEnum(PaymentType)
  @IsNotEmpty()
  paymentType: PaymentType;

  @IsOptional()
  metadata?: PaymentMetadata;
}
