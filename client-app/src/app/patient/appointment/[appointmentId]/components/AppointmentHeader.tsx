"use client";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function AppointmentHeader({ avatarUrl, nav }: { avatarUrl: string; nav: (path: string) => void }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e7f3eb] dark:border-[#2a4533] bg-surface-light dark:bg-surface-dark px-4 py-3 lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LocalHospitalIcon className="text-[28px]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">MediQueue</h1>
        </div>
        <div className="hidden flex-1 items-center justify-end gap-8 md:flex">
          <nav className="flex items-center gap-6">
            <button className="text-sm font-medium hover:text-primary transition-colors" onClick={() => nav("/patient/appointments")}>My Appointments</button>
            <button className="text-sm font-medium hover:text-primary transition-colors" onClick={() => nav("/patient/doctors")}>Find Doctors</button>
          </nav>
          <div className="flex items-center gap-4">
            <button className="flex size-10 items-center justify-center rounded-full bg-background-light dark:bg-background-dark hover:bg-primary/20 transition-colors">
              <NotificationsIcon />
            </button>
            <div className="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm" style={{ backgroundImage: `url(${avatarUrl})` }} />
          </div>
        </div>
        <button className="md:hidden">☰</button>
      </div>
    </header>
  );
}
