"use client";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SearchIcon from "@mui/icons-material/Search";

export default function DoctorHeader({ nav }: { nav: (path: string) => void }) {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button className="flex items-center gap-3" onClick={() => nav("/patient/home")}> 
              <div className="size-8 text-primary flex items-center justify-center">
                <LocalHospitalIcon />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">MediQueue</h2>
            </button>
            <nav className="hidden md:flex items-center gap-8">
              <button className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" onClick={() => nav("/patient/doctors")}>Find Doctors</button>
              <button className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Departments</button>
              <button className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" onClick={() => nav("/patient/appointments")}>My Appointments</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <SearchIcon className="absolute inset-y-0 left-3 text-slate-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search doctors, clinics..."
                className="block w-full pl-10 pr-3 py-2 rounded-lg leading-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition"
              />
            </div>
            <button
              className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-slate-200 dark:border-slate-700"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCuDOceZEUMSGCXU_z9mdCxX8WfUYIjIkArXJG824vLq_KNhQ5C-uWoKTPG32cFth1DuCpwSsWV7CLAoBFL1pWGl6TpXACCZrWEg32MUi7WfqkzwfalkAbmE-RgstGxisIS-wbA1seDcqlJi65u3Z543VOP9_YXIVG63I1IXLT71ZRQDqxjw1a1eWau0o2HS8OHOjNTg3V6d94P-UVFmSXBlxztv6nnKWZgmmtoevfa2k3GOMQP8c1Lk-tlUtj6G8nxVtXHyw-uBhw')" }}
              aria-label="User profile picture placeholder"
            ></button>
          </div>
        </div>
      </div>
    </header>
  );
}
