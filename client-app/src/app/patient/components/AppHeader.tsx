"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DescriptionIcon from "@mui/icons-material/Description";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export default function AppHeader() {
  const pathname = usePathname();
  const { logout, user: authUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get("/patients/profile");
        setProfileData(response.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    if (authUser) {
      fetchProfile();
    }
  }, [authUser]);

  // Hide header on auth routes
  if (pathname === "/patient/login" || pathname === "/patient/verify-otp") {
    return null;
  }

  const userName = profileData?.full_name || authUser?.phone || "Patient";
  const userPhone = authUser?.phone || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const links = [
    { label: "Home", href: "/patient/home" },
    { label: "Find Doctors", href: "/patient/doctors" },
    { label: "Appointments", href: "/patient/appointments" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#1a2632]/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shrink-0">
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
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative" aria-label="Notifications">
            <NotificationsIcon className="text-[20px]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#1a2632]"></span>
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" aria-hidden="true"></div>
          
          {/* Profile Dropdown */}
          <div className="relative group">
            <button 
              className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              aria-label="Profile menu"
            >
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary border border-slate-100 dark:border-slate-700 flex items-center justify-center font-bold"
                aria-label="User profile avatar"
              >
                {userInitial}
              </div>
              <div className="hidden sm:flex flex-col overflow-hidden text-left">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">{userName}</p>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate tracking-wider">{userPhone}</p>
              </div>
              <ExpandMoreIcon className="text-[20px] text-slate-400 group-hover:text-primary transition-colors" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1a2632] rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary border-2 border-primary/20 flex items-center justify-center font-bold text-xl"
                    >
                      {userInitial}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{userName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userPhone}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <Link
                    href="/patient/profile"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary transition-colors group/item"
                  >
                    <PersonIcon className="text-[20px] text-slate-400 group-hover/item:text-primary" />
                    <span className="text-sm font-semibold">View Profile</span>
                  </Link>
                  <Link
                    href="/patient/appointments"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary transition-colors group/item"
                  >
                    <CalendarMonthIcon className="text-[20px] text-slate-400 group-hover/item:text-primary" />
                    <span className="text-sm font-semibold">My Appointments</span>
                  </Link>
                  <Link
                    href="/patient/records"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary transition-colors group/item"
                  >
                    <DescriptionIcon className="text-[20px] text-slate-400 group-hover/item:text-primary" />
                    <span className="text-sm font-semibold">Medical Records</span>
                  </Link>
                </div>
                <div className="p-2 border-t border-slate-100 dark:border-slate-700/50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group/item"
                  >
                    <LogoutIcon className="text-[20px]" />
                    <span className="text-sm font-bold">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
