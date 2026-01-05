"use client";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function QueueHeader({ nav }: { nav: (path: string) => void }) {
  return (
    <header className="w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <MedicalServicesIcon />
            </div>
            <h2 className="text-xl font-bold tracking-tight">MedQueue</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors" onClick={() => nav("/patient/home")}>Dashboard</button>
            <span className="text-sm font-medium text-primary">Live Status</span>
            <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">History</button>
          </nav>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-500">
              <NotificationsIcon />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div
              className="h-8 w-8 rounded-full bg-gray-200 bg-cover bg-center border border-slate-200"
              aria-label="User profile avatar"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC9wChCaNSLAJLOHiBuZo7iXObLBPUYl-mm3pkHYx--yz4uvb1mJAKEQ3x1bkRMCzBdG9GasvLHA7x7Dalz6VvKoJUJH78tS9qxc0Bs4viRehieUZWIphgEx0Nfp3ksDLVkh8AhW269cDAUXghYIbWGhx56fNY9ID1DRd3dH8qhn1hGg22zKM5BujQxPtluR4bXnFFWJwo2oNUShj-p1G1JJB4SGNPW20ysilOEdlfZacCI2m-7ZsnGPGOjh4xxBuJAQs2HhL4ZcyE')" }}
            ></div>
          </div>
        </div>
      </div>
    </header>
  );
}
