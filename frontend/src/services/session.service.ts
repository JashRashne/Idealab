import api from "./api";
import type { Session } from "../types";
import { FALLBACK_SESSIONS } from "./fallbackData";
import { useSessionStore } from "../store/sessionStore";

const generateId = () => `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const now = () => new Date().toISOString();

// ─── getSessions ──────────────────────────────────────────────────────────────
export const getSessions = async (): Promise<Session[]> => {
  try {
    const { data } = await api.get<Session[]>("/sessions");
    useSessionStore.getState().setSessions(data, false);
    return data;
  } catch {
    const stored = useSessionStore.getState().sessions;
    if (stored.length > 0) {
      useSessionStore.getState().setSessions(stored, true);
      return stored;
    }
    useSessionStore.getState().setSessions(FALLBACK_SESSIONS, true);
    return FALLBACK_SESSIONS;
  }
};

// ─── getSession ───────────────────────────────────────────────────────────────
export const getSession = async (id: string): Promise<Session> => {
  try {
    const { data } = await api.get<Session>(`/sessions/${id}`);
    useSessionStore.getState().setCurrentSession(data);
    return data;
  } catch {
    // Look in local store first
    const stored = useSessionStore.getState().sessions.find((s) => s.id === id);
    if (stored) {
      useSessionStore.getState().setCurrentSession(stored);
      return stored;
    }
    // Fall back to static
    const fallback = FALLBACK_SESSIONS.find((s) => s.id === id) ?? FALLBACK_SESSIONS[0];
    useSessionStore.getState().setCurrentSession(fallback);
    return fallback;
  }
};

// ─── createSession ────────────────────────────────────────────────────────────
export const createSession = async (title: string, description: string): Promise<Session> => {
  try {
    const { data } = await api.post<Session>("/sessions", { title, description });
    useSessionStore.getState().addSession(data);
    return data;
  } catch {
    const localSession: Session = {
      id: generateId(),
      title,
      description,
      owner_id: "local_user",
      participant_ids: ["local_user"],
      status: "active",
      created_at: now(),
    };
    useSessionStore.getState().addSession(localSession);
    return localSession;
  }
};

// ─── joinSession ──────────────────────────────────────────────────────────────
export const joinSession = async (id: string): Promise<Session> => {
  try {
    const { data } = await api.post<Session>(`/sessions/${id}/join`);
    useSessionStore.getState().setCurrentSession(data);
    return data;
  } catch {
    // Find locally and fake-join
    const stored =
      useSessionStore.getState().sessions.find((s) => s.id === id) ??
      FALLBACK_SESSIONS.find((s) => s.id === id) ??
      FALLBACK_SESSIONS[0];
    const joined: Session = {
      ...stored,
      participant_ids: stored.participant_ids.includes("local_user")
        ? stored.participant_ids
        : [...stored.participant_ids, "local_user"],
    };
    useSessionStore.getState().setCurrentSession(joined);
    return joined;
  }
};