"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockIcon from "@mui/icons-material/Lock";

export default function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    const trimmed = phone.replace(/\D/g, "");
    if (trimmed !== phone || trimmed.length < 10) {
      setError(true);
      return;
    }
    router.push("/patient/verify-otp");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    const digits = e.target.value.replace(/\D/g, "");
    if (digits !== e.target.value) {
      setError(true);
      return;
    }
    setError(false);
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
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm ml-auto mr-auto">Please enter a valid mobile number.</p>
              )}
            </label>
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer flex items-center justify-center rounded-lg h-12 px-5 bg-green-600 hover:bg-green-700 text-white text-base font-bold tracking-[0.015em] transition-colors shadow-lg shadow-green-500/30"
          >
            <span className="truncate">Get One-Time Password</span>
            <ArrowForwardIcon className="material-symbols-outlined ml-2 text-xl" />
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
