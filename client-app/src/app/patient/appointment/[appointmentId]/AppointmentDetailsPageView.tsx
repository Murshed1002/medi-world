"use client";

import { useRouter, useParams } from "next/navigation";
import AppointmentBreadcrumbs from "./components/AppointmentBreadcrumbs";
import AppointmentMainCard from "./components/AppointmentMainCard";
import AppointmentBottomLinks from "./components/AppointmentBottomLinks";
import CancelIcon from "@mui/icons-material/Cancel";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

export default function AppointmentDetailsPageView() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params?.appointmentId as string;
  
  const nav = (path: string) => router.push(path);
  const onQueue = () => router.push(`/patient/queue/${appointmentId}`);
  
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!appointmentId) return;
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get(`/appointments/getById/${appointmentId}`);
        console.log("Fetched appointment details:", response.data);
        setAppointmentDetails(response.data);
      } catch (err: any) {
        console.error("Error fetching appointment details:", err);
        setError(err.response?.data?.message || "Failed to load appointment details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId]);

  if (isLoading) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">Loading appointment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push("/patient/appointments")}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display min-h-screen flex flex-col overflow-x-hidden transition-colors">
      <main className="grow w-full px-4 py-6 md:px-8 lg:px-0 lg:py-10">
        <div className="mx-auto max-w-4xl flex flex-col gap-6">
          <AppointmentBreadcrumbs nav={nav} />
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Appointment Details</h2>
              <p className="text-text-secondary mt-1">View booking information and manage your visit.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-[#e7f3eb] dark:border-[#2a4533] bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors" onClick={() => nav("/patient/appointments")}> 
                <CancelIcon className="text-[18px]" />
                Cancel
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-[#e7f3eb] dark:border-[#2a4533] bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" onClick={() => nav(`/patient/appointment/${appointmentId}`)}>
                <CalendarMonthIcon className="text-[18px]" />
                Reschedule
              </button>
            </div>
          </div>
          <AppointmentMainCard appointment={appointmentDetails} onQueue={onQueue} />
        </div>

        <AppointmentBottomLinks />
      </main>
    </div>
  );
}
