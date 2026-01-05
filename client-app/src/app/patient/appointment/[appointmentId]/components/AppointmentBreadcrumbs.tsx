"use client";

export default function AppointmentBreadcrumbs({ nav }: { nav: (path: string) => void }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm">
      <button className="font-medium text-text-secondary hover:text-primary transition-colors" onClick={() => nav("/patient/home")}>
        Home
      </button>
      <span className="text-text-secondary/50">/</span>
      <button className="font-medium text-text-secondary hover:text-primary transition-colors" onClick={() => nav("/patient/appointments")}>
        My Appointments
      </button>
      <span className="text-text-secondary/50">/</span>
      <span className="font-medium">Appointment Details</span>
    </nav>
  );
}
