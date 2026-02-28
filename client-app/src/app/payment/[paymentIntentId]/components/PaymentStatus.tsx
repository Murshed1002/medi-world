import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import type { PaymentStatusType } from "../types";

export default function PaymentStatus({ 
  status,
  onSuccess,
  onRetry
}: { 
  status: PaymentStatusType;
  onSuccess?: () => void;
  onRetry?: () => void;
}) {
  if (status === "CREATED") return null;

  return (
    <div className="rounded-xl border p-4 bg-white dark:bg-[#1a2632] border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-3">
        {status === "PAID" && <CheckCircleIcon className="text-green-600" />}
        {status === "FAILED" && <ErrorIcon className="text-red-600" />}
        {status === "PENDING" && <HourglassBottomIcon className="text-amber-600 animate-pulse" />}
        <div>
          <p className="text-sm font-bold">
            {status === "PAID" && "Payment Successful"}
            {status === "FAILED" && "Payment Failed"}
            {status === "PENDING" && "Processing Payment"}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {status === "PAID" && "Your appointment has been confirmed"}
            {status === "FAILED" && "Please retry or contact support"}
            {status === "PENDING" && "Please wait while we confirm your payment"}
          </p>
        </div>
      </div>
      
      {status === "PAID" && onSuccess && (
        <button
          onClick={onSuccess}
          className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          View Appointment Details
        </button>
      )}
      
      {status === "FAILED" && onRetry && (
        <button
          onClick={onRetry}
          className="w-full mt-2 bg-primary hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Retry Payment
        </button>
      )}
    </div>
  );
}
