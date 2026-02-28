"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppointmentsFilters from "@/app/patient/appointments/components/AppointmentsFilters";
import AppointmentsTable from "@/app/patient/appointments/components/AppointmentsTable";
import { apiClient } from "@/lib/api-client";

export default function AppointmentsPageView() {
  const router = useRouter();
  const nav = (path: string) => router.push(path);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [query, setQuery] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const data = (await apiClient.get("appointments/getAllByUser")).data;
      setAppointments(data);
    };
    fetchAppointments();
  }, []);

  const filtered = useMemo(() => {
    return appointments.filter((a: any) => {
      const matchesQuery = query
        ? [a.doctor.name, a.doctor.specialization, a.appointmentDate].some((f) => f?.toLowerCase()?.includes(query?.toLowerCase()))
        : true;
      const matchesTab =
        activeTab === "upcoming"
          ? a.status.toLowerCase() === "confirmed" || a.status.toLowerCase() === "pending" || a.status.toLowerCase() === "waitlist"
          : activeTab === "past"
          ? a.status.toLowerCase() === "completed" || a.status.toLowerCase() === "cancelled"
          : a.status.toLowerCase() === "cancelled";
      return matchesQuery && matchesTab;
    });
  }, [activeTab, query, appointments]);

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
                <span className="font-bold text-slate-700 dark:text-slate-300"> {appointments.length}</span> appointments
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
