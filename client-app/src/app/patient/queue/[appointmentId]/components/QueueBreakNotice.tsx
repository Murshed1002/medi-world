"use client";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";

export default function QueueBreakNotice({ resumeTimeText }: { resumeTimeText: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex items-start gap-4">
      <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-full text-amber-600 dark:text-amber-500 shrink-0">
        <LocalCafeIcon />
      </div>
      <div className="flex-1">
        <h4 className="text-base font-bold text-slate-900 dark:text-white">Doctor is on a short break</h4>
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
          The doctor has paused consultations. Queue will resume at approximately <span className="font-bold">{resumeTimeText}</span>.
        </p>
      </div>
    </div>
  );
}
