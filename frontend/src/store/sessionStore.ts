import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session } from "../types";
import { FALLBACK_SESSIONS } from "../services/fallbackData";

interface SessionStore {
  sessions: Session[];
  currentSession: Session | null;
  onlineParticipantIds: string[];
  isUsingFallback: boolean;

  setSessions: (sessions: Session[], fromFallback?: boolean) => void;
  setCurrentSession: (session: Session | null) => void;
  addSession: (session: Session) => void;
  setOnlineParticipants: (participantIds: string[]) => void;
  initFallback: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      sessions: [],
      currentSession: null,
      onlineParticipantIds: [],
      isUsingFallback: false,

      setSessions: (sessions, fromFallback = false) =>
        set({ sessions, isUsingFallback: fromFallback }),

      setCurrentSession: (currentSession) => set({ currentSession }),

      addSession: (session) =>
        set((state) => ({ sessions: [session, ...state.sessions] })),

      setOnlineParticipants: (onlineParticipantIds) => set({ onlineParticipantIds }),

      initFallback: () =>
        set((state) => {
          if (state.sessions.length > 0) return state; // already has data from localStorage
          return { sessions: FALLBACK_SESSIONS, isUsingFallback: true };
        }),
    }),
    {
      name: "idealab-session-store",
      partialState: (state: SessionStore) => ({
        sessions: state.sessions,
        currentSession: state.currentSession,
      }),
    }
  )
);