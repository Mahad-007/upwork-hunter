"use client";
import { useStore } from "@/store/store";
import { BarChart3, FileText, Search, Target, TrendingUp, Clock, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

export default function DashboardPage() {
  const { savedJobs, proposals, scoreCache, activities } = useStore();

  const totalScanned = Object.keys(scoreCache).length;
  const proposalCount = proposals.length;
  const avgScore = totalScanned > 0 ? Math.round(Object.values(scoreCache).reduce((a, b) => a + b, 0) / totalScanned) : 0;
  const responseRate = proposalCount > 0 ? Math.round((proposals.filter(p => p.status === "replied").length / proposalCount) * 100) : 0;

  const statCards = [
    { label: "Jobs Scanned", value: totalScanned, icon: Search, color: "bg-yellow-300 dark:bg-yellow-400" },
    { label: "Proposals Sent", value: proposalCount, icon: FileText, color: "bg-blue-300 dark:bg-blue-400" },
    { label: "Avg Match Score", value: `${avgScore}%`, icon: Target, color: "bg-green-300 dark:bg-green-400" },
    { label: "Response Rate", value: `${responseRate}%`, icon: TrendingUp, color: "bg-pink-300 dark:bg-pink-400" },
  ];

  const recentJobs = savedJobs.slice(0, 5);
  const recentActivities = activities.slice(0, 8);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  const chartData = days.map(day => proposals.filter(p => p.createdAt.startsWith(day)).length);
  const maxChart = Math.max(...chartData, 1);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Your Upwork automation command center.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card card-hover">
            <div className={`w-10 h-10 ${color} border-2 border-black flex items-center justify-center mb-3`} style={{ boxShadow: "2px 2px 0px black" }}>
              <Icon size={18} className="text-black" />
            </div>
            <div className="text-2xl font-bold mb-0.5">{value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { href: "/jobs", icon: Search, label: "New Vibe Scan", desc: "Find AI-matched jobs", color: "bg-green-300 dark:bg-green-400" },
              { href: "/proposals", icon: FileText, label: "Generate Proposal", desc: "AI-powered cover letters", color: "bg-blue-300 dark:bg-blue-400" },
              { href: "/analytics", icon: BarChart3, label: "View Analytics", desc: "Track your performance", color: "bg-orange-300 dark:bg-orange-400" },
            ].map(({ href, icon: Icon, label, desc, color }) => (
              <Link key={href} href={href} className="flex items-center justify-between p-4 border-2 border-black dark:border-green-500/40 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group" style={{ boxShadow: "3px 3px 0px black" }}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${color} border-2 border-black flex items-center justify-center`}>
                    <Icon size={16} className="text-black" />
                  </div>
                  <div><div className="font-bold text-sm">{label}</div><div className="text-xs text-gray-500">{desc}</div></div>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-green-600 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-4">Proposals This Week</h2>
          <div className="flex items-end gap-2 h-40">
            {chartData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-green-500 border-2 border-black transition-all" style={{ height: `${(val / maxChart) * 100}%`, minHeight: val > 0 ? 8 : 2 }} />
                <span className="text-[10px] font-bold text-gray-500">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][new Date(days[i]).getDay()]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock size={24} className="mx-auto mb-2" />
              <p className="text-sm font-medium">No activity yet. Start by scanning jobs!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 border border-black mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{a.message}</p>
                    <p className="text-xs text-gray-500">{timeAgo(a.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Saved Jobs</h2>
            <Link href="/jobs" className="text-sm text-green-600 hover:text-green-500 font-bold transition-colors">View all</Link>
          </div>
          {recentJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Zap size={24} className="mx-auto mb-2" />
              <p className="text-sm font-medium">No saved jobs yet. Use Vibe Scan to find matches!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((j) => (
                <div key={j.id} className="flex items-center justify-between p-3 border-2 border-black/20 dark:border-green-500/20">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{j.title}</p>
                    <p className="text-xs text-gray-500">{j.budget} • {j.status}</p>
                  </div>
                  {j.score != null && (
                    <div className={`badge text-xs ${j.score >= 70 ? "bg-green-200 text-green-800 dark:bg-green-500/20 dark:text-green-400" : j.score >= 40 ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400" : "bg-red-200 text-red-800 dark:bg-red-500/20 dark:text-red-400"}`}>
                      {j.score}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
