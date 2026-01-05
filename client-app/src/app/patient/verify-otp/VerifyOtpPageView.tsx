"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import VerifyOtpForm from "@/app/patient/verify-otp/components/VerifyOtpForm";
import VerifyOtpFooter from "@/app/patient/verify-otp/components/VerifyOtpFooter";
import LockIcon from "@mui/icons-material/Lock";

export default function VerifyOtpPageView() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState<number>(30);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const isComplete = useMemo(() => otp.every((d) => /^\d$/.test(d)), [otp]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const handleChange = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < inputsRef.current.length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[idx]) {
        const next = [...otp];
        next[idx] = "";
        setOtp(next);
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
      }
      return;
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
      return;
    }
    if (e.key === "ArrowRight" && idx < inputsRef.current.length - 1) {
      inputsRef.current[idx + 1]?.focus();
      return;
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(6)
      .fill("")
      .map((_, i) => pasted[i] ?? "");
    setOtp(next);
    const lastIdx = Math.min(pasted.length - 1, inputsRef.current.length - 1);
    if (lastIdx >= 0) inputsRef.current[lastIdx]?.focus();
  };

  const onVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;
    const code = otp.join("");
    console.log("Verify OTP:", code);
    router.push("/patient/home");
  };

  const onResend = () => {
    if (countdown > 0) return;
    console.log("Resend OTP");
    setCountdown(30);
  };

  const onBack = () => router.push("/patient/login");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-slate-900 dark:bg-[#101922] dark:text-slate-100">
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden relative">
          <VerifyOtpForm
            otp={otp}
            inputsRef={inputsRef}
            countdown={countdown}
            isComplete={isComplete}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPasteFirst={handlePaste}
            onResend={onResend}
            onSubmit={onVerify}
          />

          <VerifyOtpFooter onBack={onBack} />
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
          <LockIcon className="text-sm" />
          <span>Secure 256-bit Encrypted Connection</span>
        </div>
      </main>
    </div>
  );
}
