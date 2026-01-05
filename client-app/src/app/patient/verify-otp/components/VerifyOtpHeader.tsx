"use client";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

export default function VerifyOtpHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-emerald-600/10 text-emerald-600">
            <LocalHospitalIcon className="text-2xl" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">HealthQueue</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 transition-colors hidden sm:block" type="button">
            Need Help?
          </button>
        </div>
      </div>
    </header>
  );
}
