import { PaymentStatus } from '../types/payment.types';
import type { PaymentIntentContext } from '../types/payment.types';

export class PaymentIntentDto {
  id: string;
  purpose: string;
  referenceId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  context: PaymentIntentContext;
}
