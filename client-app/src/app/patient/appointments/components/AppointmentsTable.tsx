"use client";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export type AppointmentRow = {
  id: string;
  doctorName: string;
  specialty: string;
  avatarUrl: string;
  dateText: string;
  timeText: string;
  status: "confirmed" | "pending" | "waitlist" | "cancelled";
  waitlistNumber?: number;
};

export default function AppointmentsTable({ rows, onRowClick }: { rows: AppointmentRow[]; onRowClick: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-16">Avatar</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Doctor</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date & Time</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {rows.map((r) => (
            <tr
              key={r.id}
              className="group hover:bg-green-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              onClick={() => onRowClick(r.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div
                  className="h-10 w-10 rounded-full bg-cover bg-center border border-slate-200 dark:border-slate-600"
                  style={{ backgroundImage: `url('${r.avatarUrl}')` }}
                  aria-label={`Portrait of ${r.doctorName}`}
                ></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{r.doctorName}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{r.specialty}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{r.dateText}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{r.timeText}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {r.status === "confirmed" && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                    Confirmed
                  </span>
                )}
                {r.status === "pending" && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                    Pending Approval
                  </span>
                )}
                {r.status === "waitlist" && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5"></span>
                    {`Waitlist #${r.waitlistNumber ?? "-"}`}
                  </span>
                )}
                {r.status === "cancelled" && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                    Cancelled
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <button className="text-slate-400 hover:text-primary dark:hover:text-green-400 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                  <ChevronRightIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
