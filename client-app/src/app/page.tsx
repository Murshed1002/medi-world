"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function App() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/patient/home");
      } else {
        router.replace("/patient/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#101922]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}