"use client";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function HomeQuickActions({ nav }: { nav: (path: string) => void }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-[#0d141b] dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <button
          className="text-left group relative flex flex-row md:flex-col items-center md:items-start gap-5 rounded-2xl border-2 border-transparent bg-white dark:bg-[#1a2632] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 transform hover:-translate-y-1"
          onClick={() => nav("/patient/doctors")}
        >
          <div className="size-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <PersonSearchIcon className="text-4xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-[#0d141b] dark:text-white text-lg font-extrabold leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Find a Doctor</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Search specialists by name</p>
          </div>
        </button>
        <button
          className="text-left group relative flex flex-row md:flex-col items-center md:items-start gap-5 rounded-2xl border-2 border-green-600/10 bg-white dark:bg-[#1a2632] p-6 shadow-[0_4px_16px_rgba(22,163,74,0.1)] hover:shadow-xl hover:border-green-600 hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-all duration-300 transform hover:-translate-y-1"
          onClick={() => nav("/patient/book")}
        >
          <div className="size-16 rounded-2xl bg-green-600/10 dark:bg-green-900/40 text-green-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
            <CalendarMonthIcon className="text-4xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-[#0d141b] dark:text-white text-lg font-extrabold leading-tight mb-1 group-hover:text-green-600 transition-colors">Book Appointment</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Schedule a new visit</p>
          </div>
          <div className="absolute top-4 right-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
            <ArrowForwardIcon />
          </div>
        </button>
        <button
          className="text-left group relative flex flex-row md:flex-col items-center md:items-start gap-5 rounded-2xl border-2 border-transparent bg-white dark:bg-[#1a2632] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300 transform hover:-translate-y-1"
          onClick={() => nav("/patient/telemedicine")}
        >
          <div className="size-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <VideoCameraFrontIcon className="text-4xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-[#0d141b] dark:text-white text-lg font-extrabold leading-tight mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Telemedicine</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Start a virtual check-in</p>
          </div>
        </button>
      </div>
    </section>
  );
}
