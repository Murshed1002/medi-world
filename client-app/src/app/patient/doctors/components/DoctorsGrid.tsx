"use client";
import StarIcon from "@mui/icons-material/Star";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import type { Doctor } from "../types";

export default function DoctorsGrid({
  doctors,
  onProfile,
}: {
  doctors: Doctor[];
  onProfile: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {doctors.map((d) => (
        <div
          key={d.id}
          className="group flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all"
        >
          <div className="flex gap-4 mb-4">
            <div className="relative w-14 h-14 shrink-0">
              <img
                src={d.avatarUrl}
                alt={d.name}
                className="w-full h-full object-cover rounded-full border border-border-light dark:border-border-dark"
              />
              {d.online && (
                <div
                  className="absolute bottom-0 right-0 size-3.5 bg-primary rounded-full border-2 border-surface-light dark:border-surface-dark"
                  title="Online"
                ></div>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-text-main dark:text-white leading-tight">{d.name}</h3>
              <p className="text-xs text-text-secondary dark:text-primary mb-1">{d.specialization}</p>
              <div className="flex items-center gap-1 text-xs font-medium text-text-main dark:text-gray-300">
                <StarIcon className="text-yellow-400 text-sm" fontSize="inherit" />
                <span>{d.rating.toFixed(1)}</span>
                <span className="text-text-secondary mx-1">•</span>
                <span>{d.reviews}+</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 mb-3 text-xs text-text-secondary dark:text-gray-400 min-h-8">
            <LocationOnIcon className="text-base mt-0.5" fontSize="inherit" />
            <p className="line-clamp-2">{d.clinic}</p>
          </div>

          <div className="mt-auto pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-text-secondary">Fee</p>
              <p className="text-base font-bold text-text-main dark:text-white">${d.fee}</p>
            </div>
            <div className="text-right">
              {d.availableToday ? (
                <p className="text-[10px] font-bold text-primary-dark bg-primary-light px-2 py-0.5 rounded-md inline-block">
                  Available Today
                </p>
              ) : d.nextSlot ? (
                <p className="text-[10px] text-text-secondary">
                  Next: <span className="text-text-main dark:text-white font-bold">{d.nextSlot}</span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => onProfile(d.id)}
              className="w-full py-2 px-2 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700 hover:shadow-md transition-all"
            >
              View Profile
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
