import { useState, useCallback } from "react";

type ToastVariant = "default" | "destructive";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

let toastQueue: ((toast: Omit<Toast, "id">) => void) | null = null;

export function useToast() {
  const toast = useCallback((options: Omit<Toast, "id">) => {
    if (toastQueue) toastQueue(options);
    else console.log("[Toast]", options.title, options.description);
  }, []);

  return { toast };
}

export function registerToastHandler(handler: (t: Omit<Toast, "id">) => void) {
  toastQueue = handler;
}
