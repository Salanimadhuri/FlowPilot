"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { registerToastHandler } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    registerToastHandler((t) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
    });
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className={cn(
              "flex gap-3 p-4 rounded-xl border shadow-lg bg-card",
              t.variant === "destructive" && "border-destructive/30 bg-destructive/5"
            )}
          >
            {t.variant === "destructive"
              ? <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              : <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            }
            <div className="flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
            </div>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}>
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
