"use client";
import ScheduleIcon from "@mui/icons-material/Schedule";
import VideocamIcon from "@mui/icons-material/Videocam";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

export type Appointment = {
  id: string;
  month: string;
  day: number;
  doctorName: string;
  tag?: string;
  tagTone?: "green" | "gray";
  specialty: string;
  title: string;
  time: string;
  location: string;
  status: "scheduled" | "pending";
};

export default function HomeAppointments({ appointments }: { appointments: Appointment[] }) {
  return (
    <div className="flex flex-col gap-3">
      {appointments.map((a) => (
        <div
          key={a.id}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-[#1a2632] shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start gap-4">
            <div
              className={`hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-xl shrink-0 ${
                a.tag === "Today"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors"
                  : "bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-slate-100 dark:border-slate-700"
              }`}
            >
              <span className="text-xs font-bold uppercase">{a.month}</span>
              <span className="text-2xl font-bold">{a.day}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[#0d141b] dark:text-white text-lg font-bold">{a.doctorName}</h3>
                {a.tag && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                      a.tagTone === "green"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {a.tag}
                  </span>
                )}
              </div>
              <p className="text-[#4c739a] dark:text-slate-400 text-sm font-medium">
                {a.specialty} • {a.title}
              </p>
              <div className="flex items-center gap-4 mt-1 text-sm text-[#0d141b] dark:text-slate-300">
                <div className="flex items-center gap-1">
                  <ScheduleIcon className="text-[18px] text-gray-400" />
                  <span>{a.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  {a.location === "Online Meeting" ? (
                    <VideocamIcon className="text-[18px] text-gray-400" />
                  ) : (
                    <LocationOnIcon className="text-[18px] text-gray-400" />
                  )}
                  <span>{a.location}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:self-center self-end w-full md:w-auto mt-2 md:mt-0">
            {a.status === "scheduled" && (
              <>
                <button className="flex-1 md:flex-none h-10 px-5 rounded-lg border border-[#cfdbe7] dark:border-slate-600 text-sm font-bold text-[#0d141b] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Reschedule
                </button>
                <button className="flex-1 md:flex-none h-10 px-5 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-bold transition-colors shadow-sm">
                  Check Details
                </button>
              </>
            )}
            {a.status === "pending" && (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1.5 border border-yellow-200 dark:border-yellow-900/50">
                <HourglassEmptyIcon className="text-[16px]" />
                Pending Confirmation
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
