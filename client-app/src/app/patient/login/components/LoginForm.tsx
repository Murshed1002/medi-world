"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockIcon from "@mui/icons-material/Lock";

export default function LoginForm() {
  const router = useRouter();
  const { sendOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const trimmed = phone.replace(/\D/g, "");
    if (trimmed.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);

    try {
      // Send OTP to backend
      await sendOtp(trimmed);
      
      // Navigate to verify OTP page with phone in state (memory only, not persisted)
      router.push(`/patient/verify-otp?phone=${encodeURIComponent(trimmed)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, "");
    
    // Only allow digits and limit to 10
    if (digits.length <= 10) {
      setPhone(digits);
      setError("");
    }
  };

  return (
    <div className="w-full max-w-125 flex flex-col bg-white dark:bg-[#1a2632] rounded-2xl shadow-xl overflow-hidden min-h-125">
      <div className="flex-1 flex flex-col justify-center p-8 md:p-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-green-600">
            <WavingHandIcon className="material-symbols-outlined text-[28px]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            Enter your mobile number to login.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-6 mb-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex flex-col flex-1">
              <span className="text-slate-900 dark:text-slate-200 text-sm font-semibold pb-2">
                Mobile Number
              </span>
              <div className="relative">
                <SmartphoneIcon className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg" />
                <input
                  className="form-input w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-green-600/20 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-green-600 h-12 placeholder:text-slate-400 pl-10 pr-3 text-base transition-all"
                  placeholder="9876543210"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={isLoading}
                  required
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || phone.length < 10}
            className="w-full cursor-pointer flex items-center justify-center rounded-lg h-12 px-5 bg-green-600 hover:bg-green-700 text-white text-base font-bold tracking-[0.015em] transition-colors shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="truncate">
              {isLoading ? "Sending OTP..." : "Get One-Time Password"}
            </span>
            {!isLoading && <ArrowForwardIcon className="material-symbols-outlined ml-2 text-xl" />}
          </button>
        </form>
        <div className="mt-6 flex flex-col items-center gap-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
            <a className="hover:text-green-600 underline transition-colors" href="#">
              Need help? Contact Support
            </a>
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-4">
            <LockIcon className="material-symbols-outlined text-sm" />
            <span>Your data is securely encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
