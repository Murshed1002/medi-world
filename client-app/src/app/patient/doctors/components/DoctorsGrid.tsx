"use client";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import type { Doctor } from "../types";

export default function DoctorsGrid({
  doctors,
  onProfile,
}: {
  doctors: Doctor[];
  onProfile: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-12">
      {doctors.map((d) => (
        <div
          key={d.id}
          className="group relative flex flex-col bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-border-dark p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full max-w-md md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-2rem)]"
        >
          <div className="flex gap-6 mb-8">
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-gray-50 bg-gray-50 shadow-sm transition-transform group-hover:scale-105">
                <img
                  src={d.avatarUrl}
                  alt={d.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col justify-start pt-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-text-main dark:text-white leading-tight">{d.name}</h3>
                {d.online && (
                  <VerifiedIcon className="text-blue-500 text-sm" />
                )}
              </div>
              <p className="text-sm font-semibold text-green-600 mb-2 uppercase tracking-wide">{d.specialization}</p>
              <div className="flex items-center gap-1.5">
                <StarIcon className="text-yellow-400 text-lg" />
                <span className="text-sm font-bold text-text-main">{d.rating.toFixed(1)}</span>
                <span className="text-text-secondary text-xs font-medium ml-1">({d.reviews}+ Reviews)</span>
              </div>
            </div>
          </div>

          <div className="space-y-5 mb-8 flex-grow">
            <div className="flex items-center gap-4 group/info">
              <div className="size-10 rounded-xl bg-gray-50 dark:bg-border-dark flex items-center justify-center shrink-0 group-hover/info:bg-green-50 transition-colors">
                <LocationCityIcon className="text-gray-500 group-hover/info:text-green-600 transition-colors text-xl" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-0.5">Clinic</p>
                <p className="text-sm font-semibold text-text-main dark:text-gray-200 line-clamp-1">{d.clinic}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group/info">
              <div className="size-10 rounded-xl bg-gray-50 dark:bg-border-dark flex items-center justify-center shrink-0 group-hover/info:bg-green-50 transition-colors">
                <AccountBalanceWalletIcon className="text-gray-500 group-hover/info:text-green-600 transition-colors text-xl" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-0.5">Fee</p>
                <p className="text-2xl font-black text-text-main dark:text-white">₹{d.fee}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => onProfile(d.id)}
              className="w-full py-4 px-6 rounded-xl bg-green-600 text-white font-bold text-sm shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-200"
            >
              View Profile
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
