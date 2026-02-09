"use client";
import { useState } from "react";
import { useStore } from "@/store/store";
import { FileText, Copy, Check, Loader2, Plus, Trash2, Sparkles, Clock } from "lucide-react";
import { timeAgo, truncate } from "@/lib/utils";

export default function ProposalsPage() {
  const { profile, savedJobs, proposals, proposalTemplates, addProposal, updateProposal, addProposalTemplate, removeProposalTemplate, addActivity } = useStore();
  const [selectedJob, setSelectedJob] = useState("");
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState<"proposals" | "templates">("proposals");
  const [newTplName, setNewTplName] = useState("");
  const [newTplText, setNewTplText] = useState("");

  const savedJobsList = savedJobs.filter(j => j.status === "saved");

  const generateProposal = async () => {
    if (!selectedJob || !profile) return;
    const job = savedJobs.find(j => j.id === selectedJob);
    if (!job) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/proposal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job: { title: job.title, description: job.description, skills: job.skills, budget: job.budget },
          profile: { name: profile.name, skills: profile.skills.map(s => s.name), hourlyRate: `$${profile.hourlyRateMin}-${profile.hourlyRateMax}`, experience: profile.experience, categories: profile.categories },
        }),
      });
      const data = await res.json();
      if (data.proposal) {
        const p = { id: Date.now().toString(36), jobId: job.id, jobTitle: job.title, text: data.proposal, createdAt: new Date().toISOString(), status: "draft" as const };
        addProposal(p);
        addActivity({ type: "proposal", message: `Generated proposal for "${job.title}"` });
      }
    } catch { /* ignore */ }
    setGenerating(false);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const startEdit = (id: string, text: string) => { setEditingId(id); setEditText(text); };
  const saveEdit = () => { if (editingId) { updateProposal(editingId, { text: editText }); setEditingId(null); } };

  const addTemplate = () => {
    if (!newTplName.trim() || !newTplText.trim()) return;
    addProposalTemplate({ id: Date.now().toString(36), name: newTplName, text: newTplText, createdAt: new Date().toISOString() });
    setNewTplName(""); setNewTplText("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">AI Proposals</h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Generate compelling, personalized cover letters with AI.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card"><div className="text-2xl font-bold">{proposals.length}</div><div className="text-sm text-gray-500 font-medium">Generated</div></div>
        <div className="card"><div className="text-2xl font-bold">{proposals.filter(p=>p.status==="sent").length}</div><div className="text-sm text-gray-500 font-medium">Sent</div></div>
        <div className="card"><div className="text-2xl font-bold">{proposalTemplates.length}</div><div className="text-sm text-gray-500 font-medium">Templates</div></div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Sparkles size={18} className="text-green-600" /> Generate New Proposal</h2>
        {!profile ? (
          <p className="text-sm font-bold text-yellow-700 dark:text-yellow-400">⚡ <a href="/profile" className="underline">Set up your profile</a> first to generate proposals.</p>
        ) : savedJobsList.length === 0 ? (
          <p className="text-sm text-gray-500 font-medium">No saved jobs. <a href="/jobs" className="text-green-600 underline font-bold">Save jobs from Vibe Scan</a> first.</p>
        ) : (
          <div className="flex gap-3">
            <select className="input flex-1" value={selectedJob} onChange={e => setSelectedJob(e.target.value)}>
              <option value="">Select a saved job...</option>
              {savedJobsList.map(j => <option key={j.id} value={j.id}>{truncate(j.title, 60)}</option>)}
            </select>
            <button onClick={generateProposal} disabled={!selectedJob || generating} className="btn-primary flex items-center gap-2 shrink-0">
              {generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} Generate
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-1 p-1 border-2 border-black dark:border-green-500/40 w-fit" style={{ boxShadow: "3px 3px 0px black" }}>
        <button onClick={() => setTab("proposals")} className={`px-4 py-2 text-sm font-bold transition-all ${tab==="proposals"?"bg-green-500 text-black":"hover:bg-gray-100 dark:hover:bg-white/10"}`}>Proposals ({proposals.length})</button>
        <button onClick={() => setTab("templates")} className={`px-4 py-2 text-sm font-bold transition-all ${tab==="templates"?"bg-green-500 text-black":"hover:bg-gray-100 dark:hover:bg-white/10"}`}>Templates ({proposalTemplates.length})</button>
      </div>

      {tab === "proposals" ? (
        proposals.length === 0 ? (
          <div className="card text-center py-12"><FileText size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" /><h3 className="font-bold mb-2">No Proposals Yet</h3><p className="text-sm text-gray-500">Generate your first AI proposal above.</p></div>
        ) : (
          <div className="space-y-4">
            {proposals.map(p => (
              <div key={p.id} className="card card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-sm">{p.jobTitle}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 font-medium">
                      <span className="flex items-center gap-1"><Clock size={12} />{timeAgo(p.createdAt)}</span>
                      <span className={`badge text-[10px] ${p.status==="draft"?"bg-gray-200 dark:bg-gray-500/20":p.status==="sent"?"bg-blue-200 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400":p.status==="viewed"?"bg-yellow-200 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400":"bg-green-200 dark:bg-green-500/20 text-green-800 dark:text-green-400"}`}>{p.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyToClipboard(p.id, p.text)} className="btn-ghost !p-2">
                      {copied === p.id ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                    <button onClick={() => editingId === p.id ? saveEdit() : startEdit(p.id, p.text)} className="btn-secondary !py-1.5 !px-3 text-xs">
                      {editingId === p.id ? "Save" : "Edit"}
                    </button>
                  </div>
                </div>
                {editingId === p.id ? (
                  <textarea className="input min-h-[200px] text-sm font-mono" value={editText} onChange={e => setEditText(e.target.value)} />
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{p.text}</p>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-sm mb-3">New Template</h3>
            <input className="input mb-3 text-sm" placeholder="Template name" value={newTplName} onChange={e => setNewTplName(e.target.value)} />
            <textarea className="input min-h-[120px] text-sm mb-3" placeholder="Template text..." value={newTplText} onChange={e => setNewTplText(e.target.value)} />
            <button onClick={addTemplate} className="btn-primary text-sm">Save Template</button>
          </div>
          {proposalTemplates.map(t => (
            <div key={t.id} className="card card-hover">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm">{t.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => copyToClipboard(t.id, t.text)} className="btn-ghost !p-2">{copied===t.id?<Check size={14} className="text-green-600"/>:<Copy size={14}/>}</button>
                  <button onClick={() => removeProposalTemplate(t.id)} className="btn-ghost !p-2 text-red-500"><Trash2 size={14}/></button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{t.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
