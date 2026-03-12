import api from "./api";
import type { Comment } from "../types";
import { FALLBACK_COMMENTS } from "./fallbackData";

const generateId = () => `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const now = () => new Date().toISOString();

// In-memory comment cache — keyed by idea_id
// This is also written to localStorage so comments survive refresh
const STORAGE_KEY = "idealab-comments-cache";

const loadCache = (): Record<string, Comment[]> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
};

const saveCache = (cache: Record<string, Comment[]>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full — fail silently
  }
};

// ─── getComments ──────────────────────────────────────────────────────────────
export const getComments = async (ideaId: string): Promise<Comment[]> => {
  try {
    const { data } = await api.get<Comment[]>(`/comments/${ideaId}`);
    // Merge into cache so offline edits aren't lost
    const cache = loadCache();
    cache[ideaId] = data;
    saveCache(cache);
    return data;
  } catch {
    const cache = loadCache();
    if (cache[ideaId]?.length) return cache[ideaId];
    // Seed with static fallback comments for this idea
    return FALLBACK_COMMENTS.filter((c) => c.idea_id === ideaId);
  }
};

// ─── createComment ────────────────────────────────────────────────────────────
export const createComment = async (ideaId: string, content: string): Promise<Comment> => {
  try {
    const { data } = await api.post<Comment>("/comments", { idea_id: ideaId, content });
    // Add to local cache
    const cache = loadCache();
    cache[ideaId] = [...(cache[ideaId] ?? []), data];
    saveCache(cache);
    return data;
  } catch {
    const localComment: Comment = {
      id: generateId(),
      idea_id: ideaId,
      content,
      author_id: "local_user",
      reactions: [],
      created_at: now(),
    };
    const cache = loadCache();
    cache[ideaId] = [...(cache[ideaId] ?? []), localComment];
    saveCache(cache);
    return localComment;
  }
};

// ─── reactToComment ───────────────────────────────────────────────────────────
export const reactToComment = async (commentId: string, emoji: string): Promise<Comment> => {
  try {
    const { data } = await api.post<Comment>(`/comments/${commentId}/react`, { emoji });
    // Update comment in cache
    const cache = loadCache();
    for (const ideaId of Object.keys(cache)) {
      cache[ideaId] = cache[ideaId].map((c) => (c.id === commentId ? data : c));
    }
    saveCache(cache);
    return data;
  } catch {
    // Toggle reaction locally
    const cache = loadCache();
    let updated: Comment | null = null;

    for (const ideaId of Object.keys(cache)) {
      cache[ideaId] = cache[ideaId].map((c) => {
        if (c.id !== commentId) return c;
        const existing = c.reactions.find(
          (r) => r.emoji === emoji && r.user_id === "local_user"
        );
        const reactions = existing
          ? c.reactions.filter((r) => !(r.emoji === emoji && r.user_id === "local_user"))
          : [...c.reactions, { emoji, user_id: "local_user" }];
        updated = { ...c, reactions };
        return updated;
      });
    }

    saveCache(cache);
    if (!updated) throw new Error(`Comment ${commentId} not found in local cache`);
    return updated;
  }
};