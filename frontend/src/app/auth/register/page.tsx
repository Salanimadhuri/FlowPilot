"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Zap, ArrowRight, Sparkles, Shield, User } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "MEMBER"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

const STEPS = [
  "Create your account",
  "Set up a workspace",
  "Invite your team & ship",
];

const ROLES = [
  {
    value: "MEMBER" as const,
    label: "Member",
    description: "View assigned tasks and update status",
    icon: User,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    value: "ADMIN" as const,
    label: "Admin",
    description: "Full access to manage projects and team",
    icon: Shield,
    gradient: "from-indigo-500 to-violet-600",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "MEMBER" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.register(data);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      
      // Redirect based on role
      if (res.data.user.role === "ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err.response?.data?.message || "Something went wrong",
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

        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">FlowPilot</span>
        </div>

        {/* Hero content */}
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            Free to get started
          </div>

          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Your team's<br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                command center.
              </span>
            </h1>
            <p className="mt-4 text-slate-400 text-base leading-relaxed max-w-sm">
              Create a workspace, invite your team, and start shipping in minutes.
            </p>
          </div>

          <div className="space-y-4">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-slate-300 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-600 text-xs">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          {/* Mobile-only logo */}
          <div className="flex items-center gap-2 mb-10 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">FlowPilot</span>
          </div>

          <h2 className="text-2xl font-bold mb-1">Create your account</h2>
          <p className="text-muted-foreground text-sm mb-8">Start your team workspace today</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selection Cards */}
            <div>
              <label className="text-sm font-medium block mb-3">Select your role</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.value;
                  return (
                    <motion.button
                      key={role.value}
                      type="button"
                      onClick={() => setValue("role", role.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/20"
                          : "border-border hover:border-indigo-500/50 bg-card"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-3 shadow-md`}>
                        <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                      </div>
                      <div className="font-semibold text-sm mb-1">{role.label}</div>
                      <div className="text-xs text-muted-foreground leading-snug">
                        {role.description}
                      </div>
                      {isSelected && (
                        <motion.div
                          layoutId="role-indicator"
                          className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center"
                        >
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              {errors.role && (
                <p className="text-destructive text-xs mt-1.5">{errors.role.message}</p>
              )}
            </div>

            {/* Form Fields */}
            {[
              { field: "name" as const, label: "Full name", type: "text", placeholder: "Alice Chen" },
              { field: "email" as const, label: "Work email", type: "email", placeholder: "you@team.com" },
              { field: "password" as const, label: "Password", type: "password", placeholder: "Min. 8 characters" },
              { field: "confirmPassword" as const, label: "Confirm password", type: "password", placeholder: "Re-enter password" },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field}>
                <label className="text-sm font-medium block mb-1.5">{label}</label>
                <input
                  {...register(field)}
                  type={type}
                  placeholder={placeholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition placeholder:text-muted-foreground/50"
                />
                {errors[field] && (
                  <p className="text-destructive text-xs mt-1.5">{errors[field]?.message}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                : <><ArrowRight className="w-4 h-4" /> Create account</>
              }
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-500 hover:text-indigo-400 font-medium transition">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
