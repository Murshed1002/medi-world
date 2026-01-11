"use client";
import SensorsIcon from "@mui/icons-material/Sensors";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InfoIcon from "@mui/icons-material/Info";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";

export default function DoctorBookingSidebar({
  doctorId,
  queue,
  fees,
  nextSlot,
  onBook,
  onQueue,
}: {
  doctorId: string;
  queue: { waiting: number; estWait: number };
  fees: { consultation: number; booking: number };
  nextSlot?: string | null;
  onBook: () => void;
  onQueue: () => void;
}) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const monthLabel = useMemo(() => {
    const date = new Date(currentYear, currentMonth, 1);
    return date.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [currentMonth, currentYear]);

  // Generate dates for the selected month/year
  const availableDays = useMemo(() => {
    const days = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      date.setHours(0, 0, 0, 0);
      
      // Skip Sundays and past dates
      if (date.getDay() !== 0 && date >= todayDate) {
        days.push(date);
      }
    }
    
    return days;
  }, [currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleYearChange = (increment: number) => {
    setCurrentYear(currentYear + increment);
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  // Fetch available slots when a date is selected
  useEffect(() => {
    if (!selectedDate || !doctorId) return;

    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        // Format date without timezone conversion
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const response = await apiClient.get(`/doctors/${doctorId}/slots?date=${dateStr}`);
        setAvailableSlots(response.data.slots || []);
        setSelectedSlot(null);
      } catch (error) {
        console.error('Failed to fetch slots:', error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, doctorId]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const formatDayLabel = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-primary">
            <CalendarMonthIcon />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Select Date & Time</h3>
            {nextSlot ? (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Next available: {nextSlot}</p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Book your slot instantly</p>
            )}
          </div>
        </div>

        {/* Month and Year header with navigation */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-3 gap-2">
            {/* Year navigation */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg px-2 py-1">
              <button
                aria-label="Previous year"
                className="p-0.5 text-slate-500 hover:text-primary transition-colors disabled:opacity-30"
                onClick={() => handleYearChange(-1)}
                disabled={currentYear <= today.getFullYear()}
              >
                <ChevronLeftIcon fontSize="small" />
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 min-w-[40px] text-center">
                {currentYear}
              </span>
              <button
                aria-label="Next year"
                className="p-0.5 text-slate-500 hover:text-primary transition-colors"
                onClick={() => handleYearChange(1)}
              >
                <ChevronRightIcon fontSize="small" />
              </button>
            </div>

            {/* Month label */}
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex-1 text-center">
              {new Date(currentYear, currentMonth).toLocaleString(undefined, { month: "long" })}
            </h4>

            {/* Month navigation */}
            <div className="flex gap-1">
              <button
                aria-label="Previous month"
                className="p-1 text-slate-500 hover:text-primary transition-colors disabled:opacity-30"
                onClick={handlePrevMonth}
                disabled={currentMonth === today.getMonth() && currentYear === today.getFullYear()}
              >
                <ChevronLeftIcon fontSize="small" />
              </button>
              <button
                aria-label="Next month"
                className="p-1 text-slate-500 hover:text-primary transition-colors"
                onClick={handleNextMonth}
              >
                <ChevronRightIcon fontSize="small" />
              </button>
            </div>
          </div>

          {/* Days grid - showing all available days in the month */}
          {availableDays.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p className="text-sm">No available dates this month</p>
              <p className="text-xs mt-1">Try selecting a different month</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 mb-4 max-h-[280px] overflow-y-auto pr-1">
              {availableDays.map((date) => {
                const isSelected = isDateSelected(date);
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateSelect(date)}
                    className={
                      isSelected
                        ? "flex flex-col items-center justify-center p-2 rounded-lg border-2 border-primary bg-green-50 dark:bg-green-900/20 shadow-sm transition-all relative"
                        : "flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-primary hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                    }
                  >
                    <span className={isSelected ? "text-[10px] uppercase text-primary font-bold" : "text-[10px] uppercase text-slate-500 dark:text-slate-400 font-medium"}>
                      {formatDayLabel(date)}
                    </span>
                    <span className={isSelected ? "text-lg font-bold text-primary" : "text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary"}>
                      {date.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Slots */}
        {selectedDate && (
          <div className="w-full mb-4">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
              Available Slots
              {loadingSlots && <span className="text-xs text-slate-500 ml-2">(Loading...)</span>}
            </h4>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {availableSlots.map((slot) => {
                  const isActive = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={
                        isActive
                          ? "px-2 py-2 text-xs font-medium rounded-md bg-primary text-white shadow-sm ring-1 ring-primary transition-colors"
                          : "px-2 py-2 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors"
                      }
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                No slots available for this date
              </div>
            )}
          </div>
        )}

        {!selectedDate && (
          <div className="text-center py-8 text-slate-400 text-sm">
            Please select a date to view available slots
          </div>
        )}

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
          disabled={!selectedDate || !selectedSlot}
          className="w-full mt-2 bg-primary hover:bg-green-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-green-500/20 transition-all duration-200 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Book Appointment</span>
          <ArrowForwardIcon />
        </button>
        <p className="text-center text-xs text-slate-400">Instant confirmation • Secure payment</p>
      </div>
    );
  }
