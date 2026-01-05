"use client";

import { useRouter } from "next/navigation";
import DoctorHeader from "@/app/patient/doctor/[doctorId]/components/DoctorHeader";
import DoctorBreadcrumbs from "@/app/patient/doctor/[doctorId]/components/DoctorBreadcrumbs";
import DoctorProfileCard from "@/app/patient/doctor/[doctorId]/components/DoctorProfileCard";
import DoctorStats from "@/app/patient/doctor/[doctorId]/components/DoctorStats";
import DoctorAbout from "@/app/patient/doctor/[doctorId]/components/DoctorAbout";
import DoctorLocation from "@/app/patient/doctor/[doctorId]/components/DoctorLocation";
import DoctorReviews from "@/app/patient/doctor/[doctorId]/components/DoctorReviews";
import DoctorBookingSidebar from "@/app/patient/doctor/[doctorId]/components/DoctorBookingSidebar";

const mockDoctor = {
  id: "dr-emily-chen",
  name: "Dr. Emily Chen",
  specialty: "Cardiologist",
  qualification: "MBBS, MD (Cardiology)",
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDJq3_Kl8kbLdC2nVlBvj6VQhmyhIb6Tui5SvwUslPxJLT7Y9IbXfjaFSVI9d0IGe6ISlXp_2QQXHOVVBbxq_wedHamSoUNs24hLXSWom6d3yj_vovjIHg7F7hJDjoxiu-xFcBXt1OA183gS2_J1XMsfxhcAALE1ivMPkFgrs8EGXHeIVIo7ksPCYOHaPhuztTUxTlG3k2NCbZ6aJjAFlxx3mN1o_BvoZe0FUCzx-5i27cnxMG7ds50SbLt4pbI66f2YBNlYW6806c",
  locationText: "City General Hospital, Wing B, New York",
  available: true,
  rating: 4.8,
  reviewCount: 124,
  recommendationRate: 98,
  stats: { yearsExp: 15, patients: 5000, languages: ["En", "Es", "Fr"] },
  about: {
    paragraphs: [
      "Dr. Emily Chen is a highly skilled Cardiologist with over 15 years of experience in diagnosing and treating cardiovascular diseases. She specializes in interventional cardiology, echocardiography, and preventive cardiology.",
      "She completed her MD in Cardiology from Harvard Medical School and has served as a senior consultant at several prestigious hospitals. Dr. Chen is dedicated to providing patient-centered care and is known for her compassionate approach.",
    ],
    tags: ["Interventional Cardiology", "Heart Failure", "Angioplasty", "Hypertension"],
  },
  location: {
    hospital: "City General Hospital",
    address: "Wing B, Room 304, 123 Medical Plaza Ave, New York, NY 10001",
    mapImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBDUWZjrNUr9h39gQr17eKDmaoK1OMRjTHZJjLiMTz4w6fkMqndY04X7w1UfeBYhmrgPvZu3uXKQgUV5faFkBdRiq19V2o6T8-rg7gixAcOIQ9CtUZXoiH6GXaqysdhuW4-u6HN3zmezRinNXkROvTtDsiCx6HYUSz5rj1mVnoSrDJzXgkDzAnEwyKjwOmh60FmNOkMnFfWYBHyHqLUvr2lK8MbdliBiekzafpTS2HvppC0Hvl_DIWO-PvnQsY0Wil0Sp-zhe3gspg",
    hours: [
      { label: "Mon - Fri", value: "09:00 AM - 05:00 PM" },
      { label: "Sat", value: "10:00 AM - 02:00 PM" },
    ],
  },
  fees: { consultation: 120, booking: 15 },
};

export default function DoctorDetailsPageView() {
  const router = useRouter();
  const nav = (path: string) => router.push(path);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      <DoctorHeader nav={nav} />

      <main className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DoctorBreadcrumbs items={["Home", mockDoctor.specialty, mockDoctor.name]} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <DoctorProfileCard doctor={mockDoctor} />
            <DoctorStats stats={mockDoctor.stats} />
            {/* Mobile booking sidebar placed above About */}
            <div className="block lg:hidden">
              <DoctorBookingSidebar
                queue={{ waiting: 12, estWait: 45 }}
                fees={mockDoctor.fees}
                onBook={() => nav(`/patient/book-appointment/${mockDoctor.id}`)}
                onQueue={() => nav(`/patient/queue/883921`)}
              />
            </div>
            <DoctorAbout about={mockDoctor.about} />
            <DoctorLocation location={mockDoctor.location} />
            <DoctorReviews rating={mockDoctor.rating} count={mockDoctor.reviewCount} />
          </div>

          {/* Desktop sidebar on the right */}
          <div className="hidden lg:block lg:col-span-4">
            <DoctorBookingSidebar
              queue={{ waiting: 12, estWait: 45 }}
              fees={mockDoctor.fees}
              onBook={() => nav(`/patient/book-appointment/${mockDoctor.id}`)}
              onQueue={() => nav(`/patient/queue/883921`)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
