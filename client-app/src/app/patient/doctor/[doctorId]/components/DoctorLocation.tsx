"use client";
import MapIcon from "@mui/icons-material/Map";

export default function DoctorLocation({
  location,
}: {
  location: { hospital: string; address: string; mapImage: string; hours: { label: string; value: string }[] };
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Location</h3>
        <button className="text-primary text-sm font-medium hover:underline">Get Directions</button>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 h-40 rounded-lg bg-slate-200 dark:bg-slate-700 relative overflow-hidden group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url('${location.mapImage}')` }}
            aria-label={`Map for ${location.hospital}`}
          ></div>
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <MapIcon className="text-white text-4xl drop-shadow-md" />
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">{location.hospital}</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{location.address}</p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
            {location.hours.map((h) => (
              <div key={h.label} className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">{h.label}</span>
                <span className="text-slate-900 dark:text-white font-medium">{h.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
