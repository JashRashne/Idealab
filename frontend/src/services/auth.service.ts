import api from "./api";
import type { User } from "../types";

export const register = async (username: string, email: string, password: string): Promise<User> => {
  const { data } = await api.post<User>("/auth/register", { username, email, password });
  return data;
};

export const login = async (email: string, password: string): Promise<User> => {
  const { data } = await api.post<User>("/auth/login", { email, password });
  return data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>("/auth/me");
  return data;
};
