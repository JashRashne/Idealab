import api from "./api";
import type { Idea } from "../types";

export interface AIJob {
  id: string;
  session_id: string;
  type: "expand" | "summarize" | "merge";
  input_idea_ids: string[];
  output: string;
  created_at: string;
}

export const expandIdea = async (ideaId: string): Promise<AIJob> => {
  const { data } = await api.post<AIJob>("/ai/expand", { idea_id: ideaId });
  return data;
};

export const summarizeSession = async (sessionId: string): Promise<AIJob> => {
  const { data } = await api.post<AIJob>("/ai/summarize", { session_id: sessionId });
  return data;
};

export const mergeIdeas = async (ideaId1: string, ideaId2: string): Promise<Idea> => {
  const { data } = await api.post<Idea>("/ai/merge", { idea_id_1: ideaId1, idea_id_2: ideaId2 });
  return data;
};
