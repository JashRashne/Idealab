import api from "./api";
import type { Idea, IdeaCreate, IdeaNode, IdeaStatus } from "../types";
import { FALLBACK_IDEA_TREE } from "./fallbackData";
import { useIdeaStore } from "../store/ideaStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateId = () => `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const now = () => new Date().toISOString();

// ─── getIdeaTree ─────────────────────────────────────────────────────────────
export const getIdeaTree = async (sessionId: string): Promise<IdeaNode[]> => {
  try {
    const { data } = await api.get<IdeaNode[]>(`/ideas/tree/${sessionId}`);
    useIdeaStore.getState().setIdeaTree(data, false);
    return data;
  } catch {
    // If store already has persisted data for this session, use it
    const stored = useIdeaStore.getState().ideaTree;
    const hasDataForSession = stored.some((n) => n.idea.session_id === sessionId);

    if (hasDataForSession) {
      useIdeaStore.getState().setIdeaTree(stored, true);
      return stored;
    }

    // Otherwise seed from static fallback
    const fallback = FALLBACK_IDEA_TREE.map((node) => ({
      ...node,
      idea: { ...node.idea, session_id: sessionId },
      children: node.children.map((child) => ({
        ...child,
        idea: { ...child.idea, session_id: sessionId },
      })),
    }));
    useIdeaStore.getState().setIdeaTree(fallback, true);
    return fallback;
  }
};

// ─── createIdea ───────────────────────────────────────────────────────────────
export const createIdea = async (payload: IdeaCreate): Promise<Idea> => {
  try {
    const { data } = await api.post<Idea>("/ideas", payload);
    useIdeaStore.getState().addIdea(data);
    return data;
  } catch {
    const localIdea: Idea = {
      id: generateId(),
      session_id: payload.session_id,
      title: payload.title,
      content: payload.content,
      branch_name: payload.branch_name,
      parent_idea_id: payload.parent_idea_id ?? null,
      tags: payload.tags,
      status: "active",
      created_by: "local_user",
      votes: [],
      created_at: now(),
      updated_at: now(),
    };
    useIdeaStore.getState().addIdea(localIdea);
    return localIdea;
  }
};

// ─── updateIdea ───────────────────────────────────────────────────────────────
export const updateIdea = async (
  id: string,
  payload: Partial<Pick<Idea, "title" | "content" | "tags">>
): Promise<Idea> => {
  try {
    const { data } = await api.patch<Idea>(`/ideas/${id}`, payload);
    useIdeaStore.getState().updateIdea(data);
    return data;
  } catch {
    // Find existing idea in the tree and patch it locally
    const existing = findIdeaInTree(useIdeaStore.getState().ideaTree, id);
    if (!existing) throw new Error(`Idea ${id} not found in local store`);
    const updated: Idea = { ...existing, ...payload, updated_at: now() };
    useIdeaStore.getState().updateIdea(updated);
    return updated;
  }
};

// ─── voteIdea ─────────────────────────────────────────────────────────────────
export const voteIdea = async (id: string, currentUserId: string = "local_user"): Promise<Idea> => {
  try {
    const { data } = await api.post<Idea>(`/ideas/${id}/vote`);
    useIdeaStore.getState().updateIdea(data);
    return data;
  } catch {
    const existing = findIdeaInTree(useIdeaStore.getState().ideaTree, id);
    if (!existing) throw new Error(`Idea ${id} not found in local store`);

    // Toggle vote locally
    const alreadyVoted = existing.votes.includes(currentUserId);
    const updated: Idea = {
      ...existing,
      votes: alreadyVoted
        ? existing.votes.filter((v) => v !== currentUserId)
        : [...existing.votes, currentUserId],
      updated_at: now(),
    };
    useIdeaStore.getState().updateIdea(updated);
    return updated;
  }
};

// ─── updateStatus ─────────────────────────────────────────────────────────────
export const updateStatus = async (id: string, status: IdeaStatus): Promise<Idea> => {
  try {
    const { data } = await api.patch<Idea>(`/ideas/${id}/status`, null, { params: { status } });
    useIdeaStore.getState().updateIdea(data);
    return data;
  } catch {
    const existing = findIdeaInTree(useIdeaStore.getState().ideaTree, id);
    if (!existing) throw new Error(`Idea ${id} not found in local store`);
    const updated: Idea = { ...existing, status, updated_at: now() };
    useIdeaStore.getState().updateIdea(updated);
    return updated;
  }
};

// ─── Tree search helper ───────────────────────────────────────────────────────
export const findIdeaInTree = (nodes: IdeaNode[], id: string): Idea | null => {
  for (const node of nodes) {
    if (node.idea.id === id) return node.idea;
    const found = findIdeaInTree(node.children, id);
    if (found) return found;
  }
  return null;
};

// ─── Flat list helper (used by FinalDocument / WorkspaceLayout) ───────────────
export const flattenTree = (nodes: IdeaNode[]): Idea[] => {
  const result: Idea[] = [];
  const walk = (list: IdeaNode[]) => {
    list.forEach((n) => { result.push(n.idea); walk(n.children); });
  };
  walk(nodes);
  return result;
};