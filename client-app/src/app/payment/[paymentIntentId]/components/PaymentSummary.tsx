import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BiotechIcon from "@mui/icons-material/Biotech";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InfoIcon from "@mui/icons-material/Info";
import type { PaymentIntent } from "../types";

export default function PaymentSummary({ intent }: { intent: PaymentIntent | null }) {
  if (!intent) {
    return (
      <div className="bg-white dark:bg-[#1a2632] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden p-6">
        <div className="h-24 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a2632] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{intent.purpose === "APPOINTMENT" ? "Payment Summary" : "Order Summary"}</h3>
          <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">ID: {intent.id}</span>
        </div>

        <div className="mb-6">
          <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight">{intent.context.title}</p>
          {intent.context.subtitle && (
            <p className="text-green-600 text-sm font-medium mt-0.5">{intent.context.subtitle}</p>
          )}
        </div>

        {intent.context.meta && intent.context.meta.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {intent.context.meta.map((m, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{m.label}</p>
                <div className="flex items-center gap-2">
                  {m.icon === "CalendarMonth" && <CalendarMonthIcon className="text-green-600" fontSize="small" />}
                  {m.icon === "Person" && <PersonIcon className="text-green-600" fontSize="small" />}
                  {m.icon === "LocalShipping" && <LocalShippingIcon className="text-green-600" fontSize="small" />}
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {intent.context.items && intent.context.items.length > 0 && (
          <div className="flex flex-col mb-6 divide-y divide-slate-100 dark:divide-slate-700/50">
            {intent.context.items.map((it, idx) => (
              <div key={idx} className="flex items-start gap-3 py-3 first:pt-0">
                <div className="size-10 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-600 flex items-center justify-center shrink-0">
                  {it.icon === "Biotech" && <BiotechIcon />}
                  {it.icon === "ReceiptLong" && <ReceiptLongIcon />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{it.title}</h4>
                    {typeof it.amount === "number" && (
                      <span className="text-sm font-bold text-slate-900 dark:text-white">₹{it.amount}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    {it.note && <p className="text-xs text-slate-500 dark:text-slate-400">{it.note}</p>}
                    {it.qty && <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Qty: {it.qty}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="relative h-4 w-full flex items-center">
          <div className="h-px w-full border-t border-dashed border-slate-300 dark:border-slate-600"></div>
        </div>
        <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 -mx-6 px-6 py-4 border-y border-green-100 dark:border-green-800/30">
          <div className="flex flex-col">
            <span className="text-green-800 dark:text-green-300 text-xs font-bold uppercase tracking-wider">Amount Due Now</span>
            <span className="text-green-600 dark:text-green-400 text-xs font-medium">{intent.purpose === "APPOINTMENT" ? "Booking Fee" : intent.purpose === "LAB" ? "Report Payment" : "Total Order Value"}</span>
          </div>
          <span className="text-3xl font-black text-green-600 dark:text-green-400">₹{intent.amount}</span>
        </div>
      </div>

      {intent.context.policyTitle && intent.context.policyText && (
        <div className="bg-orange-50 dark:bg-orange-900/10 p-5 flex gap-3 border-t border-orange-100 dark:border-orange-900/20">
          <InfoIcon className="text-orange-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{intent.context.policyTitle}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{intent.context.policyText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
