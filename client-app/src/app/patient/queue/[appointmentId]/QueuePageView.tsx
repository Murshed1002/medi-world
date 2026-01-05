"use client";

import { useRouter } from "next/navigation";
import QueueAlert from "./components/QueueAlert";
import QueueTokenCard from "./components/QueueTokenCard";
import QueueBreakNotice from "./components/QueueBreakNotice";
import QueueOverview from "./components/QueueOverview";
import QueueActions from "./components/QueueActions";

// Mock queue data
const mock = {
  clinicOpen: true,
  doctor: { name: "Dr. Sarah Smith", room: "Room 302" },
  token: "A-24",
  position: 3,
  approxWaitMins: 15,
  nowServing: "A-21",
  aheadCount: 2,
  breakNotice: { onBreak: true, resumeTimeText: "10:45 AM" },
  timeline: [
    { id: "A-20", status: "completed" as const },
    { id: "A-21", status: "serving" as const, location: "Inside Room 302" },
    { id: "A-22", status: "next" as const, etaText: "Est. 5 min" },
    { id: "A-23", status: "waiting" as const, etaText: "Est. 10 min" },
    { id: "A-24", status: "you" as const, etaText: "Approx 15m" },
  ],
};

export default function QueuePageView() {
  const router = useRouter();
  const nav = (path: string) => router.push(path);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col">
      <main className="grow w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Live Queue Status</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time updates for your appointment today.</p>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-green-500 text-sm">●</span>
              <span className="text-sm font-semibold">{mock.clinicOpen ? "Clinic is Open" : "Clinic Closed"}</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{mock.doctor.name} • {mock.doctor.room}</span>
            </div>
          </div>

          <QueueAlert position={mock.position} room={mock.doctor.room} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-7 flex flex-col gap-6">
              <QueueTokenCard token={mock.token} approxWaitMins={mock.approxWaitMins} nowServing={mock.nowServing} aheadCount={mock.aheadCount} />
              {mock.breakNotice.onBreak && <QueueBreakNotice resumeTimeText={mock.breakNotice.resumeTimeText} />}
            </section>
            <section className="lg:col-span-5 flex flex-col h-full gap-6">
              <QueueOverview timeline={mock.timeline} />
              <QueueActions onCancel={() => nav("/patient/appointments")} onSupport={() => nav("/patient/support")} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
