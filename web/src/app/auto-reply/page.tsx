"use client";
import { useState } from "react";
import { useStore } from "@/store/store";
import { MessageSquare, Plus, Trash2, Edit3, Eye, ToggleLeft, ToggleRight, Zap } from "lucide-react";

export default function AutoReplyPage() {
  const { autoReplyTemplates, addAutoReplyTemplate, updateAutoReplyTemplate, removeAutoReplyTemplate } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", message: "", condition: "score_above", minScore: 70 });
  const [preview, setPreview] = useState<string | null>(null);

  const resetForm = () => { setForm({ name: "", message: "", condition: "score_above", minScore: 70 }); setShowForm(false); setEditId(null); };

  const handleSave = () => {
    if (!form.name.trim() || !form.message.trim()) return;
    if (editId) {
      updateAutoReplyTemplate(editId, form);
    } else {
      addAutoReplyTemplate({ id: Date.now().toString(36), ...form, enabled: true, createdAt: new Date().toISOString() });
    }
    resetForm();
  };

  const startEdit = (id: string) => {
    const t = autoReplyTemplates.find(t => t.id === id);
    if (!t) return;
    setForm({ name: t.name, message: t.message, condition: t.condition, minScore: t.minScore });
    setEditId(id); setShowForm(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-extrabold mb-1">Auto-Reply</h1><p className="text-gray-500">Pre-written responses auto-queued when conditions are met.</p></div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> New Template</button>
      </div>

      {/* Info Card */}
      <div className="card border-blue-500/10 bg-blue-500/5">
        <div className="flex gap-3">
          <Zap size={18} className="text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium mb-1">How Auto-Reply Works</p>
            <p className="text-xs text-gray-400">Create response templates with conditions. When a job matches your criteria (e.g., score above 70%), the reply is auto-queued and ready to send. You can review before sending.</p>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4">{editId ? "Edit" : "New"} Reply Template</h2>
          <div className="space-y-4">
            <div><label className="text-xs text-gray-500 mb-1 block">Template Name</label><input className="input" placeholder="e.g. High-match quick response" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Reply Message</label>
              <textarea className="input min-h-[150px] text-sm" placeholder="Hi! I noticed your project and I'd love to help. I have extensive experience in..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Condition</label>
                <select className="input" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                  <option value="score_above">Match Score Above</option>
                  <option value="any_reply">Any Client Reply</option>
                  <option value="saved_job">Saved Jobs Only</option>
                </select>
              </div>
              <div><label className="text-xs text-gray-500 mb-1 block">Min Score Threshold</label>
                <input type="number" min={0} max={100} className="input" value={form.minScore} onChange={e => setForm({...form, minScore: parseInt(e.target.value)||0})} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="btn-primary text-sm">Save Template</button>
              <button onClick={resetForm} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Templates */}
      {autoReplyTemplates.length === 0 && !showForm ? (
        <div className="card text-center py-16">
          <MessageSquare size={40} className="mx-auto mb-4 text-gray-700" />
          <h3 className="font-bold mb-2">No Auto-Reply Templates</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">Create templates that auto-queue when your conditions are met.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm inline-flex items-center gap-2"><Plus size={16} /> Create First Template</button>
        </div>
      ) : (
        <div className="space-y-4">
          {autoReplyTemplates.map(t => (
            <div key={t.id} className="card card-hover">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold">{t.name}</h3>
                  <span className={`badge text-[10px] ${t.enabled ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-500"}`}>{t.enabled ? "Active" : "Paused"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPreview(preview === t.id ? null : t.id)} className="btn-ghost !p-2"><Eye size={16} /></button>
                  <button onClick={() => startEdit(t.id)} className="btn-ghost !p-2"><Edit3 size={16} /></button>
                  <button onClick={() => updateAutoReplyTemplate(t.id, { enabled: !t.enabled })} className="btn-ghost !p-2">
                    {t.enabled ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => removeAutoReplyTemplate(t.id)} className="btn-ghost !p-2 text-red-400"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Condition: {t.condition === "score_above" ? `Score > ${t.minScore}%` : t.condition === "any_reply" ? "Any reply" : "Saved jobs"}</span>
              </div>
              {preview === t.id && (
                <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Preview</p>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{t.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
