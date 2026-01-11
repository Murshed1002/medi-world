"use client";
import SensorsIcon from "@mui/icons-material/Sensors";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InfoIcon from "@mui/icons-material/Info";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useMemo, useState } from "react";

export default function DoctorBookingSidebar({
  queue,
  fees,
  onBook,
  onQueue,
}: {
  queue: { waiting: number; estWait: number };
  fees: { consultation: number; booking: number };
  onBook: () => void;
  onQueue: () => void;
}) {
  const [monthIndex, setMonthIndex] = useState(9); // 0-based; 9 => October
  const [year] = useState(2023);
  const [selectedDay, setSelectedDay] = useState<number | null>(24);
  const [selectedSlot, setSelectedSlot] = useState<string | null>("10:30 AM");

  const monthLabel = useMemo(() => {
    const date = new Date(year, monthIndex, 1);
    return date.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [monthIndex, year]);

  const days = useMemo(
    () => [
      { label: "Mon", date: 23, disabled: false, badge: 0 },
      { label: "Tue", date: 24, disabled: false, badge: 3 },
      { label: "Wed", date: 25, disabled: false, badge: 0 },
      { label: "Thu", date: 26, disabled: true, badge: 0 },
    ],
    []
  );

  const slots = useMemo(
    () => ["09:00 AM", "10:30 AM", "11:15 AM", "02:00 PM", "03:30 PM", "04:45 PM"],
    []
  );

  return (
    <div className="sticky top-24 flex flex-col gap-4">
      <div className="bg-linear-to-r from-green-600 to-green-500 rounded-xl p-4 shadow-lg text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">Live Queue Status</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold">{queue.waiting}</h2>
              <span className="text-sm opacity-90">Patients waiting</span>
            </div>
          </div>
          <div className="bg-white/20 p-2 rounded-lg">
            <SensorsIcon className="animate-pulse" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-sm">
          <span>Est. Wait Time:</span>
          <span className="font-bold">{queue.estWait} mins</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-primary">
            <CalendarMonthIcon />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Select Date & Time</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Book your slot instantly</p>
          </div>
        </div>

        {/* Month header */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{monthLabel}</h4>
            <div className="flex gap-1">
              <button
                aria-label="Previous month"
                className="p-1 text-slate-500 hover:text-primary transition-colors"
                onClick={() => setMonthIndex((i) => Math.max(0, i - 1))}
              >
                <ChevronLeftIcon fontSize="small" />
              </button>
              <button
                aria-label="Next month"
                className="p-1 text-slate-500 hover:text-primary transition-colors"
                onClick={() => setMonthIndex((i) => Math.min(11, i + 1))}
              >
                <ChevronRightIcon fontSize="small" />
              </button>
            </div>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {days.map((d) => {
              const isSelected = selectedDay === d.date;
              if (d.disabled) {
                return (
                  <button
                    key={d.date}
                    disabled
                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-50 cursor-not-allowed"
                  >
                    <span className="text-[10px] uppercase text-slate-400 font-medium">{d.label}</span>
                    <span className="text-lg font-bold text-slate-400">{d.date}</span>
                  </button>
                );
              }
              return (
                <button
                  key={d.date}
                  onClick={() => setSelectedDay(d.date)}
                  className={
                    isSelected
                      ? "flex flex-col items-center justify-center p-2 rounded-lg border-2 border-primary bg-green-50 dark:bg-green-900/20 shadow-sm transition-all relative"
                      : "flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-primary hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                  }
                >
                  {d.badge > 0 && isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold px-1.5 rounded-full">{d.badge}</div>
                  )}
                  <span className={isSelected ? "text-[10px] uppercase text-primary font-bold" : "text-[10px] uppercase text-slate-500 dark:text-slate-400 font-medium"}>{d.label}</span>
                  <span className={isSelected ? "text-lg font-bold text-primary" : "text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary"}>{d.date}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slots */}
        <div className="w-full mb-4">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Available Slots</h4>
          <div className="grid grid-cols-3 gap-2">
            {slots.map((s) => {
              const isActive = selectedSlot === s;
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSlot(s)}
                  className={
                    isActive
                      ? "px-2 py-2 text-xs font-medium rounded-md bg-primary text-white shadow-sm ring-1 ring-primary transition-colors"
                      : "px-2 py-2 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors"
                  }
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start text-sm border-b border-slate-100 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 dark:text-slate-300">Consultation Fee</span>
              <div className="group relative flex items-center">
                <InfoIcon className="text-[18px] text-slate-400 cursor-help group-hover:text-primary transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-slate-800 text-white text-xs leading-relaxed rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                  Doctor's standard charge. Paid directly at the clinic.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900 dark:text-white block">₹{fees.consultation.toFixed(2)}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pay at clinic</span>
            </div>
          </div>
          <div className="flex justify-between items-start text-sm border-b border-slate-100 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 dark:text-slate-300">Booking Fee</span>
              <div className="group relative flex items-center">
                <InfoIcon className="text-[18px] text-slate-400 cursor-help group-hover:text-primary transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-slate-800 text-white text-xs leading-relaxed rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                  A small, upfront fee required to secure your appointment slot.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900 dark:text-white block">₹{fees.booking.toFixed(2)}</span>
              <span className="text-xs text-primary font-bold">Pay now</span>
            </div>
          </div>
        </div>
        <button
          onClick={onBook}
          className="w-full mt-2 bg-primary hover:bg-green-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-green-500/20 transition-all duration-200 flex items-center justify-center gap-2 text-lg"
        >
          <span>Book Appointment</span>
          <ArrowForwardIcon />
        </button>
        <p className="text-center text-xs text-slate-400">Instant confirmation • Secure payment</p>
      </div>
    </div>
  );
}
