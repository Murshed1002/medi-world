"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type User = { name: string; idText: string; avatarUrl: string };

export default function AppHeader({ user }: { user?: User }) {
  const pathname = usePathname();
  // Hide header on auth routes
  if (pathname === "/patient/login" || pathname === "/patient/verify-otp") {
    return null;
  }
  const u: User =
    user || {
      name: "Alex Johnson",
      idText: "#839201",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBTfbngJQSz8TILudFFMHuqd1hpVsdJOoDovOYvS4dx7AzDxgmuZxEvZhPfjQAJfoDiW3Exyg9jvQUoGb16_pbK-wsQlgVU2b07zBpS45-SuW3DcdXYrhd-VPkdLW-7IGc89mgWeasJOgGM-4sxcL6gKX34tJZzf7rEQUsMfhG_YbiEB1Qk5Ig9N2SjpwHN00DDI2XDN0qrVJU0kONIdXEw76_nNGix_QfthAzWUMpRpEe2m6dAjD4Xl04SLZ9pWBi3fBC291us9rw",
    };

  const links = [
    { label: "Home", href: "/patient/home" },
    { label: "Find Doctors", href: "/patient/doctors" },
    { label: "Appointments", href: "/patient/appointments" },
  ];

  return (
    <header className="bg-white dark:bg-[#1a2632] border-b border-slate-200 dark:border-slate-700 z-20 shrink-0">
      <div className="w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
            <LocalHospitalIcon className="text-[18px]" />
          </div>
          <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-normal">MediQueue</h1>
        </div>
        <nav className="hidden lg:flex items-center gap-1 mx-4" aria-label="Primary">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-label={l.label}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary dark:bg-primary/20"
                    : "flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                }
              >
                <span className="text-sm font-bold">{l.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4 shrink-0">
          <button className="flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative" aria-label="Notifications">
            <NotificationsIcon className="text-[20px]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#1a2632]"></span>
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true"></div>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 bg-cover bg-center"
              style={{ backgroundImage: `url('${u.avatarUrl}')` }}
              aria-label="User profile avatar"
            ></div>
            <div className="hidden sm:flex flex-col overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">ID: {u.idText}</p>
            </div>
            <button className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="Profile menu">
              <ExpandMoreIcon className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
