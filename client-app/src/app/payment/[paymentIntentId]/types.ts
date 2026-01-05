export type PaymentPurpose = "APPOINTMENT" | "MEDICINE" | "LAB";
export type PaymentStatusType = "CREATED" | "PAID" | "FAILED" | "PENDING";

export type PaymentIntent = {
  id: string;
  purpose: PaymentPurpose;
  reference_id: string;
  amount: number;
  currency: string;
  status: PaymentStatusType;
  context: {
    title: string;
    subtitle?: string;
    meta?: Array<{ label: string; value: string; icon?: string }>;
    items?: Array<{ title: string; note?: string; amount?: number; qty?: number; icon?: string }>;
    policyTitle?: string;
    policyText?: string;
  };
};
