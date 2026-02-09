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
  const appliedCount = savedJobs.filter(j => j.status === "applied").length;
  const responseRate = proposalCount > 0 ? Math.round((proposals.filter(p => p.status === "replied").length / proposalCount) * 100) : 0;

  const statCards = [
    { label: "Jobs Scanned", value: totalScanned, icon: Search, color: "from-blue-500 to-blue-600" },
    { label: "Proposals Sent", value: proposalCount, icon: FileText, color: "from-purple-500 to-purple-600" },
    { label: "Avg Match Score", value: `${avgScore}%`, icon: Target, color: "from-green-500 to-emerald-600" },
    { label: "Response Rate", value: `${responseRate}%`, icon: TrendingUp, color: "from-orange-500 to-red-500" },
  ];

  const recentJobs = savedJobs.slice(0, 5);
  const recentActivities = activities.slice(0, 8);

  // Mini chart data - proposals per day (last 7 days)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  const chartData = days.map(day => proposals.filter(p => p.createdAt.startsWith(day)).length);
  const maxChart = Math.max(...chartData, 1);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold mb-1">Dashboard</h1>
        <p className="text-gray-500">Your Upwork automation command center.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon size={18} className="text-white" />
              </div>
            </div>
            <div className="text-2xl font-extrabold mb-0.5">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/jobs" className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-all group">
              <div className="flex items-center gap-3">
                <Search size={18} className="text-blue-400" />
                <div><div className="font-medium text-sm">New Vibe Scan</div><div className="text-xs text-gray-500">Find AI-matched jobs</div></div>
              </div>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
            </Link>
            <Link href="/proposals" className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-all group">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-purple-400" />
                <div><div className="font-medium text-sm">Generate Proposal</div><div className="text-xs text-gray-500">AI-powered cover letters</div></div>
              </div>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
            </Link>
            <Link href="/analytics" className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-all group">
              <div className="flex items-center gap-3">
                <BarChart3 size={18} className="text-green-400" />
                <div><div className="font-medium text-sm">View Analytics</div><div className="text-xs text-gray-500">Track your performance</div></div>
              </div>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-4">Proposals This Week</h2>
          <div className="flex items-end gap-2 h-40">
            {chartData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-purple-600 transition-all" style={{ height: `${(val / maxChart) * 100}%`, minHeight: val > 0 ? 8 : 2 }} />
                <span className="text-[10px] text-gray-600">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][new Date(days[i]).getDay()]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity + Saved Jobs */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Clock size={24} className="mx-auto mb-2" />
              <p className="text-sm">No activity yet. Start by scanning jobs!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 truncate">{a.message}</p>
                    <p className="text-xs text-gray-600">{timeAgo(a.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Saved Jobs</h2>
            <Link href="/jobs" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View all</Link>
          </div>
          {recentJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Zap size={24} className="mx-auto mb-2" />
              <p className="text-sm">No saved jobs yet. Use Vibe Scan to find matches!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((j) => (
                <div key={j.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{j.title}</p>
                    <p className="text-xs text-gray-500">{j.budget} • {j.status}</p>
                  </div>
                  {j.score != null && (
                    <div className={`badge text-xs ${j.score >= 70 ? "bg-green-500/20 text-green-400" : j.score >= 40 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>
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
