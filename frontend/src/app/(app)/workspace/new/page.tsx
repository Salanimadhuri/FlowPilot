"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Users, Zap } from "lucide-react";
import { workspaceApi } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useToast } from "@/hooks/use-toast";

const GRADIENTS = [
  ["#6366f1", "#8b5cf6"],
  ["#0ea5e9", "#6366f1"],
  ["#10b981", "#0ea5e9"],
  ["#f59e0b", "#ef4444"],
  ["#ec4899", "#8b5cf6"],
  ["#14b8a6", "#6366f1"],
];

export default function NewWorkspacePage() {
  const router = useRouter();
  const { setWorkspaces, setActiveWorkspace, workspaces } = useWorkspaceStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gradientIdx, setGradientIdx] = useState(0);

  const [from, to] = GRADIENTS[gradientIdx];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await workspaceApi.create({ name, description });
      const updated = [...workspaces, res.data];
      setWorkspaces(updated);
      setActiveWorkspace(res.data);
      toast({ title: "Workspace created", description: `"${name}" is ready.` });
      router.push("/dashboard");
    } catch (err: any) {
      toast({
        title: "Failed to create workspace",
        description: err.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
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
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 rounded-2xl border bg-card p-6"
        >
          <h1 className="text-xl font-bold mb-1">New workspace</h1>
          <p className="text-sm text-muted-foreground mb-6">
            A workspace is a shared space for your team's projects and tasks.
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium block mb-1.5">Workspace name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Engineering"
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
                placeholder="What does this workspace focus on?"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Avatar gradient</label>
              <div className="flex gap-2 flex-wrap">
                {GRADIENTS.map(([f, t], i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGradientIdx(i)}
                    className={`w-8 h-8 rounded-lg transition-all duration-150 ${gradientIdx === i ? "ring-2 ring-offset-2 ring-offset-card ring-indigo-500 scale-110" : "hover:scale-105"}`}
                    style={{ background: `linear-gradient(135deg, ${f}, ${t})` }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating…" : "Create workspace"}
            </button>
          </form>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preview</p>

          {/* Workspace card preview */}
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl shrink-0 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
              />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">
                  {name || <span className="text-muted-foreground">Workspace name</span>}
                </p>
                <p className="text-xs text-muted-foreground">1 member · 0 projects</p>
              </div>
            </div>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
            )}
          </div>

          {/* Sidebar preview */}
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3 font-medium">Sidebar appearance</p>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50">
              <div
                className="w-5 h-5 rounded-md shrink-0"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
              />
              <span className="text-xs font-medium truncate">
                {name || "Workspace name"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-dashed">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Invite team members after creating the workspace.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
