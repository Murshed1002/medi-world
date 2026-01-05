"use client";
export default function DoctorAbout({ about }: { about: { paragraphs: string[]; tags: string[] } }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">About</h3>
      <div className="max-w-none text-slate-600 dark:text-slate-300 space-y-4">
        {about.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {about.tags.map((t) => (
          <span key={t} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
