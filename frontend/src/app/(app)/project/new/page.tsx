"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Calendar, Layers } from "lucide-react";
import { projectApi } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const COLORS = [
  "#6366f1", "#8b5cf6", "#0ea5e9", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#14b8a6",
];

export default function NewProjectPage() {
  const router = useRouter();
  const { activeWorkspace, addProject } = useWorkspaceStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [dueDate, setDueDate] = useState("");

const onSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!activeWorkspace) {
       toast({
         title: "No workspace selected",
         description: "Please select a workspace first",
         variant: "destructive",
       });
       return;
     }
     setLoading(true);
     try {
       const res = await projectApi.create(activeWorkspace.id, {
         name, description, color, dueDate: dueDate || null,
       });
       addProject(res.data);
       toast({ title: "Project created", description: `"${name}" is ready.` });
       router.push("/workspace");
     } catch (err: any) {
       if (err.response?.status === 403) {
         toast({
           title: "Permission denied",
           description: "Only workspace admins can create projects",
           variant: "destructive",
         });
       } else {
         toast({
           title: "Failed to create project",
           description: err.response?.data?.message || "Something went wrong",
           variant: "destructive",
         });
       }
     } finally {
       setLoading(false);
     }
   };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to projects
      </button>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 rounded-2xl border bg-card p-6"
        >
          <h1 className="text-xl font-bold mb-1">New project</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Projects group related tasks and track progress.
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium block mb-1.5">Project name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mobile App Revamp"
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all duration-150",
                      color === c ? "ring-2 ring-offset-2 ring-offset-card scale-110" : "hover:scale-105"
                    )}
                    style={{
                      backgroundColor: c,
                      ringColor: c,
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">
                Due date <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating…" : "Create project"}
            </button>
          </form>
        </motion.div>

        {/* Live preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Preview</p>
          <div className="rounded-2xl border bg-card p-5 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: color }}
            />
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: color + "20", border: `1px solid ${color}30` }}
              >
                <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: color }} />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Active
              </span>
            </div>
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">
              {name || <span className="text-muted-foreground">Project name</span>}
            </h3>
            {description ? (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{description}</p>
            ) : (
              <p className="text-xs text-muted-foreground/40 mb-4 italic">No description</p>
            )}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>0% complete</span>
                <span>0/0 tasks</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted" />
            </div>
            {dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            )}
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-muted/40 border border-dashed">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Layers className="w-3.5 h-3.5" />
              <span>Tasks will appear on the Kanban board after creation.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
