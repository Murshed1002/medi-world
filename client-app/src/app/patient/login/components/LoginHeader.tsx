"use client";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

export default function LoginHeader() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 px-6 py-4 md:px-10 bg-white dark:bg-[#1a2632]">
      <div className="flex items-center gap-3 text-slate-900 dark:text-white">
        <div className="size-8 flex items-center justify-center text-green-600">
          <LocalHospitalIcon className="material-symbols-outlined text-3xl" />
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-tight">HealthSimple</h2>
      </div>
    </header>
  );
}
