"use client";
import LoginHeader from "./components/LoginHeader";
import LoginForm from "./components/LoginForm";
import LoginFooter from "./components/LoginFooter";

export default function LoginPageView() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-slate-900 dark:bg-[#101922] dark:text-slate-100">
      <LoginHeader />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <LoginForm />
        <LoginFooter />
      </main>
    </div>
  );
}
