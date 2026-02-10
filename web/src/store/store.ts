import { create } from "zustand";

export interface UserProfile {
  name: string;
  title: string;
  bio: string;
  skills: { name: string; level: number }[];
  hourlyRateMin: number;
  hourlyRateMax: number;
  experience: string;
  categories: string[];
  portfolioLinks: string[];
}

export interface SavedJob {
  id: string;
  title: string;
  link: string;
  budget: string;
  description: string;
  skills: string[];
  category: string;
  jobType: string;
  experienceLevel: string;
  clientCountry: string;
  pubDate: string;
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
  status: "draft" | "sent" | "viewed" | "replied";
  score?: number;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

export interface AutoReplyTemplate {
  id: string;
  name: string;
  message: string;
  condition: string;
  minScore: number;
  enabled: boolean;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: "search" | "proposal" | "save" | "apply" | "score";
  message: string;
  timestamp: string;
}

interface AppState {
  profile: UserProfile | null;
  savedJobs: SavedJob[];
  proposals: SavedProposal[];
  proposalTemplates: ProposalTemplate[];
  autoReplyTemplates: AutoReplyTemplate[];
  scoreCache: Record<string, number>;
  activities: ActivityItem[];
  settings: {
    notifications: boolean;
    aiModel: string;
    theme: string;
    geminiKey: string;
  };
  setProfile: (p: UserProfile) => void;
  saveJob: (j: SavedJob) => void;
  updateJobStatus: (id: string, status: SavedJob["status"]) => void;
  removeJob: (id: string) => void;
  addProposal: (p: SavedProposal) => void;
  updateProposal: (id: string, updates: Partial<SavedProposal>) => void;
  addProposalTemplate: (t: ProposalTemplate) => void;
  removeProposalTemplate: (id: string) => void;
  addAutoReplyTemplate: (t: AutoReplyTemplate) => void;
  updateAutoReplyTemplate: (id: string, updates: Partial<AutoReplyTemplate>) => void;
  removeAutoReplyTemplate: (id: string) => void;
  setScoreCache: (id: string, score: number) => void;
  addActivity: (a: Omit<ActivityItem, "id" | "timestamp">) => void;
  updateSettings: (s: Partial<AppState["settings"]>) => void;
  clearAllData: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = "freelanceflow-state";

function persist(state: Partial<AppState>) {
  if (typeof window === "undefined") return;
  const data = {
    profile: state.profile,
    savedJobs: state.savedJobs,
    proposals: state.proposals,
    proposalTemplates: state.proposalTemplates,
    autoReplyTemplates: state.autoReplyTemplates,
    scoreCache: state.scoreCache,
    activities: state.activities,
    settings: state.settings,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const useStore = create<AppState>((set, get) => ({
  profile: null,
  savedJobs: [],
  proposals: [],
  proposalTemplates: [],
  autoReplyTemplates: [],
  scoreCache: {},
  activities: [],
  settings: { notifications: true, aiModel: "gemini-2.0-flash", theme: "dark", geminiKey: "" },

  setProfile: (p) => { set({ profile: p }); persist(get()); },
  saveJob: (j) => {
    const jobs = [...get().savedJobs.filter((x) => x.id !== j.id), j];
    set({ savedJobs: jobs }); persist(get());
  },
  updateJobStatus: (id, status) => {
    const jobs = get().savedJobs.map((j) => j.id === id ? { ...j, status } : j);
    set({ savedJobs: jobs }); persist(get());
  },
  removeJob: (id) => {
    const jobs = get().savedJobs.filter((j) => j.id !== id);
    set({ savedJobs: jobs }); persist(get());
  },
  addProposal: (p) => {
    const proposals = [p, ...get().proposals];
    set({ proposals }); persist(get());
  },
  updateProposal: (id, updates) => {
    const proposals = get().proposals.map((p) => p.id === id ? { ...p, ...updates } : p);
    set({ proposals }); persist(get());
  },
  addProposalTemplate: (t) => {
    const templates = [...get().proposalTemplates, t];
    set({ proposalTemplates: templates }); persist(get());
  },
  removeProposalTemplate: (id) => {
    const templates = get().proposalTemplates.filter((t) => t.id !== id);
    set({ proposalTemplates: templates }); persist(get());
  },
  addAutoReplyTemplate: (t) => {
    const templates = [...get().autoReplyTemplates, t];
    set({ autoReplyTemplates: templates }); persist(get());
  },
  updateAutoReplyTemplate: (id, updates) => {
    const templates = get().autoReplyTemplates.map((t) => t.id === id ? { ...t, ...updates } : t);
    set({ autoReplyTemplates: templates }); persist(get());
  },
  removeAutoReplyTemplate: (id) => {
    const templates = get().autoReplyTemplates.filter((t) => t.id !== id);
    set({ autoReplyTemplates: templates }); persist(get());
  },
  setScoreCache: (id, score) => {
    const scoreCache = { ...get().scoreCache, [id]: score };
    set({ scoreCache }); persist(get());
  },
  addActivity: (a) => {
    const activity: ActivityItem = { ...a, id: Date.now().toString(36), timestamp: new Date().toISOString() };
    const activities = [activity, ...get().activities].slice(0, 50);
    set({ activities }); persist(get());
  },
  updateSettings: (s) => {
    const settings = { ...get().settings, ...s };
    set({ settings }); persist(get());
  },
  clearAllData: () => {
    set({ profile: null, savedJobs: [], proposals: [], proposalTemplates: [], autoReplyTemplates: [], scoreCache: {}, activities: [] });
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
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
          proposalTemplates: data.proposalTemplates || [],
          autoReplyTemplates: data.autoReplyTemplates || [],
          scoreCache: data.scoreCache || {},
          activities: data.activities || [],
          settings: { ...{ notifications: true, aiModel: "gemini-2.0-flash", theme: "dark", geminiKey: "" }, ...data.settings },
        });
      }
    } catch { /* ignore */ }
  },
}));
