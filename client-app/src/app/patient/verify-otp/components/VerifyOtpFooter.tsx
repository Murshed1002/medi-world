"use client";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function VerifyOtpFooter({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 px-8 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-center">
      <button
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-white transition-colors"
        onClick={onBack}
        type="button"
      >
        <ArrowBackIcon className="text-lg" />
        Back to Login or Change Number
      </button>
    </div>
  );
}
