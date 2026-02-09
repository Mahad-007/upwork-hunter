"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/store/store";
import { User, Plus, X, Save, Briefcase } from "lucide-react";

const EXPERIENCE_LEVELS = ["Entry Level", "Intermediate", "Expert"];
const CATEGORIES = ["Web Development", "Mobile Development", "UI/UX Design", "Data Science", "DevOps", "Blockchain", "AI/ML", "Content Writing", "Digital Marketing", "Video Editing", "Graphic Design", "Game Development"];

export default function ProfilePage() {
  const { profile, setProfile } = useStore();
  const [form, setForm] = useState({
    name: "", title: "", bio: "",
    skills: [] as { name: string; level: number }[],
    hourlyRateMin: 25, hourlyRateMax: 100,
    experience: "Intermediate",
    categories: [] as string[],
    portfolioLinks: [] as string[],
  });
  const [newSkill, setNewSkill] = useState("");
  const [newLink, setNewLink] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const addSkill = () => {
    if (!newSkill.trim() || form.skills.some(s => s.name.toLowerCase() === newSkill.toLowerCase())) return;
    setForm({ ...form, skills: [...form.skills, { name: newSkill.trim(), level: 3 }] });
    setNewSkill("");
  };

  const removeSkill = (name: string) => setForm({ ...form, skills: form.skills.filter(s => s.name !== name) });
  const setSkillLevel = (name: string, level: number) => setForm({ ...form, skills: form.skills.map(s => s.name === name ? { ...s, level } : s) });

  const toggleCategory = (cat: string) => {
    setForm({ ...form, categories: form.categories.includes(cat) ? form.categories.filter(c => c !== cat) : [...form.categories, cat] });
  };

  const addLink = () => { if (!newLink.trim()) return; setForm({ ...form, portfolioLinks: [...form.portfolioLinks, newLink.trim()] }); setNewLink(""); };
  const removeLink = (i: number) => setForm({ ...form, portfolioLinks: form.portfolioLinks.filter((_, idx) => idx !== i) });

  const handleSave = () => {
    if (!form.name.trim()) return;
    setProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div><h1 className="text-3xl font-extrabold mb-1">Profile</h1><p className="text-gray-500">Your professional profile powers AI matching and proposal generation.</p></div>

      <div className="card space-y-6">
        {/* Basic */}
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="text-xs text-gray-500 mb-1 block font-medium">Full Name *</label><input className="input" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><label className="text-xs text-gray-500 mb-1 block font-medium">Professional Title</label><input className="input" placeholder="Full-Stack Developer" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
        </div>

        <div><label className="text-xs text-gray-500 mb-1 block font-medium">Bio / Elevator Pitch</label>
          <textarea className="input min-h-[100px] text-sm" placeholder="Brief description of your expertise and what you offer..." value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
          <p className="text-xs text-gray-600 mt-1">Used by AI to personalize proposals.</p>
        </div>

        {/* Skills */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block font-medium">Skills & Proficiency</label>
          <div className="flex gap-2 mb-3">
            <input className="input flex-1" placeholder="e.g. React, Node.js, Python" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} />
            <button onClick={addSkill} className="btn-secondary flex items-center gap-1"><Plus size={16} /> Add</button>
          </div>
          <div className="space-y-2">
            {form.skills.map(s => (
              <div key={s.name} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03]">
                <span className="text-sm font-medium flex-1">{s.name}</span>
                <div className="flex gap-1">{[1,2,3,4,5].map(l => (
                  <button key={l} onClick={() => setSkillLevel(s.name, l)} className={`w-6 h-6 rounded-md text-xs font-bold transition-all ${l <= s.level ? "bg-blue-600 text-white" : "bg-white/[0.06] text-gray-600"}`}>{l}</button>
                ))}</div>
                <button onClick={() => removeSkill(s.name)} className="text-gray-600 hover:text-red-400"><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Rate & Experience */}
        <div className="grid md:grid-cols-3 gap-4">
          <div><label className="text-xs text-gray-500 mb-1 block font-medium">Min Rate ($/hr)</label><input type="number" className="input" value={form.hourlyRateMin} onChange={e => setForm({...form, hourlyRateMin: parseInt(e.target.value)||0})} /></div>
          <div><label className="text-xs text-gray-500 mb-1 block font-medium">Max Rate ($/hr)</label><input type="number" className="input" value={form.hourlyRateMax} onChange={e => setForm({...form, hourlyRateMax: parseInt(e.target.value)||0})} /></div>
          <div><label className="text-xs text-gray-500 mb-1 block font-medium">Experience Level</label>
            <select className="input" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})}>
              {EXPERIENCE_LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block font-medium">Preferred Categories</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => toggleCategory(cat)} className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${form.categories.includes(cat) ? "bg-blue-600/20 border-blue-500/30 text-blue-400" : "bg-white/[0.03] border-white/[0.06] text-gray-500 hover:text-white"}`}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Portfolio */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block font-medium">Portfolio Links</label>
          <div className="flex gap-2 mb-3">
            <input className="input flex-1" placeholder="https://..." value={newLink} onChange={e => setNewLink(e.target.value)} onKeyDown={e => e.key === "Enter" && addLink()} />
            <button onClick={addLink} className="btn-secondary flex items-center gap-1"><Plus size={16} /></button>
          </div>
          {form.portfolioLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5">
              <span className="text-sm text-blue-400 truncate flex-1">{link}</span>
              <button onClick={() => removeLink(i)} className="text-gray-600 hover:text-red-400"><X size={14} /></button>
            </div>
          ))}
        </div>

        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save size={18} /> {saved ? "Saved ✓" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
