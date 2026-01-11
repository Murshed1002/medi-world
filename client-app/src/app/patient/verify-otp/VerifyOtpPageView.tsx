"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import VerifyOtpForm from "@/app/patient/verify-otp/components/VerifyOtpForm";
import VerifyOtpFooter from "@/app/patient/verify-otp/components/VerifyOtpFooter";
import LockIcon from "@mui/icons-material/Lock";

export default function VerifyOtpPageView() {
  const router = useRouter();
  const { verifyOtp, sendOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState<number>(30);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const isComplete = useMemo(() => otp.every((d) => /^\d$/.test(d)), [otp]);

  // Load phone from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storedPhone = params.get("phone");
    if (!storedPhone) {
      router.push("/patient/login");
      return;
    }
    setPhone(storedPhone);
  }, [router]);

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
    setError("");
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

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;
    
    setIsLoading(true);
    setError("");
    const code = otp.join("");

    try {
      // Verify OTP with backend
      await verifyOtp(phone, code);
      
      // No need to clear anything - phone was never stored
      
      // Redirect to home
      router.push("/patient/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
      // Clear OTP fields on error
      setOtp(Array(6).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      await sendOtp(phone);
      setCountdown(30);
      setOtp(Array(6).fill(""));
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onBack = () => {
    // Phone was never stored, nothing to clean up
    router.push("/patient/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-slate-900 dark:bg-[#101922] dark:text-slate-100">
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden relative">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-4">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
          
          <VerifyOtpForm
            otp={otp}
            inputsRef={inputsRef}
            countdown={countdown}
            isComplete={isComplete}
            isLoading={isLoading}
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
