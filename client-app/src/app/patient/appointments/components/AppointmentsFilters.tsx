"use client";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

export default function AppointmentsFilters({
  activeTab,
  onTabChange,
  query,
  onQueryChange,
  onBookNew,
}: {
  activeTab: "upcoming" | "past" | "cancelled";
  onTabChange: (tab: "upcoming" | "past" | "cancelled") => void;
  query: string;
  onQueryChange: (q: string) => void;
  onBookNew: () => void;
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mt-2 bg-white dark:bg-[#1a2632] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50">
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
        <button
          className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
            activeTab === "upcoming" ? "bg-white dark:bg-[#2c3b4a] shadow-sm text-primary dark:text-green-400" : "hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium"
          }`}
          onClick={() => onTabChange("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm transition-all ${
            activeTab === "past" ? "bg-white dark:bg-[#2c3b4a] shadow-sm text-primary dark:text-green-400 font-bold" : "hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium"
          }`}
          onClick={() => onTabChange("past")}
        >
          Past
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm transition-all ${
            activeTab === "cancelled" ? "bg-white dark:bg-[#2c3b4a] shadow-sm text-primary dark:text-green-400 font-bold" : "hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium"
          }`}
          onClick={() => onTabChange("cancelled")}
        >
          Cancelled
        </button>
      </div>
      <div className="flex w-full lg:max-w-md items-center relative">
        <SearchIcon className="absolute left-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search doctor, specialty, or date..."
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block pl-10 p-2.5 placeholder:text-slate-400 transition-colors"
        />
      </div>
      <button
        onClick={onBookNew}
        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm shadow-green-500/20 active:scale-95"
      >
        <AddIcon className="text-[20px]" />
        <span>Book New Appointment</span>
      </button>
    </div>
  );
}
