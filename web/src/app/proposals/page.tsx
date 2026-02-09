"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/store/store";
import { Loader2, Copy, Check, FileText } from "lucide-react";

function ProposalContent() {
  const searchParams = useSearchParams();
  const { profile, proposals, addProposal } = useStore();

  const [generating, setGenerating] = useState(false);
  const [proposalText, setProposalText] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "history">(
    searchParams.get("jobId") ? "generate" : "history"
  );

  const jobId = searchParams.get("jobId") || "";
  const jobTitle = searchParams.get("title") || "";
  const jobDesc = searchParams.get("desc") || "";
  const jobSkills = searchParams.get("skills") || "";
  const jobBudget = searchParams.get("budget") || "";

  useEffect(() => {
    if (jobId && jobTitle) {
      setActiveTab("generate");
    }
  }, [jobId, jobTitle]);

  const generate = async () => {
    if (!profile) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job: {
            title: jobTitle,
            description: jobDesc,
            skills: jobSkills.split(",").filter(Boolean),
            budget: jobBudget,
          },
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
      if (data.proposal) {
        setProposalText(data.proposal);
      }
    } catch {
      setProposalText("Failed to generate proposal. Please try again.");
    }
    setGenerating(false);
  };

  const saveProposal = () => {
    if (!proposalText) return;
    addProposal({
      id: Date.now().toString(),
      jobId,
      jobTitle,
      text: proposalText,
      createdAt: new Date().toISOString(),
    });
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(proposalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Proposals</h1>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("generate")}
          className={activeTab === "generate" ? "btn-primary" : "btn-secondary"}
        >
          Generate
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={activeTab === "history" ? "btn-primary" : "btn-secondary"}
        >
          History ({proposals.length})
        </button>
      </div>

      {activeTab === "generate" && (
        <div className="space-y-4">
          {jobTitle ? (
            <div className="card">
              <p className="text-sm text-gray-400">Generating proposal for:</p>
              <p className="font-semibold mt-1">{jobTitle}</p>
              <p className="text-sm text-gray-500 mt-1">{jobBudget}</p>
            </div>
          ) : (
            <div className="card text-gray-400 text-sm">
              Select a job from the Jobs page to generate a proposal.
            </div>
          )}

          {!profile && (
            <div className="card border-yellow-800 bg-yellow-900/20 text-yellow-300 text-sm">
              Set up your profile first to generate proposals.
            </div>
          )}

          {jobTitle && profile && (
            <button
              onClick={generate}
              disabled={generating}
              className="btn-primary flex items-center gap-2"
            >
              {generating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileText size={16} />
              )}
              {generating ? "Generating..." : "Generate Proposal"}
            </button>
          )}

          {proposalText && (
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Generated Proposal</h3>
                <div className="flex gap-2">
                  <button onClick={copyToClipboard} className="btn-ghost flex items-center gap-1 text-sm">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={saveProposal} className="btn-secondary text-sm">
                    Save
                  </button>
                </div>
              </div>
              <textarea
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                className="input min-h-[300px] font-mono text-sm"
              />
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <div className="card text-gray-500 text-sm">No saved proposals yet.</div>
          ) : (
            proposals.map((p) => (
              <div key={p.id} className="card space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{p.jobTitle}</h3>
                  <span className="text-xs text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-400 whitespace-pre-wrap">{p.text}</p>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(p.text);
                  }}
                  className="btn-ghost text-xs flex items-center gap-1"
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function ProposalsPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto"><div className="skeleton h-8 w-48 mb-6" /><div className="skeleton h-64 w-full" /></div>}>
      <ProposalContent />
    </Suspense>
  );
}
