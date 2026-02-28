"use client";
import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function DoctorsFilters({
  filtersRef,
  openFilter,
  setOpenFilter,
  selectedSpecs,
  toggleSpec,
  availability,
  setAvailability,
  priceMax,
  setPriceMax,
  availableTodayChip,
  setAvailableTodayChip,
  videoConsult,
  setVideoConsult,
  femaleDoctor,
  setFemaleDoctor,
  sort,
  setSort,
}: {
  filtersRef: React.RefObject<HTMLDivElement>;
  openFilter: null | "spec" | "avail" | "price";
  setOpenFilter: (v: null | "spec" | "avail" | "price") => void;
  selectedSpecs: Set<string>;
  toggleSpec: (spec: string) => void;
  availability: "any" | "today" | "next3";
  setAvailability: (v: "any" | "today" | "next3") => void;
  priceMax: number;
  setPriceMax: (v: number) => void;
  availableTodayChip: boolean;
  setAvailableTodayChip: (v: boolean) => void;
  videoConsult: boolean;
  setVideoConsult: (v: boolean) => void;
  femaleDoctor: boolean;
  setFemaleDoctor: (v: boolean) => void;
  sort: string;
  setSort: (v: string) => void;
}) {
  const onSummaryClick = (key: "spec" | "avail" | "price") => (
    e: React.MouseEvent<HTMLElement>
  ) => {
    e.preventDefault();
    setOpenFilter(openFilter === key ? null : key);
  };

  return (
    <div ref={filtersRef} className="flex flex-wrap items-center justify-center gap-3 w-full max-w-5xl mx-auto">
      {/* Specialization */}
      <details className="relative group" open={openFilter === "spec"}>
        <summary
          aria-expanded={openFilter === "spec"}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full hover:border-primary-dark dark:hover:border-primary transition-colors text-sm font-medium text-text-main dark:text-gray-200 select-none shadow-sm"
          onClick={onSummaryClick("spec")}
        >
          <span>Specialization</span>
          <ExpandMoreIcon className="text-text-secondary" fontSize="small" />
        </summary>
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-xl p-4 z-20 text-left">
          <div className="space-y-3">
            {["General Physician", "Cardiologist", "Dermatologist", "Pediatrician"].map((spec) => (
              <label
                key={spec}
                className="flex items-center gap-3 cursor-pointer hover:bg-background-light dark:hover:bg-background-dark p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedSpecs.has(spec)}
                  onChange={() => toggleSpec(spec)}
                  className="rounded border-border-light text-primary focus:ring-primary/20 bg-background-light dark:bg-background-dark"
                />
                <span className="text-sm text-text-main dark:text-gray-300">{spec}</span>
              </label>
            ))}
          </div>
        </div>
      </details>

      {/* Availability */}
      <details className="relative group" open={openFilter === "avail"}>
        <summary
          aria-expanded={openFilter === "avail"}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full hover:border-primary-dark dark:hover:border-primary transition-colors text-sm font-medium text-text-main dark:text-gray-200 select-none shadow-sm"
          onClick={onSummaryClick("avail")}
        >
          <span>Availability</span>
          <ExpandMoreIcon className="text-text-secondary" fontSize="small" />
        </summary>
        <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-xl p-4 z-20 text-left">
          <div className="space-y-3">
            {[
              { label: "Anytime", value: "any" },
              { label: "Today", value: "today" },
              { label: "Next 3 days", value: "next3" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="avail-top"
                  checked={availability === (opt.value as any)}
                  onChange={() => setAvailability(opt.value as any)}
                  className="border-border-light text-primary focus:ring-primary/20 bg-background-light dark:bg-background-dark"
                />
                <span className="text-sm text-text-main dark:text-gray-300">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </details>

      {/* Price Range */}
      <details className="relative group" open={openFilter === "price"}>
        <summary
          aria-expanded={openFilter === "price"}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full hover:border-primary-dark dark:hover:border-primary transition-colors text-sm font-medium text-text-main dark:text-gray-200 select-none shadow-sm"
          onClick={onSummaryClick("price")}
        >
          <span>Price Range</span>
          <ExpandMoreIcon className="text-text-secondary" fontSize="small" />
        </summary>
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-xl p-4 z-20 text-left">
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Min: ₹0</span>
              <span>Max: ₹500+</span>
            </div>
            <input
              className="w-full h-6 appearance-none cursor-pointer accent-primary rounded-lg"
              type="range"
              min={0}
              max={500}
              step={10}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
            />
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold text-text-main dark:text-white">₹0 - ₹{priceMax}</span>
              <button
                className="text-xs text-primary font-bold hover:underline"
                onClick={() => setOpenFilter(null)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </details>

      <div className="w-px h-6 bg-border-light dark:bg-border-dark mx-1 hidden md:block"></div>

      {/* Quick chips */}
      <button
        aria-pressed={availableTodayChip}
        onClick={() => setAvailableTodayChip(!availableTodayChip)}
        className={
          `group flex items-center justify-center gap-2 rounded-full transition-all px-4 py-2 cursor-pointer border ` +
          (availableTodayChip
            ? `bg-primary-light text-primary-dark border-transparent dark:bg-primary dark:text-white`
            : `bg-white dark:bg-surface-dark text-text-main dark:text-white border-border-light dark:border-border-dark hover:border-primary hover:text-primary`)
        }
      >
        <p className="text-sm font-medium">Available Today</p>
      </button>
      <button
        aria-pressed={videoConsult}
        onClick={() => setVideoConsult(!videoConsult)}
        className={
          `group flex items-center justify-center gap-2 rounded-full transition-all px-4 py-2 cursor-pointer border ` +
          (videoConsult
            ? `bg-primary-light text-primary-dark border-transparent dark:bg-primary dark:text-white`
            : `bg-white dark:bg-surface-dark text-text-main dark:text-white border-border-light dark:border-border-dark hover:border-primary hover:text-primary`)
        }
      >
        <p className="text-sm font-medium">Video Consult</p>
      </button>
      <button
        aria-pressed={femaleDoctor}
        onClick={() => setFemaleDoctor(!femaleDoctor)}
        className={
          `group flex items-center justify-center gap-2 rounded-full transition-all px-4 py-2 cursor-pointer border ` +
          (femaleDoctor
            ? `bg-primary-light text-primary-dark border-transparent dark:bg-primary dark:text-white`
            : `bg-white dark:bg-surface-dark text-text-main dark:text-white border-border-light dark:border-border-dark hover:border-primary hover:text-primary`)
        }
      >
        <p className="text-sm font-medium">Female Doctor</p>
      </button>

      {/* Sort (desktop) */}
      <div className="ml-auto hidden lg:block">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">Sort:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent border-none text-sm font-bold text-text-main dark:text-white focus:ring-0 p-0 pr-6 cursor-pointer"
          >
            <option>Relevance</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Rating</option>
          </select>
        </div>
      </div>
    </div>
  );
}
