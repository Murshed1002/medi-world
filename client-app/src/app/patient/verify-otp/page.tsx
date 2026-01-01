"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import TimerIcon from "@mui/icons-material/Timer";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";

export default function VerifyOtpPage() {
	const router = useRouter();
	const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
	const [countdown, setCountdown] = useState<number>(30);
	const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

	const isComplete = useMemo(() => otp.every((d) => /^\d$/.test(d)), [otp]);

	useEffect(() => {
		if (countdown <= 0) return;
		const id = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
		return () => clearInterval(id);
	}, [countdown]);

	const handleChange = (idx: number, value: string) => {
		const digit = value.replace(/\D/g, "").slice(0, 1);
		const next = [...otp];
		next[idx] = digit;
		setOtp(next);
		if (digit && idx < inputsRef.current.length - 1) {
			inputsRef.current[idx + 1]?.focus();
		}
	};

	const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace") {
			if (otp[idx]) {
				const next = [...otp];
				next[idx] = "";
				setOtp(next);
			} else if (idx > 0) {
				inputsRef.current[idx - 1]?.focus();
			}
			return;
		}
		if (e.key === "ArrowLeft" && idx > 0) {
			inputsRef.current[idx - 1]?.focus();
			return;
		}
		if (e.key === "ArrowRight" && idx < inputsRef.current.length - 1) {
			inputsRef.current[idx + 1]?.focus();
			return;
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
		if (!pasted) return;
		e.preventDefault();
		const next = Array(6)
			.fill("")
			.map((_, i) => pasted[i] ?? "");
		setOtp(next);
		// Focus last filled
		const lastIdx = Math.min(pasted.length - 1, inputsRef.current.length - 1);
		if (lastIdx >= 0) inputsRef.current[lastIdx]?.focus();
	};

	const onVerify = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isComplete) return;
		const code = otp.join("");
		console.log("Verify OTP:", code);
		router.push("/patient/home");
	};

	const onResend = () => {
		if (countdown > 0) return;
		console.log("Resend OTP");
		setCountdown(30);
	};

	const onBack = () => router.push("/patient/login");

	return (
		<div className="min-h-screen flex flex-col bg-gray-50 text-slate-900 dark:bg-[#101922] dark:text-slate-100">
			<header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
				<div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center size-10 rounded-xl bg-emerald-600/10 text-emerald-600">
							<LocalHospitalIcon className="text-2xl" />
						</div>
						<h2 className="text-xl font-bold tracking-tight">HealthQueue</h2>
					</div>
					<div className="flex items-center gap-4">
						<button className="text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 transition-colors hidden sm:block" type="button">
							Need Help?
						</button>
					</div>
				</div>
			</header>

			<main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
				<div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden relative">
					<div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-600/60 via-emerald-600 to-emerald-600/60" />

					<div className="px-8 py-10 sm:px-12 sm:py-12 flex flex-col items-center text-center">
						<div className="mb-6 rounded-full bg-emerald-50 dark:bg-emerald-900/30 p-4 ring-1 ring-emerald-100 dark:ring-emerald-800">
							<LockPersonIcon className="text-4xl text-emerald-600" />
						</div>
						<h1 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">Verification Required</h1>
						<p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-xs mx-auto mb-8">
							We've sent a 6-digit code to <span className="font-semibold text-slate-700 dark:text-slate-200">your number</span>. Please enter it below.
						</p>

						<form className="w-full flex flex-col gap-8" onSubmit={onVerify}>
							<div className="flex justify-center gap-2 sm:gap-3">
								{otp.map((val, i) => (
									<input
										key={i}
										aria-label={`Digit ${i + 1}`}
                                        ref={(el) => {
                                            inputsRef.current[i] = el;
                                        }}
										autoFocus={i === 0}
										className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-600"
										inputMode="numeric"
										maxLength={1}
										placeholder="-"
										type="text"
										value={val}
										onChange={(e) => handleChange(i, e.target.value)}
										onKeyDown={(e) => handleKeyDown(i, e)}
										onPaste={i === 0 ? handlePaste : undefined}
									/>
								))}
							</div>

							<div className="flex flex-col items-center gap-2">
								<div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-full">
									<TimerIcon className="text-lg" />
									<span>
										Resend code in <span className="text-emerald-600 font-bold font-mono">{String(Math.floor(countdown / 60)).padStart(2, "0")}:{String(countdown % 60).padStart(2, "0")}</span>
									</span>
								</div>
								<button
									className="text-sm font-semibold text-slate-400 dark:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60 hover:text-emerald-600 transition-colors"
									disabled={countdown > 0}
									type="button"
									onClick={onResend}
								>
									Resend OTP
								</button>
							</div>

							<button
								type="submit"
								disabled={!isComplete}
								className="flex w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold tracking-wide shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 active:scale-[0.98]"
							>
								<span className="mr-2">Verify &amp; Proceed</span>
								<ArrowForwardIcon />
							</button>
						</form>
					</div>

					<div className="bg-slate-50 dark:bg-slate-900/50 px-8 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-center">
						<button
							className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-white transition-colors"
							onClick={onBack}
							type="button"
						>
							<ArrowBackIcon className="text-lg" />
							Back to Login or Change Number
						</button>
					</div>
				</div>

				<div className="mt-8 flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
					<LockIcon className="text-sm" />
					<span>Secure 256-bit Encrypted Connection</span>
				</div>
			</main>
		</div>
	);
}

