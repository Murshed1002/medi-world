export enum PaymentReferenceType {
  APPOINTMENT = 'APPOINTMENT',
  MEDICINE_ORDER = 'MEDICINE_ORDER',
  LAB_TEST = 'LAB_TEST',
  CONSULTATION = 'CONSULTATION',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum PaymentType {
  BOOKING_FEE = 'BOOKING_FEE',
  CONSULTATION_FEE = 'CONSULTATION_FEE',
  MEDICINE = 'MEDICINE',
  DIAGNOSTIC = 'DIAGNOSTIC',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum PaymentMethod {
  UPI = 'UPI',
  CARD = 'CARD',
  NET_BANKING = 'NET_BANKING',
  WALLET = 'WALLET',
}

export enum PaymentProvider {
  RAZORPAY = 'RAZORPAY',
  STRIPE = 'STRIPE',
  PAYTM = 'PAYTM',
  PHONEPE = 'PHONEPE',
}

export enum PaymentStatus {
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface PaymentMetadata {
  items?: Array<{
    title: string;
    note?: string;
    amount?: number;
    qty?: number;
    icon?: string;
  }>;
  meta?: Array<{
    label: string;
    value: string;
    icon?: string;
  }>;
  delivery_address?: string;
  prescription_id?: string;
  [key: string]: any;
}

export interface PaymentIntentContext {
  title: string;
  subtitle?: string;
  meta?: Array<{ label: string; value: string; icon?: string }>;
  items?: Array<{
    title: string;
    note?: string;
    amount?: number;
    qty?: number;
    icon?: string;
  }>;
  policyTitle?: string;
  policyText?: string;
}
