"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

const FEATURES = [
  "Kanban boards with drag-and-drop",
  "Real-time activity timeline",
  "Focus Meter & productivity scoring",
  "Risk alerts for overdue projects",
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      router.push("/dashboard");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── Left branding panel — hidden on mobile, visible md+ ── */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] flex-col justify-between p-10 lg:p-14 bg-[#0f0f14] relative overflow-hidden">

        {/* Background orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">FlowPilot</span>
        </div>

        {/* Hero content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Ship faster,<br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                together.
              </span>
            </h1>
            <p className="mt-4 text-slate-400 text-base leading-relaxed max-w-sm">
              The task management platform built for high-velocity engineering teams.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {/* Stats */}
          <div className="flex gap-8">
            {[["10k+", "Tasks shipped"], ["98%", "Uptime"], ["< 1s", "Response time"]].map(([val, label]) => (
              <div key={label}>
                <p className="text-white font-bold text-xl">{val}</p>
                <p className="text-slate-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 border border-white/10 rounded-xl p-4 bg-white/5">
          <p className="text-slate-300 text-sm italic leading-relaxed">
            "FlowPilot cut our sprint planning time in half. The Kanban board is buttery smooth."
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
              A
            </div>
            <span className="text-slate-400 text-xs">Alice Chen · Engineering Lead</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          {/* Mobile-only logo */}
          <div className="flex items-center gap-2 mb-10 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">FlowPilot</span>
          </div>

          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your workspace</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@team.com"
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition placeholder:text-muted-foreground/50"
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Password</label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition placeholder:text-muted-foreground/50"
              />
              {errors.password && (
                <p className="text-destructive text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                : <><ArrowRight className="w-4 h-4" /> Sign in</>
              }
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            No account?{" "}
            <Link href="/auth/register" className="text-indigo-500 hover:text-indigo-400 font-medium transition">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
