"use client";
import CancelIcon from "@mui/icons-material/Cancel";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

export default function QueueActions({ onCancel, onSupport }: { onCancel: () => void; onSupport: () => void }) {
  return (
    <div className="flex gap-4 mt-auto">
      <button
        onClick={onCancel}
        className="flex-1 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 rounded-lg transition-colors text-sm font-semibold flex items-center justify-center gap-2"
      >
        <CancelIcon className="text-[18px]" />
        Cancel Appointment
      </button>
      <button
        onClick={onSupport}
        className="flex-1 py-3 text-primary hover:bg-green-50 dark:hover:bg-green-900/20 border border-transparent hover:border-green-100 rounded-lg transition-colors text-sm font-semibold flex items-center justify-center gap-2"
      >
        <SupportAgentIcon className="text-[18px]" />
        Contact Support
      </button>
    </div>
  );
}
