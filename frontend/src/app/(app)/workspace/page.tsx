"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus, FolderOpen, Calendar, AlertTriangle,
  CheckCircle2, MoreHorizontal, ArrowUpRight,
} from "lucide-react";
import { projectApi } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspace.store";
import { Project, ProjectStatus } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  PLANNING: { label: "Planning", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  ACTIVE:   { label: "Active",   className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  COMPLETED:{ label: "Done",     className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  ARCHIVED: { label: "Archived", className: "bg-muted text-muted-foreground" },
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl bg-muted" />
        <div className="w-16 h-5 rounded-full bg-muted" />
      </div>
      <div className="space-y-1.5">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
      <div className="h-1.5 rounded-full bg-muted" />
    </div>
  );
}

export default function WorkspacePage() {
  const router = useRouter();
  const { activeWorkspace, projects, setProjects, setActiveProject } = useWorkspaceStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeWorkspace) return;
    setLoading(true);
    projectApi.list(activeWorkspace.id)
      .then((res) => setProjects(res.data))
      .finally(() => setLoading(false));
  }, [activeWorkspace?.id]);

  const openKanban = (project: Project) => {
    setActiveProject(project);
    router.push("/kanban");
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1.5">
            <div className="h-7 w-32 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-9 w-32 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""} in{" "}
            <span className="text-foreground font-medium">{activeWorkspace?.name}</span>
          </p>
        </div>
        <button
          onClick={() => router.push("/project/new")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-sm shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          New project
        </button>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No projects yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            Create your first project to start organizing tasks and tracking progress.
          </p>
          <button
            onClick={() => router.push("/project/new")}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            Create first project
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const progress = project.taskCount > 0
              ? Math.round((project.completedTaskCount / project.taskCount) * 100)
              : 0;
            const status = STATUS_CONFIG[project.status];

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => openKanban(project)}
                className="group rounded-2xl border bg-card p-5 cursor-pointer hover:shadow-lg hover:border-indigo-500/20 transition-all duration-200 relative overflow-hidden"
              >
                {/* Top color accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-60"
                  style={{ backgroundColor: project.color }}
                />

                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: project.color + "20", border: `1px solid ${project.color}30` }}
                  >
                    <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: project.color }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", status.className)}>
                      {status.label}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-1 mb-1">
                  {project.name}
                </h3>

                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{progress}% complete</span>
                    <span>{project.completedTaskCount}/{project.taskCount} tasks</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: project.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 + 0.2 }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {project.overdueTaskCount > 0 && (
                    <span className="flex items-center gap-1 text-red-500 font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      {project.overdueTaskCount} overdue
                    </span>
                  )}
                  {project.overdueTaskCount === 0 && project.completedTaskCount === project.taskCount && project.taskCount > 0 && (
                    <span className="flex items-center gap-1 text-emerald-500 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      All done
                    </span>
                  )}
                  {project.dueDate && (
                    <span className="flex items-center gap-1 ml-auto">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(project.dueDate), "MMM d")}
                    </span>
                  )}
                  <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition text-indigo-500" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
