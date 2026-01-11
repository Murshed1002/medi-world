import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RefundPaymentDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number; // If not provided, full refund

  @IsString()
  @IsOptional()
  reason?: string;

  @IsOptional()
  notes?: Record<string, string>;
}
