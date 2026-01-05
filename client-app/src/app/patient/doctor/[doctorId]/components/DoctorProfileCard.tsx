"use client";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function DoctorProfileCard({
  doctor,
}: {
  doctor: {
    name: string;
    specialty: string;
    qualification: string;
    avatarUrl: string;
    locationText: string;
    available: boolean;
    rating: number;
    reviewCount: number;
    recommendationRate: number;
  };
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="relative">
          <div
            className="w-32 h-32 rounded-xl bg-cover bg-center shadow-inner"
            style={{ backgroundImage: `url('${doctor.avatarUrl}')` }}
            aria-label={`Professional headshot of ${doctor.name}`}
          ></div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap border border-green-200 dark:border-green-800 flex items-center gap-1 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {doctor.available ? "Available" : "Unavailable"}
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">{doctor.name}</h1>
            <div className="flex items-center gap-1 text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
              <VerifiedIcon className="text-[18px]" />
              <span className="text-xs font-bold uppercase tracking-wide">Verified Profile</span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-1">
            {doctor.specialty} • {doctor.qualification}
          </p>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-4">
            <LocationOnIcon className="text-[18px]" />
            <span>{doctor.locationText}</span>
          </div>
          <div className="flex items-center gap-6 mt-auto">
            <div className="flex items-center gap-1.5">
              <div className="bg-yellow-400 text-white p-1 rounded-md flex items-center justify-center">
                <StarIcon className="text-[16px]" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{doctor.rating.toFixed(1)}</span>
              <span className="text-sm text-slate-500 underline decoration-slate-300 decoration-dotted underline-offset-4 cursor-pointer hover:text-primary">({doctor.reviewCount} Reviews)</span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="text-green-500 text-[20px]" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{doctor.recommendationRate}% Recommendation Rate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
