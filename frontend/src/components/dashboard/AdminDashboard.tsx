"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2, AlertTriangle, Clock, Flame,
  TrendingUp, Zap, Activity, ArrowUpRight,
} from "lucide-react";
import { DashboardStats } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

const RISK_STYLES: Record<string, { bar: string; badge: string; text: string }> = {
  CRITICAL: { bar: "bg-red-500", badge: "bg-red-500/10 border-red-500/20 text-red-500", text: "text-red-500" },
  HIGH: { bar: "bg-orange-500", badge: "bg-orange-500/10 border-orange-500/20 text-orange-500", text: "text-orange-500" },
  MEDIUM: { bar: "bg-yellow-500", badge: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500", text: "text-yellow-500" },
};

interface Props {
  stats: DashboardStats;
  workspaceName: string;
}

export default function AdminDashboard({ stats, workspaceName }: Props) {
  const statCards = [
    {
      label: "Total Tasks",
      value: stats.totalTasks,
      icon: Activity,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      trend: null,
    },
    {
      label: "Completed",
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      trend: stats.totalTasks > 0 ? Math.round((Number(stats.completedTasks) / Number(stats.totalTasks)) * 100) : 0,
    },
    {
      label: "Overdue",
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-500/10",
      trend: null,
    },
    {
      label: "In Progress",
      value: stats.inProgressTasks,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      trend: null,
    },
  ];

  const circumference = 2 * Math.PI * 50;
  const focusDash = (stats.focusMeter / 100) * circumference;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {workspaceName} · full workspace overview
          </p>
        </div>
        <Link
          href="/workspace"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition px-3 py-1.5 rounded-lg hover:bg-muted"
        >
          Manage projects <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="rounded-2xl border bg-card p-5 hover:shadow-md hover:border-border/80 transition group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", card.bg)}>
                <card.icon className={cn("w-4 h-4", card.color)} />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">{card.value}</p>
            {card.trend !== null && (
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
            <span className="font-semibold text-sm">Team Focus Meter</span>
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

            <div className="flex items-center gap-2 mt-4">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm">
                <strong>{stats.dailyMomentum}</strong>
                <span className="text-muted-foreground"> day streak</span>
              </span>
            </div>

            <div className="w-full mt-4 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Team Productivity</span>
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

        {/* Risk Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="rounded-2xl border bg-card p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            </div>
            <span className="font-semibold text-sm">Risk Alerts</span>
            {stats.riskAlerts.length > 0 && (
              <span className="ml-auto text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-medium">
                {stats.riskAlerts.length} active
              </span>
            )}
          </div>

          {stats.riskAlerts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-medium">All clear</p>
              <p className="text-xs text-muted-foreground">No projects at risk</p>
            </div>
          ) : (
            <div className="flex-1 space-y-2.5 overflow-y-auto">
              {stats.riskAlerts.map((alert) => {
                const s = RISK_STYLES[alert.riskLevel] ?? RISK_STYLES.MEDIUM;
                return (
                  <div key={alert.projectId} className={cn("rounded-xl border px-3.5 py-3", s.badge)}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold truncate">{alert.projectName}</span>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wide", s.text)}>
                        {alert.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-black/10">
                        <div
                          className={cn("h-full rounded-full", s.bar)}
                          style={{ width: `${Math.min((Number(alert.overdueCount) / 10) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium shrink-0">
                        {alert.overdueCount} overdue
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Activity Timeline */}
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
            <span className="font-semibold text-sm">Team Activity</span>
          </div>

          {stats.recentActivity.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              No activity yet
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto max-h-64 pr-1">
              {stats.recentActivity.map((log, i) => (
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
                    {i < stats.recentActivity.length - 1 && (
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
