"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, Zap, Activity, Calendar, TrendingUp,
} from "lucide-react";
import { MemberDashboardStats } from "@/types";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES = {
  LOW: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  HIGH: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  CRITICAL: "bg-red-500/10 text-red-600 border-red-500/20",
};

interface Props {
  stats: MemberDashboardStats;
  workspaceName: string;
}

export default function MemberDashboard({ stats, workspaceName }: Props) {
  const statCards = [
    {
      label: "Assigned Tasks",
      value: stats.assignedTasks,
      icon: Activity,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Completed",
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      trend: stats.assignedTasks > 0 ? Math.round((Number(stats.completedTasks) / Number(stats.assignedTasks)) * 100) : 0,
    },
    {
      label: "In Progress",
      value: stats.inProgressTasks,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Overdue",
      value: stats.overdueTasks,
      icon: Calendar,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  ];

  const circumference = 2 * Math.PI * 50;
  const focusDash = (stats.focusMeter / 100) * circumference;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {workspaceName} · personal overview
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="rounded-2xl border bg-card p-5 hover:shadow-md hover:border-border/80 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", card.bg)}>
                <card.icon className={cn("w-4 h-4", card.color)} />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">{card.value}</p>
            {"trend" in card && card.trend !== undefined && (
              <p className="text-xs text-muted-foreground mt-1.5">
                <span className="text-emerald-500 font-medium">{card.trend}%</span> completion rate
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Focus Meter */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border bg-card p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <span className="font-semibold text-sm">My Focus Meter</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" strokeWidth="8" className="stroke-muted" />
                <motion.circle
                  cx="60" cy="60" r="50" fill="none" strokeWidth="8"
                  stroke="url(#focusGrad)"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - focusDash }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                />
                <defs>
                  <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-3xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {stats.focusMeter.toFixed(0)}
                </motion.span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>

            <div className="w-full mt-6 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Personal Productivity</span>
                <span>{stats.focusMeter.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.focusMeter}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="rounded-2xl border bg-card p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="font-semibold text-sm">Upcoming Deadlines</span>
            {(stats.upcomingDeadlines?.length ?? 0) > 0 && (
              <span className="ml-auto text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                {stats.upcomingDeadlines?.length}
              </span>
            )}
          </div>

          {(stats.upcomingDeadlines?.length ?? 0) === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs text-muted-foreground">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-64">
              {(stats.upcomingDeadlines ?? []).map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border bg-card/50 px-3.5 py-3 hover:bg-card transition"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold leading-snug flex-1">{task.title}</span>
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border shrink-0",
                        PRIORITY_STYLES[task.priority]
                      )}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="truncate">{task.projectName}</span>
                    {task.dueDate && (
                      <span className="shrink-0 ml-2">
                        Due {format(new Date(task.dueDate), "MMM d")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* My Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.39 }}
          className="rounded-2xl border bg-card p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <span className="font-semibold text-sm">My Activity</span>
          </div>

          {(stats.recentActivity?.length ?? 0) === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              No activity yet
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto max-h-64 pr-1">
              {(stats.recentActivity ?? []).map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className="flex gap-3"
                >
                  <div className="relative shrink-0">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: log.actor?.avatarColor ?? "#6366f1" }}
                    >
                      {log.actor?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    {i < (stats.recentActivity?.length ?? 0) - 1 && (
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-px h-3 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-3">
                    <p className="text-xs leading-snug text-foreground">{log.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
