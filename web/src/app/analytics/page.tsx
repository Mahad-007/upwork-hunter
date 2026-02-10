"use client";
import { useStore } from "@/store/store";
import { BarChart3, TrendingUp, Target, Download, PieChart } from "lucide-react";

export default function AnalyticsPage() {
  const { proposals, savedJobs, scoreCache } = useStore();

  const days14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split("T")[0];
  });
  const bidsPerDay = days14.map(day => ({ day, count: proposals.filter(p => p.createdAt.startsWith(day)).length }));
  const maxBids = Math.max(...bidsPerDay.map(d => d.count), 1);

  const scores = Object.values(scoreCache);
  const scoreBuckets = [
    { label: "0-20", count: scores.filter(s => s <= 20).length, color: "bg-red-500" },
    { label: "21-40", count: scores.filter(s => s > 20 && s <= 40).length, color: "bg-orange-500" },
    { label: "41-60", count: scores.filter(s => s > 40 && s <= 60).length, color: "bg-yellow-500" },
    { label: "61-80", count: scores.filter(s => s > 60 && s <= 80).length, color: "bg-green-500" },
    { label: "81-100", count: scores.filter(s => s > 80).length, color: "bg-emerald-500" },
  ];
  const maxBucket = Math.max(...scoreBuckets.map(b => b.count), 1);

  const categories: Record<string, number> = {};
  savedJobs.forEach(j => { categories[j.category || "Other"] = (categories[j.category || "Other"] || 0) + 1; });
  const catEntries = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxCat = Math.max(...catEntries.map(c => c[1]), 1);

  const statusCounts = { saved: savedJobs.filter(j => j.status === "saved").length, applied: savedJobs.filter(j => j.status === "applied").length, rejected: savedJobs.filter(j => j.status === "rejected").length };
  const proposalStatuses = { draft: proposals.filter(p => p.status === "draft").length, sent: proposals.filter(p => p.status === "sent").length, viewed: proposals.filter(p => p.status === "viewed").length, replied: proposals.filter(p => p.status === "replied").length };

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const exportData = () => {
    const data = { proposals, savedJobs, scoreCache, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "freelanceflow-analytics.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold mb-1">Analytics</h1><p className="text-gray-600 dark:text-gray-400 font-medium">Track your performance and optimize your strategy.</p></div>
        <button onClick={exportData} className="btn-secondary flex items-center gap-2 text-sm"><Download size={16} /> Export</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Jobs Scored", value: scores.length, icon: Target, color: "bg-yellow-300 dark:bg-yellow-400" },
          { label: "Avg Match Score", value: `${avgScore}%`, icon: TrendingUp, color: "bg-green-300 dark:bg-green-400" },
          { label: "Total Proposals", value: proposals.length, icon: BarChart3, color: "bg-blue-300 dark:bg-blue-400" },
          { label: "Jobs Saved", value: savedJobs.length, icon: PieChart, color: "bg-pink-300 dark:bg-pink-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`w-8 h-8 ${color} border-2 border-black flex items-center justify-center mb-2`} style={{ boxShadow: "2px 2px 0px black" }}>
              <Icon size={16} className="text-black" />
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-gray-500 font-medium">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold mb-6">Proposals Per Day</h2>
          <div className="flex items-end gap-1.5 h-44">
            {bidsPerDay.map(({ day, count }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                {count > 0 && <span className="text-[10px] font-bold text-gray-500">{count}</span>}
                <div className="w-full bg-green-500 border-2 border-black transition-all duration-300" style={{ height: `${(count / maxBids) * 100}%`, minHeight: count > 0 ? 6 : 2, opacity: count > 0 ? 1 : 0.2 }} />
                <span className="text-[9px] font-bold text-gray-400">{day.slice(8)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-6">Match Score Distribution</h2>
          <div className="space-y-3">
            {scoreBuckets.map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 w-12">{label}</span>
                <div className="flex-1 h-6 bg-gray-100 dark:bg-white/10 border-2 border-black/20 dark:border-green-500/20 overflow-hidden">
                  <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${(count / maxBucket) * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-gray-400 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Jobs by Category</h2>
          {catEntries.length === 0 ? <p className="text-sm text-gray-500 font-medium">No data yet.</p> : (
            <div className="space-y-3">
              {catEntries.map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 truncate w-24">{cat}</span>
                  <div className="flex-1 h-5 bg-gray-100 dark:bg-white/10 border-2 border-black/20 dark:border-green-500/20 overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${(count / maxCat) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-400 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-4">Status Breakdown</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Jobs</h3>
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between py-1.5">
                  <span className="text-sm font-medium capitalize">{status}</span>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Proposals</h3>
              {Object.entries(proposalStatuses).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between py-1.5">
                  <span className="text-sm font-medium capitalize">{status}</span>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
