import DoctorDetailsPageView from "./DoctorDetailsPageView";

export default async function Page(props: { params: Promise<{ doctorId: string }> }) {
	const params = await props.params;
	return <DoctorDetailsPageView doctorId={params.doctorId} />;
}

