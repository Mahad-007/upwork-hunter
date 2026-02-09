"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore, SavedJob } from "@/store/store";
import { Job } from "@/lib/rss";
import { cn, timeAgo, truncate } from "@/lib/utils";
import {
  Search,
  Star,
  Zap,
  ExternalLink,
  Bookmark,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  ArrowUpDown,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function JobsPage() {
  const { profile, savedJobs, saveJob, scoreCache, setScoreCache } = useStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchQuery, setSearchQuery] = useState("web development");
  const [page, setPage] = useState(1);
  const [scoring, setScoring] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "score">("date");

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterExp, setFilterExp] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setJobs(data.jobs || []);
      setPage(1);
    } catch {
      setJobs([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs(searchQuery);
  }, [searchQuery, fetchJobs]);

  const scoreAllJobs = async () => {
    if (!profile || jobs.length === 0) return;
    setScoring(true);

    const unscored = jobs.filter((j) => !scoreCache[j.id]);
    const batches = [];
    for (let i = 0; i < unscored.length; i += 5) {
      batches.push(unscored.slice(i, i + 5));
    }

    for (const batch of batches) {
      try {
        const res = await fetch("/api/ai/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobs: batch.map((j) => ({
              id: j.id,
              title: j.title,
              description: j.description,
              skills: j.skills,
              budget: j.budget,
            })),
            profile: {
              name: profile.name,
              skills: profile.skills,
              hourlyRate: `$${profile.hourlyRateMin}-$${profile.hourlyRateMax}`,
              experience: profile.experience,
              categories: profile.categories,
            },
          }),
        });
        const data = await res.json();
        if (data.scores) {
          data.scores.forEach((s: { id: string; score: number }) => {
            setScoreCache(s.id, s.score);
          });
        }
      } catch {}
    }
    setScoring(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      setSearchQuery(keyword.trim());
    }
  };

  const filteredJobs = jobs
    .filter((j) => {
      if (filterType !== "all" && j.jobType.toLowerCase() !== filterType) return false;
      if (filterExp !== "all" && !j.experienceLevel.toLowerCase().includes(filterExp)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "score") {
        return (scoreCache[b.id] || 0) - (scoreCache[a.id] || 0);
      }
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const isJobSaved = (id: string) => savedJobs.some((j) => j.id === id);

  const handleSaveJob = (job: Job, status: SavedJob["status"]) => {
    saveJob({
      id: job.id,
      title: job.title,
      link: job.link,
      budget: job.budget,
      description: job.description,
      skills: job.skills,
      status,
      score: scoreCache[job.id],
      savedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Job Search</h1>
        {profile && (
          <button
            onClick={scoreAllJobs}
            disabled={scoring}
            className="btn-primary flex items-center gap-2"
          >
            {scoring ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {scoring ? "Scoring..." : "AI Score All"}
          </button>
        )}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search jobs... (e.g. React, Python, Design)"
            className="input pl-10"
          />
        </div>
        <button type="submit" className="btn-primary">
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center gap-2"
        >
          <Filter size={16} />
        </button>
        <button
          type="button"
          onClick={() => setSortBy(sortBy === "date" ? "score" : "date")}
          className="btn-secondary flex items-center gap-2"
          title={`Sort by ${sortBy === "date" ? "score" : "date"}`}
        >
          <ArrowUpDown size={16} />
          {sortBy === "date" ? "Date" : "Score"}
        </button>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="card flex flex-wrap gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Job Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input w-40"
            >
              <option value="all">All Types</option>
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Experience</label>
            <select
              value={filterExp}
              onChange={(e) => setFilterExp(e.target.value)}
              className="input w-40"
            >
              <option value="all">All Levels</option>
              <option value="entry">Entry</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card space-y-3">
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-3 w-1/4" />
              <div className="skeleton h-12 w-full" />
              <div className="flex gap-2">
                <div className="skeleton h-6 w-16 rounded-full" />
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {filteredJobs.length} jobs found for &quot;{searchQuery}&quot;
          </p>

          <div className="space-y-4">
            {paginatedJobs.map((job) => {
              const score = scoreCache[job.id];
              const saved = isJobSaved(job.id);

              return (
                <div
                  key={job.id}
                  className={cn(
                    "card hover:border-gray-700 transition-colors",
                    score !== undefined && score > 80 && "border-brand-600/50 bg-brand-900/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-semibold hover:text-brand-400 flex items-center gap-1"
                        >
                          {job.title}
                          <ExternalLink size={14} className="shrink-0" />
                        </a>
                        {score !== undefined && (
                          <span
                            className={cn(
                              "badge",
                              score >= 80
                                ? "bg-green-900 text-green-300"
                                : score >= 60
                                ? "bg-yellow-900 text-yellow-300"
                                : "bg-gray-800 text-gray-400"
                            )}
                          >
                            {score}% match
                          </span>
                        )}
                        {score && score > 80 && (
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{job.budget}</span>
                        <span>·</span>
                        <span>{job.jobType}</span>
                        <span>·</span>
                        <span>{job.experienceLevel}</span>
                        <span>·</span>
                        <span>{timeAgo(job.pubDate)}</span>
                      </div>

                      <p className="text-sm text-gray-400 mt-2">
                        {truncate(job.description, 250)}
                      </p>

                      {job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.skills.map((s) => (
                            <span key={s} className="badge bg-gray-800 text-gray-300">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => handleSaveJob(job, "saved")}
                        className={cn("btn-ghost p-2", saved && "text-brand-400")}
                        title="Save"
                      >
                        <Bookmark size={16} className={saved ? "fill-current" : ""} />
                      </button>
                      <button
                        onClick={() => handleSaveJob(job, "applied")}
                        className="btn-ghost p-2 text-green-400"
                        title="Mark Applied"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleSaveJob(job, "rejected")}
                        className="btn-ghost p-2 text-red-400"
                        title="Reject"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Generate proposal button */}
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <a
                      href={`/proposals?jobId=${job.id}&title=${encodeURIComponent(job.title)}&desc=${encodeURIComponent(job.description.slice(0, 1000))}&skills=${encodeURIComponent(job.skills.join(","))}&budget=${encodeURIComponent(job.budget)}`}
                      className="text-sm text-brand-400 hover:underline"
                    >
                      Generate Proposal →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
