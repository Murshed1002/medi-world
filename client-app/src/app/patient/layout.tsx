import type { ReactNode } from "react";
import QuickNav from "./components/QuickNav";
import AppHeader from "./components/AppHeader";

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen pb-16">
      {/* Shared header (desktop), hidden on auth routes via component logic */}
      <AppHeader />
      {children}
      {/* Mobile quick navigation bar */}
      <QuickNav />
    </div>
  );
}
