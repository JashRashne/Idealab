import { create } from "zustand";

import { getMe } from "../services/auth.service";
import type { AuthState, User } from "../types";

interface AuthStore extends AuthState {
  initialized: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  initialized: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  initialize: async () => {
    try {
      const me = await getMe();
      set({ user: me, isAuthenticated: true, initialized: true });
    } catch {
      set({ user: null, isAuthenticated: false, initialized: true });
    }
  }
}));
