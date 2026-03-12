import api from "./api";
import type { Comment } from "../types";

export const getComments = async (ideaId: string): Promise<Comment[]> => {
  const { data } = await api.get<Comment[]>(`/comments/${ideaId}`);
  return data;
};

export const createComment = async (ideaId: string, content: string): Promise<Comment> => {
  const { data } = await api.post<Comment>("/comments", { idea_id: ideaId, content });
  return data;
};

export const reactToComment = async (commentId: string, emoji: string): Promise<Comment> => {
  const { data } = await api.post<Comment>(`/comments/${commentId}/react`, { emoji });
  return data;
};
