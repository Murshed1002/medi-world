"use client";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";

type TimelineItem =
  | { id: string; status: "completed" }
  | { id: string; status: "serving"; location: string }
  | { id: string; status: "next"; etaText: string }
  | { id: string; status: "waiting"; etaText: string }
  | { id: string; status: "you"; etaText: string };

export default function QueueOverview({ timeline }: { timeline: TimelineItem[] }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Queue Overview</h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Live Updates</span>
      </div>
      <div className="p-4 flex-1 overflow-y-auto max-h-125">
        <div className="relative">
          <div className="absolute left-6.75 top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>
          {timeline.map((t) => (
            <div key={t.id} className={`flex items-center gap-4 py-3 ${t.status === "completed" ? "opacity-60" : ""}`}>
              <div
                className={
                  t.status === "serving"
                    ? "size-14 rounded-full bg-green-100 dark:bg-green-900/20 border-2 border-green-500 flex items-center justify-center text-green-700 dark:text-green-400 font-bold shadow-[0_0_0_4px_rgba(34,197,94,0.1)] z-10"
                    : t.status === "you"
                    ? "size-14 rounded-full bg-primary text-white border-2 border-primary flex items-center justify-center font-bold shadow-lg shadow-green-500/20 z-10 scale-110"
                    : "size-14 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold z-10"
                }
              >
                {t.id}
              </div>
              <div
                className={
                  t.status === "serving"
                    ? "flex-1 p-4 rounded-xl shadow-sm border border-green-100 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
                    : t.status === "you"
                    ? "flex-1 p-4 rounded-xl shadow-md border-l-4 border-l-primary border-y border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    : "flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                }
              >
                <div className="flex justify-between items-center">
                  {t.status === "completed" && (
                    <>
                      <span className="font-bold text-slate-500">Completed</span>
                      <CheckCircleIcon className="text-green-500 text-sm" />
                    </>
                  )}
                  {t.status === "serving" && (
                    <>
                      <span className="font-bold text-green-800 dark:text-green-300">Serving Now</span>
                      <div className="flex gap-1">
                        <span className="animate-bounce w-1 h-1 bg-green-500 rounded-full"></span>
                        <span className="animate-bounce delay-75 w-1 h-1 bg-green-500 rounded-full"></span>
                        <span className="animate-bounce delay-150 w-1 h-1 bg-green-500 rounded-full"></span>
                      </div>
                    </>
                  )}
                  {t.status === "next" && (
                    <>
                      <span className="font-bold text-slate-700 dark:text-slate-200">Next</span>
                      <span className="text-xs text-slate-400">{t.etaText}</span>
                    </>
                  )}
                  {t.status === "waiting" && (
                    <>
                      <span className="font-bold text-slate-700 dark:text-slate-200">Waiting</span>
                      <span className="text-xs text-slate-400">{t.etaText}</span>
                    </>
                  )}
                  {t.status === "you" && (
                    <>
                      <span className="font-bold text-slate-900 dark:text-white">You</span>
                      <span className="text-xs font-semibold text-primary">{t.etaText}</span>
                    </>
                  )}
                </div>
                {t.status === "serving" && <p className="text-xs text-green-700 dark:text-green-400">{t.location}</p>}
                {t.status === "you" && <p className="text-xs text-slate-500 dark:text-slate-400">Please stay nearby</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
        <button className="w-full py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
          <RefreshIcon className="text-sm" />
          Refresh Status
        </button>
      </div>
    </div>
  );
}
