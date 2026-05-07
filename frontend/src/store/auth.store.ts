import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, access: string, refresh: string) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          const ws = JSON.parse(localStorage.getItem("fp-workspace") || "{}");
          if (ws.state) ws.state.activeWorkspace = null;
          localStorage.setItem("fp-workspace", JSON.stringify(ws));
        }
        localStorage.setItem("fp_access", accessToken);
        localStorage.setItem("fp_refresh", refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem("fp_access");
        localStorage.removeItem("fp_refresh");
        localStorage.removeItem("fp-workspace");
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      updateUser: (user) => set({ user }),
    }),
    {
      name: "fp-auth",
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
