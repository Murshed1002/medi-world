"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import VerifiedIcon from "@mui/icons-material/Verified";

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

interface PatientProfile {
  fullName: string;
  phoneNumber: string;
  gender?: string;
  dateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

const GUARDIAN_RELATIONS = [
  { value: "", label: "Select Relation" },
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "spouse", label: "Spouse" },
  { value: "sibling", label: "Sibling" },
  { value: "child", label: "Child" },
  { value: "other", label: "Other" },
];

export default function BookAppointmentPageView({ doctorId }: { doctorId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Patient form state
  const [bookForSelf, setBookForSelf] = useState(false);
  const [patientFullName, setPatientFullName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("");

  // Cached profile for toggling
  const [profile, setProfile] = useState<PatientProfile | null>(null);

  // Get date and slot from URL params (passed from doctor details page)
  const selectedDate = searchParams.get('date');
  const selectedSlot = searchParams.get('slot');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorRes, profileRes] = await Promise.all([
          apiClient.get(`/doctors/${doctorId}`),
          apiClient.get("/patients/profile"),
        ]);

        const data = doctorRes.data;
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

        const p = profileRes.data;
        setProfile({
          fullName: p.fullName,
          phoneNumber: p.phoneNumber,
          gender: p.gender,
          dateOfBirth: p.dob,
          emergencyContactName: p.emergencyContactName,
          emergencyContactPhone: p.emergencyContactPhone,
          emergencyContactRelation: p.emergencyContactRelation,
        });
      } catch (err) {
        setError("Failed to load details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId]);

  const handleBookForSelfToggle = () => {
    const next = !bookForSelf;
    setBookForSelf(next);
    if (next && profile) {
      setPatientFullName(profile.fullName || "");
      setPatientPhone(profile.phoneNumber || "");
      setPatientGender(profile.gender?.toLowerCase() || "");
      if (profile.dateOfBirth) {
        const age = Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        setPatientAge(age > 0 ? String(age) : "");
      } else {
        setPatientAge("");
      }
      setGuardianName(profile.emergencyContactName || "");
      setGuardianPhone(profile.emergencyContactPhone || "");
      setGuardianRelation(profile.emergencyContactRelation?.toLowerCase() || "");
    } else {
      setPatientFullName("");
      setPatientPhone("");
      setPatientAge("");
      setPatientGender("");
      setGuardianName("");
      setGuardianPhone("");
      setGuardianRelation("");
    }
  };

  const parseSlotTime = (slot: string): { start: string; end: string } => {
    const [time, period] = slot.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;

    const start = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const endMinutes = minutes + 30;
    const endHour = hour24 + Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const end = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

    return { start, end };
  };

  const handleBookAppointment = async () => {
    if (!doctor || !selectedDate || !selectedSlot) return;
    if (!patientFullName.trim() || !patientPhone.trim()) {
      setError("Patient name and phone number are required");
      return;
    }
    if (!patientAge || !patientGender) {
      setError("Patient age and gender are required");
      return;
    }

    try {
      setBooking(true);
      setError(null);
      const { start, end } = parseSlotTime(selectedSlot);

      const payload: Record<string, string | number> = {
        doctorId: doctor.id,
        clinicId: doctor.clinicId,
        appointmentDate: selectedDate,
        slotStartTime: start,
        slotEndTime: end,
        patientFullName: patientFullName.trim(),
        patientAge: Number(patientAge),
        patientGender: patientGender,
        patientPhone: patientPhone.trim(),
      };

      if (guardianName.trim()) payload.guardianName = guardianName.trim();
      if (guardianPhone.trim()) payload.guardianPhone = guardianPhone.trim();
      if (guardianRelation) payload.guardianRelation = guardianRelation;

      const response = await apiClient.post('/appointments/create', payload);
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
          <button onClick={() => router.back()} className="text-primary hover:underline">Go Back</button>
        </div>
      </div>
    );
  }

  if (!selectedDate || !selectedSlot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No appointment details provided</p>
          <button onClick={() => router.back()} className="text-primary hover:underline">Go Back to Doctor</button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const { start: slotStart, end: slotEnd } = parseSlotTime(selectedSlot);
  const formatDisplay = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary mb-4 text-sm font-medium"
          >
            <ArrowBackIcon fontSize="small" />
            <span>Back to Doctor</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Confirm Appointment
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Please review the details and provide patient information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Forms */}
          <div className="lg:col-span-8 space-y-8">
            {/* Patient Information */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 p-6 md:p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <PersonIcon className="text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Patient Information</h2>
              </div>

              {/* Book for Self Toggle */}
              <div
                onClick={handleBookForSelfToggle}
                className={`flex items-center justify-between p-4 mb-8 rounded-2xl cursor-pointer transition-all border-2 ${
                  bookForSelf
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500"
                    : "bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      bookForSelf ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-500"
                    }`}
                  >
                    {bookForSelf && <CheckIcon className="text-white" style={{ fontSize: 14 }} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Booking for myself</p>
                    <p className={`text-xs font-medium ${bookForSelf ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500"}`}>
                      Use your profile details to autofill
                    </p>
                  </div>
                </div>
                {bookForSelf && (
                  <span className="text-xs font-bold text-emerald-600 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-700 shadow-sm">
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={patientFullName}
                    onChange={(e) => setPatientFullName(e.target.value)}
                    placeholder="e.g. Arjun Sharma"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-slate-50/50 dark:bg-slate-700/50 dark:text-white"
                    readOnly={bookForSelf}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+91 00000 00000"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-slate-50/50 dark:bg-slate-700/50 dark:text-white"
                    readOnly={bookForSelf}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Age
                  </label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="e.g. 28"
                    min="0"
                    max="150"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-slate-50/50 dark:bg-slate-700/50 dark:text-white"
                    readOnly={bookForSelf}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      disabled={bookForSelf}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none bg-slate-50/50 dark:bg-slate-700/50 dark:text-white pr-10 disabled:opacity-70"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">
                      ▾
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Guardian Details */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <FamilyRestroomIcon className="text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Guardian Details</h2>
                </div>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Optional
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-slate-50/50 dark:bg-slate-700/50 dark:text-white"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Relation
                  </label>
                  <div className="relative">
                    <select
                      value={guardianRelation}
                      onChange={(e) => setGuardianRelation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none bg-slate-50/50 dark:bg-slate-700/50 dark:text-white pr-10"
                    >
                      {GUARDIAN_RELATIONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">
                      ▾
                    </span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Guardian Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="Enter guardian mobile number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-slate-50/50 dark:bg-slate-700/50 dark:text-white"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Summary Card (Sticky) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 overflow-hidden">
              {/* Doctor header */}
              <div className="bg-emerald-900 dark:bg-emerald-950 p-6 md:p-8 text-white">
                <h3 className="text-lg font-bold mb-6">Appointment Summary</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {doctor?.avatarUrl ? (
                      <img
                        src={doctor.avatarUrl}
                        alt={doctor?.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-700/50 shadow-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-emerald-800 flex items-center justify-center border-2 border-emerald-700/50">
                        <PersonIcon className="text-emerald-300" style={{ fontSize: 32 }} />
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-emerald-900 rounded-full flex items-center justify-center">
                      <VerifiedIcon style={{ fontSize: 10 }} className="text-white" />
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg leading-tight">{doctor?.name}</h4>
                    <p className="text-emerald-300 text-sm font-medium">{doctor?.specialization}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 md:p-8">
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                    <div className="flex items-center">
                      <CalendarMonthIcon className="text-slate-400 mr-3" fontSize="small" />
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Date</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">{formattedDate}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                    <div className="flex items-center">
                      <ScheduleIcon className="text-slate-400 mr-3" fontSize="small" />
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Time</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">
                      {formatDisplay(slotStart)} - {formatDisplay(slotEnd)}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Fee */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Total Booking Fee</span>
                    <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">₹{doctor?.bookingFee.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Consultation fee (₹{doctor?.fee.toFixed(2)}) to be paid at the clinic
                  </p>
                </div>

                {/* Book Button */}
                <button
                  onClick={handleBookAppointment}
                  disabled={booking}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-emerald-200 dark:shadow-none active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {booking ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Payment</span>
                      <ArrowForwardIcon fontSize="small" />
                    </>
                  )}
                </button>

                <p className="mt-6 text-[11px] text-center text-slate-400 leading-relaxed">
                  By clicking proceed, you agree to our{" "}
                  <a className="text-emerald-600 font-bold hover:underline" href="#">Terms &amp; Conditions</a>{" "}
                  and{" "}
                  <a className="text-emerald-600 font-bold hover:underline" href="#">Privacy Policy</a>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
