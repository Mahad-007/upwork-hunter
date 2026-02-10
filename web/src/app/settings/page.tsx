"use client";
import { useState } from "react";
import { useStore } from "@/store/store";
import { Bell, Cpu, Database, Key, Download, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings, clearAllData, savedJobs, proposals, scoreCache } = useStore();
  const [saved, setSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const exportAllData = () => {
    const data = { savedJobs, proposals, scoreCache, settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "freelanceflow-data.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => { if (confirmClear) { clearAllData(); setConfirmClear(false); } else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); } };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div><h1 className="text-3xl font-bold mb-1">Settings</h1><p className="text-gray-600 dark:text-gray-400 font-medium">Configure your FreelanceFlow experience.</p></div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-300 dark:bg-blue-400 border-2 border-black flex items-center justify-center" style={{ boxShadow: "2px 2px 0px black" }}>
            <Bell size={16} className="text-black" />
          </div>
          <h2 className="text-lg font-bold">Notifications</h2>
        </div>
        <div className="flex items-center justify-between p-3 border-2 border-black/10 dark:border-green-500/20">
          <div><div className="text-sm font-bold">Enable Notifications</div><div className="text-xs text-gray-500">Get alerts for new matches and replies</div></div>
          <button onClick={() => updateSettings({ notifications: !settings.notifications })} className={`w-12 h-6 border-2 border-black relative transition-all ${settings.notifications ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`}>
            <div className={`w-5 h-5 bg-white border-2 border-black absolute top-0 transition-all ${settings.notifications ? "left-5" : "left-0"}`} />
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-purple-300 dark:bg-purple-400 border-2 border-black flex items-center justify-center" style={{ boxShadow: "2px 2px 0px black" }}>
            <Cpu size={16} className="text-black" />
          </div>
          <h2 className="text-lg font-bold">AI Model</h2>
        </div>
        <div><label className="text-xs font-bold text-gray-500 mb-1 block">Model</label>
          <select className="input" value={settings.aiModel} onChange={e => updateSettings({ aiModel: e.target.value })}>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast)</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Quality)</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-yellow-300 dark:bg-yellow-400 border-2 border-black flex items-center justify-center" style={{ boxShadow: "2px 2px 0px black" }}>
            <Key size={16} className="text-black" />
          </div>
          <h2 className="text-lg font-bold">API Keys</h2>
        </div>
        <div><label className="text-xs font-bold text-gray-500 mb-1 block">Gemini API Key (optional override)</label>
          <input type="password" className="input" placeholder="Set via GEMINI_API_KEY env var" value={settings.geminiKey} onChange={e => updateSettings({ geminiKey: e.target.value })} />
          <p className="text-xs text-gray-400 mt-1 font-medium">Leave blank to use the server&apos;s default key.</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green-300 dark:bg-green-400 border-2 border-black flex items-center justify-center" style={{ boxShadow: "2px 2px 0px black" }}>
            <Database size={16} className="text-black" />
          </div>
          <h2 className="text-lg font-bold">Data Management</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border-2 border-black/10 dark:border-green-500/20">
            <div><div className="text-sm font-bold">Export All Data</div><div className="text-xs text-gray-500">{savedJobs.length} jobs, {proposals.length} proposals</div></div>
            <button onClick={exportAllData} className="btn-secondary text-sm flex items-center gap-2"><Download size={14} /> Export</button>
          </div>
          <div className="flex items-center justify-between p-3 border-2 border-red-500">
            <div><div className="text-sm font-bold text-red-600">Clear All Data</div><div className="text-xs text-gray-500">This cannot be undone</div></div>
            <button onClick={handleClear} className={`text-sm px-4 py-2 border-2 border-black font-bold transition-all ${confirmClear ? "bg-red-500 text-white" : "bg-red-100 dark:bg-red-500/10 text-red-600"}`} style={{ boxShadow: "2px 2px 0px black" }}>
              {confirmClear ? "Confirm Clear" : "Clear"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
