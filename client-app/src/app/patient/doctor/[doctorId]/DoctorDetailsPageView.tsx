"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import SensorsIcon from "@mui/icons-material/Sensors";
import DoctorBreadcrumbs from "@/app/patient/doctor/[doctorId]/components/DoctorBreadcrumbs";
import DoctorProfileCard from "@/app/patient/doctor/[doctorId]/components/DoctorProfileCard";
import DoctorStats from "@/app/patient/doctor/[doctorId]/components/DoctorStats";
import DoctorAbout from "@/app/patient/doctor/[doctorId]/components/DoctorAbout";
import DoctorLocation from "@/app/patient/doctor/[doctorId]/components/DoctorLocation";
import DoctorReviews from "@/app/patient/doctor/[doctorId]/components/DoctorReviews";
import DoctorBookingSidebar from "@/app/patient/doctor/[doctorId]/components/DoctorBookingSidebar";

interface DoctorDetailsPageViewProps {
  doctorId: string;
}

export default function DoctorDetailsPageView({ doctorId }: DoctorDetailsPageViewProps) {
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get(`/doctors/${doctorId}`);
        setDoctor(response.data);
      } catch (err: any) {
        console.error('Failed to fetch doctor:', err);
        setError(err.response?.data?.message || 'Failed to load doctor details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  const nav = (path: string) => router.push(path);

  if (isLoading) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-text-secondary">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error loading doctor</div>
          <p className="text-text-secondary mb-4">{error || 'Doctor not found'}</p>
          <button
            onClick={() => router.push('/patient/doctors')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  // Format clinic hours
  const formatClinicHours = (hours: any) => {
    if (!hours || !Array.isArray(hours) || hours.length === 0) {
      return [];
    }
    return hours.map((h: any) => ({
      label: h.day || h.label,
      value: h.hours || h.value || `${h.open} - ${h.close}`,
    }));
  };

  // Generate Google Maps link
  const getMapLink = (lat: number | null, lng: number | null, address: string) => {
    if (lat && lng) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    // Fallback to address search
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const doctorData = {
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialization,
    qualification: doctor.qualifications,
    avatarUrl: doctor.avatarUrl,
    locationText: doctor.clinic,
    available: true,
    rating: doctor.rating,
    reviewCount: doctor.reviewsCount,
    recommendationRate: doctor.reviewsCount > 0 ? Math.round((doctor.rating / 5) * 100) : 0,
    stats: {
      yearsExp: doctor.experienceYears,
      patients: doctor.totalPatients || 0,
      languages: ["English"], // TODO: Add languages to schema
    },
    about: {
      paragraphs: [doctor.bio],
      tags: [doctor.specialization], // TODO: Add specializations/tags to schema
    },
    location: {
      hospital: doctor.clinicName,
      address: `${doctor.clinicAddress}, ${doctor.clinicCity}`,
      mapLink: getMapLink(doctor.clinicLatitude, doctor.clinicLongitude, `${doctor.clinicAddress}, ${doctor.clinicCity}`),
      hours: formatClinicHours(doctor.clinicHours),
      latitude: doctor.clinicLatitude,
      longitude: doctor.clinicLongitude,
    },
    fees: { 
      consultation: doctor.fee, 
      booking: doctor.bookingFee || doctor.fee * 0.1 
    },
    queue: {
      waiting: doctor.queueStatus?.waiting || 0,
      estWait: doctor.queueStatus?.estimatedWaitTime || 0,
    },
    nextSlot: doctor.nextAvailableSlot,
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <main className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DoctorBreadcrumbs items={["Home", doctorData.specialty, doctorData.name]} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <DoctorProfileCard doctor={doctorData} />
            <DoctorStats stats={doctorData.stats} />
            
            {/* Mobile: Queue status above About, Booking sidebar follows */}
            <div className="block lg:hidden space-y-4">
              <div className="bg-linear-to-r from-green-600 to-green-500 rounded-xl p-4 shadow-lg text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Live Queue Status</p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-3xl font-bold">{doctorData.queue.waiting}</h2>
                      <span className="text-sm opacity-90">Patients waiting</span>
                    </div>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <SensorsIcon className="animate-pulse" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-sm">
                  <span>Est. Wait Time:</span>
                  <span className="font-bold">{doctorData.queue.estWait} mins</span>
                </div>
              </div>
              
              <DoctorBookingSidebar
                doctorId={doctorId}
                queue={doctorData.queue}
                fees={doctorData.fees}
                nextSlot={doctorData.nextSlot}
                onBook={() => nav(`/patient/book-appointment/${doctorData.id}`)}
                onQueue={() => nav(`/patient/queue/883921`)}
              />
            </div>
            
            <DoctorAbout about={doctorData.about} />
            <DoctorLocation location={doctorData.location} />
            <DoctorReviews 
              rating={doctorData.rating} 
              count={doctorData.reviewCount}
              reviews={doctor.reviews}
            />
          </div>

          {/* Desktop sidebar on the right */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 flex flex-col gap-4">
              <DoctorBookingSidebar
                doctorId={doctorId}
                queue={doctorData.queue}
                fees={doctorData.fees}
                nextSlot={doctorData.nextSlot}
                onBook={() => nav(`/patient/book-appointment/${doctorData.id}`)}
                onQueue={() => nav(`/patient/queue/883921`)}
              />
              
              <div className="bg-linear-to-r from-green-600 to-green-500 rounded-xl p-4 shadow-lg text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Live Queue Status</p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-3xl font-bold">{doctorData.queue.waiting}</h2>
                      <span className="text-sm opacity-90">Patients waiting</span>
                    </div>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <SensorsIcon className="animate-pulse" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center text-sm">
                  <span>Est. Wait Time:</span>
                  <span className="font-bold">{doctorData.queue.estWait} mins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
