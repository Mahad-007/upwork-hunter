"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/store";
import { Save, Plus, X } from "lucide-react";

export default function ProfilePage() {
  const { profile, setProfile } = useStore();

  const [name, setName] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [rateMin, setRateMin] = useState(25);
  const [rateMax, setRateMax] = useState(75);
  const [experience, setExperience] = useState("intermediate");
  const [catInput, setCatInput] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setSkills(profile.skills);
      setRateMin(profile.hourlyRateMin);
      setRateMax(profile.hourlyRateMax);
      setExperience(profile.experience);
      setCategories(profile.categories);
    }
  }, [profile]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  };

  const addCategory = () => {
    const c = catInput.trim();
    if (c && !categories.includes(c)) {
      setCategories([...categories, c]);
      setCatInput("");
    }
  };

  const handleSave = () => {
    setProfile({
      name,
      skills,
      hourlyRateMin: rateMin,
      hourlyRateMax: rateMax,
      experience,
      categories,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile Setup</h1>
      <p className="text-gray-400">Configure your profile for AI job matching.</p>

      <div className="card space-y-5">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="input"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1">Skills</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              placeholder="Add a skill..."
              className="input"
            />
            <button onClick={addSkill} className="btn-secondary shrink-0">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((s) => (
              <span key={s} className="badge bg-brand-900 text-brand-300 flex items-center gap-1">
                {s}
                <button onClick={() => setSkills(skills.filter((x) => x !== s))}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Hourly Rate */}
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1">
            Hourly Rate Range (USD)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={rateMin}
              onChange={(e) => setRateMin(Number(e.target.value))}
              className="input w-28"
              min={0}
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              value={rateMax}
              onChange={(e) => setRateMax(Number(e.target.value))}
              className="input w-28"
              min={0}
            />
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1">Experience Level</label>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="input"
          >
            <option value="entry">Entry Level</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        {/* Categories */}
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1">
            Preferred Categories
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={catInput}
              onChange={(e) => setCatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
              placeholder="Add a category..."
              className="input"
            />
            <button onClick={addCategory} className="btn-secondary shrink-0">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map((c) => (
              <span key={c} className="badge bg-purple-900 text-purple-300 flex items-center gap-1">
                {c}
                <button onClick={() => setCategories(categories.filter((x) => x !== c))}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save size={16} />
          {saved ? "Saved!" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
