"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, FolderKanban, Settings,
  ChevronDown, Plus, LogOut, PanelLeftClose, PanelLeftOpen,
  Users, Kanban,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { workspaceApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export function AppSidebar() {
   const router = useRouter();
   const pathname = usePathname();
   const { user, clearAuth } = useAuthStore();
   const { workspaces, activeWorkspace, setWorkspaces, setActiveWorkspace } = useWorkspaceStore();
   const [wsOpen, setWsOpen] = useState(false);
   const [collapsed, setCollapsed] = useState(false);

   useEffect(() => {
     if (!user) {
       setWorkspaces([]);
       setActiveWorkspace(null);
       return;
     }
     workspaceApi.list().then((res) => {
       setWorkspaces(res.data);
       if (res.data.length > 0 && !activeWorkspace) setActiveWorkspace(res.data[0]);
     });
   }, [user?.id]);

  const nav = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/workspace", icon: FolderKanban, label: "Projects" },
    { href: "/kanban", icon: Kanban, label: "Board" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 232 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-screen border-r bg-card flex flex-col shrink-0 overflow-hidden relative"
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
                <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-sm tracking-tight">FlowPilot</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "text-muted-foreground hover:text-foreground transition rounded-md p-1 hover:bg-muted",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Workspace switcher */}
      {!collapsed && (
        <div className="px-3 pt-3 shrink-0">
          <button
            onClick={() => setWsOpen(!wsOpen)}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted transition group"
          >
            {activeWorkspace ? (
              <div
                className="w-5 h-5 rounded-md shrink-0"
                style={{ background: `linear-gradient(135deg, ${activeWorkspace.gradientFrom}, ${activeWorkspace.gradientTo})` }}
              />
            ) : (
              <div className="w-5 h-5 rounded-md bg-muted shrink-0" />
            )}
            <span className="flex-1 text-left truncate text-xs font-medium text-foreground">
              {activeWorkspace?.name ?? "Select workspace"}
            </span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200", wsOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {wsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
                transition={{ duration: 0.15 }}
                className="mt-1 rounded-xl border bg-card shadow-lg overflow-hidden origin-top"
              >
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => { setActiveWorkspace(ws); setWsOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted text-xs transition",
                      activeWorkspace?.id === ws.id && "bg-muted"
                    )}
                  >
                    <div
                      className="w-5 h-5 rounded-md shrink-0"
                      style={{ background: `linear-gradient(135deg, ${ws.gradientFrom}, ${ws.gradientTo})` }}
                    />
                    <span className="truncate font-medium">{ws.name}</span>
                    {activeWorkspace?.id === ws.id && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </button>
                ))}
                <div className="border-t">
                  <button
                    onClick={() => { router.push("/workspace/new"); setWsOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted text-xs transition text-muted-foreground"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New workspace
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Collapsed workspace dot */}
      {collapsed && activeWorkspace && (
        <div className="flex justify-center pt-3 shrink-0">
          <div
            className="w-8 h-8 rounded-lg"
            style={{ background: `linear-gradient(135deg, ${activeWorkspace.gradientFrom}, ${activeWorkspace.gradientTo})` }}
          />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 pt-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition relative group",
                active
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-full"
                />
              )}
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover border rounded-md text-xs font-medium shadow-md opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className={cn("p-3 border-t shrink-0", collapsed && "px-2")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: user?.avatarColor ?? "#6366f1" }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <button
              onClick={() => { clearAuth(); router.push("/auth/login"); }}
              className="text-muted-foreground hover:text-foreground transition"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-1 py-1 rounded-lg hover:bg-muted transition group">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-background"
              style={{ backgroundColor: user?.avatarColor ?? "#6366f1" }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { clearAuth(); router.push("/auth/login"); }}
              className="text-muted-foreground hover:text-foreground transition opacity-0 group-hover:opacity-100"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
