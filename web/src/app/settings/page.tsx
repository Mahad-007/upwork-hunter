"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [cleared, setCleared] = useState(false);

  const clearData = () => {
    if (confirm("Clear all saved data? This cannot be undone.")) {
      localStorage.removeItem("upwork-hunter-state");
      setCleared(true);
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Data Management</h2>
        <p className="text-sm text-gray-400">
          All data is stored locally in your browser. Nothing is sent to any server except AI API calls.
        </p>
        <button
          onClick={clearData}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 size={16} />
          {cleared ? "Data cleared! Reloading..." : "Clear All Data"}
        </button>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">About</h2>
        <p className="text-sm text-gray-400">
          Upwork Hunter is an AI-powered job hunting assistant. It uses Google Gemini
          to score jobs against your profile and generate tailored proposals.
        </p>
        <p className="text-xs text-gray-600">Version 1.0.0</p>
      </div>
    </div>
  );
}
