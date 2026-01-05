"use client";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function AppointmentsHeader({
  nav,
  user,
}: {
  nav: (path: string) => void;
  user: { name: string; idText: string; avatarUrl: string };
}) {
  return (
    <header className="bg-white dark:bg-[#1a2632] border-b border-slate-200 dark:border-slate-700 z-20 shrink-0">
      <div className="w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
            <LocalHospitalIcon className="text-[18px]" />
          </div>
          <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-normal">MediQueue</h1>
        </div>
        <nav className="hidden lg:flex items-center gap-1 mx-4">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group" onClick={() => nav("/patient/home")}> 
            <span className="text-sm font-bold">Dashboard</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary dark:bg-primary/20" onClick={() => nav("/patient/appointments")}> 
            <span className="text-sm font-bold">Appointments</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"> 
            <span className="text-sm font-bold">Prescriptions</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group" onClick={() => nav("/patient/queue/883921")}> 
            <span className="text-sm font-bold">Queue Status</span>
            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">LIVE</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"> 
            <span className="text-sm font-bold">Profile</span>
          </button>
        </nav>
        <div className="flex items-center gap-4 shrink-0">
          <button className="flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
            <NotificationsIcon className="text-[20px]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#1a2632]"></span>
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 bg-cover bg-center"
              style={{ backgroundImage: `url('${user.avatarUrl}')` }}
              aria-label="User profile avatar"
            ></div>
            <div className="hidden sm:flex flex-col overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">ID: {user.idText}</p>
            </div>
            <button className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <ExpandMoreIcon className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
      <div className="lg:hidden flex justify-center pb-2 border-t border-slate-100 dark:border-slate-800 pt-2">
        <button className="text-sm text-slate-500 font-medium flex items-center gap-1">
          <span>Menu</span>
          <ExpandMoreIcon className="text-[16px]" />
        </button>
      </div>
    </header>
  );
}
