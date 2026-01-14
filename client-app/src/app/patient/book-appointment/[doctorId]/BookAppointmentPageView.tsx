"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  clinicName: string;
  clinicAddress: string;
  clinicCity: string;
  fee: number;
  bookingFee: number;
  avatarUrl?: string;
  clinicId: string;
}

export default function BookAppointmentPageView({ doctorId }: { doctorId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get date and slot from URL params (passed from doctor details page)
  const selectedDate = searchParams.get('date');
  const selectedSlot = searchParams.get('slot');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await apiClient.get(`/doctors/${doctorId}`);
        const data = response.data;
        
        // Transform backend response to match our interface
        setDoctor({
          id: data.id,
          name: data.name,
          specialization: data.specialization,
          clinicName: data.clinicName,
          clinicAddress: data.clinicAddress,
          clinicCity: data.clinicCity,
          fee: data.fee,
          bookingFee: data.bookingFee || data.fee * 0.1,
          avatarUrl: data.avatarUrl,
          clinicId: data.clinicId,
        });
      } catch (err) {
        setError('Failed to load doctor details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  const parseSlotTime = (slot: string): { start: string; end: string } => {
    // Parse slot like "2:30 PM" and calculate end time (30 min later)
    const [time, period] = slot.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    
    const start = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Add 30 minutes for end time
    const endMinutes = minutes + 30;
    const endHour = hour24 + Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const end = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
    
    return { start, end };
  };

  const handleBookAppointment = async () => {
    if (!doctor || !selectedDate || !selectedSlot) return;

    try {
      setBooking(true);
      const { start, end } = parseSlotTime(selectedSlot);

      const payload = {
        doctorId: doctor.id,
        clinicId: doctor.clinicId,
        appointmentDate: selectedDate,
        slotStartTime: start,
        slotEndTime: end,
      };

      console.log('Booking appointment with payload:', payload);

      const response = await apiClient.post('/appointments', payload);

      // Redirect to payment page
      router.push(`/payment/${response.data.paymentId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.back()} className="text-primary hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!selectedDate || !selectedSlot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No appointment details provided</p>
          <button onClick={() => router.back()} className="text-primary hover:underline">
            Go Back to Doctor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary mb-6"
        >
          <ArrowBackIcon />
          <span>Back to Doctor</span>
        </button>

        {/* Main card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Confirm Appointment
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Doctor info */}
          <div className="flex gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              {doctor?.avatarUrl ? (
                <img src={doctor.avatarUrl} alt={doctor.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <PersonIcon className="text-3xl text-slate-500" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{doctor?.name}</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{doctor?.specialization}</p>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm mt-1">
                <LocalHospitalIcon fontSize="small" />
                <span>{doctor?.clinicName}</span>
              </div>
            </div>
          </div>

          {/* Appointment details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <CalendarMonthIcon className="text-primary" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Date</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <AccessTimeIcon className="text-primary" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Time</p>
                <p className="font-medium text-slate-900 dark:text-white">{selectedSlot}</p>
              </div>
            </div>
          </div>

          {/* Fee breakdown */}
          <div className="space-y-3 mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Consultation Fee</span>
              <span className="font-medium text-slate-900 dark:text-white">₹{doctor?.fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm pb-3 border-b border-slate-200 dark:border-slate-600">
              <span className="text-slate-600 dark:text-slate-400">Booking Fee</span>
              <span className="font-medium text-primary">₹{doctor?.bookingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Pay Now</span>
              <span className="font-bold text-primary text-lg">₹{doctor?.bookingFee.toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Consultation fee (₹{doctor?.fee.toFixed(2)}) to be paid at the clinic
            </p>
          </div>

          {/* Book button */}
          <button
            onClick={handleBookAppointment}
            disabled={booking}
            className="w-full bg-primary hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {booking ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Proceed to Payment</span>
                <ArrowForwardIcon />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 mt-4">
            By proceeding, you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
}
