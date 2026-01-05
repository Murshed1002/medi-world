"use client";
import StarIcon from "@mui/icons-material/Star";

export default function DoctorReviews({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Patient Reviews</h3>
        <button className="text-primary text-sm font-medium hover:underline">Write a Review</button>
      </div>
      <div className="flex flex-wrap gap-8 items-center mb-8">
        <div className="flex flex-col gap-1 items-center min-w-30">
          <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{rating.toFixed(1)}</span>
          <div className="flex text-yellow-400 gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className={`text-[20px] ${i < Math.round(rating) ? "text-yellow-400" : "text-slate-300 dark:text-slate-600"}`} />
            ))}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{count} reviews</p>
        </div>
        <div className="flex-1 min-w-60">
          <div className="space-y-2">
            {[
              { stars: 5, percent: 78 },
              { stars: 4, percent: 15 },
              { stars: 3, percent: 4 },
              { stars: 2, percent: 1 },
              { stars: 1, percent: 2 },
            ].map((r) => (
              <div key={r.stars} className="flex items-center gap-3 text-sm">
                <span className="font-medium w-3 text-slate-700 dark:text-slate-300">{r.stars}</span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${r.percent}%` }}></div>
                </div>
                <span className="w-8 text-right text-slate-500">{r.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
        <div className="flex gap-4">
          <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 shrink-0">JD</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h5 className="font-bold text-slate-900 dark:text-white text-sm">John Doe</h5>
              <span className="text-xs text-slate-400">• 2 days ago</span>
            </div>
            <div className="flex text-yellow-400 gap-0.5 mb-2 text-xs">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} className="text-[14px]" />
              ))}
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Dr. Chen is amazing! She listened to all my concerns and explained everything clearly. The staff was also very friendly. Highly recommended.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
