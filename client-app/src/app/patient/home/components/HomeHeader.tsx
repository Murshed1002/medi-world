"use client";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function HomeHeader({ nav, avatarUrl }: { nav: (path: string) => void; avatarUrl: string }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#1a2632] border-b border-[#e7edf3] dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-green-600/10 flex items-center justify-center text-green-600">
            <LocalHospitalIcon className="text-2xl" />
          </div>
          <h2 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            MediQueue
          </h2>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-6">
            <button className="text-[#0d141b] dark:text-slate-200 text-sm font-bold hover:text-green-600 transition-colors" onClick={() => nav("/patient/home")}>Home</button>
            <button className="text-[#0d141b] dark:text-slate-200 text-sm font-medium hover:text-green-600 transition-colors" onClick={() => nav("/patient/appointments")}>Appointments</button>
            <button className="text-[#0d141b] dark:text-slate-200 text-sm font-medium hover:text-green-600 transition-colors" onClick={() => nav("/patient/doctors")}>Doctors</button>
            <button className="text-[#0d141b] dark:text-slate-200 text-sm font-medium hover:text-green-600 transition-colors" onClick={() => nav("/patient/history")}>History</button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative flex items-center justify-center rounded-lg size-10 bg-[#e7edf3] dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-[#0d141b] dark:text-white">
            <NotificationsIcon className="text-[20px]" />
            <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border border-white dark:border-slate-700" />
          </button>
          <div
            className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-white dark:ring-slate-800 shadow-sm"
            style={{ backgroundImage: `url(${avatarUrl})` }}
            aria-label="Patient avatar"
          />
        </div>
      </div>
    </header>
  );
}
