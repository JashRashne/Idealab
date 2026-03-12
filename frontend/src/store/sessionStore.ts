import { create } from "zustand";

import type { Session } from "../types";

interface SessionStore {
  sessions: Session[];
  currentSession: Session | null;
  onlineParticipantIds: string[];
  setSessions: (sessions: Session[]) => void;
  setCurrentSession: (session: Session | null) => void;
  addSession: (session: Session) => void;
  setOnlineParticipants: (participantIds: string[]) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: [],
  currentSession: null,
  onlineParticipantIds: [],
  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (currentSession) => set({ currentSession }),
  addSession: (session) => set((state) => ({ sessions: [session, ...state.sessions] })),
  setOnlineParticipants: (onlineParticipantIds) => set({ onlineParticipantIds })
}));
