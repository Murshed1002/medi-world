"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

type NavItem = { label: string; href: string; icon: React.ReactNode; isActive: (path: string) => boolean };

export default function QuickNav() {
  const pathname = usePathname();

  const items: NavItem[] = [
    {
      label: "Home",
      href: "/patient/home",
      icon: <HomeIcon />,
      isActive: (p) => p.startsWith("/patient/home"),
    },
    {
      label: "Find Doctors",
      href: "/patient/doctors",
      icon: <LocalHospitalIcon />,
      isActive: (p) => p.startsWith("/patient/doctors") || p.startsWith("/patient/doctor/"),
    },
    {
      label: "Appointments",
      href: "/patient/appointments",
      icon: <CalendarMonthIcon />,
      isActive: (p) => p.startsWith("/patient/appointments"),
    },
  ];

  // Hide on login and OTP verification screens
  if (pathname === "/patient/login" || pathname === "/patient/verify-otp") {
    return null;
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Quick navigation"
    >
      <ul className="flex justify-around items-center py-2">
        {items.map((item) => {
          const active = item.isActive(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={item.label}
                className="flex flex-col items-center gap-1 px-3 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded-md"
              >
                <span
                  className={
                    active ? "text-green-600" : "text-slate-500 dark:text-slate-400"
                  }
                >
                  {item.icon}
                </span>
                <span
                  className={
                    active
                      ? "text-[11px] font-bold text-green-700"
                      : "text-[11px] font-medium text-slate-600 dark:text-slate-300"
                  }
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
