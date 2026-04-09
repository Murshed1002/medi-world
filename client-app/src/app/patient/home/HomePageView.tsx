"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import HomeQuickActions from "./components/HomeQuickActions";
import HomeQueueStatus from "./components/HomeQueueStatus";
import HomeAppointments from "./components/HomeAppointments";

interface BackendAppointment {
	id: string;
	patientFullName: string;
	appointmentDate: string;
	slotStartTime: string;
	slotEndTime: string;
	status: string;
	tokenNumber: number | null;
	doctor: { id: string; name: string; specialization: string; avatarUrl: string } | null;
	clinic: { id: string; name: string; address: string } | null;
}

function formatTime12h(timeStr: string) {
	const [h, m] = timeStr.split(":").map(Number);
	const ampm = h >= 12 ? "PM" : "AM";
	return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function isToday(dateStr: string) {
	const d = new Date(dateStr);
	const now = new Date();
	return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export default function HomePageView() {
	const router = useRouter();
	const nav = (path: string) => router.push(path);

	const [userName, setUserName] = useState("");
	const [appointments, setAppointments] = useState<BackendAppointment[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [profileRes, appointmentsRes] = await Promise.all([
					apiClient.get("/patients/profile"),
					apiClient.get("/appointments/getAllByUser"),
				]);
				setUserName(profileRes.data.fullName?.split(" ")[0] || "there");
				setAppointments(appointmentsRes.data || []);
			} catch (err) {
				console.error("Failed to load home data:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	// Transform backend appointments to the shape HomeAppointments expects
	const upcomingAppointments = appointments
		.filter((a) => new Date(a.appointmentDate) >= new Date(new Date().toDateString()))
		.sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
		.slice(0, 5)
		.map((a) => {
			const date = new Date(a.appointmentDate);
			const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			const today = isToday(a.appointmentDate);
			return {
				id: a.id,
				month: months[date.getMonth()],
				day: date.getDate(),
				doctorName: a.doctor?.name || "Doctor",
				tag: today ? "Today" : undefined,
				tagTone: today ? ("green" as const) : undefined,
				specialty: a.doctor?.specialization || "",
				title: a.patientFullName || "Appointment",
				time: formatTime12h(a.slotStartTime),
				location: a.clinic?.name || "Clinic",
				status: a.status === "CONFIRMED" ? ("scheduled" as const) : ("pending" as const),
			};
		});

	// Determine greeting based on time of day
	const hour = new Date().getHours();
	const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

	return (
		<div className="bg-gray-50 dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen flex flex-col">
			<main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 flex flex-col gap-10">
				<section className="flex flex-col gap-2">
					{loading ? (
						<div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
					) : (
						<p className="text-[#0d141b] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
							{greeting}, {userName}
						</p>
					)}
				</section>

				<HomeQuickActions nav={nav} />

				<section className="flex flex-col gap-4">
					<h2 className="text-[#0d141b] dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Live Queue Status</h2>
					<HomeQueueStatus queue={{
						position: 0,
						estWaitMinutes: 0,
						currentPatientNumber: 0,
						doctor: { name: "--", department: "--", room: "--" },
						lastUpdatedMinsAgo: 0,
					}} />
				</section>

				<section className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h2 className="text-[#0d141b] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Upcoming Appointments</h2>
						<button className="text-green-600 text-sm font-bold hover:underline flex items-center gap-1" onClick={() => nav("/patient/appointments")}>
							View All <span className="text-sm">→</span>
						</button>
					</div>

					{loading ? (
						<div className="flex flex-col gap-3">
							{[1, 2].map((i) => (
								<div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
							))}
						</div>
					) : upcomingAppointments.length > 0 ? (
						<HomeAppointments appointments={upcomingAppointments} />
					) : (
						<div className="p-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] text-center">
							<p className="text-slate-500 dark:text-slate-400 font-medium">No upcoming appointments</p>
							<button
								onClick={() => nav("/patient/doctors")}
								className="mt-3 text-green-600 font-bold text-sm hover:underline"
							>
								Book an appointment →
							</button>
						</div>
					)}
				</section>
			</main>
		</div>
	);
}
