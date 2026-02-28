"use client";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import TimerIcon from "@mui/icons-material/Timer";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function VerifyOtpForm({
  otp,
  inputsRef,
  countdown,
  isComplete,
  isLoading,
  onChange,
  onKeyDown,
  onPasteFirst,
  onResend,
  onSubmit,
}: {
  otp: string[];
  inputsRef: React.MutableRefObject<(HTMLInputElement | null)[]>;
  countdown: number;
  isComplete: boolean;
  isLoading?: boolean;
  onChange: (idx: number, value: string) => void;
  onKeyDown: (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPasteFirst: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onResend: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <>
      <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-emerald-600/60 via-emerald-600 to-emerald-600/60" />

      <div className="px-8 py-10 sm:px-12 sm:py-12 flex flex-col items-center text-center">
        <div className="mb-6 rounded-full bg-emerald-50 dark:bg-emerald-900/30 p-4 ring-1 ring-emerald-100 dark:ring-emerald-800">
          <LockPersonIcon className="text-4xl text-emerald-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">Verification Required</h1>
        <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-xs mx-auto mb-8">
          We've sent a 6-digit code to <span className="font-semibold text-slate-700 dark:text-slate-200">your number</span>. Please enter it below.
        </p>

        <form className="w-full flex flex-col gap-8" onSubmit={onSubmit}>
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((val, i) => (
              <input
                key={i}
                aria-label={`Digit ${i + 1}`}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                autoFocus={i === 0}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-600"
                inputMode="numeric"
                maxLength={1}
                placeholder="-"
                type="text"
                value={val}
                onChange={(e) => onChange(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                onPaste={i === 0 ? onPasteFirst : undefined}
                disabled={isLoading}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-full">
              <TimerIcon className="text-lg" />
              <span>
                Resend code in <span className="text-emerald-600 font-bold font-mono">{String(Math.floor(countdown / 60)).padStart(2, "0")}:{String(countdown % 60).padStart(2, "0")}</span>
              </span>
            </div>
            <button
              className="text-sm font-semibold text-slate-400 dark:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60 hover:text-emerald-600 transition-colors"
              disabled={countdown > 0 || isLoading}
              type="button"
              onClick={onResend}
            >
              Resend OTP
            </button>
          </div>

          <button
            type="submit"
            disabled={!isComplete || isLoading}
            className="flex w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold tracking-wide shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 active:scale-[0.98]"
          >
            <span className="mr-2">{isLoading ? "Verifying..." : "Verify & Proceed"}</span>
            {!isLoading && <ArrowForwardIcon />}
          </button>
        </form>
      </div>
    </>
  );
}
