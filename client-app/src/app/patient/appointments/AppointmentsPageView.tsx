"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppointmentsFilters from "@/app/patient/appointments/components/AppointmentsFilters";
import AppointmentsTable, { AppointmentRow } from "@/app/patient/appointments/components/AppointmentsTable";

// Mock data at top
const mockUser = {
  name: "Alex Johnson",
  idText: "#839201",
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBTfbngJQSz8TILudFFMHuqd1hpVsdJOoDovOYvS4dx7AzDxgmuZxEvZhPfjQAJfoDiW3Exyg9jvQUoGb16_pbK-wsQlgVU2b07zBpS45-SuW3DcdXYrhd-VPkdLW-7IGc89mgWeasJOgGM-4sxcL6gKX34tJZzf7rEQUsMfhG_YbiEB1Qk5Ig9N2SjpwHN00DDI2XDN0qrVJU0kONIdXEw76_nNGix_QfthAzWUMpRpEe2m6dAjD4Xl04SLZ9pWBi3fBC291us9rw",
};

const mockAppointments: AppointmentRow[] = [
  {
    id: "883921",
    doctorName: "Dr. Sarah Jenkins",
    specialty: "Cardiology",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDg1YiFg6RNKIYKPJuk37Q-dXAdit5e9M7e7ZFHzyAznFysRkSAbkJvPzs6TNxi1YZpVMPShQI6f_UftEiqRqXQhHQdGlHzLuHs7l8VcJQI17hEFPMI0ouD5JoTj2cvvG46sr5KSNJQawUM_3i-n5Pbs4Yh8jQ7qrPH5L1AkTpwHVPFJvgdDf0ri4KY7vcm-ixddXXJ-dNEtL-trRByZZd47zXuHsThN1-AdS4UAXgBBfAwdR9jb5rDGBC-t9ae8T9o5AK7Wwpx0xs",
    dateText: "Oct 24, 2023",
    timeText: "10:00 AM - 10:30 AM",
    status: "confirmed",
  },
  {
    id: "772114",
    doctorName: "Dr. Mark Lee",
    specialty: "General Practice",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAYYfgWIKv1DF0B8GwWjcKBet7UofQS4IG-tweFB5YoL0NguP0Hy9b6DIy4x4ID2_fxBctq33MNwQC_rF_y32m4A3pkJrKY23-ZAJmnV69_BjkdBb8NkeoouZHrdX-CNMsJMtQN2_pgqa3jzpic9S3k8YGO-QdH3QTDVw4o7K67g_wioCsICDG0V-e1aUAjNNkVjnCITuUFnQQYcMHnQIwSYJsGsqfQZFALijudJhHPUYvh-Gbc0FvJIBzs3WhcKi5wyVM8LkUDCSI",
    dateText: "Nov 02, 2023",
    timeText: "02:30 PM - 03:00 PM",
    status: "pending",
  },
  {
    id: "664510",
    doctorName: "Dr. Emily Chen",
    specialty: "Dermatology",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDZerXlJMmpgMlrtASHuGEaX4NUJPg7VlA5EfaOdQeos84QbGQckvalz1v8lAQmQ7qrh2Rr9LFNt95um0svLaR_BARYIkvabk46e_qUdOd1-_4CmttEHYBVAl_5oBwQ6rEqxR6l6hn3-CUeK5WN-ptYldRdU1xr3Yl3vHuNMER_jkg7CRKUwhl_m7rImjVWtdozbYdKlVz7x2t25FkkuYQugMoSsDP-IgtAcwfoKmTxR1Tz107NTfIBUkctyVTBt2ziQwp4ok3dfhg",
    dateText: "Nov 15, 2023",
    timeText: "09:15 AM - 09:45 AM",
    status: "confirmed",
  },
  {
    id: "559307",
    doctorName: "Dr. James Wilson",
    specialty: "Orthopedics",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQmoGAbm21XCVq84b-2qVB6BXiuiQ5-gfH-De-fkxDg5xCr28c9gX23vFWySV2DsvKvi_ldpQGRSVSlZN4VN184Gew5rEHiNAMxbOQOJRavEkhIQPgEAqX38M0sYmmWyJDXSUm35cJL-WdMu2S3WPviP1wKwkiBvo5et8zHCJYrsTkR-j9TwInDD3EnOHpyS1XYzYwkN340h59MIRvYruA4HM9BPyVTnPklo8THQVpvsI_vmhcFJqvIEmCJigOrIOMQ697ZGXMth0",
    dateText: "Nov 20, 2023",
    timeText: "11:00 AM - 11:45 AM",
    status: "waitlist",
    waitlistNumber: 3,
  },
];

export default function AppointmentsPageView() {
  const router = useRouter();
  const nav = (path: string) => router.push(path);

  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return mockAppointments.filter((a) => {
      const matchesQuery = query
        ? [a.doctorName, a.specialty, a.dateText].some((f) => f.toLowerCase().includes(query.toLowerCase()))
        : true;
      const matchesTab = activeTab === "upcoming" ? true : activeTab === "past" ? false : a.status === "cancelled";
      return matchesQuery && matchesTab;
    });
  }, [activeTab, query]);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col">

      <main className="grow w-full">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-extrabold tracking-tight">My Appointments</h1>
              <p className="text-slate-500 dark:text-slate-400 text-base">Manage your scheduled visits and view past history.</p>
            </div>
            <AppointmentsFilters
              activeTab={activeTab}
              onTabChange={setActiveTab}
              query={query}
              onQueryChange={setQuery}
              onBookNew={() => nav("/patient/doctors")}
            />
          </div>

          <div className="rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-[#1a2632]">
            <AppointmentsTable rows={filtered} onRowClick={(id: string) => nav(`/patient/appointment/${id}`)} />

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-bold text-slate-700 dark:text-slate-300">{filtered.length}</span> of
                <span className="font-bold text-slate-700 dark:text-slate-300"> {mockAppointments.length}</span> appointments
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 hover:text-primary dark:hover:text-primary transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
