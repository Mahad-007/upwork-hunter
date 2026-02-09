"use client";
import { useState, useCallback } from "react";
import { useStore } from "@/store/store";
import { Search, Filter, Bookmark, Send, X, Loader2, ChevronDown, Globe, Clock, DollarSign, Star, Briefcase, ArrowUpDown } from "lucide-react";
import { timeAgo, truncate } from "@/lib/utils";
import type { Job } from "@/lib/rss";

type SortBy = "relevance" | "newest" | "budget";
type FilterState = {
  category: string; budgetMin: string; budgetMax: string; experience: string;
  jobType: string; country: string; showFilters: boolean;
};

export default function JobsPage() {
  const { profile, savedJobs, scoreCache, saveJob, removeJob, setScoreCache, addActivity } = useStore();
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("relevance");
  const [filters, setFilters] = useState<FilterState>({
    category: "", budgetMin: "", budgetMax: "", experience: "", jobType: "", country: "", showFilters: false,
  });

  const searchJobs = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setJobs(data.jobs || []);
      addActivity({ type: "search", message: `Searched for "${query}" — found ${data.jobs?.length || 0} jobs` });
    } catch { setJobs([]); }
    setLoading(false);
  }, [query, addActivity]);

  const scoreAllJobs = useCallback(async () => {
    if (!profile || jobs.length === 0) return;
    setScoring(true);
    try {
      const res = await fetch("/api/ai/score", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobs: jobs.map(j => ({ id: j.id, title: j.title, description: j.description, skills: j.skills, budget: j.budget })),
          profile: { name: profile.name, skills: profile.skills.map(s => s.name), hourlyRate: `$${profile.hourlyRateMin}-${profile.hourlyRateMax}`, experience: profile.experience, categories: profile.categories },
        }),
      });
      const data = await res.json();
      if (data.scores) {
        data.scores.forEach((s: { id: string; score: number }) => setScoreCache(s.id, s.score));
        addActivity({ type: "score", message: `AI scored ${data.scores.length} jobs` });
      }
    } catch { /* ignore */ }
    setScoring(false);
  }, [profile, jobs, setScoreCache, addActivity]);

  const isSaved = (id: string) => savedJobs.some(j => j.id === id);

  const handleSave = (job: Job) => {
    if (isSaved(job.id)) { removeJob(job.id); return; }
    saveJob({ ...job, status: "saved", score: scoreCache[job.id], savedAt: new Date().toISOString() });
    addActivity({ type: "save", message: `Saved "${job.title}"` });
  };

  // Filter and sort
  let filtered = jobs.filter(j => {
    if (filters.category && !j.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
    if (filters.experience && j.experienceLevel !== filters.experience) return false;
    if (filters.jobType && j.jobType !== filters.jobType) return false;
    if (filters.country && !j.clientCountry.toLowerCase().includes(filters.country.toLowerCase())) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === "relevance") return (scoreCache[b.id] || 0) - (scoreCache[a.id] || 0);
    if (sortBy === "newest") return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold mb-1">Vibe Scan</h1>
        <p className="text-gray-500">Describe your ideal job in plain English. AI finds and scores matches.</p>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input className="input !pl-11" placeholder="e.g. React developer for e-commerce dashboard with $50+ hourly rate" value={query}
              onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchJobs()} />
          </div>
          <button onClick={searchJobs} disabled={loading} className="btn-primary flex items-center gap-2 shrink-0">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />} Search
          </button>
          <button onClick={() => setFilters(f => ({ ...f, showFilters: !f.showFilters }))} className="btn-secondary flex items-center gap-2">
            <Filter size={18} /> Filters
          </button>
        </div>

        {filters.showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/[0.06]">
            <div><label className="text-xs text-gray-500 mb-1 block">Category</label><input className="input !py-2 text-sm" placeholder="e.g. Web Dev" value={filters.category} onChange={e => setFilters(f => ({...f, category: e.target.value}))} /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Experience</label>
              <select className="input !py-2 text-sm" value={filters.experience} onChange={e => setFilters(f => ({...f, experience: e.target.value}))}>
                <option value="">All</option><option>Entry Level</option><option>Intermediate</option><option>Expert</option>
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Job Type</label>
              <select className="input !py-2 text-sm" value={filters.jobType} onChange={e => setFilters(f => ({...f, jobType: e.target.value}))}>
                <option value="">All</option><option>Hourly</option><option>Fixed</option>
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Country</label><input className="input !py-2 text-sm" placeholder="e.g. United States" value={filters.country} onChange={e => setFilters(f => ({...f, country: e.target.value}))} /></div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      {jobs.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{filtered.length} jobs found</span>
            {profile && (
              <button onClick={scoreAllJobs} disabled={scoring} className="btn-secondary text-sm flex items-center gap-2 !py-1.5 !px-3">
                {scoring ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />} AI Score All
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-gray-500" />
            {(["relevance","newest","budget"] as SortBy[]).map(s => (
              <button key={s} onClick={() => setSortBy(s)} className={`text-xs px-3 py-1.5 rounded-lg transition-all ${sortBy===s?"bg-blue-600/20 text-blue-400 font-medium":"text-gray-500 hover:text-white"}`}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
            ))}
          </div>
        </div>
      )}

      {/* Job Cards */}
      {loading ? (
        <div className="space-y-4">{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-40" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-16">
          <Search size={40} className="mx-auto mb-4 text-gray-700" />
          <h3 className="text-lg font-bold mb-2">Start Your Vibe Scan</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">Describe your ideal job above. Our AI will search Upwork and score every job by how well it matches your profile.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => {
            const score = scoreCache[job.id];
            const saved = isSaved(job.id);
            return (
              <div key={job.id} className="card card-hover">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-base font-bold hover:text-blue-400 transition-colors">{job.title}</a>
                      {score != null && (
                        <span className={`badge text-xs ${score >= 70 ? "bg-green-500/20 text-green-400" : score >= 40 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>
                          {score}% match
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-3 leading-relaxed">{truncate(job.description, 250)}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skills.slice(0,6).map(s => <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] text-gray-400 border border-white/[0.06]">{s}</span>)}
                      {job.skills.length > 6 && <span className="text-xs text-gray-600">+{job.skills.length-6}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><DollarSign size={12} />{job.budget}</span>
                      <span className="flex items-center gap-1"><Briefcase size={12} />{job.jobType}</span>
                      <span className="flex items-center gap-1"><Globe size={12} />{job.clientCountry}</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{timeAgo(job.pubDate)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => handleSave(job)} className={`p-2.5 rounded-xl transition-all ${saved ? "bg-blue-600/20 text-blue-400" : "bg-white/[0.04] text-gray-500 hover:text-white"}`}>
                      <Bookmark size={16} className={saved ? "fill-current" : ""} />
                    </button>
                    <a href={job.link} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/[0.04] text-gray-500 hover:text-green-400 transition-all">
                      <Send size={16} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!profile && jobs.length > 0 && (
        <div className="card border-yellow-500/20 bg-yellow-500/5 text-center">
          <p className="text-sm text-yellow-400">⚡ Set up your <a href="/profile" className="underline font-medium">profile</a> to enable AI scoring and personalized proposals.</p>
        </div>
      )}
    </div>
  );
}
