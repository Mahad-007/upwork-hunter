"use client";
import { useState } from "react";
import { useStore } from "@/store/store";
import { Settings as SettingsIcon, Bell, Cpu, Database, Palette, Key, Download, Trash2, Check } from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings, clearAllData, savedJobs, proposals, scoreCache } = useStore();
  const [saved, setSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const exportAllData = () => {
    const data = { savedJobs, proposals, scoreCache, settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "upwork-hunter-data.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => { if (confirmClear) { clearAllData(); setConfirmClear(false); } else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); } };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div><h1 className="text-3xl font-extrabold mb-1">Settings</h1><p className="text-gray-500">Configure your Upwork Hunter experience.</p></div>

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4"><Bell size={18} className="text-blue-400" /><h2 className="text-lg font-bold">Notifications</h2></div>
        <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] cursor-pointer">
          <div><div className="text-sm font-medium">Enable Notifications</div><div className="text-xs text-gray-500">Get alerts for new matches and replies</div></div>
          <button onClick={() => updateSettings({ notifications: !settings.notifications })} className={`w-12 h-6 rounded-full transition-all relative ${settings.notifications ? "bg-blue-600" : "bg-white/[0.1]"}`}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings.notifications ? "left-6" : "left-0.5"}`} />
          </button>
        </label>
      </div>

      {/* AI Model */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4"><Cpu size={18} className="text-purple-400" /><h2 className="text-lg font-bold">AI Model</h2></div>
        <div className="space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block font-medium">Model</label>
            <select className="input" value={settings.aiModel} onChange={e => updateSettings({ aiModel: e.target.value })}>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Quality)</option>
            </select>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4"><Key size={18} className="text-yellow-400" /><h2 className="text-lg font-bold">API Keys</h2></div>
        <div><label className="text-xs text-gray-500 mb-1 block font-medium">Gemini API Key (optional override)</label>
          <input type="password" className="input" placeholder="Set via GEMINI_API_KEY env var" value={settings.geminiKey} onChange={e => updateSettings({ geminiKey: e.target.value })} />
          <p className="text-xs text-gray-600 mt-1">Leave blank to use the server&apos;s default key.</p>
        </div>
      </div>

      {/* Data */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4"><Database size={18} className="text-green-400" /><h2 className="text-lg font-bold">Data Management</h2></div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
            <div><div className="text-sm font-medium">Export All Data</div><div className="text-xs text-gray-500">{savedJobs.length} jobs, {proposals.length} proposals</div></div>
            <button onClick={exportAllData} className="btn-secondary text-sm flex items-center gap-2"><Download size={14} /> Export</button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
            <div><div className="text-sm font-medium text-red-400">Clear All Data</div><div className="text-xs text-gray-500">This cannot be undone</div></div>
            <button onClick={handleClear} className={`text-sm px-4 py-2 rounded-xl font-medium transition-all ${confirmClear ? "bg-red-600 text-white" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}>
              {confirmClear ? "Confirm Clear" : "Clear"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
