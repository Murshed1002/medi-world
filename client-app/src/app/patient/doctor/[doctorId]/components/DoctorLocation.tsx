"use client";
import MapIcon from "@mui/icons-material/Map";
import AppleIcon from "@mui/icons-material/Apple";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useState } from "react";
import MapPreview from "@/components/shared/MapPreview";

export default function DoctorLocation({
  location,
}: {
  location: { 
    hospital: string; 
    address: string; 
    mapLink: string; 
    hours: { label: string; value: string }[];
    latitude: number;
    longitude: number;
  };
}) {
  const [showMapOptions, setShowMapOptions] = useState(false);
  
  // Detect if user is on mobile
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Generate Apple Maps link
  const getAppleMapsLink = () => {
    if (location.latitude && location.longitude) {
      return `https://maps.apple.com/?q=${location.latitude},${location.longitude}`;
    }
    return `https://maps.apple.com/?q=${encodeURIComponent(location.address)}`;
  };
  
  // Generate Google Maps link for mobile (opens app if installed)
  const getGoogleMapsAppLink = () => {
    if (location.latitude && location.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Location</h3>
        <button
          onClick={() => window.open(getGoogleMapsAppLink(), '_blank')}
          className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
        >
          Get Directions
          <MapIcon className="text-base" />
        </button>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full max-w-sm">
          <MapPreview
            mapImageUrl={undefined}
            latitude={location.latitude}
            longitude={location.longitude}
            locationName={location.hospital}
          />
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
