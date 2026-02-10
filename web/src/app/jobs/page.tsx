"use client";
import { useState, useCallback } from "react";
import { useStore } from "@/store/store";
import { Search, Filter, Bookmark, Send, Loader2, Globe, Clock, DollarSign, Star, Briefcase, ArrowUpDown, Zap } from "lucide-react";
import { timeAgo, truncate } from "@/lib/utils";
import type { Job } from "@/lib/rss";

type SortBy = "relevance" | "newest" | "budget";
type FilterState = {
  category: string; budgetMin: string; budgetMax: string; experience: string;
  jobType: string; country: string; showFilters: boolean;
};

type JobSource = "RemoteOK" | "WeWorkRemotely" | "Sample";

const sourceColors: Record<JobSource, string> = {
  RemoteOK: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400 border-purple-300 dark:border-purple-500/40",
  WeWorkRemotely: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 border-blue-300 dark:border-blue-500/40",
  Sample: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-gray-300 dark:border-gray-500/40",
};

export default function JobsPage() {
  const { profile, savedJobs, scoreCache, saveJob, removeJob, setScoreCache, addActivity } = useStore();
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("relevance");
  const [sources, setSources] = useState<JobSource[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    category: "", budgetMin: "", budgetMax: "", experience: "", jobType: "", country: "", showFilters: false,
  });

  const searchJobs = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSources([]);
    try {
      const res = await fetch(`/api/jobs?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setJobs(data.jobs || []);
      setSources(data.sources || []);
      const sourceInfo = data.sources?.length > 0 ? ` from ${data.sources.join(", ")}` : "";
      addActivity({ type: "search", message: `Searched for "${query}" — found ${data.jobs?.length || 0} jobs${sourceInfo}` });
    } catch { setJobs([]); setSources([]); }
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
        <h1 className="text-3xl font-bold mb-1">Vibe Scan</h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Describe your ideal job in plain English. AI finds and scores matches.</p>
      </div>

      <div className="card">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t-2 border-black/10 dark:border-green-500/20">
            <div><label className="text-xs font-bold text-gray-500 mb-1 block">Category</label><input className="input !py-2 text-sm" placeholder="e.g. Web Dev" value={filters.category} onChange={e => setFilters(f => ({...f, category: e.target.value}))} /></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1 block">Experience</label>
              <select className="input !py-2 text-sm" value={filters.experience} onChange={e => setFilters(f => ({...f, experience: e.target.value}))}>
                <option value="">All</option><option>Entry Level</option><option>Intermediate</option><option>Expert</option>
              </select>
            </div>
            <div><label className="text-xs font-bold text-gray-500 mb-1 block">Job Type</label>
              <select className="input !py-2 text-sm" value={filters.jobType} onChange={e => setFilters(f => ({...f, jobType: e.target.value}))}>
                <option value="">All</option><option>Hourly</option><option>Fixed</option>
              </select>
            </div>
            <div><label className="text-xs font-bold text-gray-500 mb-1 block">Country</label><input className="input !py-2 text-sm" placeholder="e.g. United States" value={filters.country} onChange={e => setFilters(f => ({...f, country: e.target.value}))} /></div>
          </div>
        )}
      </div>

      {jobs.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-bold text-gray-500">{filtered.length} jobs found</span>
            {sources.length > 0 && (
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-green-500" />
                <span className="text-xs text-gray-500">from</span>
                {sources.map(src => (
                  <span key={src} className={`text-xs px-2 py-0.5 font-bold border ${sourceColors[src]}`}>
                    {src}
                  </span>
                ))}
              </div>
            )}
            {profile && (
              <button onClick={scoreAllJobs} disabled={scoring} className="btn-secondary text-sm flex items-center gap-2 !py-1.5 !px-3">
                {scoring ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />} AI Score All
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-gray-500" />
            {(["relevance","newest","budget"] as SortBy[]).map(s => (
              <button key={s} onClick={() => setSortBy(s)} className={`text-xs px-3 py-1.5 border-2 font-bold transition-all ${sortBy===s?"bg-green-500 text-black border-black":"border-transparent text-gray-500 hover:text-black dark:hover:text-white"}`} style={sortBy===s?{boxShadow:"2px 2px 0px black"}:{}}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{Array.from({length:5}).map((_,i)=><div key={i} className="skeleton h-40" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-16">
          <Search size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-bold mb-2">Start Your Vibe Scan</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">Describe your ideal job above. We&apos;ll search RemoteOK and WeWorkRemotely for matching jobs, then AI scores them by how well they fit your profile.</p>
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
                      <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-base font-bold hover:text-green-600 transition-colors">{job.title}</a>
                      {score != null && (
                        <span className={`badge text-xs ${score >= 70 ? "bg-green-200 text-green-800 dark:bg-green-500/20 dark:text-green-400" : score >= 40 ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400" : "bg-red-200 text-red-800 dark:bg-red-500/20 dark:text-red-400"}`}>
                          {score}% match
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{truncate(job.description, 250)}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skills.slice(0,6).map(s => <span key={s} className="text-xs px-2.5 py-1 border-2 border-black/20 dark:border-green-500/30 font-bold bg-gray-50 dark:bg-white/5">{s}</span>)}
                      {job.skills.length > 6 && <span className="text-xs text-gray-500 font-bold">+{job.skills.length-6}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium flex-wrap">
                      <span className="flex items-center gap-1"><DollarSign size={12} />{job.budget}</span>
                      <span className="flex items-center gap-1"><Briefcase size={12} />{job.jobType}</span>
                      <span className="flex items-center gap-1"><Globe size={12} />{job.clientCountry}</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{timeAgo(job.pubDate)}</span>
                      {job.source && (
                        <span className={`px-2 py-0.5 border text-[10px] font-bold ${sourceColors[job.source as JobSource] || sourceColors.Sample}`}>
                          {job.source}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => handleSave(job)} className={`p-2.5 border-2 border-black dark:border-green-500/40 transition-all ${saved ? "bg-green-500 text-black" : "bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-white/10"}`} style={{ boxShadow: "2px 2px 0px black" }}>
                      <Bookmark size={16} className={saved ? "fill-current" : ""} />
                    </button>
                    <a href={job.link} target="_blank" rel="noopener noreferrer" className="p-2.5 border-2 border-black dark:border-green-500/40 bg-white dark:bg-[#111] hover:bg-green-100 dark:hover:bg-green-500/10 transition-all" style={{ boxShadow: "2px 2px 0px black" }}>
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
        <div className="card !border-yellow-500 bg-yellow-100 dark:bg-yellow-500/10 text-center">
          <p className="text-sm font-bold text-yellow-800 dark:text-yellow-400">⚡ Set up your <a href="/profile" className="underline">profile</a> to enable AI scoring and personalized proposals.</p>
        </div>
      )}
    </div>
  );
}
