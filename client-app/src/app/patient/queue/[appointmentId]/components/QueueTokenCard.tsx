"use client";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import GroupsIcon from "@mui/icons-material/Groups";
import HowToRegIcon from "@mui/icons-material/HowToReg";

export default function QueueTokenCard({
  token,
  approxWaitMins,
  nowServing,
  aheadCount,
}: {
  token: string;
  approxWaitMins: number;
  nowServing: string;
  aheadCount: number;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
      <div className="p-8 flex flex-col items-center justify-center text-center relative z-10">
        <span className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Your Token Number</span>
        <div className="text-8xl font-extrabold text-primary tracking-tight mb-2">{token}</div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-primary text-sm font-bold border border-green-100 dark:border-green-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          In Queue
        </div>
      </div>
      <div className="bg-slate-5 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 p-6">
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex justify-between text-sm font-medium mb-1">
            <span className="text-slate-600 dark:text-slate-300">Progress</span>
            <span className="text-primary">~{approxWaitMins} mins wait</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full w-[65%]" style={{ boxShadow: "0 0 10px rgba(22, 163, 74, 0.4)" }}></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <HowToRegIcon />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Now Serving</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{nowServing}</p>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
              <GroupsIcon />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ahead of You</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{aheadCount} Ppl</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
