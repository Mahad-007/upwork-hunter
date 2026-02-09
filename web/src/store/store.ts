import { create } from "zustand";

export interface UserProfile {
  name: string;
  skills: string[];
  hourlyRateMin: number;
  hourlyRateMax: number;
  experience: string;
  categories: string[];
}

export interface SavedJob {
  id: string;
  title: string;
  link: string;
  budget: string;
  description: string;
  skills: string[];
  status: "saved" | "applied" | "rejected";
  score?: number;
  savedAt: string;
}

export interface SavedProposal {
  id: string;
  jobId: string;
  jobTitle: string;
  text: string;
  createdAt: string;
}

interface AppState {
  profile: UserProfile | null;
  savedJobs: SavedJob[];
  proposals: SavedProposal[];
  scoreCache: Record<string, number>;
  setProfile: (p: UserProfile) => void;
  saveJob: (j: SavedJob) => void;
  updateJobStatus: (id: string, status: SavedJob["status"]) => void;
  removeJob: (id: string) => void;
  addProposal: (p: SavedProposal) => void;
  setScoreCache: (id: string, score: number) => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = "upwork-hunter-state";

function persist(state: Partial<AppState>) {
  if (typeof window === "undefined") return;
  const data = {
    profile: state.profile,
    savedJobs: state.savedJobs,
    proposals: state.proposals,
    scoreCache: state.scoreCache,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const useStore = create<AppState>((set, get) => ({
  profile: null,
  savedJobs: [],
  proposals: [],
  scoreCache: {},

  setProfile: (p) => {
    set({ profile: p });
    persist({ ...get(), profile: p });
  },

  saveJob: (j) => {
    const jobs = [...get().savedJobs.filter((x) => x.id !== j.id), j];
    set({ savedJobs: jobs });
    persist({ ...get(), savedJobs: jobs });
  },

  updateJobStatus: (id, status) => {
    const jobs = get().savedJobs.map((j) =>
      j.id === id ? { ...j, status } : j
    );
    set({ savedJobs: jobs });
    persist({ ...get(), savedJobs: jobs });
  },

  removeJob: (id) => {
    const jobs = get().savedJobs.filter((j) => j.id !== id);
    set({ savedJobs: jobs });
    persist({ ...get(), savedJobs: jobs });
  },

  addProposal: (p) => {
    const proposals = [p, ...get().proposals];
    set({ proposals });
    persist({ ...get(), proposals });
  },

  setScoreCache: (id, score) => {
    const scoreCache = { ...get().scoreCache, [id]: score };
    set({ scoreCache });
    persist({ ...get(), scoreCache });
  },

  loadFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        set({
          profile: data.profile || null,
          savedJobs: data.savedJobs || [],
          proposals: data.proposals || [],
          scoreCache: data.scoreCache || {},
        });
      }
    } catch {}
  },
}));
