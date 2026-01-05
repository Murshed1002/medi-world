"use client";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CloseIcon from "@mui/icons-material/Close";

export default function QueueAlert({ position, room }: { position: number; room: string }) {
  return (
    <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-4 flex items-start gap-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
      <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
        <NotificationsActiveIcon />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">You're up soon!</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
          You are currently <span className="font-bold">{position}rd in line</span>. Please make your way to the waiting area near {room}.
        </p>
      </div>
      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
        <CloseIcon />
      </button>
    </div>
  );
}
