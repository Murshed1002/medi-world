"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface Appointment {
  id: string;
  appointmentDate: string;
  slotStartTime: string;
  slotEndTime: string;
  status: string;
  tokenNumber: number;
  doctor: {
    id: string;
    name: string;
    specialization: string;
  };
  clinic: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
  payment: {
    amount: number;
    status: string;
  };
}

export default function ConfirmationPageView({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await apiClient.get(`/appointments/${appointmentId}`);
        setAppointment(response.data);
      } catch (err) {
        console.error('Failed to fetch appointment:', err);
        setError('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const formatTime = (timeStr: string) => {
    // timeStr is in HH:mm format
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Appointment not found'}</p>
          <button onClick={() => router.push('/patient/home')} className="text-primary hover:underline">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-6 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="text-green-600 dark:text-green-400" style={{ fontSize: 48 }} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Appointment Confirmed!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your appointment has been successfully booked
          </p>
        </div>

        {/* Queue token card */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-90">Your Queue Token</span>
            <ConfirmationNumberIcon />
          </div>
          <div className="text-5xl font-bold mb-2">#{appointment.tokenNumber}</div>
          <p className="text-sm opacity-90">
            Show this token number at the clinic reception
          </p>
        </div>

        {/* Appointment details */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Appointment Details
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <PersonIcon className="text-primary mt-1" />
              <div className="flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Doctor</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {appointment.doctor.name}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {appointment.doctor.specialization}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <LocalHospitalIcon className="text-primary mt-1" />
              <div className="flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Clinic</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {appointment.clinic.name}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {appointment.clinic.address}, {appointment.clinic.city}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <CalendarMonthIcon className="text-primary mt-1" />
              <div className="flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {formatDate(appointment.appointmentDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <AccessTimeIcon className="text-primary mt-1" />
              <div className="flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Time</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {formatTime(appointment.slotStartTime)} - {formatTime(appointment.slotEndTime)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">Booking Fee Paid</span>
              <span className="font-medium text-green-600">₹{appointment.payment.amount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              * Consultation fee to be paid at the clinic
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/patient/appointments')}
            className="w-full bg-primary hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>View All Appointments</span>
            <ArrowForwardIcon />
          </button>
          
          <button
            onClick={() => router.push('/patient/home')}
            className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-3 px-6 rounded-xl border border-slate-200 dark:border-slate-700 transition-all duration-200"
          >
            Back to Home
          </button>
        </div>

        {/* Additional info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-200 font-medium mb-1">
            Important Information
          </p>
          <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <li>• Please arrive 10 minutes before your scheduled time</li>
            <li>• Bring any relevant medical records or test results</li>
            <li>• Your queue token number is #{appointment.tokenNumber}</li>
            <li>• Check in at the clinic reception upon arrival</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
