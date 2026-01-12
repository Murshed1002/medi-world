import ConfirmationPageView from './ConfirmationPageView';

export default async function ConfirmationPage({
	params,
}: {
	params: Promise<{ appointmentId: string }>;
}) {
	const { appointmentId } = await params;
	return <ConfirmationPageView appointmentId={appointmentId} />;
}
