"use client";

export default function LoginFooter() {
  return (
    <footer className="mt-8 text-center text-slate-400 dark:text-slate-500 text-xs">
      <p>© 2024 HealthSimple Inc. All rights reserved.</p>
      <div className="flex justify-center gap-4 mt-2">
        <a className="hover:text-green-600 transition-colors" href="#">
          Privacy Policy
        </a>
        <a className="hover:text-green-600 transition-colors" href="#">
          Terms of Service
        </a>
      </div>
    </footer>
  );
}
