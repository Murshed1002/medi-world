"use client";
import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
import TimerIcon from "@mui/icons-material/Timer";
import UpdateIcon from "@mui/icons-material/Update";

export default function HomeQueueStatus({
  queue,
}: {
  queue: {
    position: number;
    estWaitMinutes: number;
    currentPatientNumber: number;
    doctor: { name: string; department: string; room: string };
    lastUpdatedMinsAgo: number;
  };
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-3 rounded-2xl p-6 bg-green-600 text-white shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <PersonPinCircleIcon className="text-[7rem] leading-none" />
        </div>
        <div className="relative z-10 flex flex-col gap-1">
          <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Your Position</p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black tracking-tight">#{queue.position}</span>
            <span className="text-white/70 text-lg font-medium">in line</span>
          </div>
        </div>
        <div className="relative z-10 mt-auto pt-4">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm border border-white/10">
            <span className="size-2 rounded-full bg-white animate-pulse" />
            Live Update
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-2 rounded-2xl p-6 bg-white dark:bg-[#1a2632] border border-[#cfdbe7] dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div>
          <div className="size-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 mb-4">
            <TimerIcon className="text-2xl" />
          </div>
          <p className="text-[#4c739a] dark:text-slate-400 text-sm font-bold uppercase tracking-wide">Est. Wait Time</p>
          <p className="text-[#0d141b] dark:text-white text-4xl font-black leading-tight mt-1">
            {queue.estWaitMinutes} <span className="text-lg font-bold text-gray-500 dark:text-gray-400">mins</span>
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <UpdateIcon className="text-sm text-[#4c739a] dark:text-slate-500" />
          <p className="text-xs font-medium text-[#4c739a] dark:text-slate-500">Updated {queue.lastUpdatedMinsAgo} mins ago</p>
        </div>
      </div>
    </div>
  );
}
