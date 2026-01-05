"use client";
export default function DoctorBreadcrumbs({ items }: { items: string[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex mb-6">
      <ol className="flex items-center space-x-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {idx < items.length - 1 ? (
              <a className="text-slate-500 hover:text-primary text-sm font-medium" href="#">
                {item}
              </a>
            ) : (
              <span className="text-slate-900 dark:text-white text-sm font-medium" aria-current="page">
                {item}
              </span>
            )}
            {idx < items.length - 1 && <span className="text-slate-400 text-sm">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
