import PaymentPageView from './PaymentPageView';

export default async function Page({
  params,
}: {
  params: Promise<{ paymentIntentId: string }>;
}) {
  const { paymentIntentId } = await params;
  return <PaymentPageView paymentIntentId={paymentIntentId} />;
}
