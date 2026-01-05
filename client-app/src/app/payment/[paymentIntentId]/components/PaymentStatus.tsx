import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import type { PaymentStatusType } from "../types";

export default function PaymentStatus({ status }: { status: PaymentStatusType }) {
  if (status === "CREATED") return null;

  return (
    <div className="rounded-xl border p-4 flex items-center gap-3 bg-white dark:bg-[#1a2632] border-slate-200 dark:border-slate-700">
      {status === "PAID" && <CheckCircleIcon className="text-green-600" />}
      {status === "FAILED" && <ErrorIcon className="text-red-600" />}
      {status === "PENDING" && <HourglassBottomIcon className="text-amber-600" />}
      <div>
        <p className="text-sm font-bold">
          {status === "PAID" && "Payment success"}
          {status === "FAILED" && "Payment failed"}
          {status === "PENDING" && "Payment pending"}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {status === "PAID" && "You’re all set. Proceed to next steps."}
          {status === "FAILED" && "Please retry or contact support if the issue persists."}
          {status === "PENDING" && "Awaiting confirmation from gateway. This usually takes a moment."}
        </p>
      </div>
    </div>
  );
}
