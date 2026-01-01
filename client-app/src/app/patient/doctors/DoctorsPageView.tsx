"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Doctor } from "./types";
import DoctorsHeader from "./components/DoctorsHeader";
import DoctorsSearchBar from "./components/DoctorsSearchBar";
import DoctorsFilters from "./components/DoctorsFilters";
import DoctorsGrid from "./components/DoctorsGrid";

// Mock data (kept at top, same pattern as other pages)
const mockDoctors: Doctor[] = [
  {
    id: "alsjf-9adfa-a9dsf9as-asdfasdf",
    name: "Dr. James Wilson",
    specialization: "Cardiologist",
    rating: 4.9,
    reviews: 120,
    fee: 150,
    availableToday: true,
    clinic: "Heart Care Clinic, 123 Health Ave, New York",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDZLxHCTeji0h2YcibzURppf4JWscgBwpeIzdm5d7N52ECQ-816Nta3RWeXKh67R2zyRo4C3tniUIAPMOqkD-BGO6jHKZ7-4QZ6tty1GTfQYpzm3-mcvvIIJXTp6J7Xg1rAtg0YfyF-3JWDzu5SDP1W4nqCeZ4cGY5bC59ldtI5v-dUDzOYtnQml4mXGQ5r0A8CPYomltQoIdimIiaFyijYC5fYOjoVpCyabFyGZ4ZVdfx8X0sdMafiARklJ7z-ZvvQq03vkXZYcnk",
    online: true,
    city: "New York",
    supportsVideo: true,
    isFemale: false,
  },
  {
    id: "gfag-afdgadga-adgad-adgdfagd",
    name: "Dr. Emily Chen",
    specialization: "Pediatrician",
    rating: 4.8,
    reviews: 85,
    fee: 100,
    nextSlot: "Tom, 10am",
    clinic: "Kids Wellness Center, 45 Maple St, Brooklyn",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDFLhDweYIPeaWTMZf4XESSyCFmcQRjA7e2bSIeoMY-869jaVRqcjLOJTWPTMikWBOEhTsC5hhPkILz1PIRNoXgZR6ZGKKf0o8Xic2aZR0qXDIeVFYQ-W70O1ZqcJVfVbFRJIqALsnzQ-G5xaQBuO-5fBA1lq8wsBOw-mi82k5FT7e6sh0qNMadyaLolHdgLmCYBWmJv4Dx_5Wyj5MC005rNJgLSuUoRcSN5weM53yY9ne5tjIVHV1rWKy0-Z68Mb11hXlLwKdN1_Q",
    city: "Brooklyn",
    supportsVideo: true,
    isFemale: true,
  },
  {
    id: "abdsf-asfdfashdf-asdfbas-asdfaysdf",
    name: "Dr. Michael Brown",
    specialization: "Neurologist",
    rating: 5.0,
    reviews: 210,
    fee: 200,
    availableToday: true,
    clinic: "City General Hospital, 800 5th Ave, New York",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD6Hh95dv66FlTLY3Ga3Vip8mQ2sULBNMYaWwDqV8z3PvdNkrUVfXeX-XEDp5GLznupEVhoc-ueRnbSxDrOudkCAoWul3J1LDKnBKMRCBSnG8f66xbYDyU1X1w9aw0Qdq-G2FC2cE5IekKyzFqN-pKNb1oNsrduSYb0j9J7grv4FkcvLaCbkzBeQzmiUvvMAMb0drlorwDaClNvF07K3KqWct-nZSIAPMevMiH50rJH4X--L5X6HmDLmiW5K9St2DE4xfTIEUunroA",
    online: true,
    city: "New York",
    supportsVideo: false,
    isFemale: false,
  },
  {
    id: "assdf-asdfabsdf-asghdf-asdfhasdf",
    name: "Dr. Linda Davis",
    specialization: "Dermatologist",
    rating: 4.7,
    reviews: 54,
    fee: 120,
    nextSlot: "Mon, 9am",
    clinic: "Skin & Glow Clinic, 22 Park Ln, Queens",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBHGdIYXLyd0elWa7ZZjv0f760lTCLzDyixhVdsuRmmM4hDYwoDnwRZHCJhWL59Cpj90wS2cUX25umhYB8212ImwcD5CoZ2L23k2geTyCB9KMn8z3dlre82NIOxs2bxoA2A0rS0BZ3IRwqQFBqCoyLlTMaHgckFCJu0Sz4XJA-c4TziVPShRgJUjk_jr1zzMxLC27NK6iDi19Iw0NPLTrcjPkNJL9z-1rt5JaAK0e431IadArvyps0fVIJr5Vcxa7JVHv6tYQXpGdE",
    city: "Queens",
    supportsVideo: true,
    isFemale: true,
  },
  {
    id: "assdf-assdfasdf-asdf-asdfagssdf",
    name: "Dr. Robert Taylor",
    specialization: "General Physician",
    rating: 4.6,
    reviews: 320,
    fee: 80,
    availableToday: true,
    clinic: "Community Health, 99 Broadway, New York",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBOgvkt3rkm6RK2bXWAibgvF6UK0QjIdHFaBdlVTY-j3S37wD1eEgZGGWEI8g5KZdq3SGvVGAafKBJr3h4J40OBpD23i90YdbpGn8izqPsugZmXliTmm4zTYinz5x4OGqzr6J4_-l-v16HaZhWIUt0NNxFoadHr_gxfaSICbqbsazyn2SDKXtS5eyJJRYmJwBj4gOs2Z1a63ldTywY2AkdKKzCl8YtZua8THjI3dOvWdpulNmqlpeFfDHE1qnoOlgSsRdzPLxUF2as",
    online: true,
    city: "New York",
    supportsVideo: true,
    isFemale: false,
  },
  {
    id: "asdf-asdfagfsdf-asgddf-asdfasdf",
    name: "Dr. Sarah Lopez",
    specialization: "Dentist",
    rating: 4.9,
    reviews: 98,
    fee: 110,
    nextSlot: "Fri, 2pm",
    clinic: "Bright Smiles, 12 Elm St, Brooklyn",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCXW9VhpbSbJnFY6NgTh-DiSE1Q-3BrzOpBtTCMN6k-YOXoC-9Oq7x3Lz_3rmYLgYaogz6cGVKvxZ7BbOpN-ewJPkS_ycuc2GUmyZVnnxSBcZ028RmcSxKP57MxmaVS-5cFA_EHSZDe4HJhIbpoXdPKBfLwJDegLzjmfG2nZ_p7cBChWVJn0QCELWRGE4ysXwZf_e4v81P6Xq5eaSCZADDsDYhgw8CS8PeCV58rXYuQMikV-wjoQRE7K65RBjVPFkxjB0uHyOzLbsQ",
    city: "Brooklyn",
    supportsVideo: false,
    isFemale: true,
  },
  {
    id: "qwef-23asdfa-dsfas-1231",
    name: "Dr. Priya Singh",
    specialization: "Gynecologist",
    rating: 4.8,
    reviews: 145,
    fee: 130,
    nextSlot: "Wed, 4pm",
    clinic: "Women's Wellness Clinic, 210 Oak Rd, Queens",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDFLhDweYIPeaWTMZf4XESSyCFmcQRjA7e2bSIeoMY-869jaVRqcjLOJTWPTMikWBOEhTsC5hhPkILz1PIRNoXgZR6ZGKKf0o8Xic2aZR0qXDIeVFYQ-W70O1ZqcJVfVbFRJIqALsnzQ-G5xaQBuO-5fBA1lq8wsBOw-mi82k5FT7e6sh0qNMadyaLolHdgLmCYBWmJv4Dx_5Wyj5MC005rNJgLSuUoRcSN5weM53yY9ne5tjIVHV1rWKy0-Z68Mb11hXlLwKdN1_Q",
    city: "Queens",
    supportsVideo: true,
    isFemale: true,
  },
  {
    id: "zxcv-2342-asdf-0345",
    name: "Dr. Ahmed Khan",
    specialization: "Orthopedic Surgeon",
    rating: 4.7,
    reviews: 76,
    fee: 140,
    availableToday: true,
    clinic: "OrthoCare Center, 67 River Ave, Brooklyn",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD6Hh95dv66FlTLY3Ga3Vip8mQ2sULBNMYaWwDqV8z3PvdNkrUVfXeX-XEDp5GLznupEVhoc-ueRnbSxDrOudkCAoWul3J1LDKnBKMRCBSnG8f66xbYDyU1X1w9aw0Qdq-G2FC2cE5IekKyzFqN-pKNb1oNsrduSYb0j9J7grv4FkcvLaCbkzBeQzmiUvvMAMb0drlorwDaClNvF07K3KqWct-nZSIAPMevMiH50rJH4X--L5X6HmDLmiW5K9St2DE4xfTIEUunroA",
    city: "Brooklyn",
    online: true,
    supportsVideo: false,
    isFemale: false,
  },
];

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
  const [priceMax, setPriceMax] = useState(250);
  const [openFilter, setOpenFilter] = useState<null | "spec" | "avail" | "price">(null);
  const filtersRef = useRef<HTMLDivElement>(null!);

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

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) => {
      const next = new Set(prev);
      if (next.has(spec)) next.delete(spec);
      else next.add(spec);
      return next;
    });
  };

  const filteredDoctors = useMemo(() => {
    let list = [...mockDoctors];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.clinic.toLowerCase().includes(q)
      );
    }

    if (location.trim()) {
      const lq = location.toLowerCase();
      list = list.filter((d) => (d.city || "").toLowerCase().includes(lq) || d.clinic.toLowerCase().includes(lq));
    }

    const requireToday = availability === "today" || availableTodayChip;
    if (requireToday) list = list.filter((d) => d.availableToday);

    if (selectedSpecs.size > 0) list = list.filter((d) => selectedSpecs.has(d.specialization));

    if (typeof priceMax === "number") list = list.filter((d) => d.fee <= priceMax);

    if (videoConsult) list = list.filter((d) => d.supportsVideo);
    if (femaleDoctor) list = list.filter((d) => d.isFemale);

    if (sort === "Price: Low to High") list.sort((a, b) => a.fee - b.fee);
    else if (sort === "Price: High to Low") list.sort((a, b) => b.fee - a.fee);
    else if (sort === "Rating") list.sort((a, b) => b.rating - a.rating);

    return list;
  }, [query, location, sort, availability, availableTodayChip, selectedSpecs, videoConsult, femaleDoctor, priceMax]);

  const onProfile = (id: string) => router.push(`/patient/doctor/${id}`);
  const onBook = (id: string) => router.push(`/patient/book/${id}`);
  const nav = (path: string) => router.push(path);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-gray-100 antialiased min-h-screen flex flex-col">
      <DoctorsHeader nav={nav} />

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

        {/* Results */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-4 md:hidden">
            <span className="text-sm font-bold text-text-main dark:text-white">{filteredDoctors.length} Doctors found</span>
            <button className="text-primary text-sm font-bold">Sort</button>
          </div>

          <DoctorsGrid doctors={filteredDoctors} onProfile={onProfile} onBook={onBook} />
        </section>
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
