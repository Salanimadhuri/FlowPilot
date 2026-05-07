"use client";

import { useEffect, useState } from "react";
import { Layers } from "lucide-react";
import Link from "next/link";
import { dashboardApi } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useAuthStore } from "@/store/auth.store";
import { DashboardStats, MemberDashboardStats } from "@/types";
import { cn } from "@/lib/utils";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import MemberDashboard from "@/components/dashboard/MemberDashboard";

function SkeletonCard({ className }: { className?: string }) {
  return <div className={cn("rounded-2xl bg-muted animate-pulse", className)} />;
}

export default function DashboardPage() {
  const { activeWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | MemberDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
     if (!activeWorkspace) {
       setLoading(false);
       return;
     }
     setLoading(true);
     setError(null);
     dashboardApi.stats(activeWorkspace.id)
       .then((res) => {
         console.log('Dashboard stats:', res.data);
         console.log('User role:', user?.role);
         setStats(res.data);
       })
       .catch((err) => {
         console.error('Dashboard error:', err);
         const msg = err.response?.status === 403
           ? 'Access denied to this workspace'
           : err.response?.data?.message || 'Failed to load dashboard';
         setError(msg);
       })
       .finally(() => setLoading(false));
   }, [activeWorkspace?.id, user?.role]);

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="space-y-1">
          <SkeletonCard className="h-7 w-48" />
          <SkeletonCard className="h-4 w-64 mt-1" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} className="h-28" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <Layers className="w-10 h-10 opacity-20" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!stats || !activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
        <Layers className="w-12 h-12 opacity-20" />
        <div>
          <p className="text-sm font-medium mb-1">No workspace selected</p>
          <p className="text-xs text-muted-foreground">Create or select a workspace to view your dashboard</p>
        </div>
        <Link
          href="/workspace"
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
        >
          Go to Workspaces
        </Link>
      </div>
    );
  }

  // Check user role to determine which dashboard to show
  const isAdmin = user?.role === "ADMIN";

  // Admin dashboard has dailyMomentum and riskAlerts
  // Member dashboard has upcomingDeadlines
  if (isAdmin) {
    return <AdminDashboard stats={stats as DashboardStats} workspaceName={activeWorkspace.name} />;
  } else {
    return <MemberDashboard stats={stats as MemberDashboardStats} workspaceName={activeWorkspace.name} />;
  }
}
