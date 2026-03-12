import api from "./api";
import type { Session } from "../types";

export const getSessions = async (): Promise<Session[]> => {
  const { data } = await api.get<Session[]>("/sessions");
  return data;
};

export const getSession = async (id: string): Promise<Session> => {
  const { data } = await api.get<Session>(`/sessions/${id}`);
  return data;
};

export const createSession = async (title: string, description: string): Promise<Session> => {
  const { data } = await api.post<Session>("/sessions", { title, description });
  return data;
};

export const joinSession = async (id: string): Promise<Session> => {
  const { data } = await api.post<Session>(`/sessions/${id}/join`);
  return data;
};
