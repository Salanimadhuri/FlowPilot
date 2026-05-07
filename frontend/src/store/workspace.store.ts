import { create } from "zustand";
import { Workspace, Project, Task } from "@/types";

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  projects: Project[];
  activeProject: Project | null;
  tasks: Task[];
  setWorkspaces: (ws: Workspace[]) => void;
  setActiveWorkspace: (ws: Workspace | null) => void;
  setProjects: (projects: Project[]) => void;
  setActiveProject: (project: Project | null) => void;
  setTasks: (tasks: Task[]) => void;
  updateTask: (task: Task) => void;
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (id: string) => void;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  activeWorkspace: null,
  projects: [],
  activeProject: null,
  tasks: [],

  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
  setProjects: (projects) => set({ projects }),
  setActiveProject: (activeProject) => set({ activeProject }),
  setTasks: (tasks) => set({ tasks }),

  updateTask: (updated) =>
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === updated.id ? updated : t)) })),

  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),

  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  addProject: (project) => set((s) => ({ projects: [project, ...s.projects] })),

  updateProject: (updated) =>
    set((s) => ({ projects: s.projects.map((p) => (p.id === updated.id ? updated : p)) })),

  removeProject: (id) =>
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

  reset: () => set({ workspaces: [], activeWorkspace: null, projects: [], activeProject: null, tasks: [] }),
}));
