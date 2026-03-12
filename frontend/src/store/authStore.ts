import { create } from "zustand";

import { getMe } from "../services/auth.service";
import type { AuthState, User } from "../types";

interface AuthStore extends AuthState {
  initialized: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  initialize: () => Promise<void>;
}

const DEMO_USER_KEY = "idealab-demo-user";
const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  initialized: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem(DEMO_USER_KEY);
    set({ user: null, isAuthenticated: false });
  },
  initialize: async () => {
    const hasToken = Boolean(localStorage.getItem("access_token"));
    if (!hasToken) {
      if (isDemoMode) {
        try {
          const raw = localStorage.getItem(DEMO_USER_KEY);
          if (raw) {
            const user = JSON.parse(raw) as User;
            set({ user, isAuthenticated: true, initialized: true });
            return;
          }
        } catch {
          // ignore parse errors and fall through
        }
      }
      set({ user: null, isAuthenticated: false, initialized: true });
      return;
    }
    try {
      const me = await getMe();
      set({ user: me, isAuthenticated: true, initialized: true });
    } catch {
      if (isDemoMode) {
        try {
          const raw = localStorage.getItem(DEMO_USER_KEY);
          if (raw) {
            const user = JSON.parse(raw) as User;
            set({ user, isAuthenticated: true, initialized: true });
            return;
          }
        } catch {
          // ignore parse errors
        }
      }
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem(DEMO_USER_KEY);
      set({ user: null, isAuthenticated: false, initialized: true });
    }
  }
}));
