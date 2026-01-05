"use client";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PaymentsIcon from "@mui/icons-material/Payments";
import InfoIcon from "@mui/icons-material/Info";
import SensorsIcon from "@mui/icons-material/Sensors";

export default function AppointmentMainCard({
  appointment,
  total,
  onQueue,
}: {
  appointment: {
    id: string;
    status: "confirmed" | "pending" | "cancelled";
    doctor: { name: string; specialization: string; qualification: string; avatarUrl: string };
    schedule: { dateText: string; timeText: string };
    location: { hospital: string; details: string; address: string; mapImage: string };
    patient: { name: string; age: number; gender: string };
    guardian: { name: string; relationship: string };
    payment: { consultationFee: number; bookingFee: number };
  };
  total: number;
  onQueue: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-surface-light dark:bg-surface-dark shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/5 dark:ring-white/10">
      {/* Header */}
      <div className="border-b border-[#e7f3eb] dark:border-[#2a4533] p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-5">
            <div className="size-20 shrink-0 overflow-hidden rounded-full border-2 border-white dark:border-[#2a4533] shadow-sm">
              <img src={appointment.doctor.avatarUrl} alt={appointment.doctor.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col pt-1">
              <h3 className="text-xl font-bold">{appointment.doctor.name}</h3>
              <p className="text-text-secondary font-medium">
                {appointment.doctor.specialization} • {appointment.doctor.qualification}
              </p>
              <p className="mt-1 text-xs font-semibold text-text-secondary uppercase tracking-wider">Appointment ID: #{appointment.id}</p>
            </div>
          </div>
          <div className="flex items-center self-start rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-sm font-bold text-green-700 dark:text-green-400">
            <CheckCircleIcon className="text-[18px] mr-1.5" /> Confirmed
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Left details */}
        <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-[#e7f3eb] dark:border-[#2a4533] p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
            <div className="group flex flex-col gap-1">
              <div className="flex items-center gap-2 text-text-secondary mb-1">
                <ScheduleIcon className="text-[20px]" />
                <span className="text-sm font-semibold uppercase tracking-wide">Date & Time</span>
              </div>
              <p className="text-base font-bold">{appointment.schedule.dateText}</p>
              <p className="text-base font-normal dark:text-gray-300">{appointment.schedule.timeText}</p>
            </div>

            <div className="group flex flex-col gap-1">
              <div className="flex items-center gap-2 text-text-secondary mb-1">
                <LocationOnIcon className="text-[20px]" />
                <span className="text-sm font-semibold uppercase tracking-wide">Location</span>
              </div>
              <p className="text-base font-bold">{appointment.location.hospital}</p>
              <p className="text-base font-normal dark:text-gray-300">{appointment.location.details}</p>
            </div>

            <div className="group flex flex-col gap-1 pt-4 border-t border-[#f0f7f2] dark:border-white/5 sm:border-t-0 sm:pt-0">
              <div className="flex items-center gap-2 text-text-secondary mb-1">
                <PersonIcon className="text-[20px]" />
                <span className="text-sm font-semibold uppercase tracking-wide">Patient</span>
              </div>
              <p className="text-base font-bold">{appointment.patient.name}</p>
              <p className="text-sm text-text-secondary">Age: {appointment.patient.age} • {appointment.patient.gender}</p>
            </div>

            <div className="group flex flex-col gap-1 pt-4 border-t border-[#f0f7f2] dark:border-white/5 sm:border-t-0 sm:pt-0">
              <div className="flex items-center gap-2 text-text-secondary mb-1">
                <SupervisorAccountIcon className="text-[20px]" />
                <span className="text-sm font-semibold uppercase tracking-wide">Guardian</span>
              </div>
              <p className="text-base font-bold">{appointment.guardian.name}</p>
              <p className="text-sm text-text-secondary">Relationship: {appointment.guardian.relationship}</p>
            </div>
          </div>

          <div className="mt-8 rounded-lg bg-[#f8fcf9] dark:bg-background-dark p-5">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-secondary flex items-center gap-2">
              <PaymentsIcon className="text-[20px]" /> Payment Details
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="dark:text-gray-300">Consultation Fee</span>
                <span className="font-medium">${appointment.payment.consultationFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="dark:text-gray-300">Booking Fee</span>
                <span className="font-medium">${appointment.payment.bookingFee.toFixed(2)}</span>
              </div>
              <div className="my-2 h-px bg-[#e7f3eb] dark:bg-[#2a4533]"></div>
              <div className="flex justify-between text-base font-bold">
                <span>Total Amount</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col bg-[#fbfdfc] dark:bg-background-dark/50 p-6 sm:p-8 justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-wide text-text-secondary">Hospital Map</span>
              <button className="text-sm font-bold text-primary hover:underline">Get Directions</button>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200 shadow-inner relative group cursor-pointer">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${appointment.location.mapImage})` }}
                aria-label={`Map for ${appointment.location.hospital}`}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                <div className="bg-white/90 p-2 rounded-full shadow-lg">
                  <LocationOnIcon className="text-red-500" />
                </div>
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-2">{appointment.location.address}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 flex gap-3 items-start">
              <InfoIcon className="text-blue-600 dark:text-blue-400 text-sm mt-0.5" />
              <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                Please arrive 15 minutes early. The live queue updates in real-time.
              </p>
            </div>
            <button
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-6 py-4 text-center font-bold text-text-main shadow-[0_4px_14px_rgba(19,236,91,0.4)] transition-all hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-[0_6px_20px_rgba(19,236,91,0.6)] active:translate-y-0 active:shadow-none"
              onClick={onQueue}
            >
              <SensorsIcon className="text-[24px] transition-transform group-hover:scale-110" />
              <span className="text-lg">View Live Queue Status</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
