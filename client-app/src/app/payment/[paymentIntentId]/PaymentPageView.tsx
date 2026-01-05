"use client";

import { useEffect, useMemo, useState } from "react";
import PaymentSummary from "./components/PaymentSummary";
import PaymentMethods from "./components/PaymentMethods";
import PaymentStatus from "./components/PaymentStatus";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import type { PaymentIntent, PaymentPurpose, PaymentStatusType } from "./types";

function mockFetchPaymentIntent(id: string): Promise<PaymentIntent> {
  const base = {
    id,
    currency: "INR",
    status: "CREATED" as const,
  };

  // Very simple purpose detection based on id string; replace with real fetch in backend
  const purpose: PaymentPurpose = id.toLowerCase().includes("med")
    ? "MEDICINE"
    : id.toLowerCase().includes("lab")
    ? "LAB"
    : "APPOINTMENT";

  if (purpose === "APPOINTMENT") {
    return Promise.resolve({
      ...base,
      purpose,
      reference_id: "apt-12345",
      amount: 200,
      context: {
        title: "Doctor Consultation",
        subtitle: "Dr. Emily Chen · Cardiologist",
        meta: [
          { label: "Appointment Time", value: "Oct 24, 10:00 AM", icon: "CalendarMonth" },
          { label: "Patient Name", value: "John Doe", icon: "Person" },
        ],
        policyTitle: "Cancellation & Refund Policy",
        policyText:
          "Cancellations made 24 hours prior to the appointment are eligible for a full refund of the booking fee. No refunds for late cancellations.",
      },
    });
  }

  if (purpose === "MEDICINE") {
    return Promise.resolve({
      ...base,
      purpose,
      reference_id: "ord-29381",
      amount: 1150,
      context: {
        title: "Medicine Order",
        subtitle: "Pharmacy Delivery · Home",
        items: [
          { title: "Atorva 20mg Tablet", note: "Strip of 15 tabs", amount: 380, qty: 2, icon: "healing" },
          { title: "Benadryl Cough Syrup", note: "150ml Bottle", amount: 125, qty: 1, icon: "medication" },
          { title: "Pan 40 Tablet", note: "Strip of 15 tabs", amount: 450, qty: 3, icon: "pill" },
          { title: "Shelcal 500mg", note: "Bottle of 30 tabs", amount: 295, qty: 1, icon: "prescriptions" },
        ],
        meta: [
          { label: "Delivery Estimate", value: "Tomorrow, 4 PM", icon: "LocalShipping" },
          { label: "Patient Name", value: "John Doe", icon: "Person" },
        ],
        policyTitle: "Return Policy",
        policyText:
          "Medicines are non-returnable once the seal is broken. Returns for damaged or incorrect items are accepted within 7 days of delivery.",
      },
    });
  }

  return Promise.resolve({
    ...base,
    purpose: "LAB",
    reference_id: "rep-88291",
    amount: 500,
    context: {
      title: "Medical Test Report",
      subtitle: "Complete Blood Count · Pathology",
      items: [
        { title: "Complete Blood Count", note: "Ready for Download", amount: 450, icon: "Biotech" },
        { title: "Service Charge", note: "Platform Processing Fee", amount: 50, icon: "ReceiptLong" },
      ],
      meta: [{ label: "Patient Name", value: "John Doe", icon: "Person" }],
      policyTitle: "Refund Policy",
      policyText:
        "Payment for medical reports is non-refundable once the test sample has been processed. If you believe there is an error in the billing, please contact support before paying.",
    },
  });
}

export default function PaymentPageView({ paymentIntentId }: { paymentIntentId: string }) {
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [status, setStatus] = useState<PaymentStatusType>("CREATED");

  useEffect(() => {
    let mounted = true;
    mockFetchPaymentIntent(paymentIntentId).then((pi) => {
      if (!mounted) return;
      setIntent(pi);
      setStatus(pi.status);
    });
    return () => {
      mounted = false;
    };
  }, [paymentIntentId]);

  const amount = useMemo(() => intent?.amount ?? 0, [intent]);

  const onPay = async (method: string) => {
    // Simulate gateway redirect/modal and result
    setStatus("PENDING");
    await new Promise((r) => setTimeout(r, 1200));
    // Randomize outcome lightly for demo; replace with real gateway callback
    const ok = Math.random() > 0.1;
    setStatus(ok ? "PAID" : "FAILED");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#101922] text-slate-900 dark:text-white">
      <header className="sticky top-0 z-50 bg-white dark:bg-[#1a2632] border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="px-4 md:px-10 py-3 max-w-7xl mx-auto w-full flex items-center justify-between whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-green-600/10 rounded-full flex items-center justify-center text-green-600">
              <MedicalServicesIcon fontSize="small" />
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight">MedQueue</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="size-10 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center relative">
              <NotificationsIcon fontSize="medium" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-[#1a2632]"></span>
            </button>
            <button className="size-10 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center">
              <AccountCircleIcon fontSize="medium" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-8 md:py-10">
        <div className="flex flex-col gap-2 mb-8 md:mb-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
              Payment Gateway
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            {intent?.purpose === "MEDICINE"
              ? "Complete Medicine Order"
              : intent?.purpose === "LAB"
              ? "Complete Report Payment"
              : "Complete Booking Payment"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
            {intent?.purpose === "MEDICINE"
              ? "Please review your medicine order details. Payment is required to confirm the order and initiate dispatch from the pharmacy."
              : intent?.purpose === "LAB"
              ? "You are paying for your medical test report. Once the payment is complete, the digital report will be instantly available for download."
              : "You are paying a booking fee to secure your appointment. The remaining consultation fee will be collected at the clinic."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <PaymentSummary intent={intent} />
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/40 rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <LockIcon className="text-green-600" />
                <div>
                  <p className="text-sm font-bold">Secure Transaction</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Payments are encrypted and secured by Razorpay.</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-70 grayscale">
                <img alt="Visa" className="h-5 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDl7yE8cGnHTsxq2_NRMNctGOmXqSWq3GP5JM26P17Sy-k54MbPWVydIVZ3u5xxSotHf2T8s5Q8rWuEv6SGcT3rQBaRv2C8Uw1PxtzjxtcyhMOpSa4fvHEED0cpaxjQv23kz2RXN_8as8vEANOFCflMYGaLfNgIGv4eKSJ6e1V5smmD9BsxB0-tH41qBKs6Wn-5l-qqBDH1fTuHcjCjeQBilo2zx1NRKcPA7gZhHomQ5fXUBZnB8gb0oKnvOFlIfpGXcm1OJDsW9GI" />
                <img alt="Mastercard" className="h-5 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9JF5VDv6FWJltj1M48e_8xJ22QNttDSYjowRY2zFupU-qrg-Ad42oXUN3DPthL0OG5RHi_aG9FaqXo_-Jfh5zVYVzss0cJIfr6BPuKLIzDqaRZ-4equF4Zq_s5jcKblWl7EJYdQyV6tpR6IKJjOUOgWCSTe7wQKfUC_KhMpKE-THaTIuVu6GpqbEckT2E_dlHIdPqiuFylHz9o0kfrmj7OcKzjpNGWhWvH7ncg7dXmQ5kqUe97OMQ7pYnFhfB8FtJISQ5-Es3KZQ" />
              </div>
            </div>

            <PaymentMethods amount={amount} onPay={onPay} />
            <PaymentStatus status={status} />
          </div>
        </div>
      </main>
    </div>
  );
}
