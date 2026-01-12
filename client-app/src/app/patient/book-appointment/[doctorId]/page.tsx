import BookAppointmentPageView from './BookAppointmentPageView';

export default async function Page({params}: {params: Promise<{ doctorId: string }>}) {
    const { doctorId } = await params;
    return <BookAppointmentPageView doctorId={doctorId} />;
}


