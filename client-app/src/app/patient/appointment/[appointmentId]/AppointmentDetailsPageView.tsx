"use client";

import { useRouter } from "next/navigation";
import AppointmentHeader from "./components/AppointmentHeader";
import AppointmentBreadcrumbs from "./components/AppointmentBreadcrumbs";
import AppointmentMainCard from "./components/AppointmentMainCard";
import AppointmentBottomLinks from "./components/AppointmentBottomLinks";
import CancelIcon from "@mui/icons-material/Cancel";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

// Mock appointment data (kept at top)
const mockAppointment = {
  id: "883921",
  status: "confirmed" as const,
  doctor: {
    name: "Dr. Sarah Jenkins",
    specialization: "Cardiologist",
    qualification: "MBBS, MD",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAS3QSkGqhcrFqFBwTStHRFeInAJahA1o1430CafVvs5FrGH7tiD1WJUAdCalfNJ5ne3yAGJL5-Z5a-rmYOAvN0MoNeA1xjdCFoYHqz0G3fCagdSZwRRJhcB92jf9ykg_L0mXD77CNRRNV3j3spBbyrKlsGf_JkA7v5IRPkJhuxN9FF5XHD06lUli3NDJurRVtS2zeppC56fNaXXpV3b-GbcGE58x9EVkMeUUX4AF2zCYNJJZ_vdJ9J17srxfsKH9FarFjBXMeNrqs",
  },
  schedule: {
    dateText: "Wednesday, Oct 24, 2023",
    timeText: "10:30 AM - 11:00 AM",
  },
  location: {
    hospital: "City General Hospital",
    details: "Building B, Room 304",
    address: "123 Health Avenue, Medical District, NY 10001",
    mapImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARvmOM8r7x0BoJIlgGtzyXoJsVfQhW8fdgk8mGFAmmSpSoNy-VCuYPatThAKMO3z-uduVrB5BQ184E7wiogDbLudyexIGxNi9-lFN_bxGl5bN_LLDwWG1U16Gy_2KlkVv0yyoVn7Hj7bCfe_-AJ4NKgKusR4k0xps_-tEZSWWhAgbu3vnO8_slEhaTUfkIez4K4tQC_yOpT23TlFD3wIobgyrwDZLFSlEl7BzMjJFB2TLyuo0gb7oXRaTtrs6dATcXyO5wVxWIfpY",
  },
  patient: {
    name: "John Doe",
    age: 34,
    gender: "Male",
  },
  guardian: {
    name: "Jane Doe",
    relationship: "Spouse",
  },
  payment: {
    consultationFee: 50,
    bookingFee: 5,
  },
  userAvatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC0z8HEjghVBINKiDY2pmYjjL0HSrBA2CZu9k9ZFk_np0ID56O3Pa31CLNp5MbD_nlqSnLfI-Gjla9cX0D74yq4eP_3UJCCMTO0zcggJNeSVgUbRpDa7jHEuJxdH1nepHKZOtUvC2nOh8smJIzoim8bBsE9I93X3q8phWjxHkOoO1_6VL3d37oygRHLZB8E4hAewCul10YFTWd7p1WBz3KiRBcSO3OqremkcfnJX0a76QfTB5JwGWTTyG9DUlmfnreZlSI_ImvPsso",
};

export default function AppointmentDetailsPageView() {
  const router = useRouter();
  const nav = (path: string) => router.push(path);
  const onQueue = () => router.push(`/patient/queue/${mockAppointment.id}`);

  const total = mockAppointment.payment.consultationFee + mockAppointment.payment.bookingFee;

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display min-h-screen flex flex-col overflow-x-hidden transition-colors">
      <AppointmentHeader avatarUrl={mockAppointment.userAvatar} nav={nav} />

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
              <button className="flex items-center gap-2 rounded-lg border border-[#e7f3eb] dark:border-[#2a4533] bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" onClick={() => nav(`/patient/appointment/${mockAppointment.id}`)}>
                <CalendarMonthIcon className="text-[18px]" />
                Reschedule
              </button>
            </div>
          </div>

          <AppointmentMainCard appointment={mockAppointment} total={total} onQueue={onQueue} />
        </div>

        <AppointmentBottomLinks />
      </main>
    </div>
  );
}
