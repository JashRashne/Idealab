import api from "./api";
import type { User, TokenResponse } from "../types";

export const TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
const DEMO_USER_KEY = "idealab-demo-user";
const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

const createDemoUser = (overrides?: Partial<User>): User => {
  const base: User = {
    id: "demo_user",
    username: "Demo User",
    email: "demo@example.com",
    created_at: new Date().toISOString(),
  };
  const user = { ...base, ...overrides };
  try {
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
  } catch {
    // ignore storage errors in demo mode
  }
  try {
    localStorage.setItem(TOKEN_KEY, "demo-access-token");
    localStorage.setItem(REFRESH_TOKEN_KEY, "demo-refresh-token");
  } catch {
    // ignore
  }
  return user;
};

export const register = async (username: string, email: string, password: string): Promise<User> => {
  try {
    const { data } = await api.post<User>("/auth/register", { username, email, password });
    return data;
  } catch (error) {
    if (!isDemoMode) {
      throw error;
    }
    return createDemoUser({
      username: username || email.split("@")[0] || "Demo User",
      email,
    });
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  try {
    const { data } = await api.post<TokenResponse>("/auth/login", { email, password });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    const { data: user } = await api.get<User>("/auth/me");
    return user;
  } catch (error) {
    if (!isDemoMode) {
      throw error;
    }
    return createDemoUser({
      username: email.split("@")[0] || "Demo User",
      email,
    });
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(DEMO_USER_KEY);
  }
};

export const getMe = async (): Promise<User> => {
  try {
    const { data } = await api.get<User>("/auth/me");
    return data;
  } catch (error) {
    if (!isDemoMode) {
      throw error;
    }
    try {
      const raw = localStorage.getItem(DEMO_USER_KEY);
      if (raw) {
        return JSON.parse(raw) as User;
      }
    } catch {
      // ignore parse errors
    }
    return createDemoUser();
  }
};
