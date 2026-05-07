"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bell, Shield, Palette, Check } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profile",       label: "Profile",       icon: User },
  { id: "workspace",     label: "Workspace",     icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security",      label: "Security",      icon: Shield },
];

const NOTIF_ITEMS = [
  { id: "task_assigned", label: "Task assigned to me",   desc: "Get notified when a task is assigned to you" },
  { id: "task_overdue",  label: "Task overdue reminders", desc: "Reminders for tasks past their due date" },
  { id: "project_update",label: "Project status changes", desc: "When a project status is updated" },
  { id: "member_joined", label: "New workspace member",  desc: "When someone joins your workspace" },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { activeWorkspace } = useWorkspaceStore();
  const [tab, setTab] = useState("profile");
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    task_assigned: true, task_overdue: true, project_update: false, member_joined: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and workspace preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <nav className="w-48 shrink-0 space-y-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition relative",
                tab === id
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab === id && (
                <motion.div
                  layoutId="settings-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-full"
                />
              )}
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="rounded-2xl border bg-card p-6"
            >
              {tab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-semibold mb-0.5">Profile</h2>
                    <p className="text-xs text-muted-foreground">Your personal information</p>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold ring-4 ring-background shadow-sm"
                      style={{ backgroundColor: user?.avatarColor ?? "#6366f1" }}
                    >
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Display name</label>
                      <input
                        defaultValue={user?.name}
                        className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Email address</label>
                      <input
                        defaultValue={user?.email}
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-xl border bg-muted text-sm text-muted-foreground cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">Email cannot be changed after registration.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition"
                  >
                    {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save changes"}
                  </button>
                </div>
              )}

              {tab === "workspace" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-semibold mb-0.5">Workspace</h2>
                    <p className="text-xs text-muted-foreground">Manage your active workspace settings</p>
                  </div>

                  {activeWorkspace ? (
                    <>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border">
                        <div
                          className="w-10 h-10 rounded-xl shrink-0"
                          style={{ background: `linear-gradient(135deg, ${activeWorkspace.gradientFrom}, ${activeWorkspace.gradientTo})` }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{activeWorkspace.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {activeWorkspace.memberCount} member{activeWorkspace.memberCount !== 1 ? "s" : ""} ·{" "}
                            {activeWorkspace.projectCount} project{activeWorkspace.projectCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-semibold">
                          Active
                        </span>
                      </div>

                      <div className="grid gap-4">
                        <div>
                          <label className="text-sm font-medium block mb-1.5">Workspace name</label>
                          <input
                            defaultValue={activeWorkspace.name}
                            className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1.5">Description</label>
                          <textarea
                            defaultValue={activeWorkspace.description ?? ""}
                            rows={3}
                            className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition resize-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition"
                      >
                        {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Update workspace"}
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No workspace selected.</p>
                  )}
                </div>
              )}

              {tab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-semibold mb-0.5">Notifications</h2>
                    <p className="text-xs text-muted-foreground">Choose what you want to be notified about</p>
                  </div>

                  <div className="space-y-1">
                    {NOTIF_ITEMS.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3.5 px-1 border-b last:border-0"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifs(n => ({ ...n, [item.id]: !n[item.id] }))}
                          className={cn(
                            "relative w-10 h-5.5 rounded-full transition-colors duration-200 shrink-0",
                            notifs[item.id] ? "bg-indigo-600" : "bg-muted-foreground/30"
                          )}
                          style={{ height: "22px" }}
                        >
                          <motion.span
                            animate={{ x: notifs[item.id] ? 18 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                            style={{ left: 0 }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-semibold mb-0.5">Security</h2>
                    <p className="text-xs text-muted-foreground">Update your password</p>
                  </div>

                  <div className="grid gap-4">
                    {[
                      { label: "Current password", placeholder: "Enter current password" },
                      { label: "New password",     placeholder: "Min. 8 characters" },
                      { label: "Confirm password", placeholder: "Repeat new password" },
                    ].map(({ label, placeholder }) => (
                      <div key={label}>
                        <label className="text-sm font-medium block mb-1.5">{label}</label>
                        <input
                          type="password"
                          placeholder={placeholder}
                          className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition"
                  >
                    {saved ? <><Check className="w-4 h-4" /> Updated!</> : "Update password"}
                  </button>

                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-semibold text-destructive mb-1">Danger zone</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Once you delete your account, there is no going back.
                    </p>
                    <button className="px-4 py-2 rounded-xl border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/5 transition">
                      Delete account
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
