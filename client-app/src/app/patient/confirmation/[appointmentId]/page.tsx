export default async function ConfirmationPage({
	params,
}: {
	params: Promise<{ appointmentId: string }>;
}) {
	const { appointmentId } = await params;
	return (
		<div className="mx-auto max-w-3xl px-6 py-10">
			<h1 className="text-2xl font-bold">Appointment Confirmed</h1>
			<p className="text-slate-600 mt-2">Reference: {appointmentId}</p>
		</div>
	);
}
