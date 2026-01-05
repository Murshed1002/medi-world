import { useState } from "react";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function PaymentMethods({ amount, onPay }: { amount: number; onPay: (method: string) => Promise<void> | void }) {
  const [tab, setTab] = useState<"UPI" | "CARD" | "NETBANKING">("UPI");
  const [upiId, setUpiId] = useState("");
  const [verifying, setVerifying] = useState(false);

  const verifyUpi = async () => {
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 600));
    setVerifying(false);
  };

  return (
    <div className="bg-white dark:bg-[#1a2632] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-105">
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          className={`flex-1 py-4 flex items-center justify-center gap-2 border-b-2 ${tab === "UPI" ? "border-green-600 bg-green-50/50 dark:bg-green-900/10 text-green-700 dark:text-green-400" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"}`}
          onClick={() => setTab("UPI")}
        >
          <SmartphoneIcon />
          <span className="text-sm font-bold">UPI</span>
        </button>
        <button
          className={`flex-1 py-4 flex items-center justify-center gap-2 border-b-2 ${tab === "CARD" ? "border-green-600 bg-green-50/50 dark:bg-green-900/10 text-green-700 dark:text-green-400" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"}`}
          onClick={() => setTab("CARD")}
        >
          <CreditCardIcon />
          <span className="text-sm font-bold">Card</span>
        </button>
        <button
          className={`flex-1 py-4 flex items-center justify-center gap-2 border-b-2 ${tab === "NETBANKING" ? "border-green-600 bg-green-50/50 dark:bg-green-900/10 text-green-700 dark:text-green-400" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"}`}
          onClick={() => setTab("NETBANKING")}
        >
          <AccountBalanceIcon />
          <span className="text-sm font-bold">Netbanking</span>
        </button>
      </div>

      <div className="p-6 md:p-8 flex-1 flex flex-col">
        {tab === "UPI" && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-bold">Pay via UPI App</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select your preferred UPI app or pay with UPI ID.</p>
            </div>

            <div className="relative mb-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AlternateEmailIcon className="text-slate-400" />
                </div>
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@bank"
                  className="w-full h-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white pl-10 pr-24 focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
                />
                <button
                  onClick={verifyUpi}
                  disabled={verifying}
                  className="absolute right-2 top-1.5 h-9 px-4 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 text-slate-700 dark:text-white transition-colors shadow-sm"
                >
                  {verifying ? "Verifying..." : "Verify"}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Your UPI ID will be verified before payment.</p>
            </div>
          </div>
        )}

        {tab === "CARD" && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold">Pay via Card</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">You will be redirected to a secure card gateway.</p>
          </div>
        )}

        {tab === "NETBANKING" && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold">Pay via Netbanking</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Select your bank in the gateway to complete payment.</p>
          </div>
        )}

        <div className="mt-auto">
          <button
            onClick={() => onPay(tab)}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-base rounded-xl shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <span>Pay Now</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-semibold">₹{amount}</span>
            <ArrowForwardIcon className="ml-1" />
          </button>
          <p className="text-center text-xs text-slate-400 mt-4">By paying, you agree to our Terms of Service.</p>
        </div>
      </div>
    </div>
  );
}
