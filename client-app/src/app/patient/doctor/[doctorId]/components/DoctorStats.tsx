"use client";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import GroupsIcon from "@mui/icons-material/Groups";
import TranslateIcon from "@mui/icons-material/Translate";

export default function DoctorStats({ stats }: { stats: { yearsExp: number; patients: number; languages: string[] } }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
        <div className="size-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-primary">
          <MedicalServicesIcon className="text-[24px]" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.yearsExp}+</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Years Exp.</p>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
        <div className="size-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-primary">
          <GroupsIcon className="text-[24px]" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.patients.toLocaleString()}+</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Patients</p>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 col-span-2 sm:col-span-1">
        <div className="size-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-primary">
          <TranslateIcon className="text-[24px]" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{stats.languages.join(", ")}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Languages</p>
        </div>
      </div>
    </div>
  );
}
