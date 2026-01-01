"use client";

import { useRouter } from "next/navigation";
import HomeHeader from "./components/HomeHeader";
import HomeQuickActions from "./components/HomeQuickActions";
import HomeQueueStatus from "./components/HomeQueueStatus";
import HomeAppointments from "./components/HomeAppointments";

// Mock data (kept separate at the top)
const mock = {
	userName: "Alex",
	queue: {
		position: 7,
		estWaitMinutes: 15,
		currentPatientNumber: 4,
		doctor: {
			name: "Dr. Sarah Smith",
			department: "Cardiology",
			room: "Room 304",
		},
		lastUpdatedMinsAgo: 2,
	},
	avatarUrl:
		"https://lh3.googleusercontent.com/aida-public/AB6AXuAFg96Jl2V2TcjSgO8w15fMJdB5vz8HvV-wXSCuHEeZrr6dlsqVYeeNcET993oJmzmEWKl_mIfJde00ZUNabT8vmxoRu4OsD6TufDWtM3ht4ajCdrAWaVN2S3Gpm-Pa36j9KR5Pk8z0C2ZbAmLEdsNBOjo-dzLh60sOF35frEAkVwotZkAotMIpMSYno0eTvjDPiZIWRlX0amvQ01_4TVUO1aKmjFnwbsCr5bwLrxnRQDlmrLeuwENadg9HZgh7lWQNRG4TZE8JzIY",
	appointments: [
		{
			id: "appt-1",
			month: "Oct",
			day: 24,
			doctorName: "Dr. Sarah Smith",
			tag: "Today",
			tagTone: "green",
			specialty: "Cardiology",
			title: "General Checkup",
			time: "10:30 AM",
			location: "Room 304",
			status: "scheduled",
		},
		{
			id: "appt-2",
			month: "Nov",
			day: 2,
			doctorName: "Dr. Michael Ross",
			specialty: "Dermatology",
			title: "Consultation",
			time: "04:15 PM",
			location: "Online Meeting",
			status: "pending",
		},
	],
};

export default function HomePageView() {
	const router = useRouter();
	const nav = (path: string) => router.push(path);

	return (
		<div className="bg-gray-50 dark:bg-[#101922] text-[#0d141b] dark:text-slate-100 min-h-screen flex flex-col">
			<HomeHeader nav={nav} avatarUrl={mock.avatarUrl} />

			<main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 flex flex-col gap-10">
				<section className="flex flex-col gap-2">
					<p className="text-[#0d141b] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
						Good Morning, {mock.userName}
					</p>
				</section>

				<HomeQuickActions nav={nav} />

				<section className="flex flex-col gap-4">
					<h2 className="text-[#0d141b] dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Live Queue Status</h2>
					<HomeQueueStatus queue={mock.queue} />
				</section>

				<section className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h2 className="text-[#0d141b] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Upcoming Appointments</h2>
						<button className="text-green-600 text-sm font-bold hover:underline flex items-center gap-1" onClick={() => nav("/patient/appointments")}>
							View All <span className="text-sm">→</span>
						</button>
					</div>

					<HomeAppointments appointments={mock.appointments} />
				</section>
			</main>
		</div>
	);
}
