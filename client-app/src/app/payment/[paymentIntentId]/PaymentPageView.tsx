"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import PaymentIcon from "@mui/icons-material/Payment";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ShieldIcon from "@mui/icons-material/Shield";

type PaymentStatusType = "CREATED" | "PENDING" | "PAID" | "FAILED";

interface Payment {
  id: string;
  amount: number | string;
  currency: string;
  status: PaymentStatusType;
  referenceType: string;
  referenceId: string;
}

async function fetchPayment(id: string): Promise<Payment> {
  try {
    const response = await apiClient.get(`/payments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payment:', error);
    throw error;
  }
}

export default function PaymentPageView({ paymentIntentId }: { paymentIntentId: string }) {
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [status, setStatus] = useState<PaymentStatusType>("CREATED");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadPayment = async () => {
      try {
        const paymentData = await fetchPayment(paymentIntentId);
        if (!mounted) return;
        setPayment(paymentData);
        setStatus(paymentData.status);
      } catch (err) {
        console.error('Failed to load payment:', err);
        if (mounted) {
          setError('Failed to load payment details');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadPayment();
    
    return () => {
      mounted = false;
    };
  }, [paymentIntentId, router]);

  const handlePayment = async () => {
    if (!payment) return;
    
    try {
      setStatus("PENDING");
      
      // ============================================================================
      // DEVELOPMENT MODE - Mock Payment (Currently Active)
      // ============================================================================
      // Simulate payment gateway response time
      await new Promise((r) => setTimeout(r, 1200));
      
      // Send payment verification data
      // Backend will determine if it's dev mode and bypass accordingly
      await apiClient.post(`/payments/${paymentIntentId}/verify`, {
        paymentId: paymentIntentId,
        providerOrderId: `order_${Date.now()}`,
        providerPaymentId: `pay_${Date.now()}`,
        signature: `sig_${Date.now()}`,
      });
      
      setStatus('PAID');
      
      setTimeout(() => {
        if (payment.referenceType === 'APPOINTMENT') {
          router.push(`/patient/confirmation/${payment.referenceId}`);
        }
      }, 1000);
      
      // ============================================================================
      // PRODUCTION MODE - Razorpay Integration (Commented Out)
      // ============================================================================
      // Step 1: Load Razorpay SDK dynamically (if not already loaded)
      // const loadRazorpay = () => {
      //   return new Promise((resolve) => {
      //     const script = document.createElement('script');
      //     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      //     script.onload = () => resolve(true);
      //     script.onerror = () => resolve(false);
      //     document.body.appendChild(script);
      //   });
      // };
      //
      // const razorpayLoaded = await loadRazorpay();
      // if (!razorpayLoaded) {
      //   throw new Error('Failed to load Razorpay SDK');
      // }
      //
      // Step 2: Create Razorpay order from backend
      // const orderResponse = await apiClient.post(`/payments/${paymentIntentId}/create-order`);
      // const { provider_order_id, amount, currency } = orderResponse.data;
      //
      // Step 3: Configure Razorpay options
      // const options = {
      //   key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Add to .env.local
      //   amount: amount * 100, // Razorpay expects amount in paise
      //   currency: currency,
      //   name: 'MediWorld',
      //   description: payment.reference_type === 'APPOINTMENT' ? 'Appointment Booking' : 'Payment',
      //   order_id: provider_order_id,
      //   handler: async (response: any) => {
      //     // Payment successful - verify with backend
      //     try {
      //       await apiClient.post(`/payments/${paymentIntentId}/verify`, {
      //         payment_id: paymentIntentId,
      //         provider_order_id: response.razorpay_order_id,
      //         provider_payment_id: response.razorpay_payment_id,
      //         signature: response.razorpay_signature,
      //       });
      //       
      //       setStatus('PAID');
      //       
      //       setTimeout(() => {
      //         if (payment.reference_type === 'APPOINTMENT') {
      //           router.push(`/patient/confirmation/${payment.reference_id}`);
      //         }
      //       }, 1000);
      //     } catch (err) {
      //       console.error('Payment verification failed:', err);
      //       setStatus('FAILED');
      //     }
      //   },
      //   modal: {
      //     ondismiss: () => {
      //       // User closed the payment modal
      //       setStatus('FAILED');
      //     }
      //   },
      //   prefill: {
      //     name: '', // Get from user profile
      //     email: '', // Get from user profile
      //     contact: '', // Get from user profile
      //   },
      //   theme: {
      //     color: '#16a34a', // Green-600 to match our theme
      //   },
      //   retry: {
      //     enabled: true,
      //     max_count: 3,
      //   },
      // };
      //
      // Step 4: Open Razorpay payment modal
      // const razorpay = new (window as any).Razorpay(options);
      // razorpay.on('payment.failed', (response: any) => {
      //   console.error('Payment failed:', response.error);
      //   setStatus('FAILED');
      // });
      // razorpay.open();
      
      // ============================================================================
      // PRODUCTION MODE - Stripe Integration (Alternative - Commented Out)
      // ============================================================================
      // Step 1: Load Stripe SDK (install: npm install @stripe/stripe-js)
      // import { loadStripe } from '@stripe/stripe-js';
      // const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      // if (!stripe) {
      //   throw new Error('Failed to load Stripe');
      // }
      //
      // Step 2: Create payment intent from backend
      // const intentResponse = await apiClient.post(`/payments/${paymentIntentId}/create-stripe-intent`);
      // const { client_secret } = intentResponse.data;
      //
      // Step 3: Confirm payment with Stripe
      // const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
      //   payment_method: {
      //     card: {}, // Card element from Stripe Elements
      //     billing_details: {
      //       name: '', // Get from form
      //       email: '', // Get from form
      //     },
      //   },
      // });
      //
      // Step 4: Handle result
      // if (error) {
      //   console.error('Payment failed:', error);
      //   setStatus('FAILED');
      // } else if (paymentIntent.status === 'succeeded') {
      //   // Verify with backend
      //   await apiClient.post(`/payments/${paymentIntentId}/verify`, {
      //     payment_id: paymentIntentId,
      //     provider_order_id: paymentIntent.id,
      //     provider_payment_id: paymentIntent.id,
      //     signature: '', // Stripe doesn't use signature, verified via webhook
      //   });
      //   
      //   setStatus('PAID');
      //   
      //   setTimeout(() => {
      //     if (payment.reference_type === 'APPOINTMENT') {
      //       router.push(`/patient/confirmation/${payment.reference_id}`);
      //     }
      //   }, 1000);
      // }
      
    } catch (err) {
      console.error('Payment failed:', err);
      setStatus('FAILED');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Payment not found'}</p>
          <button onClick={() => router.back()} className="text-primary hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-16">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 mb-6">
            <LockIcon fontSize="small" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Secure Payment</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Complete Your Payment
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Secure checkout powered by Razorpay
          </p>
        </div>

        {/* Payment Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Amount Section */}
          <div className="px-10 py-10 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-900/10 dark:to-emerald-900/5 border-b border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-3">
                Amount to Pay
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">₹</span>
                <span className="text-5xl font-black text-slate-900 dark:text-white tabular-nums">
                  {Number(payment.amount).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                {payment.reference_type === 'APPOINTMENT' ? 'Doctor Consultation Booking Fee' : 'Payment'}
              </p>
            </div>
          </div>

          {/* Status Display */}
          {status === 'PENDING' && (
            <div className="p-8">
              <div className="flex items-center gap-4 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
                <HourglassBottomIcon className="text-amber-600 text-3xl animate-pulse" />
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-200 text-lg">Processing Payment</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">Please wait while we confirm your payment...</p>
                </div>
              </div>
            </div>
          )}
          
          {status === 'PAID' && (
            <div className="p-8">
              <div className="flex items-center gap-4 p-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
                <CheckCircleIcon className="text-green-600 text-3xl" />
                <div>
                  <p className="font-bold text-green-900 dark:text-green-200 text-lg">Payment Successful!</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Redirecting to confirmation...</p>
                </div>
              </div>
            </div>
          )}
          
          {status === 'FAILED' && (
            <div className="p-8">
              <div className="flex items-center gap-4 p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                <ErrorIcon className="text-red-600 text-3xl" />
                <div>
                  <p className="font-bold text-red-900 dark:text-red-200 text-lg">Payment Failed</p>
                  <p className="text-sm text-red-700 dark:text-red-300">Please try again or contact support</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Button */}
          {(status === 'CREATED' || status === 'FAILED') && (
            <div className="p-10">
              <button
                onClick={handlePayment}
                className="w-full h-16 bg-green-600 hover:bg-green-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-green-600/30 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-[0.98]"
              >
                <PaymentIcon />
                Pay ₹{Number(payment.amount).toFixed(2)}
              </button>
              
              <p className="text-center text-xs text-slate-400 mt-6 font-medium">
                By proceeding, you agree to our Terms & Conditions
              </p>
            </div>
          )}

          {/* Trust Badges */}
          {status === 'CREATED' && (
            <div className="px-10 pb-10">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                  <LockIcon className="text-green-600 text-2xl" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide text-center">
                    SSL Encrypted
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                  <VerifiedUserIcon className="text-green-600 text-2xl" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide text-center">
                    PCI Compliant
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                  <ShieldIcon className="text-green-600 text-2xl" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide text-center">
                    100% Secure
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-4">
            <LockIcon fontSize="small" />
            <span className="text-xs font-medium tracking-wide">256-bit SSL Encrypted Payment</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Your payment information is processed securely. We do not store credit card details.
          </p>
        </div>
      </div>
    </div>
  );
}

// Remove all tab components - Razorpay/Stripe will handle payment UI
