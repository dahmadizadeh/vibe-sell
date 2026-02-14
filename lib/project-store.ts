import type { Project } from "./types";

const STORAGE_KEY = "vibesell_projects";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadAllProjects(): Project[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

export function saveAllProjects(projects: Project[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function loadProject(id: string): Project | undefined {
  return loadAllProjects().find((p) => p.id === id);
}

export function saveProject(project: Project): void {
  const all = loadAllProjects();
  const idx = all.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    all[idx] = project;
  } else {
    all.push(project);
  }
  saveAllProjects(all);
}

export function deleteProject(id: string): void {
  const all = loadAllProjects().filter((p) => p.id !== id);
  saveAllProjects(all);
}
