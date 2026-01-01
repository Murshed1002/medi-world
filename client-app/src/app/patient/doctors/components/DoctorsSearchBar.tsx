"use client";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function DoctorsSearchBar({
  query,
  setQuery,
  location,
  setLocation,
}: {
  query: string;
  setQuery: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
}) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-6">
      <div className="flex flex-col md:flex-row w-full items-stretch rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm overflow-hidden group focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        <div className="flex-1 flex items-center h-14 border-b md:border-b-0 md:border-r border-border-light dark:border-border-dark">
          <div className="text-text-secondary dark:text-gray-400 flex items-center justify-center pl-4 pr-2">
            <SearchIcon />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 h-full px-2 text-text-main dark:text-white placeholder-text-secondary dark:placeholder-gray-500 text-base"
            placeholder="Search doctor, specialty, or condition"
          />
        </div>
        <div className="md:w-48 flex items-center h-14 bg-background-light dark:bg-background-dark">
          <div className="text-text-secondary dark:text-gray-400 flex items-center justify-center pl-4 pr-2">
            <LocationOnIcon fontSize="small" />
          </div>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 h-full px-2 text-text-main dark:text-white placeholder-text-secondary dark:placeholder-gray-500 text-sm"
            placeholder="Zip code or City"
          />
        </div>
        <button className="bg-linear-to-br from-primary to-emerald-600 hover:from-emerald-600 hover:to-primary text-white font-bold px-8 h-14 transition-all shadow-md">
          Search
        </button>
      </div>
    </div>
  );
}
