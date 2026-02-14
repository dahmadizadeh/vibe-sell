import { create } from "zustand";
import type { Project, Contact, EmailDraft, Targeting, ProductPage, PitchPage, ProjectMode, UserProfile, Conversation, PMFScore } from "./types";
import { loadAllProjects, saveProject } from "./project-store";
import { generateId } from "./utils";

interface AppState {
  projects: Project[];
  currentProjectId: string | null;
  userProfile: UserProfile | null;

  // Hydrate from localStorage
  hydrate: () => void;

  // Project CRUD
  createProject: (params: {
    mode: ProjectMode;
    title: string;
    description: string;
    targetCompanies?: string[];
  }) => string; // returns project id
  getProject: (id: string) => Project | undefined;
  updateProject: (id: string, partial: Partial<Project>) => void;
  cloneProject: (id: string, newCompany: string) => string; // returns new project id

  // User profile
  setUserProfile: (profile: UserProfile) => void;

  // Granular updates
  setContacts: (id: string, contacts: Contact[]) => void;
  setEmailDrafts: (id: string, drafts: EmailDraft[]) => void;
  setTargeting: (id: string, targeting: Targeting) => void;
  setProductPage: (id: string, page: ProductPage) => void;
  setPitchPages: (id: string, pages: PitchPage[]) => void;
  updateEmailDraft: (projectId: string, contactId: string, draft: Partial<EmailDraft>) => void;
  markDraftStatus: (projectId: string, contactId: string, status: 'drafted' | 'sent') => void;
  addConversation: (projectId: string, conversation: Conversation) => void;
  updatePMFScore: (projectId: string, pmfScore: PMFScore) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: [],
  currentProjectId: null,
  userProfile: null,

  hydrate: () => {
    const projects = loadAllProjects();
    let userProfile: UserProfile | null = null;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("vibesell_user_profile");
        if (raw) userProfile = JSON.parse(raw);
      } catch {}
    }
    set({ projects, userProfile });
  },

  createProject: ({ mode, title, description, targetCompanies }) => {
    const id = generateId();
    const project: Project = {
      id,
      mode,
      title,
      description,
      createdAt: new Date().toISOString(),
      targeting: { industries: [], companySize: { min: 0, max: 0 }, titles: [], regions: [], summary: "" },
      contacts: [],
      emailDrafts: [],
      stats: { contactsFound: 0, emailsSent: 0, replies: 0, meetingsBooked: 0 },
      targetCompanies,
    };
    saveProject(project);
    set((state) => ({ projects: [...state.projects, project], currentProjectId: id }));
    // Increment landing page counter
    try {
      const prev = parseInt(localStorage.getItem("vibe_sell_app_count") || "847", 10);
      localStorage.setItem("vibe_sell_app_count", String(prev + 1));
    } catch {}
    return id;
  },

  setUserProfile: (profile) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vibesell_user_profile", JSON.stringify(profile));
    }
    set({ userProfile: profile });
  },

  getProject: (id) => {
    return get().projects.find((p) => p.id === id);
  },

  updateProject: (id, partial) => {
    set((state) => {
      const projects = state.projects.map((p) =>
        p.id === id ? { ...p, ...partial } : p
      );
      const updated = projects.find((p) => p.id === id);
      if (updated) saveProject(updated);
      return { projects };
    });
  },

  cloneProject: (id, newCompany) => {
    const source = get().getProject(id);
    if (!source) return "";
    const newId = generateId();
    const cloned: Project = {
      ...source,
      id: newId,
      createdAt: new Date().toISOString(),
      targetCompanies: [newCompany],
      contacts: [],
      emailDrafts: [],
      pitchPages: [],
      stats: { contactsFound: 0, emailsSent: 0, replies: 0, meetingsBooked: 0 },
    };
    saveProject(cloned);
    set((state) => ({ projects: [...state.projects, cloned], currentProjectId: newId }));
    return newId;
  },

  setContacts: (id, contacts) => {
    get().updateProject(id, {
      contacts,
      stats: { ...get().getProject(id)!.stats, contactsFound: contacts.length },
    });
  },

  setEmailDrafts: (id, drafts) => {
    get().updateProject(id, { emailDrafts: drafts });
  },

  setTargeting: (id, targeting) => {
    get().updateProject(id, { targeting });
  },

  setProductPage: (id, page) => {
    get().updateProject(id, { productPage: page });
  },

  setPitchPages: (id, pages) => {
    get().updateProject(id, { pitchPages: pages });
  },

  updateEmailDraft: (projectId, contactId, draftUpdate) => {
    const project = get().getProject(projectId);
    if (!project) return;
    const drafts = project.emailDrafts.map((d) =>
      d.contactId === contactId ? { ...d, ...draftUpdate } : d
    );
    get().updateProject(projectId, { emailDrafts: drafts });
  },

  markDraftStatus: (projectId, contactId, status) => {
    const project = get().getProject(projectId);
    if (!project) return;
    const drafts = project.emailDrafts.map((d) =>
      d.contactId === contactId ? { ...d, status } : d
    );
    get().updateProject(projectId, { emailDrafts: drafts });
  },

  addConversation: (projectId, conversation) => {
    const project = get().getProject(projectId);
    if (!project) return;
    const conversations = [...(project.conversations || []), conversation];
    get().updateProject(projectId, { conversations });
  },

  updatePMFScore: (projectId, pmfScore) => {
    get().updateProject(projectId, { pmfScore });
  },
}));
