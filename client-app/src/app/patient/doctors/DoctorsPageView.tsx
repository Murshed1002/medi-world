"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { Doctor } from "./types";
import DoctorsSearchBar from "./components/DoctorsSearchBar";
import DoctorsFilters from "./components/DoctorsFilters";
import DoctorsGrid from "./components/DoctorsGrid";

export default function DoctorsPageView() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("Relevance");
  const [availability, setAvailability] = useState<"any" | "today" | "next3">("any");
  const [selectedSpecs, setSelectedSpecs] = useState<Set<string>>(new Set());
  const [availableTodayChip, setAvailableTodayChip] = useState(false);
  const [videoConsult, setVideoConsult] = useState(false);
  const [femaleDoctor, setFemaleDoctor] = useState(false);
  const [priceMax, setPriceMax] = useState(10000); // High default to show all doctors
  const [openFilter, setOpenFilter] = useState<null | "spec" | "avail" | "price">(null);
  const filtersRef = useRef<HTMLDivElement>(null!);

  // State for API data
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query params
        const params = new URLSearchParams();
        
        if (query.trim()) {
          params.append('search', query.trim());
        }
        
        if (location.trim()) {
          params.append('city', location.trim());
        }
        
        if (selectedSpecs.size > 0) {
          params.append('specialization', Array.from(selectedSpecs)[0]); // Simplified: take first spec
        }
        
        if (availableTodayChip || availability === 'today') {
          params.append('availableToday', 'true');
        }
        
        if (videoConsult) {
          params.append('supportsVideo', 'true');
        }
        
        if (femaleDoctor) {
          params.append('isFemale', 'true');
        }
        
        // Map sort to API params
        if (sort === 'Top Rated') {
          params.append('sortBy', 'rating');
          params.append('sortOrder', 'desc');
        } else if (sort === 'Low to High') {
          params.append('sortBy', 'fee');
          params.append('sortOrder', 'asc');
        }

        const response = await apiClient.get(`/doctors?${params.toString()}`);
        console.log('API Response:', response.data);
        console.log('Number of doctors:', response.data.length);
        setDoctors(response.data);
      } catch (err: any) {
        console.error('Failed to fetch doctors:', err);
        setError(err.response?.data?.message || 'Failed to load doctors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [query, location, selectedSpecs, availableTodayChip, availability, videoConsult, femaleDoctor, sort]);

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) => {
      const next = new Set(prev);
      if (next.has(spec)) next.delete(spec);
      else next.add(spec);
      return next;
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!filtersRef.current) return;
      const target = e.target as Node;
      if (!filtersRef.current.contains(target)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter doctors by price (backend handles other filters)
  const filteredDoctors = useMemo(() => {
    const filtered = doctors.filter((d) => d.fee <= priceMax);
    console.log('Doctors state:', doctors.length);
    console.log('Filtered doctors:', filtered.length);
    console.log('Price max:', priceMax);
    return filtered;
  }, [doctors, priceMax]);

  const onProfile = (id: string) => router.push(`/patient/doctor/${id}`);
  const nav = (path: string) => router.push(path);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-gray-100 antialiased min-h-screen flex flex-col">

      {/* Main */}
      <main className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title + Search */}
        <div className="mb-8 text-center">
          <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-black mb-3 tracking-tight">Find Your Specialist</h1>
          <p className="text-text-secondary dark:text-gray-400 text-base md:text-lg font-normal mb-8 max-w-2xl mx-auto">Book appointments with top doctors near you and track queue status in real-time.</p>
          <DoctorsSearchBar query={query} setQuery={setQuery} location={location} setLocation={setLocation} />

          <DoctorsFilters
            filtersRef={filtersRef}
            openFilter={openFilter}
            setOpenFilter={setOpenFilter}
            selectedSpecs={selectedSpecs}
            toggleSpec={toggleSpec}
            availability={availability}
            setAvailability={setAvailability}
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            availableTodayChip={availableTodayChip}
            setAvailableTodayChip={setAvailableTodayChip}
            videoConsult={videoConsult}
            setVideoConsult={setVideoConsult}
            femaleDoctor={femaleDoctor}
            setFemaleDoctor={setFemaleDoctor}
            sort={sort}
            setSort={setSort}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <section className="w-full text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-text-secondary">Loading doctors...</p>
          </section>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <section className="w-full text-center py-12">
            <div className="text-red-500 text-lg font-semibold mb-2">Error loading doctors</div>
            <p className="text-text-secondary mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Retry
            </button>
          </section>
        )}

        {/* Results */}
        {!isLoading && !error && (
          <section className="w-full">
            <div className="flex items-center justify-between mb-4 md:hidden">
              <span className="text-sm font-bold text-text-main dark:text-white">{filteredDoctors.length} Doctors found</span>
              <button className="text-primary text-sm font-bold">Sort</button>
            </div>

            <DoctorsGrid doctors={filteredDoctors} onProfile={onProfile} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-secondary dark:text-gray-500 text-sm">
          <p>© 2024 MediConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
