"use client";

import { useStore } from "@/store/store";
import { Briefcase, FileText, Star, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { savedJobs, proposals, profile, scoreCache } = useStore();

  const applied = savedJobs.filter((j) => j.status === "applied");
  const saved = savedJobs.filter((j) => j.status === "saved");
  const rejected = savedJobs.filter((j) => j.status === "rejected");
  const highMatch = savedJobs.filter((j) => (j.score || scoreCache[j.id] || 0) > 80);

  const stats = [
    { label: "Saved Jobs", value: saved.length, icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Applied", value: applied.length, icon: Briefcase, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Proposals", value: proposals.length, icon: FileText, color: "text-brand-400", bg: "bg-brand-400/10" },
    { label: "High Match", value: highMatch.length, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          {profile ? `Welcome back, ${profile.name}` : "Set up your profile to get started"}
        </p>
      </div>

      {!profile && (
        <div className="card border-yellow-800 bg-yellow-900/20 flex items-start gap-3">
          <AlertCircle className="text-yellow-400 mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-medium text-yellow-200">Profile not set up</p>
            <p className="text-sm text-yellow-400 mt-1">
              <Link href="/profile" className="underline hover:text-yellow-300">
                Set up your profile
              </Link>{" "}
              to enable AI job matching and proposal generation.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`${s.bg} p-3 rounded-lg`}>
              <s.icon className={s.color} size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent saved jobs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Saved Jobs</h2>
          <Link href="/jobs" className="text-sm text-brand-400 hover:underline">
            Browse Jobs →
          </Link>
        </div>
        {savedJobs.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No saved jobs yet. Start browsing!</p>
        ) : (
          <div className="space-y-3">
            {savedJobs.slice(0, 5).map((j) => (
              <div
                key={j.id}
                className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
              >
                <div className="min-w-0">
                  <a
                    href={j.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:text-brand-400 truncate block"
                  >
                    {j.title}
                  </a>
                  <p className="text-xs text-gray-500">{j.budget}</p>
                </div>
                <span
                  className={`badge ${
                    j.status === "applied"
                      ? "bg-green-900 text-green-300"
                      : j.status === "rejected"
                      ? "bg-red-900 text-red-300"
                      : "bg-gray-800 text-gray-300"
                  }`}
                >
                  {j.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent proposals */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Proposals</h2>
          <Link href="/proposals" className="text-sm text-brand-400 hover:underline">
            View All →
          </Link>
        </div>
        {proposals.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No proposals generated yet.</p>
        ) : (
          <div className="space-y-3">
            {proposals.slice(0, 5).map((p) => (
              <div key={p.id} className="py-2 border-b border-gray-800 last:border-0">
                <p className="text-sm font-medium">{p.jobTitle}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(p.createdAt).toLocaleDateString()} · {p.text.slice(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
