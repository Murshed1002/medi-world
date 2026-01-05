"use client";
import Link from "next/link";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import GavelIcon from "@mui/icons-material/Gavel";
import ShareIcon from "@mui/icons-material/Share";

export default function AppointmentBottomLinks() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Link
        href="#"
        className="flex items-center gap-2 rounded-lg border border-[#e7f3eb] dark:border-[#2a4533] bg-[#fbfdfc] dark:bg-background-dark px-4 py-3 text-sm font-semibold hover:bg-white dark:hover:bg-background-dark/80"
      >
        <HelpOutlineIcon className="text-[18px] text-text-secondary" />
        Need Help?
      </Link>
      <Link
        href="#"
        className="flex items-center gap-2 rounded-lg border border-[#e7f3eb] dark:border-[#2a4533] bg-[#fbfdfc] dark:bg-background-dark px-4 py-3 text-sm font-semibold hover:bg-white dark:hover:bg-background-dark/80"
      >
        <GavelIcon className="text-[18px] text-text-secondary" />
        Clinic Policy
      </Link>
      <Link
        href="#"
        className="flex items-center gap-2 rounded-lg border border-[#e7f3eb] dark:border-[#2a4533] bg-[#fbfdfc] dark:bg-background-dark px-4 py-3 text-sm font-semibold hover:bg-white dark:hover:bg-background-dark/80"
      >
        <ShareIcon className="text-[18px] text-text-secondary" />
        Share Appointment
      </Link>
    </div>
  );
}
