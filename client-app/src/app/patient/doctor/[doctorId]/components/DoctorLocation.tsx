"use client";
import MapIcon from "@mui/icons-material/Map";
import AppleIcon from "@mui/icons-material/Apple";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useState } from "react";

export default function DoctorLocation({
  location,
}: {
  location: { 
    hospital: string; 
    address: string; 
    mapLink: string; 
    hours: { label: string; value: string }[];
    latitude?: number | null;
    longitude?: number | null;
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
        <div className="relative">
          {isMobile ? (
            <button
              onClick={() => setShowMapOptions(!showMapOptions)}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              Get Directions
              <MapIcon className="text-base" />
            </button>
          ) : (
            <a 
              href={location.mapLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              Get Directions
              <MapIcon className="text-base" />
            </a>
          )}
          
          {showMapOptions && isMobile && (
            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 z-10 min-w-[200px]">
              <a
                href={getGoogleMapsAppLink()}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-t-lg"
                onClick={() => setShowMapOptions(false)}
              >
                <MapIcon className="text-primary" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">Google Maps</span>
              </a>
              <a
                href={getAppleMapsLink()}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-b-lg border-t border-slate-100 dark:border-slate-600"
                onClick={() => setShowMapOptions(false)}
              >
                <AppleIcon className="text-slate-700 dark:text-slate-300" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">Apple Maps</span>
              </a>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div
          onClick={() => {
            if (isMobile) {
              setShowMapOptions(!showMapOptions);
            } else {
              window.open(location.mapLink, '_blank', 'noopener,noreferrer');
            }
          }}
          className="w-full md:w-1/3 h-40 rounded-lg relative overflow-hidden group cursor-pointer"
          style={{
            backgroundImage: location.latitude && location.longitude 
              ? `url(https://tile.openstreetmap.org/16/${Math.floor((location.longitude + 180) * (Math.pow(2, 16) / 360))}/${Math.floor((1 - Math.log(Math.tan(location.latitude * Math.PI / 180) + 1 / Math.cos(location.latitude * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, 16))}.png)`
              : 'url(https://tile.openstreetmap.org/12/2389/1537.png)', // Default: San Francisco-ish location
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Semi-transparent overlay with location marker */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Location marker */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <LocationOnIcon className="text-red-500 text-7xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
          </div>
          
          {/* Bottom info bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-2 text-center">
            <p className="text-xs text-white font-medium">
              {isMobile ? 'Tap to view in Maps' : 'Click for directions'}
            </p>
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
