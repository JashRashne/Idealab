import api from "./api";
import type { User, TokenResponse } from "../types";

export const TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

export const register = async (username: string, email: string, password: string): Promise<User> => {
  const { data } = await api.post<User>("/auth/register", { username, email, password });
  return data;
};

export const login = async (email: string, password: string): Promise<User> => {
  const { data } = await api.post<TokenResponse>("/auth/login", { email, password });
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
  const { data: user } = await api.get<User>("/auth/me");
  return user;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>("/auth/me");
  return data;
};
