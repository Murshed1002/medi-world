import { redirect } from "next/navigation";

export default async function Page({params}: {params: Promise<{ appointmentId: string }>}) {
    //do the booking related call to backend
    const { appointmentId } = await params;
    const paymentIntentId = `apt-${appointmentId}`;
    redirect(`/payment/${paymentIntentId}`);
}

