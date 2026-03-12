import api from "./api";
import type { Idea, IdeaCreate, IdeaNode, IdeaStatus } from "../types";

export const getIdeaTree = async (sessionId: string): Promise<IdeaNode[]> => {
  const { data } = await api.get<IdeaNode[]>(`/ideas/tree/${sessionId}`);
  return data;
};

export const createIdea = async (payload: IdeaCreate): Promise<Idea> => {
  const { data } = await api.post<Idea>("/ideas", payload);
  return data;
};

export const updateIdea = async (id: string, payload: Partial<Pick<Idea, "title" | "content" | "tags">>): Promise<Idea> => {
  const { data } = await api.patch<Idea>(`/ideas/${id}`, payload);
  return data;
};

export const voteIdea = async (id: string): Promise<Idea> => {
  const { data } = await api.post<Idea>(`/ideas/${id}/vote`);
  return data;
};

export const updateStatus = async (id: string, status: IdeaStatus): Promise<Idea> => {
  const { data } = await api.patch<Idea>(`/ideas/${id}/status`, null, { params: { status } });
  return data;
};
